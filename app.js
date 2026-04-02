import { callGemini } from "./src/ai/gemini.js";
import { createSection1WarmupController } from "./src/controllers/section1WarmupController.js";
import { createSection5Controller } from "./src/controllers/section5Controller.js";
import {
  bindInteraction,
  createFeedbackPlaceholder,
  renderInteraction,
  validateInteraction
} from "./src/interactions/activityInteractions.js";
import { createResponsePayload, getResponseValue } from "./src/interactions/responsePayload.js";

const slides = [
  {
    id: "s1-warmup",
    section: 1,
    title: "Section 1 · Warm-up Chat",
    type: "question",
    interactionType: "chat",
    controller: "section1",
    revealSteps: ["Share short reflections. The coach asks one warm-up question at a time."],
    required: {
      type: "chatComplete",
      message: "Complete the warm-up chat before continuing."
    },
    next: "s2-arrival"
  },
  {
    id: "s2-arrival",
    section: 2,
    title: "Section 2 · Arrival",
    type: "content",
    revealSteps: [
      "Take one steady breath before you start.",
      "Notice where your attention is landing right now.",
      "Name one intention for this reflection session."
    ],
    next: "s2-checkin"
  },
  {
    id: "s2-checkin",
    section: 2,
    title: "Section 2 · Check-in",
    type: "question",
    interactionType: "textarea",
    revealSteps: ["What moments today stood out, and why?"],
    required: {
      type: "minLength",
      value: 20,
      message: "Please enter at least 20 characters before continuing."
    },
    next: "s2-patterns"
  },
  {
    id: "s2-patterns",
    section: 2,
    title: "Section 2 · Patterns",
    type: "content",
    revealSteps: [
      "Look for a repeated theme in your day.",
      "Ask: what helped you stay grounded?",
      "Ask: what pulled you away from your priorities?"
    ],
    next: "s2-commitment"
  },
  {
    id: "s2-commitment",
    section: 2,
    title: "Section 2 · Commitment",
    type: "question",
    interactionType: "textarea",
    revealSteps: ["What is one small action you will take next?"],
    required: {
      type: "minLength",
      value: 10,
      message: "Share one actionable next step to continue."
    },
    next: "s3-orientation"
  },
  {
    id: "s3-orientation",
    section: 3,
    title: "Section 3 · Orientation",
    type: "content",
    revealSteps: [
      "Section 3 focuses on clarity.",
      "You will identify one useful perspective shift."
    ],
    next: "s3-question"
  },
  {
    id: "s3-question",
    section: 3,
    title: "Section 3 · Reflection Prompt",
    type: "question",
    interactionType: "descriptorToggles",
    interactionConfig: {
      prompt: "Mark each descriptor Yes/No based on your current perspective.",
      descriptors: ["Clear", "Actionable", "Compassionate", "Grounded"]
    },
    revealSteps: ["Use the descriptor toggles to map the quality of your perspective."],
    required: {
      type: "minSelections",
      value: 1,
      message: "Set at least one descriptor to Yes before continuing."
    },
    next: "s4-orientation"
  },
  {
    id: "s4-orientation",
    section: 4,
    title: "Section 4 · Orientation",
    type: "content",
    revealSteps: [
      "Section 4 is about strengths.",
      "Capture evidence of what went well."
    ],
    next: "s4-question"
  },
  {
    id: "s4-question",
    section: 4,
    title: "Section 4 · Reflection Prompt",
    type: "question",
    interactionType: "descriptorToggles",
    interactionConfig: {
      prompt: "Reuse the same descriptors for your strengths check.",
      descriptors: ["Clear", "Actionable", "Compassionate", "Grounded"]
    },
    revealSteps: ["Which strengths are visible in your current reflection state?"],
    required: {
      type: "minSelections",
      value: 1,
      message: "Set at least one descriptor to Yes before continuing."
    },
    next: "s5-orientation"
  },
  {
    id: "s5-orientation",
    section: 5,
    title: "Section 5 · Orientation",
    type: "content",
    revealSteps: [
      "Section 5 now uses guided phases.",
      "Respond after each phase question to unlock the next one."
    ],
    next: "s5-phases"
  },
  {
    id: "s5-phases",
    section: 5,
    title: "Section 5 · Guided Phases",
    type: "question",
    interactionType: "chat",
    controller: "section5",
    revealSteps: ["Phase order is strict: Observe → Analyze → Reframe → Commit."],
    required: {
      type: "chatComplete",
      message: "Complete all Section 5 phases before advancing."
    },
    next: "s6-orientation"
  },
  {
    id: "s6-orientation",
    section: 6,
    title: "Section 6 · Orientation",
    type: "content",
    revealSteps: [
      "Section 6 moves from insight to planning.",
      "Keep your next step concrete and small."
    ],
    next: "s6-question"
  },
  {
    id: "s6-question",
    section: 6,
    title: "Section 6 · Reflection Prompt",
    type: "question",
    interactionType: "textarea",
    revealSteps: ["What is your plan for the next 24 hours?"],
    required: {
      type: "minLength",
      value: 15,
      message: "Enter a concrete 24-hour plan to continue."
    },
    next: "s7-orientation"
  },
  {
    id: "s7-orientation",
    section: 7,
    title: "Section 7 · Orientation",
    type: "content",
    revealSteps: [
      "Section 7 closes your reflection loop.",
      "Acknowledge what you want to carry forward."
    ],
    next: "s7-question"
  },
  {
    id: "s7-question",
    section: 7,
    title: "Section 7 · Closing Prompt",
    type: "question",
    interactionType: "textarea",
    revealSteps: ["What commitment will you revisit tomorrow?"],
    required: {
      type: "minLength",
      value: 12,
      message: "Add a clear commitment before finishing."
    },
    next: null
  }
];

