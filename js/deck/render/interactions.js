(() => {
  function resolveInteractionType(slide) {
    const legacyTypeMap = {
      content: "text",
      "section-title": "section-title",
      "grounding-321": "grounding-321",
      "ilo-stack": "ilo-stack",
      "personalisation-mbti": "personalisation-mbti",
      "pathway-selector": "pathway-selector",
      "api-gate-connect": "api-gate-connect",
      "api-gate-confirm": "api-gate-confirm",
      "single-choice": "single-choice",
      "multi-choice": "multi-select",
      input: "free-response",
      matrix: "matrix",
      "drag-drop": "drag-drop",
      pelmanism: "pelmanism",
      "table-completion": "table-completion",
      "short-answer": "short-answer",
      gapfill: "gapfill",
      linking: "linking",
      "pond-game": "pond-game",
      "feedback-form": "feedback-form"
    };

    return legacyTypeMap[slide.type] || slide.type || "text";
  }

  function createInteractionContext({
    saveResponse,
    getResponse,
    setFeedback,
    hideFeedback,
    saveSharedResponse,
    getSharedResponse,
    isApiConnected,
    requestAiReply
  }) {
    return {
      saveResponse,
      getResponse,
      setFeedback,
      hideFeedback,
      saveSharedResponse,
      getSharedResponse,
      isApiConnected,
      requestAiReply
    };
  }

  function createInteractionRenderer({
    getInteractionModule,
    builtInRenderers,
    createContext,
    moduleTypes,
    renderUnknownInteraction
  }) {
    function renderSlideByInteractionType(card, slide, interactionType) {
      if (moduleTypes.has(interactionType)) {
        const module = getInteractionModule(interactionType);
        if (module && typeof module.render === "function") {
          module.render(card, slide, createContext());
          return;
        }
        renderUnknownInteraction(card, slide, interactionType);
        return;
      }

      const renderer = builtInRenderers[interactionType];
      if (typeof renderer === "function") {
        renderer(card, slide);
        return;
      }

      renderUnknownInteraction(card, slide, interactionType);
    }

    return { renderSlideByInteractionType };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.renderInteractions = {
    resolveInteractionType,
    createInteractionContext,
    createInteractionRenderer
  };
})();
