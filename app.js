const slides = [
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
    revealSteps: [
      "What moments today stood out, and why?"
    ],
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
    interactionType: "textarea",
    revealSteps: ["What new perspective feels most useful right now?"],
    required: {
      type: "minLength",
      value: 15,
      message: "Write a short reflection to move forward."
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
    interactionType: "textarea",
    revealSteps: ["Which strength showed up for you today?"],
    required: {
      type: "minLength",
      value: 12,
      message: "Add a specific strength example to continue."
    },
    next: "s5-orientation"
  },
  {
    id: "s5-orientation",
    section: 5,
    title: "Section 5 · Orientation",
    type: "content",
    revealSteps: [
      "Section 5 examines obstacles.",
      "Name friction points without judgment."
    ],
    next: "s5-question"
  },
  {
    id: "s5-question",
    section: 5,
    title: "Section 5 · Reflection Prompt",
    type: "question",
    interactionType: "textarea",
    revealSteps: ["What obstacle deserves your attention next?"],
    required: {
      type: "minLength",
      value: 12,
      message: "Describe the obstacle before advancing."
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
  responses: {},
  conversationHistory: []
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
  if (currentIndex <= 0) {
    return null;
  }

  return slides[currentIndex - 1].id;
}

function validateQuestionSlide(slide) {
  if (slide.type !== "question") {
    return { valid: true, message: "" };
  }

  const response = (appState.responses[slide.id] || "").trim();

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
  return slides.filter((slide) => {
    if (slide.type === "content") {
      return true;
    }

    return validateQuestionSlide(slide).valid;
  }).length;
}

function updateProgressIndicator(currentSlide) {
  const completedSlides = getCompletedSlideCount();
  const totalSlides = slides.length;
  const sectionSlides = slides.filter((slide) => slide.section === currentSlide.section);
  const sectionCompleted = sectionSlides.filter((slide) => {
    if (slide.type === "content") {
      return true;
    }

    return validateQuestionSlide(slide).valid;
  }).length;

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
  const visibleSteps = slide.revealSteps.slice(0, appState.currentRevealStep);
  return visibleSteps.map((step, index) => `<p data-step="${index + 1}">${step}</p>`).join("");
}

function renderQuestionInput(slide) {
  if (slide.type !== "question") {
    return "";
  }

  const validation = validateQuestionSlide(slide);
  return `
    <label for="response-input-${slide.id}">Your response</label>
    <textarea
      id="response-input-${slide.id}"
      class="touch-target response-input"
      rows="4"
      aria-label="Response for ${slide.title}"
      placeholder="Type your reflection here"
    >${appState.responses[slide.id] || ""}</textarea>
    <p id="validation-message-${slide.id}" class="validation-message" role="status" aria-live="polite">${validation.message}</p>
  `;
}

function updateNavigationState(slide) {
  elements.prevButton.disabled = getSlideIndex(slide.id) === 0;

  const hasMoreRevealSteps = appState.currentRevealStep < slide.revealSteps.length;
  if (hasMoreRevealSteps) {
    elements.nextButton.textContent = "Continue";
    return;
  }

  elements.nextButton.textContent = slide.next ? "Next" : "Finish";
}

function bindQuestionInput(slide) {
  if (slide.type !== "question") {
    return;
  }

  const textarea = document.getElementById(`response-input-${slide.id}`);
  const validationNode = document.getElementById(`validation-message-${slide.id}`);

  textarea.addEventListener("input", (event) => {
    appState.responses[slide.id] = event.target.value;
    const validation = validateQuestionSlide(slide);
    validationNode.textContent = validation.message;
  });
}

function renderSlide(slideId) {
  const slide = slideById.get(slideId);
  if (!slide) {
    return;
  }

  appState.currentSlideId = slideId;
  elements.slideTitle.textContent = slide.title;
  elements.slideContent.innerHTML = `
    ${renderRevealSteps(slide)}
    ${renderQuestionInput(slide)}
  `;

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
  elements.slideContent.innerHTML = "<p>Thanks for reflecting. Your responses are stored in app state for now.</p>";
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