const slideById = new Map(slides.map((slide) => [slide.id, slide]));
const SPEECH_UNSUPPORTED_MESSAGE =
  "Speech input is not available in this browser. You can continue by typing your response.";
const PADLET_URL = "https://padlet.com/";
const FEEDBACK_STORAGE_KEY = "reflective-practice-feedback";

const appState = {
  currentSlideId: slides[0].id,
  currentRevealStep: 1,
  responses: {
    s1-warmup: { transcript: [] },
    s5-phases: { transcript: [], phases: {} }
  },
  conversationHistory: [],
  chatDrafts: {},
  chatPending: {},
  feedback: {
    rating: "",
    comment: "",
    status: ""
  }
};

const chatControllers = {
  section1: createSection1WarmupController({
    callModel: callGemini,
    onPersist: (payload) => {
      appState.responses["s1-warmup"] = payload;
    }
  }),
  section5: createSection5Controller({
    callModel: callGemini,
    onPersist: (payload) => {
      appState.responses["s5-phases"] = payload;
    }
  })
};

const elements = {
  slideTitle: document.getElementById("slide-title"),
  slideContent: document.getElementById("slide-content"),
  prevButton: document.getElementById("prev-button"),
  nextButton: document.getElementById("next-button")
};

function recordConversationEntry(slide, event) {
  appState.conversationHistory.push({
    timestamp: new Date().toISOString(),
    slideId: slide.id,
    event
  });
}

function getCurrentSlide() {
  return slideById.get(appState.currentSlideId);
}

function getSlideIndex(slideId) {
  return slides.findIndex((slide) => slide.id === slideId);
}

function getPreviousSlideId(slideId) {
  const currentIndex = getSlideIndex(slideId);
  return currentIndex <= 0 ? null : slides[currentIndex - 1].id;
}

