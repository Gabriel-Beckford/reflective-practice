(() => {
  function createRenderCore({
    state,
    slides,
    elements,
    sectionSummariesRef,
    resolveInteractionType,
    isSlideIncludedByPathway,
    findNextIncludedIndex,
    getPairGroupByIndex,
    isCarouselModeActive,
    getSectionMeta,
    createPhaseChip,
    createSegmentedControl,
    renderSection3PairedUnit,
    renderSlideByInteractionType,
    getSubmitKey,
    getResponse,
    renderFeedback,
    renderYesNoFeedback,
    pairedGroups,
    renderSectionMenu,
    onSetNavState
  }) {
    function render() {
      if (!isSlideIncludedByPathway(slides[state.index])) {
        state.index = findNextIncludedIndex(state.index, 1);
      }
      const slide = slides[state.index];
      const interactionType = resolveInteractionType(slide);
      const pairGroup = getPairGroupByIndex(state.index);
      const carouselActive = isCarouselModeActive(state.index);
      const { sectionKey, sectionTheme } = getSectionMeta(slide.section);
      const previousSectionKey = elements.container.dataset.currentSection || "";
      elements.container.innerHTML = "";

      const card = document.createElement("article");
      card.className = "slide active";
      card.dataset.section = sectionKey;
      card.dataset.theme = sectionTheme;
      if (previousSectionKey && previousSectionKey !== sectionKey) {
        card.classList.add("section-enter");
        elements.container.dataset.sectionTransition = `${previousSectionKey}-to-${sectionKey}`;
      } else {
        delete elements.container.dataset.sectionTransition;
      }
      elements.container.dataset.currentSection = sectionKey;

      const badge = document.createElement("div");
      badge.className = "slide-badge";
      badge.textContent = slide.badge;

      const title = document.createElement("h1");
      title.className = "slide-question";
      title.textContent = carouselActive && pairGroup ? "Paired Excerpt Carousel" : slide.title;

      const feedback = document.createElement("div");
      feedback.id = "feedback-card";
      feedback.className = "feedback-card";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      feedback.setAttribute("aria-atomic", "true");
      feedback.innerHTML = '<div class="feedback-title">Feedback</div><div class="feedback-body"></div>';

      card.append(badge, title);

      const phaseChip = createPhaseChip(slide.phaseTag || pairGroup?.phaseTag || "");
      if (phaseChip) card.appendChild(phaseChip);
      if (slide.section === "SECTION 3: IDENTIFY THE PHASE" && pairGroup) {
        card.appendChild(createSegmentedControl(state.section3View));
      }

      if (carouselActive && pairGroup) {
        renderSection3PairedUnit(card, pairGroup);
      } else {
        renderSlideByInteractionType(card, slide, interactionType);
      }
      card.appendChild(feedback);

      const feedbackSlide = carouselActive && pairGroup ? slides[pairGroup.questionIndex] : slide;
      if (getResponse(feedbackSlide.id, getSubmitKey(feedbackSlide), false)) {
        const seed = getResponse(feedbackSlide.id, feedbackSlide.responseKey, []);
        renderFeedback(feedbackSlide, Array.isArray(seed) ? seed : []);
      }
      if (interactionType === "yes-no-matrix") {
        const saved = getResponse(slide.id, slide.responseKey, {});
        renderYesNoFeedback(slide, saved);
      }

      elements.container.appendChild(card);

      elements.section.textContent = slide.section;
      const sectionSummaries = sectionSummariesRef();
      const activeSection = sectionSummaries.find((entry) => state.index >= entry.firstIndex && state.index <= entry.lastIndex);
      const sectionOffset = activeSection ? state.index - activeSection.firstIndex + 1 : state.index + 1;
      const sectionSpan = activeSection ? activeSection.lastIndex - activeSection.firstIndex + 1 : slides.length;

      if (carouselActive && pairGroup) {
        const pairIndex = pairedGroups.findIndex((group) => group.pairingId === pairGroup.pairingId);
        elements.slideId.textContent = `Pair ${pairIndex + 1}`;
        elements.counter.textContent = `Pair ${pairIndex + 1} of ${pairedGroups.length} · ${activeSection?.section || "Section"}`;
      } else {
        elements.slideId.textContent = `Slide ${slide.id}`;
        elements.counter.textContent = `Slide ${state.index + 1} of ${slides.length} · Section progress ${sectionOffset}/${sectionSpan}`;
      }
      elements.progress.style.width = `${(sectionOffset / sectionSpan) * 100}%`;

      renderSectionMenu();
      onSetNavState({ slide, lockActive: !state.apiConnected });

      const completionMessageId = "completion-message";
      const existingMessage = document.getElementById(completionMessageId);
      if (existingMessage) existingMessage.remove();
      if (state.completed && slide.id === "06.4") {
        const completionMessage = document.createElement("p");
        completionMessage.id = completionMessageId;
        completionMessage.className = "completion-message";
        completionMessage.textContent = "Thank you for completing this session. Your responses have been recorded. See you in the next lesson!";
        card.appendChild(completionMessage);
      }
    }

    return { render };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.renderCore = { createRenderCore };
})();
