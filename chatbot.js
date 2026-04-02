import { GeminiClientError, generateAssistantTurn, testGeminiConnection } from "./js/chat/adapters/gemini-client.js";

const PHASES = [
  {
    key: "CE",
    label: "Concrete Experience",
    initialPrompt:
      "Let's begin with a Concrete Experience. Think of a recent teaching event. Briefly, what happened and who was involved?"
  },
  {
    key: "RO",
    label: "Reflective Observation",
    initialPrompt:
      "Thank you, that gives a clear picture. Let's move to Reflective Observation. How did this specific moment make you feel, and what do you think the students were feeling?"
  },
  {
    key: "AC",
    label: "Abstract Conceptualisation",
    initialPrompt:
      "Now for Abstract Conceptualisation. Can you connect this to any teaching frameworks, or why do you think this happened on a broader level?"
  },
  {
    key: "AE",
    label: "Active Experimentation",
    initialPrompt:
      "Finally, let's look at Active Experimentation. Based on these insights, what specific step will you take differently next time?"
  }
];

const CONNECTION_STATUS = {
  NOT_CONFIGURED: "Not configured",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  FAILED: "Failed"
};

const appState = {
  screen: 1,
  mode: "Type",
  phaseIndex: 0,
  phaseResponses: {
    CE: [],
    RO: [],
    AC: [],
    AE: []
  },
  phaseAssistantTurns: {
    CE: [],
    RO: [],
    AC: [],
    AE: []
  },
  shareWithPeers: false,
  sessionToken: "",
  connectionStatus: CONNECTION_STATUS.NOT_CONFIGURED,
  connectionMessage: "Connect to Gemini before starting chat.",
  generationInFlight: false,
  generationError: ""
};

const root = document.getElementById("chatbot-root");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function summarizePhase(responses) {
  if (!responses.length) {
    return "No response captured.";
  }

  const firstLine = responses[0].trim();
  if (firstLine.length <= 160) {
    return firstLine;
  }
  return `${firstLine.slice(0, 157)}...`;
}

function mapFailureMessage(code) {
  if (code === "timeout") {
    return "Request timed out. Check connection and retry.";
  }
  if (code === "rate_limit") {
    return "Rate limit reached. Wait a moment and retry.";
  }
  if (code === "invalid_key") {
    return "Gemini credentials are invalid. Update server-side key and reconnect.";
  }
  if (code === "offline" || code === "network") {
    return "You're offline or Gemini is unreachable. Reconnect and retry.";
  }
  return "Unable to generate the next prompt right now.";
}

function normalizeClientError(error) {
  if (error instanceof GeminiClientError) {
    return error;
  }
  return new GeminiClientError("unknown", "Unexpected Gemini error", { cause: error?.message });
}

function render() {
  if (appState.screen === 1) {
    renderWelcomeScreen();
    return;
  }
  if (appState.screen === 2) {
    renderPhaseScreen();
    return;
  }
  renderSummaryScreen();
}