function validateQuestionSlide(slide) {
  if (slide.type !== "question") {
    return { valid: true, message: "" };
  }

  if (slide.required?.type === "chatComplete") {
    const controller = chatControllers[slide.controller];
    const isValid = Boolean(controller?.isComplete());
    return {
      valid: isValid,
      message: isValid ? "" : slide.required.message
    };
  }

  if (
    ["singleSelectMcq", "multiSelectMcq", "descriptorToggles", "shortAnswer", "tapToMatch"].includes(slide.interactionType)
  ) {
    return validateInteraction(slide, appState.responses[slide.id] || null);
  }

  const response = String(getResponseValue(appState.responses[slide.id]) || "").trim();

  if (slide.required?.type === "minLength") {
    const isValid = response.length >= slide.required.value;
    return {
      valid: isValid,
      message: isValid ? "" : slide.required.message
    };
  }

  return { valid: true, message: "" };
}

function getCompletedSlideCount() {
  return slides.filter((slide) => (slide.type === "content" ? true : validateQuestionSlide(slide).valid)).length;
}

function updateProgressIndicator(currentSlide) {
  const completedSlides = getCompletedSlideCount();
  const totalSlides = slides.length;
  const sectionSlides = slides.filter((slide) => slide.section === currentSlide.section);
  const sectionCompleted = sectionSlides.filter((slide) => (slide.type === "content" ? true : validateQuestionSlide(slide).valid)).length;

  const progressMarkup = `
    <div class="progress-card" aria-live="polite">
      <p class="progress-meta">Section ${currentSlide.section}</p>
      <p class="progress-label">Section progress: ${sectionCompleted}/${sectionSlides.length}</p>
      <progress max="${sectionSlides.length}" value="${sectionCompleted}" aria-label="Section progress"></progress>
      <p class="progress-label">Overall progress: ${completedSlides}/${totalSlides}</p>
      <progress max="${totalSlides}" value="${completedSlides}" aria-label="Overall progress"></progress>
    </div>
  `;

  elements.slideContent.insertAdjacentHTML("afterbegin", progressMarkup);
}

function renderRevealSteps(slide) {
  return slide.revealSteps.slice(0, appState.currentRevealStep).map((step, index) => `<p data-step="${index + 1}">${step}</p>`).join("");
}

function renderTranscript(entries) {
  return entries
    .map((entry) => `<p><strong>${entry.role === "assistant" ? "Coach" : "You"}:</strong> ${entry.content}</p>`)
    .join("");
}

function renderChatInput(slide) {
  const responseEntry = appState.responses[slide.id] || { transcript: [] };
  const draft = appState.chatDrafts[slide.id] || "";
  const pending = Boolean(appState.chatPending[slide.id]);
  const validation = validateQuestionSlide(slide);

  return `
    <div class="chat-transcript" aria-live="polite">
      ${renderTranscript(responseEntry.transcript || []) || "<p>Coach is preparing the first prompt…</p>"}
    </div>
    <label for="response-input-${slide.id}">Your response</label>
    <textarea
      id="response-input-${slide.id}"
      class="touch-target response-input"
      rows="3"
      aria-label="Response for ${slide.title}"
      placeholder="Type your response"
      ${pending ? "disabled" : ""}
    >${draft}</textarea>
    <div class="assistive-actions">
      <button id="speech-button-${slide.id}" type="button" class="touch-target secondary-action" ${pending ? "disabled" : ""}>🎤 Speak</button>
      <p id="speech-status-${slide.id}" class="assistive-status" aria-live="polite"></p>
    </div>
    <button id="send-button-${slide.id}" type="button" class="touch-target" ${pending ? "disabled" : ""}>${pending ? "Sending..." : "Send"}</button>
    ${slide.id === "s5-phases" ? renderSection57SummaryCard() : ""}
    <p id="validation-message-${slide.id}" class="validation-message" role="status" aria-live="polite">${validation.message}</p>
  `;
}

