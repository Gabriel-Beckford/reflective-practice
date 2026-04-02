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

const appState = {
  screen: 1,
  mode: "Type",
  phaseIndex: 0,
  followUpIndex: 0,
  phaseResponses: {
    CE: [],
    RO: [],
    AC: [],
    AE: []
  },
  shareWithPeers: false
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

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3);
}

function buildFollowUps(phaseKey, responseText) {
  const keywords = extractKeywords(responseText);
  const keywordHint = keywords.length ? ` around ${keywords.join(", ")}` : "";

  const followUpLibrary = {
    CE: [
      `What happened immediately before that moment${keywordHint}?`,
      "What detail from that event still feels most important right now?"
    ],
    RO: [
      "Which emotion felt strongest for you during that moment, and why?",
      "If a colleague observed the class, what might they say they noticed in student reactions?"
    ],
    AC: [
      "What pattern have you seen across similar lessons?",
      "Which principle or framework best explains why this unfolded that way?"
    ],
    AE: [
      "What exact action will you test first, and when will you try it?",
      "How will you know whether the change is working for students?"
    ]
  };

  return followUpLibrary[phaseKey];
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
  root.innerHTML = `
    <h1 class="chatbot-title">Micro-Reflection</h1>
    <p class="chatbot-subtitle">Choose your interaction mode and begin your CE → RO → AC → AE reflection.</p>
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
      <button class="btn primary" id="begin-btn" type="button">Begin</button>
    </div>
  `;

  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      appState.mode = btn.getAttribute("data-mode");
      render();
    });
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

function renderPhaseScreen() {
  const phase = PHASES[appState.phaseIndex];
  const responses = appState.phaseResponses[phase.key];
  const followUps = responses.length ? buildFollowUps(phase.key, responses[0]) : [];
  const currentPrompt = responses.length === 0 ? phase.initialPrompt : followUps[appState.followUpIndex];

  root.innerHTML = `
    <h1 class="chatbot-title">Micro-Reflection</h1>
    ${phaseProgressMarkup()}
    <p class="chatbot-subtitle"><strong>${phase.key} · ${phase.label}</strong></p>
    <div class="question-box">${escapeHtml(currentPrompt)}</div>
    <label class="sr-only" for="response-input">Your response</label>
    <textarea id="response-input" placeholder="Share your reflection for ${phase.key}..."></textarea>
    <div class="actions">
      <button class="btn primary" id="submit-response" type="button">Save Response</button>
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

  document.getElementById("submit-response").addEventListener("click", () => {
    const input = document.getElementById("response-input");
    const text = input.value.trim();

    if (!text) {
      input.focus();
      return;
    }

    appState.phaseResponses[phase.key].push(text);

    const totalForPhase = appState.phaseResponses[phase.key].length;
    if (totalForPhase >= 3) {
      advancePhase();
      return;
    }

    appState.followUpIndex += 1;
    render();
  });
}

function advancePhase() {
  if (appState.phaseIndex < PHASES.length - 1) {
    appState.phaseIndex += 1;
    appState.followUpIndex = 0;
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
    const now = new Date().toISOString().slice(0, 10);
    const lines = [
      "Micro-Reflection",
      `Date: ${now}`,
      `Mode: ${appState.mode}`,
      `Peer sharing opt-in: ${appState.shareWithPeers ? "Yes" : "No"}`,
      ""
    ];

    PHASES.forEach((phase) => {
      lines.push(`${phase.key} - ${phase.label}`);
      appState.phaseResponses[phase.key].forEach((response, idx) => {
        lines.push(`  ${idx + 1}. ${response}`);
      });
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "micro-reflection.pdf";
    link.click();
    URL.revokeObjectURL(url);

    document.getElementById("download-status").textContent =
      "Downloaded micro-reflection.pdf. (File is generated from captured transcript content.)";
  });
}

render();
