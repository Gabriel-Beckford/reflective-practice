const appState = {
  currentSlide: 0,
  responses: {},
  conversationHistory: []
};

const slides = [
  {
    id: "welcome",
    title: "Welcome",
    prompt: "Start your reflection by noticing how you feel right now."
  },
  {
    id: "awareness",
    title: "Awareness",
    prompt: "What moments today stood out, and why?"
  },
  {
    id: "next-step",
    title: "Next Step",
    prompt: "What is one small action you can take after this reflection?"
  }
];

const elements = {
  slideTitle: document.getElementById("slide-title"),
  slideContent: document.getElementById("slide-content"),
  prevButton: document.getElementById("prev-button"),
  nextButton: document.getElementById("next-button")
};

function recordConversationEntry(slide) {
  appState.conversationHistory.push({
    timestamp: new Date().toISOString(),
    slideId: slide.id,
    event: "viewed"
  });
}

function renderSlide() {
  const slide = slides[appState.currentSlide];
  elements.slideTitle.textContent = slide.title;
  elements.slideContent.innerHTML = `
    <p>${slide.prompt}</p>
    <label for="response-input-${slide.id}">Your response</label>
    <textarea
      id="response-input-${slide.id}"
      class="touch-target"
      rows="4"
      style="width: 100%; border-radius: 0.75rem; border: 1px solid #cac4d0; padding: 0.75rem;"
      aria-label="Response for ${slide.title}"
      placeholder="Type your reflection here"
    >${appState.responses[slide.id] || ""}</textarea>
  `;

  const textarea = document.getElementById(`response-input-${slide.id}`);
  textarea.addEventListener("input", (event) => {
    appState.responses[slide.id] = event.target.value;
  });

  elements.prevButton.disabled = appState.currentSlide === 0;
  elements.nextButton.textContent = appState.currentSlide === slides.length - 1 ? "Finish" : "Next";

  recordConversationEntry(slide);
}

function goToPreviousSlide() {
  if (appState.currentSlide === 0) return;
  appState.currentSlide -= 1;
  renderSlide();
}

function goToNextSlide() {
  if (appState.currentSlide < slides.length - 1) {
    appState.currentSlide += 1;
    renderSlide();
    return;
  }

  elements.slideTitle.textContent = "Reflection complete";
  elements.slideContent.innerHTML = "<p>Thanks for reflecting. Your responses are stored in app state for now.</p>";
  elements.nextButton.disabled = true;
}

function initializeNavigation() {
  elements.prevButton.addEventListener("click", goToPreviousSlide);
  elements.nextButton.addEventListener("click", goToNextSlide);
}

initializeNavigation();
renderSlide();

window.reflectivePracticeApp = {
  appState,
  goToPreviousSlide,
  goToNextSlide
};