function renderWelcomeScreen() {
  const statusClass = appState.connectionStatus.toLowerCase().replaceAll(" ", "-");

  root.innerHTML = `
    <h1 class="chatbot-title">Micro-Reflection</h1>
    <p class="chatbot-subtitle">Choose your interaction mode and connect Gemini before beginning CE → RO → AC → AE.</p>

    <div class="question-box">
      <p><strong>Gemini Connection</strong></p>
      <label for="session-token">Session token from backend (optional)</label>
      <input id="session-token" type="password" value="${escapeHtml(appState.sessionToken)}" placeholder="short-lived token" />
      <p class="chatbot-hint">Long-lived API keys are kept server-side in <code>GEMINI_API_KEY</code>. The browser never sends keys directly to Google.</p>
      <p class="chatbot-hint"><strong>Status:</strong> <span class="conn-status ${statusClass}">${appState.connectionStatus}</span> — ${escapeHtml(appState.connectionMessage)}</p>
      <div class="actions">
        <button class="btn" id="connect-btn" type="button" ${appState.connectionStatus === CONNECTION_STATUS.CONNECTING ? "disabled" : ""}>Test Gemini Connection</button>
      </div>
    </div>

    <div class="mode-options" role="radiogroup" aria-label="Mode select">
      <button class="mode-pill ${appState.mode === "Type" ? "active" : ""}" data-mode="Type" role="radio" aria-checked="${appState.mode === "Type"}">Type</button>
      <button class="mode-pill ${appState.mode === "Speak" ? "active" : ""}" data-mode="Speak" role="radio" aria-checked="${appState.mode === "Speak"}">Speak</button>
    </div>

    <p class="chatbot-hint">${
      appState.mode === "Speak"
        ? "Speak mode selected. In this standalone version, speech is simulated through text entry."
        : "Type mode selected."
    }</p>
    <div class="actions">
      <button class="btn primary" id="begin-btn" type="button" ${appState.connectionStatus !== CONNECTION_STATUS.CONNECTED ? "disabled" : ""}>Begin</button>
    </div>
  `;

  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      appState.mode = btn.getAttribute("data-mode");
      render();
    });
  });

  document.getElementById("session-token").addEventListener("input", (event) => {
    appState.sessionToken = event.target.value;
    if (appState.connectionStatus !== CONNECTION_STATUS.CONNECTING) {
      appState.connectionStatus = CONNECTION_STATUS.NOT_CONFIGURED;
      appState.connectionMessage = "Credentials updated. Run connection test.";
      render();
    }
  });

  document.getElementById("connect-btn").addEventListener("click", async () => {
    appState.connectionStatus = CONNECTION_STATUS.CONNECTING;
    appState.connectionMessage = "Testing Gemini route and credentials...";
    render();

    try {
      await testGeminiConnection({ sessionToken: appState.sessionToken });
      appState.connectionStatus = CONNECTION_STATUS.CONNECTED;
      appState.connectionMessage = "Gemini test call succeeded.";
    } catch (error) {
      const normalized = normalizeClientError(error);
      appState.connectionStatus = CONNECTION_STATUS.FAILED;
      appState.connectionMessage = mapFailureMessage(normalized.code);
    }
    render();
  });

  document.getElementById("begin-btn").addEventListener("click", () => {
    appState.screen = 2;
    render();
  });
}

function phaseProgressMarkup() {
  return `<div class="phase-row">${PHASES.map((phase, index) => {
    const statusClass =
      index < appState.phaseIndex
        ? "done"
        : index === appState.phaseIndex
          ? "active"
          : "";
    return `<span class="phase-chip ${statusClass}">${phase.key}</span>`;
  }).join("")}</div>`;
}

function currentPromptForPhase(phase) {
  const assistantTurns = appState.phaseAssistantTurns[phase.key];
  if (!assistantTurns.length) {
    return phase.initialPrompt;
  }
  return assistantTurns[assistantTurns.length - 1].prompt;
}

async function generateNextPrompt(phaseKey) {
  const phase = PHASES.find((entry) => entry.key === phaseKey);
  const turnCount = appState.phaseResponses[phaseKey].length + 1;
  const transcript = [
    { role: "assistant", content: phase.initialPrompt },
    ...appState.phaseResponses[phaseKey].map((content) => ({ role: "user", content }))
  ];

  const assistantTurn = await generateAssistantTurn({
    sessionToken: appState.sessionToken,
    phaseKey,
    turnCount,
    mode: appState.mode,
    transcript
  });

  if (assistantTurn.phase !== phaseKey || assistantTurn.turnCount !== turnCount) {
    throw new GeminiClientError("schema", "Assistant turn did not match expected phase/turn payload.");
  }

  appState.phaseAssistantTurns[phaseKey].push(assistantTurn);
}