function getSection57SummaryEntries() {
  const phasePayload = appState.responses["s5-phases"]?.phases || {};
  const aliases = {
    ce: ["ce", "observe"],
    ro: ["ro", "analyze"],
    ac: ["ac", "reframe"],
    ae: ["ae", "commit"]
  };

  return [
    { id: "ce", label: "CE · Concrete Experience" },
    { id: "ro", label: "RO · Reflective Observation" },
    { id: "ac", label: "AC · Abstract Conceptualization" },
    { id: "ae", label: "AE · Active Experimentation" }
  ].map((entry) => {
    const key = aliases[entry.id].find((candidate) => phasePayload[candidate]);
    const value = phasePayload[key]?.response || "";
    return { ...entry, value };
  });
}

function renderSection57SummaryCard() {
  const entries = getSection57SummaryEntries();
  const hasAnyContent = entries.some((entry) => entry.value);
  if (!hasAnyContent) {
    return "";
  }

  const rows = entries
    .map((entry) => `<li><strong>${entry.label}:</strong> ${entry.value || "Not provided yet."}</li>`)
    .join("");

  return `
    <section class="summary-card" aria-labelledby="section-57-summary-title">
      <h3 id="section-57-summary-title">Section 5.7 Summary Card</h3>
      <p>This card compiles your CE/RO/AC/AE responses from Section 5.</p>
      <ul>${rows}</ul>
    </section>
  `;
}

function renderQuestionInput(slide) {
  if (slide.type !== "question") {
    return "";
  }

  if (slide.interactionType === "chat") {
    return renderChatInput(slide);
  }

  if (["singleSelectMcq", "multiSelectMcq", "descriptorToggles", "shortAnswer", "tapToMatch"].includes(slide.interactionType)) {
    return renderInteraction(slide, appState.responses[slide.id] || null);
  }

  const validation = validateQuestionSlide(slide);
  const existingResponse = appState.responses[slide.id];
  const currentValue = typeof existingResponse === "object" ? getResponseValue(existingResponse) : existingResponse;
  const localFeedback =
    existingResponse?.localFeedback || createFeedbackPlaceholder(slide, validation);

  const section6PadletMarkup =
    slide.id === "s6-question"
      ? `
      <section class="handoff-card" aria-labelledby="padlet-handoff-title">
        <h3 id="padlet-handoff-title">Section 6 · Optional Padlet handoff</h3>
        <p>If you want to continue planning with peers, hand off to Padlet in a new tab.</p>
        <button id="padlet-button" type="button" class="touch-target secondary-action">Open Padlet workspace</button>
        <p class="assistive-status">You are leaving this reflection page temporarily and can return anytime.</p>
      </section>
    `
      : "";

  const section7FeedbackMarkup =
    slide.id === "s7-question"
      ? `
      <section class="feedback-card" aria-labelledby="feedback-title">
        <h3 id="feedback-title">Section 7 · Feedback</h3>
        <p>Rate this reflection flow (1–5). Comment is optional.</p>
        <form id="feedback-form">
          <div class="rating-row" role="radiogroup" aria-label="Reflection rating">
            ${[1, 2, 3, 4, 5]
              .map(
                (value) =>
                  `<label><input type="radio" name="feedback-rating" value="${value}" ${
                    Number(appState.feedback.rating) === value ? "checked" : ""
                  } /> ${value}</label>`
              )
              .join("")}
          </div>
          <label for="feedback-comment">Optional comment</label>
          <textarea id="feedback-comment" class="response-input" rows="3" placeholder="Share what worked well or what to improve.">${
            appState.feedback.comment || ""
          }</textarea>
          <button id="feedback-submit" type="submit" class="touch-target secondary-action">Submit feedback</button>
          <p id="feedback-status" class="assistive-status" role="status" aria-live="polite">${appState.feedback.status || ""}</p>
        </form>
      </section>
    `
      : "";

  return `
    <label for="response-input-${slide.id}">Your response</label>
    <textarea
      id="response-input-${slide.id}"
      class="touch-target response-input"
      rows="4"
      aria-label="Response for ${slide.title}"
      placeholder="Type your reflection here"
    >${currentValue || ""}</textarea>
    <div class="assistive-actions">
      <button id="speech-button-${slide.id}" type="button" class="touch-target secondary-action">🎤 Speak</button>
      <p id="speech-status-${slide.id}" class="assistive-status" aria-live="polite"></p>
    </div>
    ${section6PadletMarkup}
    ${section7FeedbackMarkup}
    <p id="validation-message-${slide.id}" class="validation-message" role="status" aria-live="polite">${localFeedback}</p>
  `;
}

