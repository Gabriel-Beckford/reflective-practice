const DEFAULT_MODEL = "gemini-1.5-flash";
const DEFAULT_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getMetaContent(name) {
  const node = document.querySelector(`meta[name="${name}"]`);
  return node ? node.getAttribute("content") : "";
}

export function getRuntimeConfig() {
  const injected = window.REFLECTIVE_PRACTICE_CONFIG || {};

  return {
    geminiApiKey: injected.geminiApiKey || getMetaContent("gemini-api-key") || "",
    geminiModel: injected.geminiModel || getMetaContent("gemini-model") || DEFAULT_MODEL,
    geminiApiBase: injected.geminiApiBase || getMetaContent("gemini-api-base") || DEFAULT_API_BASE
  };
}
