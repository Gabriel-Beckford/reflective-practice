(() => {
  const { slides } = window.DECK_DATA;
  const STORAGE_KEY = "reflective-practice.deck-state.v1";

  function normalizeSavedState(saved) {
    if (!saved || typeof saved !== "object") return { index: 0, responses: {} };

    const normalized = {
      index: Number.isInteger(saved.index) ? saved.index : 0,
      responses: {}
    };

    if (saved.responses && typeof saved.responses === "object") {
      normalized.responses = saved.responses;
      return normalized;
    }

    // Backwards compatibility with older flat `answers` storage shape.
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
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { index: 0, responses: {} };
      return normalizeSavedState(JSON.parse(raw));
    } catch (error) {
      console.warn("Unable to hydrate saved deck responses.", error);
      return { index: 0, responses: {} };
    }
  }

  function persistState(state) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          index: state.index,
          responses: state.responses
        })
      );
    } catch (error) {
      console.warn("Unable to persist deck responses.", error);
    }
  }

  const persisted = loadPersistedState();
  const state = {
    index: Math.max(0, Math.min(persisted.index || 0, slides.length - 1)),
    responses: persisted.responses || {},
    beforeExportHook: null
  };

  const el = {
    container: document.getElementById("slide-container"),
    section: document.getElementById("section-label"),
    counter: document.getElementById("slide-counter"),
    progress: document.getElementById("progress-fill"),
    slideId: document.getElementById("slide-id"),
    prev: document.getElementById("prev-btn"),
    next: document.getElementById("next-btn")
  };

  function saveResponse(slideId, fieldKey, value) {
    if (!slideId || !fieldKey) return;
    const currentSlideResponses = state.responses[slideId] || {};
    state.responses[slideId] = { ...currentSlideResponses, [fieldKey]: value };
    persistState(state);
  }

  function getResponse(slideId, fieldKey, fallback = null) {
    const slideResponses = state.responses[slideId];
    if (!slideResponses || typeof slideResponses !== "object") return fallback;
    return Object.prototype.hasOwnProperty.call(slideResponses, fieldKey) ? slideResponses[fieldKey] : fallback;
  }

  function matchesCorrect(selected, correct = []) {
    if (!correct.length || !selected.length) return false;
    return selected.length === correct.length && selected.every((value, i) => value === correct[i]);
  }

  function createChoiceList(slide, multi = false) {
    const wrap = document.createElement("div");
    wrap.className = "choice-list";

    const selected = new Set(getResponse(slide.id, slide.responseKey, []));

    slide.options.forEach((option, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "choice-item";
      if (selected.has(index)) item.classList.add("selected");

      const marker = document.createElement("span");
      marker.className = "choice-marker";
      const text = document.createElement("span");
      text.className = "choice-text";
      text.textContent = option;

      item.append(marker, text);
      item.addEventListener("click", () => {
        if (multi) {
          if (selected.has(index)) selected.delete(index);
          else selected.add(index);
        } else {
          selected.clear();
          selected.add(index);
        }

        [...wrap.children].forEach((child, i) => {
          child.classList.toggle("selected", selected.has(i));
        });

        const nextSelection = [...selected].sort((a, b) => a - b);
        saveResponse(slide.id, slide.responseKey, nextSelection);
        renderFeedback(slide, nextSelection);
      });

      wrap.appendChild(item);
    });

    return wrap;
  }

  function renderFeedback(slide, selection) {
    const card = document.getElementById("feedback-card");
    if (!card || !slide.feedback) return;

    card.querySelector(".feedback-body").textContent = slide.feedback;
    card.classList.add("visible");

    if (slide.correctAnswers) {
      const okay = matchesCorrect(selection, slide.correctAnswers);
      card.classList.toggle("error", !okay);
      card.querySelector(".feedback-title").textContent = okay ? "Feedback" : "Check your answer";
    }
  }

  function createYesNoMatrix(slide) {
    const wrap = document.createElement("div");
    wrap.className = "choice-list";
    const saved = getResponse(slide.id, slide.responseKey, {});

    slide.statements.forEach((statement, index) => {
      const group = document.createElement("div");
      group.className = "input-wrap";

      const label = document.createElement("p");
      label.className = "slide-copy";
      label.textContent = statement;

      const row = document.createElement("div");
      row.className = "choice-list";

      ["Yes", "No"].forEach((choice) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-item";
        btn.classList.toggle("selected", saved[index] === choice);

        const marker = document.createElement("span");
        marker.className = "choice-marker";
        const text = document.createElement("span");
        text.className = "choice-text";
        text.textContent = choice;

        btn.append(marker, text);
        btn.addEventListener("click", () => {
          saved[index] = choice;
          saveResponse(slide.id, slide.responseKey, saved);
          [...row.children].forEach((node) => node.classList.remove("selected"));
          btn.classList.add("selected");
          renderFeedback(slide, []);
        });

        row.appendChild(btn);
      });

      group.append(label, row);
      wrap.appendChild(group);
    });

    return wrap;
  }

  function appendBodyCopy(target, slide) {
    (slide.body || []).forEach((line) => {
      const p = document.createElement("p");
      p.className = "slide-copy";
      p.textContent = line;
      target.appendChild(p);
    });
  }

  function appendOptionalList(target, slide) {
    if (slide.listTitle) {
      const listTitle = document.createElement("p");
      listTitle.className = "slide-copy";
      listTitle.textContent = slide.listTitle;
      target.appendChild(listTitle);
    }

    if (!slide.bullets?.length) return;

    const list = document.createElement("ul");
    list.className = "slide-copy";
    slide.bullets.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    target.appendChild(list);
  }

  function resolveInteractionType(slide) {
    const legacyTypeMap = {
      content: "text",
      "single-choice": "single-choice",
      "multi-choice": "multi-select",
      "multi-yn": "yes-no-matrix",
      input: "free-response"
    };

    return legacyTypeMap[slide.type] || slide.type || "text";
  }

  function renderTextSlide(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer";
    appendBodyCopy(wrap, slide);
    appendOptionalList(wrap, slide);
    card.appendChild(wrap);
  }

  function renderSingleChoice(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "single-choice-renderer";
    if (slide.question) {
      const q = document.createElement("p");
      q.className = "slide-copy";
      q.textContent = `Question: ${slide.question}`;
      wrap.appendChild(q);
    }
    wrap.appendChild(createChoiceList(slide));
    card.appendChild(wrap);
  }

  function renderMultiSelect(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "multi-select-renderer";
    if (slide.question) {
      const q = document.createElement("p");
      q.className = "slide-copy";
      q.textContent = `Question: ${slide.question}`;
      wrap.appendChild(q);
    }
    wrap.appendChild(createChoiceList(slide, true));
    card.appendChild(wrap);
  }

  function renderYesNoMatrix(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "yes-no-matrix-renderer";
    if (slide.question) {
      const q = document.createElement("p");
      q.className = "slide-copy";
      q.textContent = `Question: ${slide.question}`;
      wrap.appendChild(q);
    }
    wrap.appendChild(createYesNoMatrix(slide));
    card.appendChild(wrap);
  }

  function renderFreeResponse(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "free-response-renderer";
    appendBodyCopy(wrap, slide);

    const inputWrap = document.createElement("div");
    inputWrap.className = "input-wrap";
    const prompt = document.createElement("p");
    prompt.className = "slide-copy";
    prompt.textContent = slide.prompt || "";
    const area = document.createElement("textarea");
    area.value = getResponse(slide.id, slide.responseKey, "");
    const saveTextareaResponse = () => saveResponse(slide.id, slide.responseKey, area.value);
    area.addEventListener("input", saveTextareaResponse);
    area.addEventListener("change", saveTextareaResponse);
    inputWrap.append(prompt, area);

    wrap.appendChild(inputWrap);
    card.appendChild(wrap);
  }

  function renderCtaSlide(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "cta-renderer";
    appendBodyCopy(wrap, slide);

    const actions = slide.actions || [];
    if (actions.length) {
      const actionList = document.createElement("div");
      actionList.className = "choice-list";
      actions.forEach((actionText, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-item";
        btn.textContent = actionText;
        btn.addEventListener("click", () => {
          saveResponse(slide.id, slide.responseKey || `cta_${slide.id}`, index);
          if (slide.branching?.length) {
            jumpTo(resolveNextIndex(slide));
            return;
          }
          if (state.index < slides.length - 1) jumpTo(state.index + 1);
        });
        actionList.appendChild(btn);
      });
      wrap.appendChild(actionList);
    }

    card.appendChild(wrap);
  }

  function renderTransitionSlide(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "transition-renderer";
    appendBodyCopy(wrap, slide);
    card.appendChild(wrap);
  }

  const renderByInteractionType = {
    text: renderTextSlide,
    "single-choice": renderSingleChoice,
    "multi-select": renderMultiSelect,
    "yes-no-matrix": renderYesNoMatrix,
    "free-response": renderFreeResponse,
    cta: renderCtaSlide,
    transition: renderTransitionSlide
  };

  function validateCurrentSlide() {
    const slide = slides[state.index];
    const key = slide.responseKey;
    if (!key) return { valid: true };
    const interactionType = resolveInteractionType(slide);

    if (interactionType === "free-response") {
      const value = (getResponse(slide.id, key, "") || "").trim();
      if (!value) return { valid: false, message: "Please add your response before moving on." };
    }

    if (["single-choice", "multi-select"].includes(interactionType)) {
      const picked = getResponse(slide.id, key, []);
      if (!picked.length) return { valid: false, message: "Please select an option before moving on." };
    }

    if (interactionType === "yes-no-matrix") {
      const entries = Object.values(getResponse(slide.id, key, {}));
      if (entries.length < slide.statements.length) {
        return { valid: false, message: "Please answer every statement before moving on." };
      }
    }

    return { valid: true };
  }

  function jumpTo(index) {
    state.index = Math.max(0, Math.min(index, slides.length - 1));
    persistState(state);
    render();
  }

  function resolveNextIndex(slide) {
    const selected = getResponse(slide.id, slide.responseKey, []);
    if (slide.branching && slide.branching.length) {
      for (const branch of slide.branching) {
        if (matchesCorrect(selected, branch.ifSelected || [])) return branch.to;
      }
    }
    return state.index + 1;
  }

  function render() {
    const slide = slides[state.index];
    const interactionType = resolveInteractionType(slide);
    el.container.innerHTML = "";

    const card = document.createElement("article");
    card.className = "slide active";

    const badge = document.createElement("div");
    badge.className = "slide-badge";
    badge.textContent = slide.badge;

    const title = document.createElement("h1");
    title.className = "slide-question";
    title.textContent = slide.title;

    card.append(badge, title);
    const renderer = renderByInteractionType[interactionType] || renderTextSlide;
    renderer(card, slide);

    const feedback = document.createElement("div");
    feedback.id = "feedback-card";
    feedback.className = "feedback-card";
    feedback.innerHTML = '<div class="feedback-title">Feedback</div><div class="feedback-body"></div>';
    card.appendChild(feedback);

    if (slide.feedback && getResponse(slide.id, slide.responseKey, null) !== null) {
      const seed = getResponse(slide.id, slide.responseKey, []);
      renderFeedback(slide, Array.isArray(seed) ? seed : []);
    }

    el.container.appendChild(card);

    el.section.textContent = slide.section;
    el.slideId.textContent = `Slide ${slide.id}`;
    el.counter.textContent = `Slide ${state.index + 1} / ${slides.length}`;
    el.progress.style.width = `${((state.index + 1) / slides.length) * 100}%`;

    el.prev.disabled = state.index === 0;
    el.next.textContent = state.index === slides.length - 1 ? "Finish" : "Next";
  }

  el.prev.addEventListener("click", () => jumpTo(state.index - 1));
  el.next.addEventListener("click", () => {
    const validation = validateCurrentSlide();
    if (!validation.valid) {
      const card = document.getElementById("feedback-card");
      card.classList.add("visible", "error");
      card.querySelector(".feedback-title").textContent = "Hold on";
      card.querySelector(".feedback-body").textContent = validation.message;
      return;
    }

    const currentSlide = slides[state.index];

    if (state.index === slides.length - 1) {
      const payload = window.deckHooks.exportResponses();
      if (typeof state.beforeExportHook === "function") state.beforeExportHook(payload);
      window.dispatchEvent(new CustomEvent("deck:complete", { detail: payload }));
      return;
    }

    jumpTo(resolveNextIndex(currentSlide));
  });

  window.deckHooks = {
    getState: () => ({ ...state, slidesCount: slides.length }),
    getSlides: () => slides,
    exportResponses: () => ({
      exportedAt: new Date().toISOString(),
      responses: state.responses,
      deckTitle: window.DECK_DATA.title
    }),
    onBeforeExport: (fn) => {
      state.beforeExportHook = typeof fn === "function" ? fn : null;
    }
  };

  render();
})();
