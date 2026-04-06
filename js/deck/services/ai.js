(() => {
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

    async function requestDeckAi({ transcript, mode = "deck", phaseKey, turnCount = 1, resolvePhaseKey }) {
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

    async function testApiConnection({ onStart, onSuccess, onFailure, onFinally }) {
      try {
        onStart?.();
        const response = await fetchImpl("/api/gemini/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
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

    return { DeckAiError, mapDeckAiError, requestDeckAi, testApiConnection };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.aiService = { DeckAiError, createAiService };
})();
