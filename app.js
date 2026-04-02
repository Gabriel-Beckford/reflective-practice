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

const appState = {
  currentSlideId: slides[0].id,
  currentRevealStep: 1,
  responses: {
    s1-warmup: { transcript: [] },
    s5-phases: { transcript: [], phases: {} }
  },
  conversationHistory: [],
  chatDrafts: {},
  chatPending: {}
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
    <button id="send-button-${slide.id}" type="button" class="touch-target" ${pending ? "disabled" : ""}>${pending ? "Sending..." : "Send"}</button>
    <p id="validation-message-${slide.id}" class="validation-message" role="status" aria-live="polite">${validation.message}</p>
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
  return `
    <label for="response-input-${slide.id}">Your response</label>
    <textarea
      id="response-input-${slide.id}"
      class="touch-target response-input"
      rows="4"
      aria-label="Response for ${slide.title}"
      placeholder="Type your reflection here"
    >${currentValue || ""}</textarea>
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
  elements.slideContent.innerHTML = "<p>Thanks for reflecting. Section transcripts are stored in <code>responses</code> for final summary/PDF export flows.</p>";
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