function updateNavigationState(slide) {
  elements.prevButton.disabled = getSlideIndex(slide.id) === 0;

  if (appState.currentRevealStep < slide.revealSteps.length) {
    elements.nextButton.textContent = "Continue";
    return;
  }

  elements.nextButton.textContent = slide.next ? "Next" : "Finish";
}

async function sendChatResponse(slide) {
  const input = document.getElementById(`response-input-${slide.id}`);
  const validationNode = document.getElementById(`validation-message-${slide.id}`);
  const controller = chatControllers[slide.controller];
  if (!input || !controller) {
    return;
  }

  appState.chatPending[slide.id] = true;
  appState.chatDrafts[slide.id] = input.value;
  renderSlide(slide.id);

  const result = await controller.handleLearnerResponse(appState.chatDrafts[slide.id]);
  appState.chatPending[slide.id] = false;
  appState.chatDrafts[slide.id] = "";

  if (!result.ok && validationNode) {
    validationNode.textContent = result.message;
  }

  renderSlide(slide.id);
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function bindSpeechInput(slide) {
  const speechButton = document.getElementById(`speech-button-${slide.id}`);
  const input = document.getElementById(`response-input-${slide.id}`);
  const statusNode = document.getElementById(`speech-status-${slide.id}`);
  if (!speechButton || !input || !statusNode) {
    return;
  }

  speechButton.addEventListener("click", () => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      statusNode.textContent = SPEECH_UNSUPPORTED_MESSAGE;
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      statusNode.textContent = "Listening…";
      speechButton.disabled = true;
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) {
        statusNode.textContent = "No speech captured. Please try again.";
        return;
      }
      input.value = input.value ? `${input.value} ${transcript}` : transcript;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      statusNode.textContent = "Speech added to your response.";
    };
    recognition.onerror = () => {
      statusNode.textContent = "Speech input encountered an error. You can keep typing.";
    };
    recognition.onend = () => {
      speechButton.disabled = false;
    };

    recognition.start();
  });
}

function getSafeExternalLink(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function bindPadletCta() {
  const button = document.getElementById("padlet-button");
  if (!button) {
    return;
  }
  const safeUrl = getSafeExternalLink(PADLET_URL);
  if (!safeUrl) {
    button.disabled = true;
    return;
  }
  button.addEventListener("click", () => {
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  });
}

async function submitFeedback(payload) {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(payload));
  return { ok: true };
}

function bindFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const commentField = document.getElementById("feedback-comment");
  const statusNode = document.getElementById("feedback-status");
  if (!form || !commentField || !statusNode) {
    return;
  }

  commentField.addEventListener("input", (event) => {
    appState.feedback.comment = event.target.value;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const rating = form.querySelector('input[name="feedback-rating"]:checked')?.value || "";
    if (!rating) {
      appState.feedback.status = "Please select a rating from 1 to 5.";
      statusNode.textContent = appState.feedback.status;
      return;
    }

    const payload = {
      rating: Number(rating),
      comment: String(commentField.value || "").trim(),
      submittedAt: new Date().toISOString()
    };
    const result = await submitFeedback(payload);
    appState.feedback.rating = rating;
    appState.feedback.comment = payload.comment;
    appState.feedback.status = result.ok ? "Thanks! Your feedback was saved locally." : "Feedback submission failed.";
    statusNode.textContent = appState.feedback.status;
  });
}