function renderPhaseScreen() {
  const phase = PHASES[appState.phaseIndex];
  const responses = appState.phaseResponses[phase.key];
  const currentPrompt = currentPromptForPhase(phase);
  const canSave = !appState.generationInFlight && !appState.generationError;

  root.innerHTML = `
    <h1 class="chatbot-title">Micro-Reflection</h1>
    ${phaseProgressMarkup()}
    <p class="chatbot-subtitle"><strong>${phase.key} · ${phase.label}</strong></p>
    <div class="question-box">${escapeHtml(currentPrompt)}</div>
    ${appState.generationError ? `<p class="chatbot-hint" role="alert"><strong>Generation failed:</strong> ${escapeHtml(appState.generationError)}</p>` : ""}
    <label class="sr-only" for="response-input">Your response</label>
    <textarea id="response-input" placeholder="Share your reflection for ${phase.key}..."></textarea>
    <div class="actions">
      <button class="btn primary" id="submit-response" type="button" ${canSave ? "" : "disabled"}>Save Response</button>
      <button class="btn" id="retry-generation" type="button" ${appState.generationError ? "" : "disabled"}>Retry Gemini</button>
    </div>
    <div class="transcript" id="phase-transcript">
      ${responses
        .map(
          (entry, idx) =>
            `<div class="transcript-item"><strong>${phase.key} ${idx + 1}:</strong> ${escapeHtml(entry)}</div>`
        )
        .join("")}
    </div>
  `;

  document.getElementById("submit-response").addEventListener("click", async () => {
    const input = document.getElementById("response-input");
    const text = input.value.trim();

    if (!text) {
      input.focus();
      return;
    }

    appState.phaseResponses[phase.key].push(text);

    const totalForPhase = appState.phaseResponses[phase.key].length;
    if (totalForPhase >= 3) {
      appState.generationError = "";
      advancePhase();
      return;
    }

    appState.generationInFlight = true;
    appState.generationError = "";
    render();

    try {
      await generateNextPrompt(phase.key);
    } catch (error) {
      const normalized = normalizeClientError(error);
      appState.generationError = mapFailureMessage(normalized.code);
    } finally {
      appState.generationInFlight = false;
      render();
    }
  });

  document.getElementById("retry-generation").addEventListener("click", async () => {
    if (!appState.generationError) {
      return;
    }

    appState.generationInFlight = true;
    appState.generationError = "";
    render();

    try {
      await generateNextPrompt(phase.key);
    } catch (error) {
      const normalized = normalizeClientError(error);
      appState.generationError = mapFailureMessage(normalized.code);
    } finally {
      appState.generationInFlight = false;
      render();
    }
  });
}

function advancePhase() {
  if (appState.phaseIndex < PHASES.length - 1) {
    appState.phaseIndex += 1;
    appState.generationError = "";
    render();
    return;
  }

  appState.screen = 3;
  render();
}

function buildSummaryCards() {
  return PHASES.map((phase) => {
    const responses = appState.phaseResponses[phase.key];
    const summary = summarizePhase(responses);

    return `
      <article class="summary-card">
        <h3>${phase.key} · ${phase.label}</h3>
        <p><strong>Summary:</strong> ${escapeHtml(summary)}</p>
        <p><strong>Transcript:</strong> ${escapeHtml(responses.join(" | "))}</p>
      </article>
    `;
  }).join("");
}

function buildChatbotExportLines() {
  const lines = [
    "CE/RO/AC/AE Conversation Summary",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${appState.mode}`,
    `Peer sharing opt-in: ${appState.shareWithPeers ? "Yes" : "No"}`,
    ""
  ];

  PHASES.forEach((phase) => {
    lines.push(`${phase.key} - ${phase.label}`);
    lines.push(`Summary: ${summarizePhase(appState.phaseResponses[phase.key])}`);
    appState.phaseResponses[phase.key].forEach((response, idx) => {
      lines.push(`  ${idx + 1}. ${response}`);
    });
    lines.push("");
  });

  return lines;
}

function renderSummaryScreen() {
  root.innerHTML = `
    <h1 class="chatbot-title">Reflection Summary</h1>
    <p class="chatbot-subtitle">Your CE/RO/AC/AE responses are summarized below.</p>
    <section class="summary-grid">${buildSummaryCards()}</section>

    <label class="share-toggle" for="peer-toggle">
      <input id="peer-toggle" type="checkbox" ${appState.shareWithPeers ? "checked" : ""} />
      Opt-in to share excerpts with peers
    </label>

    <div class="actions">
      <button class="btn primary" id="download-pdf" type="button">Download PDF</button>
      <a class="btn" href="index.html">Return to slide deck</a>
    </div>
    <p class="chatbot-hint" id="download-status"></p>
  `;

  document.getElementById("peer-toggle").addEventListener("change", (event) => {
    appState.shareWithPeers = event.target.checked;
  });

  document.getElementById("download-pdf").addEventListener("click", () => {
    window.pdfExport.downloadPdf({
      filename: "chatbot-ce-ro-ac-ae-summary.pdf",
      lines: buildChatbotExportLines()
    });

    document.getElementById("download-status").textContent =
      "Downloaded chatbot-ce-ro-ac-ae-summary.pdf. This is the chatbot conversation summary export.";
  });
}

render();
