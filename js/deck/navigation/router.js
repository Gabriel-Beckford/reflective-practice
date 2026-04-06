(() => {
  function createDeckRouter({
    slides,
    pairedGroups,
    state,
    getResponse,
    isSlideIncludedByPathway,
    isCarouselModeActive,
    getPairGroupByIndex,
    findNextIncludedIndex,
    persistState,
    onJump
  }) {
    function resolveNextIndex() {
      const currentSlide = slides[state.index];
      if (currentSlide && currentSlide.routeMap && currentSlide.responseKey) {
        const selectedRoute = getResponse(currentSlide.id, currentSlide.responseKey, "");
        const routeTargetSlideId = currentSlide.routeMap[selectedRoute];
        if (routeTargetSlideId) {
          const routeIndex = slides.findIndex((entry) => entry.id === routeTargetSlideId);
          if (routeIndex >= 0) return findNextIncludedIndex(routeIndex, 1);
        }
      }

      if (!isCarouselModeActive(state.index)) return findNextIncludedIndex(state.index + 1, 1);
      const currentGroup = getPairGroupByIndex(state.index);
      if (!currentGroup) return findNextIncludedIndex(state.index + 1, 1);
      const currentGroupIndex = pairedGroups.findIndex((group) => group.pairingId === currentGroup.pairingId);
      const nextGroup = pairedGroups[currentGroupIndex + 1];
      const target = nextGroup ? nextGroup.excerptIndex : Math.min(currentGroup.questionIndex + 1, slides.length - 1);
      return findNextIncludedIndex(target, 1);
    }

    function resolvePrevIndex() {
      if (!isCarouselModeActive(state.index)) return findNextIncludedIndex(state.index - 1, -1);
      const currentGroup = getPairGroupByIndex(state.index);
      if (!currentGroup) return findNextIncludedIndex(state.index - 1, -1);
      const currentGroupIndex = pairedGroups.findIndex((group) => group.pairingId === currentGroup.pairingId);
      const prevGroup = pairedGroups[currentGroupIndex - 1];
      const target = prevGroup ? prevGroup.excerptIndex : Math.max(currentGroup.excerptIndex - 1, 0);
      return findNextIncludedIndex(target, -1);
    }

    function jumpTo(index) {
      const bounded = Math.max(0, Math.min(index, slides.length - 1));
      state.index = isSlideIncludedByPathway(slides[bounded]) ? bounded : findNextIncludedIndex(bounded, 1);
      persistState(state);
      if (typeof onJump === "function") onJump(state.index);
      return state.index;
    }

    return { resolveNextIndex, resolvePrevIndex, jumpTo };
  }

  function createInclusionResolver({ slides, state, alwaysIncludedSectionPrefixes = [] }) {
    function isAlwaysIncludedSection(sectionLabel = "") {
      return alwaysIncludedSectionPrefixes.some((prefix) => String(sectionLabel || "").startsWith(prefix));
    }

    function isSlideIncludedByPathway(slide) {
      if (!state.selectedSections || !Array.isArray(state.selectedSections) || !state.selectedSections.length) return true;
      if (!slide || !slide.section) return true;
      if (slide.alwaysInclude) return true;
      if (slide.section.startsWith("SECTION 0:")) return true;
      if (slide.section.startsWith("SECTION 1:")) return true;
      if (isAlwaysIncludedSection(slide.section)) return true;
      return state.selectedSections.includes(slide.section);
    }

    function findNextIncludedIndex(startIndex, direction = 1) {
      let next = startIndex;
      while (next >= 0 && next < slides.length) {
        if (isSlideIncludedByPathway(slides[next])) return next;
        next += direction;
      }
      return Math.max(0, Math.min(startIndex, slides.length - 1));
    }

    return { isAlwaysIncludedSection, isSlideIncludedByPathway, findNextIncludedIndex };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.navigationRouter = { createDeckRouter, createInclusionResolver };
})();
