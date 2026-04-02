import { getRuntimeConfig } from "../config/runtimeConfig.js";

function asRole(role) {
  return role === "assistant" ? "model" : "user";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    throw new Error("History must be an array.");
  }

  return history
    .filter((entry) => entry && typeof entry.content === "string" && (entry.role === "user" || entry.role === "assistant"))
    .map((entry) => ({ role: asRole(entry.role), parts: [{ text: entry.content.trim() }] }))
    .filter((entry) => entry.parts[0].text.length > 0);
}

function validateRequest(systemPrompt, userMessage) {
  if (typeof systemPrompt !== "string" || systemPrompt.trim().length === 0) {
    throw new Error("A non-empty system prompt is required.");
  }

  if (typeof userMessage !== "string" || userMessage.trim().length === 0) {
    throw new Error("A non-empty user message is required.");
  }
}

export async function callGemini(systemPrompt, userMessage, history = []) {
  try {
    validateRequest(systemPrompt, userMessage);
    const normalizedHistory = normalizeHistory(history);
    const config = getRuntimeConfig();

    if (!config.geminiApiKey) {
      return {
        ok: false,
        text: "I can continue without AI for now. Please add a Gemini API key to runtime config to enable live guidance.",
        error: "missing_api_key"
      };
    }

    const response = await fetch(`${config.geminiApiBase}/models/${config.geminiModel}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt.trim() }] },
          contents: [
            ...normalizedHistory,
            { role: "user", parts: [{ text: userMessage.trim() }] }
          ]
        })
      });

    if (!response.ok) {
      throw new Error(`Gemini API request failed (${response.status}).`);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();

    if (!text) {
      throw new Error("Empty Gemini response.");
    }

    return { ok: true, text };
  } catch (error) {
    console.error("Gemini request failed:", error);
    return {
      ok: false,
      text: "I ran into an AI connection issue. Please continue with your reflection and try again in a moment.",
      error: "service_unavailable"
    };
  }
}
