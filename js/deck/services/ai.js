(() => {
  const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
  const SESSION_KEY = "gemini_api_key";
  const SESSION_MODEL_KEY = "gemini_model";

  class DeckAiError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "DeckAiError";
      this.code = code || "ai_error";
      this.details = details;
    }
  }

  function createAiService({ fetchImpl = window.fetch.bind(window) }) {
    function mapDeckAiError(error, fallbackMessage) {
      if (error instanceof DeckAiError) return error;
      if (error?.name === "AbortError") {
        return new DeckAiError("timeout", "Gemini request timed out.");
      }
      return new DeckAiError("network", fallbackMessage || "Unable to reach Gemini right now.", {
        cause: error instanceof Error ? error.message : String(error || "")
      });
    }

    function getStoredKey() {
      try { return sessionStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
    }

    function storeKey(key) {
      try { sessionStorage.setItem(SESSION_KEY, key); } catch { /* ignore */ }
    }

    function getStoredModel() {
      try { return sessionStorage.getItem(SESSION_MODEL_KEY) || ""; } catch { return ""; }
    }

    function storeModel(model) {
      try { sessionStorage.setItem(SESSION_MODEL_KEY, model); } catch { /* ignore */ }
    }

    function pickDefaultModel(models) {
      const preferred = [
        "gemini-2.0-flash", "gemini-2.0-flash-lite",
        "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro"
      ];
      for (const p of preferred) {
        if (models.some(m => m.id === p)) return p;
      }
      return models[0]?.id || "gemini-2.0-flash";
    }

    async function listModels(apiKey) {
      const response = await fetchImpl(
        `${GEMINI_BASE_URL}/models?key=${encodeURIComponent(apiKey)}`
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new DeckAiError(String(response.status), payload?.error?.message || "Failed to list models.", payload);
      }
      return (payload.models || [])
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => ({
          id: m.name.replace(/^models\//, ""),
          displayName: m.displayName || m.name
        }));
    }

    function buildPrompt({ phaseKey, turnCount, transcript }) {
      const history = (Array.isArray(transcript) ? transcript : [])
        .map((entry) => `${entry.role}: ${String(entry.content || "").slice(0, 280)}`)
        .join("\n");
      return [
        "You are a reflective-practice chatbot.",
        "Return only JSON with this schema:",
        '{"assistantTurn":{"prompt":"string","phase":"CE|RO|AC|AE","turnCount":number,"intent":"probe|clarify|action"}}',
        "Constraints:",
        `- phase MUST be ${phaseKey}`,
        `- turnCount MUST be ${turnCount}`,
        "- prompt must be one concise follow-up question under 30 words",
        "- tailor the question to the learner's latest response",
        "- if turnCount is 3, prompt should transition toward next phase readiness",
        "Conversation history:",
        history
      ].join("\n");
    }

    async function callGeminiDirect({ prompt, apiKey, timeoutMs = 12000 }) {
      const model = getStoredModel() || "gemini-2.0-flash";
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), timeoutMs);
      try {
        const url = new URL(`${GEMINI_BASE_URL}/models/${model}:generateContent`);
        url.searchParams.set("key", apiKey);
        const response = await fetchImpl(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
            contents: [{ role: "user", parts: [{ text: prompt }] }]
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const msg = payload?.error?.message || "Gemini request failed.";
          throw new DeckAiError(String(response.status), msg, payload);
        }
        const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        return JSON.parse(text);
      } catch (error) {
        if (error instanceof DeckAiError) throw error;
        if (error?.name === "AbortError") throw new DeckAiError("timeout", "Gemini request timed out.");
        throw new DeckAiError("network", "Unable to reach Gemini right now.", { cause: error?.message });
      } finally {
        clearTimeout(timer);
      }
    }

    async function requestDeckAi({ transcript, mode = "deck", phaseKey, turnCount = 1, resolvePhaseKey }) {
      const key = getStoredKey();
      if (key) {
        try {
          const resolvedPhase = phaseKey || resolvePhaseKey?.() || "RO";
          const prompt = buildPrompt({ phaseKey: resolvedPhase, turnCount, transcript });
          const data = await callGeminiDirect({ prompt, apiKey: key });
          if (!data?.assistantTurn?.prompt) {
            throw new DeckAiError("schema", "Gemini response was missing assistantTurn.prompt.", data);
          }
          return data.assistantTurn;
        } catch (error) {
          throw mapDeckAiError(error, "Unable to reach Gemini right now.");
        }
      }
      try {
        const response = await fetchImpl("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phaseKey: phaseKey || resolvePhaseKey?.() || "RO",
            turnCount,
            transcript: Array.isArray(transcript) ? transcript : [],
            mode
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new DeckAiError(payload?.code || "upstream_error", payload?.message || "Gemini request failed.", payload);
        }
        if (!payload?.assistantTurn?.prompt) {
          throw new DeckAiError("schema", "Gemini response was missing assistantTurn.prompt.", payload);
        }
        return payload.assistantTurn;
      } catch (error) {
        throw mapDeckAiError(error, "Unable to reach Gemini right now.");
      }
    }

    async function testApiConnection({ apiKey, onStart, onSuccess, onFailure, onFinally }) {
      try {
        onStart?.();
        if (typeof apiKey === "string" && apiKey.trim()) {
          const key = apiKey.trim();
          const models = await listModels(key);
          const stored = getStoredModel();
          const selectedModel = (stored && models.some(m => m.id === stored)) ? stored : pickDefaultModel(models);
          storeModel(selectedModel);
          await callGeminiDirect({ prompt: 'Return JSON: {"ok":true}', apiKey: key });
          storeKey(key);
          onSuccess?.({ ok: true, models, selectedModel });
          return { ok: true, payload: { models, selectedModel } };
        }
        const storedKey = getStoredKey();
        const payloadBody = storedKey ? { apiKey: storedKey } : {};
        const response = await fetchImpl("/api/gemini/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBody)
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || "Connection failed.");
        }
        onSuccess?.(payload);
        return { ok: true, payload };
      } catch (error) {
        onFailure?.(error);
        return { ok: false, error };
      } finally {
        onFinally?.();
      }
    }

    return { DeckAiError, mapDeckAiError, requestDeckAi, testApiConnection, storeModel };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.aiService = { DeckAiError, createAiService };
})();
