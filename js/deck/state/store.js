(() => {
  function createDeckStore({
    slides,
    storage,
    sessionStorage,
    forcedIndex = null,
    storageKey = "reflective-practice.deck-state.v1",
    pathwayStorageKey = "reflective-practice.selected-pathway.v1",
    sessionConnectedKey = "connectionEstablished",
    sharedResponseSlideId = "__shared__"
  }) {
    let memoryState = null;
    let storageEnabled = forcedIndex === null;

    function defaultState() {
      return {
        index: forcedIndex !== null ? forcedIndex : 0,
        responses: {},
        completed: false,
        section3View: "linear",
        selectedPathway: null,
        selectedSections: null
      };
    }

    function normalizeSavedState(saved) {
      if (!saved || typeof saved !== "object") return defaultState();

      const normalized = {
        index: Number.isInteger(saved.index) ? saved.index : 0,
        responses: {},
        completed: Boolean(saved.completed),
        section3View: saved.section3View === "carousel" ? "carousel" : "linear",
        selectedPathway: typeof saved.selectedPathway === "string" ? saved.selectedPathway : null,
        selectedSections: Array.isArray(saved.selectedSections) ? saved.selectedSections : null
      };

      if (saved.responses && typeof saved.responses === "object") {
        normalized.responses = saved.responses;
        return normalized;
      }

      if (saved.answers && typeof saved.answers === "object") {
        const legacyResponses = {};
        slides.forEach((slide) => {
          if (!slide.responseKey) return;
          if (!Object.prototype.hasOwnProperty.call(saved.answers, slide.responseKey)) return;
          legacyResponses[slide.id] = {
            ...(legacyResponses[slide.id] || {}),
            [slide.responseKey]: saved.answers[slide.responseKey]
          };
        });
        normalized.responses = legacyResponses;
      }

      return normalized;
    }

    function loadPersistedState() {
      if (forcedIndex !== null) return defaultState();
      if (!storageEnabled || !storage) return memoryState || defaultState();

      try {
        const raw = storage.getItem(storageKey);
        if (!raw) return defaultState();
        return normalizeSavedState(JSON.parse(raw));
      } catch (error) {
        console.warn("Unable to hydrate saved deck responses.", error);
        storageEnabled = false;
        return defaultState();
      }
    }

    function persistState(state) {
      memoryState = {
        index: state.index,
        responses: state.responses,
        completed: state.completed,
        section3View: state.section3View,
        selectedPathway: state.selectedPathway,
        selectedSections: state.selectedSections
      };

      if (!storageEnabled || !storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(memoryState));
      } catch (error) {
        console.warn("Unable to persist deck responses.", error);
        storageEnabled = false;
      }
    }

    function loadPathwaySelection() {
      if (!storage) return null;
      const raw = storage.getItem(pathwayStorageKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (error) {
        return null;
      }
    }

    function persistPathwaySelection(state, pathwayId, selectedSections) {
      state.selectedPathway = pathwayId || null;
      state.selectedSections = Array.isArray(selectedSections) ? selectedSections : null;
      if (storage) {
        storage.setItem(
          pathwayStorageKey,
          JSON.stringify({
            selectedPathway: state.selectedPathway,
            selectedSections: state.selectedSections
          })
        );
      }
      persistState(state);
    }

    function setSessionConnected(connected) {
      sessionStorage?.setItem(sessionConnectedKey, connected ? "true" : "false");
    }

    function getSessionConnected() {
      return sessionStorage?.getItem(sessionConnectedKey) === "true";
    }

    function saveResponse(state, slideId, fieldKey, value) {
      if (!slideId || !fieldKey) return;
      const currentSlideResponses = state.responses[slideId] || {};
      state.responses[slideId] = { ...currentSlideResponses, [fieldKey]: value };

      if (fieldKey === "criticalIncidentText" || fieldKey === "theory_critical_incident") {
        const shared = state.responses[sharedResponseSlideId] || {};
        state.responses[sharedResponseSlideId] = { ...shared, criticalIncidentText: value };
      }

      persistState(state);
    }

    function saveSharedResponse(state, fieldKey, value) {
      if (!fieldKey) return;
      const shared = state.responses[sharedResponseSlideId] || {};
      state.responses[sharedResponseSlideId] = { ...shared, [fieldKey]: value };
      persistState(state);
    }

    function getSharedResponse(state, fieldKey, fallback = null) {
      const shared = state.responses[sharedResponseSlideId];
      if (!shared || typeof shared !== "object") return fallback;
      return Object.prototype.hasOwnProperty.call(shared, fieldKey) ? shared[fieldKey] : fallback;
    }

    function getResponse(state, slideId, fieldKey, fallback = null) {
      const slideResponses = state.responses[slideId];
      if (!slideResponses || typeof slideResponses !== "object") return fallback;
      return Object.prototype.hasOwnProperty.call(slideResponses, fieldKey) ? slideResponses[fieldKey] : fallback;
    }

    return {
      defaultState,
      normalizeSavedState,
      loadPersistedState,
      persistState,
      loadPathwaySelection,
      persistPathwaySelection,
      setSessionConnected,
      getSessionConnected,
      saveResponse,
      saveSharedResponse,
      getSharedResponse,
      getResponse
    };
  }

  window.DeckModules = window.DeckModules || {};
  window.DeckModules.stateStore = { createDeckStore };
})();
