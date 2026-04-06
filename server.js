const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function safeTelemetry(event, details) {
  const record = {
    event,
    timestamp: new Date().toISOString(),
    ...details
  };
  console.info("[gemini-telemetry]", JSON.stringify(record));
}

function mapGeminiError(status) {
  if (status === 401 || status === 403) {
    return { code: "invalid_key", message: "Gemini authorization failed. Check server credentials." };
  }
  if (status === 429) {
    return { code: "rate_limit", message: "Gemini rate limit reached. Please retry shortly." };
  }
  if (status >= 500) {
    return { code: "upstream_unavailable", message: "Gemini service is currently unavailable." };
  }
  return { code: "upstream_error", message: "Gemini request failed." };
}

function buildAssistantPrompt({ phaseKey, turnCount, transcript }) {
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

async function callGemini({ prompt, timeoutMs = 12000 }) {
  if (!GEMINI_API_KEY) {
    return { error: { code: "not_configured", message: "Server Gemini credentials are not configured." } };
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  try {
    const endpoint = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`);
    endpoint.searchParams.set("key", GEMINI_API_KEY);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abort.signal,
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { error: mapGeminiError(response.status), status: response.status };
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    try {
      return { data: JSON.parse(text) };
    } catch {
      return { error: { code: "parse_error", message: "Unable to parse Gemini JSON response." } };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return { error: { code: "timeout", message: "Gemini request timed out." } };
    }
    return { error: { code: "offline", message: "Unable to reach Gemini service." } };
  } finally {
    clearTimeout(timer);
  }
}

async function handleApi(req, res, pathname) {
  if (req.method !== "POST") {
    sendJson(res, 405, { code: "method_not_allowed", message: "Only POST is supported." });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    sendJson(res, 400, { code: "bad_request", message: error.message });
    return;
  }

  if (typeof body?.sessionToken !== "undefined") {
    sendJson(res, 400, {
      code: "unsupported_credential",
      message: "sessionToken is not accepted. This server uses GEMINI_API_KEY only."
    });
    return;
  }

  if (pathname === "/api/gemini/test") {
    const result = await callGemini({ prompt: "Return JSON: {\"ok\":true}" });
    if (result.error) {
      safeTelemetry("gemini_test_failed", { code: result.error.code });
      sendJson(res, 502, result.error);
      return;
    }
    sendJson(res, 200, { ok: true, model: GEMINI_MODEL });
    return;
  }

  if (pathname === "/api/gemini/chat") {
    const { phaseKey, turnCount, transcript, mode } = body;
    const prompt = buildAssistantPrompt({ phaseKey, turnCount, transcript });
    const result = await callGemini({ prompt });

    if (result.error) {
      safeTelemetry("gemini_chat_failed", {
        code: result.error.code,
        phaseKey,
        turnCount,
        mode
      });
      sendJson(res, 502, result.error);
      return;
    }

    const assistantTurn = result.data?.assistantTurn;
    if (!assistantTurn?.prompt) {
      safeTelemetry("gemini_schema_failed", { phaseKey, turnCount, mode });
      sendJson(res, 502, { code: "schema", message: "Gemini returned an invalid assistantTurn payload." });
      return;
    }

    sendJson(res, 200, {
      assistantTurn: {
        prompt: assistantTurn.prompt,
        phase: phaseKey,
        turnCount,
        intent: assistantTurn.intent || "probe"
      }
    });
    return;
  }

  sendJson(res, 404, { code: "not_found", message: "Unknown API route." });
}

function serveStatic(req, res, pathname) {
  const resolvedPath = pathname === "/" ? "/index.html" : pathname;
  const target = path.join(process.cwd(), decodeURIComponent(resolvedPath));

  if (!target.startsWith(process.cwd())) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/gemini/")) {
    await handleApi(req, res, url.pathname);
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.info(`Server running at http://${HOST}:${PORT}`);
});
