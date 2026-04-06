const DEFAULT_TIMEOUT_MS = 12000;

export class GeminiClientError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "GeminiClientError";
    this.code = code;
    this.details = details;
  }
}

function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    dispose: () => clearTimeout(timer)
  };
}

async function requestJson(url, body, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const timer = withTimeout(timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: timer.signal
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new GeminiClientError(payload.code || "upstream_error", payload.message || "Gemini request failed.", payload);
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new GeminiClientError("timeout", "Gemini request timed out.");
    }
    if (error instanceof GeminiClientError) {
      throw error;
    }
    throw new GeminiClientError("network", "Network error while calling Gemini.", { cause: error?.message });
  } finally {
    timer.dispose();
  }
}

export async function testGeminiConnection() {
  return requestJson("/api/gemini/test", {});
}

export async function generateAssistantTurn({ phaseKey, turnCount, transcript, mode }) {
  const payload = await requestJson("/api/gemini/chat", {
    phaseKey,
    turnCount,
    mode,
    transcript
  });

  if (!payload?.assistantTurn?.prompt) {
    throw new GeminiClientError("schema", "Gemini response was missing assistantTurn.prompt.", payload);
  }

  return payload.assistantTurn;
}