function formatResponseValue(slideId) {
  const response = appState.responses[slideId];
  if (!response) {
    return "Not provided.";
  }

  if (response?.transcript?.length) {
    return response.transcript
      .map((entry) => `${entry.role === "assistant" ? "Coach" : "You"}: ${entry.content}`)
      .join("\n");
  }

  const rawValue = getResponseValue(response);
  if (rawValue && typeof rawValue === "object") {
    return JSON.stringify(rawValue);
  }
  return String(rawValue || "Not provided.");
}

function exportReflectionPdf() {
  const jsPdfApi = window.jspdf?.jsPDF;
  if (!jsPdfApi) {
    window.alert("PDF export is unavailable in this browser.");
    return;
  }

  const learnerName = document.getElementById("learner-name-input")?.value?.trim() || "";
  const doc = new jsPdfApi({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const bottomMargin = 56;
  const lineHeight = 16;
  let y = 48;

  const addWrappedLine = (text, options = {}) => {
    const fontSize = options.fontSize || 11;
    const indent = options.indent || 0;
    const style = options.style || "normal";
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    const wrapped = doc.splitTextToSize(text, 500 - indent);
    wrapped.forEach((line) => {
      if (y > pageHeight - bottomMargin) {
        doc.addPage();
        y = 48;
      }
      doc.text(line, marginX + indent, y);
      y += lineHeight;
    });
  };

  addWrappedLine("Reflective Practice Summary", { fontSize: 18, style: "bold" });
  addWrappedLine(`Export date: ${new Date().toLocaleDateString()}`);
  addWrappedLine(`Learner name: ${learnerName || "Not provided"}`);
  y += 4;

  const sectionHeadings = [
    { label: "Section 1 · Warm-up", ids: ["s1-warmup"] },
    { label: "Section 2 · Arrival + Check-in", ids: ["s2-checkin", "s2-commitment"] },
    { label: "Section 3 · Reflection Prompt", ids: ["s3-question"] },
    { label: "Section 4 · Reflection Prompt", ids: ["s4-question"] },
    { label: "Section 5 · Guided Phases (CE/RO/AC/AE)", ids: ["s5-phases"] },
    { label: "Section 6 · Plan", ids: ["s6-question"] },
    { label: "Section 7 · Closing + Feedback", ids: ["s7-question"] }
  ];

  sectionHeadings.forEach((section) => {
    addWrappedLine(section.label, { fontSize: 13, style: "bold" });
    section.ids.forEach((id) => {
      addWrappedLine(formatResponseValue(id), { indent: 12 });
    });
    if (section.label.includes("Section 5")) {
      getSection57SummaryEntries().forEach((entry) => {
        addWrappedLine(`${entry.label}: ${entry.value || "Not provided."}`, { indent: 12 });
      });
    }
    y += 4;
  });

  if (appState.feedback.rating) {
    addWrappedLine(`Feedback rating: ${appState.feedback.rating}/5`, { style: "bold" });
    addWrappedLine(`Feedback comment: ${appState.feedback.comment || "No comment provided."}`);
  }

  doc.save("reflective-practice-summary.pdf");
}

function renderCompletionView() {
  return `
    <p>Thanks for reflecting. You can export your responses as a PDF summary.</p>
    ${renderSection57SummaryCard()}
    <section class="export-card" aria-labelledby="export-title">
      <h3 id="export-title">Export your reflection</h3>
      <label for="learner-name-input">Learner name (optional)</label>
      <input id="learner-name-input" class="response-input" type="text" placeholder="Enter your name for the report" />
      <button id="export-pdf-button" type="button" class="touch-target">Download PDF</button>
    </section>
  `;
}

function bindQuestionInput(slide) {
  if (slide.type !== "question") {
    return;
  }

  if (slide.interactionType === "chat") {
    const textarea = document.getElementById(`response-input-${slide.id}`);
    const sendButton = document.getElementById(`send-button-${slide.id}`);
    if (textarea) {
      textarea.addEventListener("input", (event) => {
        appState.chatDrafts[slide.id] = event.target.value;
      });
    }

    if (sendButton) {
      sendButton.addEventListener("click", () => {
        sendChatResponse(slide);
      });
    }
    bindSpeechInput(slide);

    const controller = chatControllers[slide.controller];
    if ((appState.responses[slide.id]?.transcript || []).length === 0 && controller) {
      appState.chatPending[slide.id] = true;
      controller.ensureStarted().finally(() => {
        appState.chatPending[slide.id] = false;
        renderSlide(slide.id);
      });
    }

    return;
  }

  if (["singleSelectMcq", "multiSelectMcq", "descriptorToggles", "shortAnswer", "tapToMatch"].includes(slide.interactionType)) {
    bindInteraction(slide, appState.responses[slide.id] || null, (payload) => {
      appState.responses[slide.id] = payload;
    });
    return;
  }

  const textarea = document.getElementById(`response-input-${slide.id}`);
  const validationNode = document.getElementById(`validation-message-${slide.id}`);
  bindSpeechInput(slide);
  bindPadletCta();
  bindFeedbackForm();

  textarea.addEventListener("input", (event) => {
    const value = event.target.value;
    const validation = validateInteraction(slide, { value });
    appState.responses[slide.id] = createResponsePayload({
      slideId: slide.id,
      interactionType: slide.interactionType,
      value,
      isValid: validation.valid,
      localFeedback: createFeedbackPlaceholder(slide, validation),
      metadata: { charCount: value.length },
      event: "input"
    });
    validationNode.textContent = createFeedbackPlaceholder(slide, validation);
  });
}

function renderSlide(slideId) {
  const slide = slideById.get(slideId);
  if (!slide) {
    return;
  }

  appState.currentSlideId = slideId;
  elements.slideTitle.textContent = slide.title;
  elements.slideContent.innerHTML = `${renderRevealSteps(slide)}${renderQuestionInput(slide)}`;

  updateProgressIndicator(slide);
  updateNavigationState(slide);
  bindQuestionInput(slide);
  recordConversationEntry(slide, "viewed");
}

function revealNextContent() {
  const slide = getCurrentSlide();
  if (!slide) {
    return true;
  }

  if (appState.currentRevealStep < slide.revealSteps.length) {
    appState.currentRevealStep += 1;
    renderSlide(slide.id);
    recordConversationEntry(slide, "revealed-step");
    return false;
  }

  return true;
}

function goToPreviousSlide() {
  const previousSlideId = getPreviousSlideId(appState.currentSlideId);
  if (!previousSlideId) {
    return;
  }

  appState.currentRevealStep = slideById.get(previousSlideId).revealSteps.length;
  renderSlide(previousSlideId);
}

function goToNextSlide() {
  const readyToAdvance = revealNextContent();
  if (!readyToAdvance) {
    return;
  }

  const slide = getCurrentSlide();
  const validation = validateQuestionSlide(slide);
  if (!validation.valid) {
    const validationNode = document.getElementById(`validation-message-${slide.id}`);
    if (validationNode) {
      validationNode.textContent = validation.message;
    }
    return;
  }

  if (slide.next) {
    appState.currentRevealStep = 1;
    renderSlide(slide.next);
    return;
  }

  elements.slideTitle.textContent = "Reflection complete";
  elements.slideContent.innerHTML = renderCompletionView();
  const exportButton = document.getElementById("export-pdf-button");
  if (exportButton) {
    exportButton.addEventListener("click", exportReflectionPdf);
  }
  elements.prevButton.disabled = false;
  elements.nextButton.disabled = true;
  recordConversationEntry(slide, "completed");
}

function initializeNavigation() {
  elements.prevButton.addEventListener("click", goToPreviousSlide);
  elements.nextButton.addEventListener("click", goToNextSlide);
}

initializeNavigation();
renderSlide(appState.currentSlideId);

window.reflectivePracticeApp = {
  appState,
  renderSlide,
  revealNextContent,
  goToPreviousSlide,
  goToNextSlide
};
