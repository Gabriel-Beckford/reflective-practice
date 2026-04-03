(() => {
  const { slides } = window.DECK_DATA;
  const STORAGE_KEY = "reflective-practice.deck-state.v1";
  let memoryState = null;
  let storageEnabled = true;

  function normalizeSavedState(saved) {
    if (!saved || typeof saved !== "object") return { index: 0, responses: {}, completed: false };

    const normalized = {
      index: Number.isInteger(saved.index) ? saved.index : 0,
      responses: {},
      completed: Boolean(saved.completed)
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
    if (!storageEnabled || !window.localStorage) {
      return memoryState || { index: 0, responses: {}, completed: false };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { index: 0, responses: {}, completed: false };
      return normalizeSavedState(JSON.parse(raw));
    } catch (error) {
      console.warn("Unable to hydrate saved deck responses.", error);
      storageEnabled = false;
      return { index: 0, responses: {}, completed: false };
    }
  }

  function persistState(state) {
    memoryState = {
      index: state.index,
      responses: state.responses,
      completed: state.completed
    };
    if (!storageEnabled || !window.localStorage) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(memoryState)
      );
    } catch (error) {
      console.warn("Unable to persist deck responses.", error);
      storageEnabled = false;
    }
  }

  const persisted = loadPersistedState();
  const state = {
    index: Math.max(0, Math.min(persisted.index || 0, slides.length - 1)),
    responses: persisted.responses || {},
    completed: Boolean(persisted.completed),
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

  function getSubmitKey(slide) {
    return `${slide.responseKey}__submitted`;
  }

  function matchesCorrect(selected, correct = []) {
    if (!correct.length || !selected.length) return false;
    return selected.length === correct.length && selected.every((value, i) => value === correct[i]);
  }

  function createChoiceList(slide, multi = false) {
    const wrap = document.createElement("fieldset");
    wrap.className = "choice-list";
    const legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = slide.question || slide.prompt || slide.title || "Select an option";
    wrap.appendChild(legend);

    const selected = new Set(getResponse(slide.id, slide.responseKey, []));
    const isSubmitted = Boolean(getResponse(slide.id, getSubmitKey(slide), false));
    const inputType = multi ? "checkbox" : "radio";
    const inputName = `choice-${slide.id}`;

    slide.options.forEach((option, index) => {
      const item = document.createElement("label");
      item.className = "choice-item";
      item.setAttribute("for", `${inputName}-${index}`);
      if (selected.has(index)) item.classList.add("selected");

      const input = document.createElement("input");
      input.type = inputType;
      input.id = `${inputName}-${index}`;
      input.name = inputName;
      input.className = "choice-input";
      input.checked = selected.has(index);

      const marker = document.createElement("span");
      marker.className = "choice-marker";
      const text = document.createElement("span");
      text.className = "choice-text";
      text.textContent = option;

      item.append(input, marker, text);
      input.addEventListener("change", () => {
        if (multi) {
          if (selected.has(index)) selected.delete(index);
          else selected.add(index);
        } else {
          selected.clear();
          selected.add(index);
        }

        [...wrap.children].forEach((child, i) => {
          if (i === 0) return;
          child.classList.toggle("selected", selected.has(i - 1));
        });
        [...wrap.querySelectorAll(".choice-input")].forEach((control, i) => {
          control.checked = selected.has(i);
        });

        const nextSelection = [...selected].sort((a, b) => a - b);
        saveResponse(slide.id, slide.responseKey, nextSelection);
        saveResponse(slide.id, getSubmitKey(slide), false);
        paintChoiceStates(wrap, slide, nextSelection, false);
        hideFeedback();
      });

      wrap.appendChild(item);
    });

    paintChoiceStates(wrap, slide, [...selected].sort((a, b) => a - b), isSubmitted);
    return wrap;
  }

  function hideFeedback() {
    const card = document.getElementById("feedback-card");
    if (!card) return;
    card.classList.remove("visible", "error");
  }

  function setFeedback(title, body, isError = false) {
    const card = document.getElementById("feedback-card");
    if (!card) return;
    card.querySelector(".feedback-title").textContent = title;
    card.querySelector(".feedback-body").textContent = body;
    card.classList.add("visible");
    card.classList.toggle("error", Boolean(isError));
  }

  function paintChoiceStates(wrap, slide, selection, submitted) {
    [...wrap.children].forEach((child, i) => {
      if (i === 0) return;
      const choiceIndex = i - 1;
      child.classList.remove("correct", "incorrect", "selected");
      child.classList.toggle("selected", selection.includes(choiceIndex));
      if (!submitted || !slide.correctAnswers) return;
      if (slide.correctAnswers.includes(choiceIndex)) child.classList.add("correct");
      if (selection.includes(choiceIndex) && !slide.correctAnswers.includes(choiceIndex)) child.classList.add("incorrect");
    });
  }

  function renderFeedback(slide, selection) {
    const card = document.getElementById("feedback-card");
    if (!card) return;

    const selectedText = selection.length
      ? selection.map((index) => slide.options?.[index]).filter(Boolean).join("; ")
      : "No option selected.";
    let body = `You selected: ${selectedText}.`;
    let title = "Feedback";
    let isError = false;

    if (slide.correctAnswers) {
      const okay = matchesCorrect(selection, slide.correctAnswers);
      title = okay ? "Correct" : "Not quite yet";
      isError = !okay;
      const statusLine = okay
        ? "That is correct."
        : `That is incorrect. Correct answer${slide.correctAnswers.length > 1 ? "s are" : " is"}: ${slide.correctAnswers
            .map((index) => slide.options?.[index])
            .filter(Boolean)
            .join("; ")}.`;
      body = `${statusLine} ${body}`;
    }

    if (slide.rationaleByOption && selection.length === 1) {
      const rationale = slide.rationaleByOption[selection[0]];
      if (rationale) body = `${body} ${rationale}`;
    }

    if (slide.feedbackBridge) {
      body = `${body} ${slide.feedbackBridge}`;
    }

    card.querySelector(".feedback-title").textContent = title;
    card.querySelector(".feedback-body").textContent = body;
    card.classList.add("visible");
    card.classList.toggle("error", isError);
  }

  function createYesNoMatrix(slide) {
    const wrap = document.createElement("fieldset");
    wrap.className = "choice-list";
    const legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = slide.question || "Answer yes or no for each statement";
    wrap.appendChild(legend);
    const saved = { ...getResponse(slide.id, slide.responseKey, {}) };
    const expectedAnswers = Array.isArray(slide.expectedAnswers) ? slide.expectedAnswers : [];

    const paintRowState = (row, rowIndex) => {
      const expected = expectedAnswers[rowIndex];
      const selected = saved[rowIndex];

      [...row.children].forEach((node) => {
        const isChosen = node.dataset.choice === selected;
        node.classList.toggle("selected", isChosen);
        node.classList.remove("correct", "incorrect");

        if (!expected || !selected) return;
        if (node.dataset.choice === expected) node.classList.add("correct");
        if (isChosen && selected !== expected) node.classList.add("incorrect");
      });
    };

    slide.statements.forEach((statement, index) => {
      const group = document.createElement("div");
      group.className = "input-wrap";

      const label = document.createElement("p");
      label.className = "slide-copy";
      label.textContent = statement;

      const row = document.createElement("div");
      row.className = "choice-list";

      ["Yes", "No"].forEach((choice) => {
        const btn = document.createElement("label");
        btn.className = "choice-item";
        btn.dataset.choice = choice;
        btn.setAttribute("for", `${slide.id}-${index}-${choice}`);

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `${slide.id}-${index}`;
        input.id = `${slide.id}-${index}-${choice}`;
        input.className = "choice-input";
        input.checked = saved[index] === choice;

        const marker = document.createElement("span");
        marker.className = "choice-marker";
        const text = document.createElement("span");
        text.className = "choice-text";
        text.textContent = choice;

        btn.append(input, marker, text);
        input.addEventListener("change", () => {
          saved[index] = choice;
          saveResponse(slide.id, slide.responseKey, saved);
          paintRowState(row, index);
          renderYesNoFeedback(slide, saved);
        });

        row.appendChild(btn);
      });

      paintRowState(row, index);
      group.append(label, row);
      wrap.appendChild(group);
    });

    renderYesNoFeedback(slide, saved);
    return wrap;
  }

  function renderYesNoFeedback(slide, savedResponses) {
    const card = document.getElementById("feedback-card");
    if (!card) return;

    const expectedAnswers = Array.isArray(slide.expectedAnswers) ? slide.expectedAnswers : [];
    const answeredCount = slide.statements.reduce((count, _, index) => (savedResponses[index] ? count + 1 : count), 0);
    const correctCount = expectedAnswers.reduce(
      (count, expected, index) => (savedResponses[index] === expected ? count + 1 : count),
      0
    );
    const allAnswered = answeredCount === slide.statements.length;
    const allCorrect = allAnswered && correctCount === expectedAnswers.length;

    const title = allCorrect ? "Evaluation complete" : "Keep evaluating";
    const summary = `Row-by-row score: ${correctCount}/${expectedAnswers.length} matched the expected answer.`;
    const body = allCorrect
      ? `${summary} ${slide.feedbackSuccess || ""}`.trim()
      : `${summary} ${slide.feedbackNeedsWork || "Continue checking each criterion row-by-row."}`.trim();

    card.querySelector(".feedback-title").textContent = title;
    card.querySelector(".feedback-body").textContent = body;
    card.classList.add("visible");
    card.classList.toggle("error", allAnswered && !allCorrect);
  }

  function appendBodyCopy(target, lines = [], className = "slide-copy") {
    lines.forEach((line) => {
      const p = document.createElement("p");
      p.className = className;
      p.textContent = line;
      target.appendChild(p);
    });
  }

  function normalizeBodyToKeyPoints(lines = []) {
    if (!Array.isArray(lines) || !lines.length) return [];
    if (lines.length === 1) return [];
    return lines.slice(1);
  }

  function getSlideTextRegions(slide) {
    const body = Array.isArray(slide.body) ? slide.body : [];
    return {
      lead: slide.lead || body[0] || "",
      keyPoints: Array.isArray(slide.keyPoints) ? slide.keyPoints : normalizeBodyToKeyPoints(body),
      callout: slide.callout || "",
      actionPrompt: slide.actionPrompt || ""
    };
  }

  function appendStructuredText(target, slide) {
    if (slide.fixedTextBlock) {
      const block = document.createElement("pre");
      block.className = "fixed-text-block";
      block.textContent = (slide.body || []).join("\n\n");
      target.appendChild(block);
      return;
    }

    const { lead, keyPoints, callout, actionPrompt } = getSlideTextRegions(slide);

    if (lead) {
      const leadHeader = document.createElement("header");
      leadHeader.className = "text-region text-region-lead";
      appendBodyCopy(leadHeader, [lead], "slide-lead");
      target.appendChild(leadHeader);
    }

    if (keyPoints.length || slide.listTitle || slide.bullets?.length) {
      const keyPointsSection = document.createElement("section");
      keyPointsSection.className = "text-region text-region-key-points";
      appendBodyCopy(keyPointsSection, keyPoints);
      appendOptionalList(keyPointsSection, slide);
      target.appendChild(keyPointsSection);
    }

    if (callout) {
      const calloutAside = document.createElement("aside");
      calloutAside.className = "text-region text-region-callout";
      appendBodyCopy(calloutAside, [callout], "slide-callout");
      target.appendChild(calloutAside);
    }

    if (actionPrompt) {
      const actionSection = document.createElement("section");
      actionSection.className = "text-region text-region-action";
      appendBodyCopy(actionSection, [actionPrompt], "slide-action");
      target.appendChild(actionSection);
    }
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

  const interactionModules = window.DeckInteractionModules || {};

  function getInteractionModule(type) {
    return interactionModules[type] || null;
  }

  function createInteractionContext() {
    return { saveResponse, getResponse, setFeedback, hideFeedback };
  }

  function renderPluggableInteraction(card, slide) {
    const interactionType = resolveInteractionType(slide);
    const module = getInteractionModule(interactionType);
    if (!module || typeof module.render !== "function") return false;
    module.render(card, slide, createInteractionContext());
    return true;
  }

  function resolveInteractionType(slide) {
    const legacyTypeMap = {
      content: "text",
      "single-choice": "single-choice",
      "multi-choice": "multi-select",
      "multi-yn": "yes-no-matrix",
      input: "free-response",
      matrix: "matrix",
      "drag-drop": "drag-drop",
      pelmanism: "pelmanism",
      "table-completion": "table-completion",
      "short-answer": "short-answer",
      gapfill: "gapfill"
    };

    return legacyTypeMap[slide.type] || slide.type || "text";
  }

  function renderTextSlide(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer";
    appendStructuredText(wrap, slide);

    if (slide.id === "6.1") {
      const exportBtn = document.createElement("button");
      exportBtn.type = "button";
      exportBtn.className = "cta-btn";
      exportBtn.textContent = "Download Deck Responses PDF";

      const status = document.createElement("p");
      status.className = "cta-subtext";

      exportBtn.addEventListener("click", () => {
        window.pdfExport.downloadPdf({
          filename: "deck-reflections-export.pdf",
          lines: buildDeckExportLines()
        });
        status.textContent =
          "Downloaded deck-reflections-export.pdf. This file only includes 1.2, 2.14, 4.7, and 7.2 responses.";
      });

      wrap.append(exportBtn, status);
    }

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
    const choiceList = createChoiceList(slide);
    wrap.appendChild(choiceList);
    wrap.appendChild(createSubmitButton(slide, choiceList));
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
    const choiceList = createChoiceList(slide, true);
    wrap.appendChild(choiceList);
    wrap.appendChild(createSubmitButton(slide, choiceList));
    card.appendChild(wrap);
  }

  function createSubmitButton(slide, choiceList) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "submit-btn";
    btn.textContent = "Submit answer";
    btn.addEventListener("click", () => {
      const selection = getResponse(slide.id, slide.responseKey, []);
      if (!selection.length) {
        setFeedback("Hold on", "Please select an option before submitting.", true);
        return;
      }
      saveResponse(slide.id, getSubmitKey(slide), true);
      paintChoiceStates(choiceList, slide, selection, true);
      renderFeedback(slide, selection);
    });
    return btn;
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
    appendStructuredText(wrap, slide);

    const inputWrap = document.createElement("div");
    inputWrap.className = "input-wrap";
    const area = document.createElement("textarea");
    const areaId = `response-${slide.id}`;
    area.id = areaId;
    const prompt = document.createElement("label");
    prompt.className = "slide-copy";
    prompt.setAttribute("for", areaId);
    prompt.textContent = slide.prompt || "Your response";
    area.value = getResponse(slide.id, slide.responseKey, "");
    const saveTextareaResponse = () => saveResponse(slide.id, slide.responseKey, area.value);
    area.addEventListener("input", saveTextareaResponse);
    area.addEventListener("change", saveTextareaResponse);
    inputWrap.append(prompt, area);

    wrap.appendChild(inputWrap);
    card.appendChild(wrap);
  }

  function buildDeckExportLines() {
    const prompts = [
      { id: "1.2", label: "Warm-up (Slide 1.2)" },
      { id: "2.14", label: "Micro-Reflection Analysis (Slide 2.14)" },
      { id: "4.7", label: "Emotional Connection (Slide 4.7)" },
      { id: "7.2", label: "Closing 3-2-1 (Slide 7.2)" }
    ];

    const lines = [
      "Deck Reflection Export",
      `Generated: ${new Date().toISOString()}`,
      ""
    ];

    prompts.forEach((item) => {
      const slide = slides.find((entry) => entry.id === item.id);
      const responseKey = slide?.responseKey;
      const response = responseKey ? (getResponse(item.id, responseKey, "") || "").trim() : "";
      lines.push(item.label);
      lines.push(response || "No response captured.");
      lines.push("");
    });

    return lines;
  }

  function renderCtaSlide(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "cta-renderer";
    appendStructuredText(wrap, slide);

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
    appendStructuredText(wrap, slide);

    if (slide.ctaLabel) {
      const ctaBtn = document.createElement("a");
      ctaBtn.className = "cta-btn";
      ctaBtn.textContent = slide.ctaLabel;
      ctaBtn.href = slide.ctaUrl || "chatbot.html";
      ctaBtn.target = "_blank";
      ctaBtn.rel = "noopener noreferrer";
      wrap.appendChild(ctaBtn);
    }

    if (slide.ctaHelperText) {
      const helper = document.createElement("p");
      helper.className = "cta-subtext";
      helper.textContent = slide.ctaHelperText;
      wrap.appendChild(helper);
    }

    card.appendChild(wrap);
  }

  const renderByInteractionType = {
    text: renderTextSlide,
    "single-choice": renderSingleChoice,
    "multi-select": renderMultiSelect,
    "yes-no-matrix": renderYesNoMatrix,
    matrix: (card, slide) => renderPluggableInteraction(card, slide) || renderYesNoMatrix(card, slide),
    "drag-drop": (card, slide) => renderPluggableInteraction(card, slide) || renderTextSlide(card, slide),
    pelmanism: (card, slide) => renderPluggableInteraction(card, slide) || renderTextSlide(card, slide),
    "table-completion": (card, slide) => renderPluggableInteraction(card, slide) || renderTextSlide(card, slide),
    "short-answer": (card, slide) => renderPluggableInteraction(card, slide) || renderFreeResponse(card, slide),
    gapfill: (card, slide) => renderPluggableInteraction(card, slide) || renderTextSlide(card, slide),
    "free-response": renderFreeResponse,
    cta: renderCtaSlide,
    transition: renderTransitionSlide
  };

  function validateCurrentSlide() {
    const slide = slides[state.index];
    const key = slide.responseKey;
    if (!key) return { valid: true };
    const interactionType = resolveInteractionType(slide);
    const module = getInteractionModule(interactionType);
    if (module && typeof module.validate === "function") {
      const moduleValidation = module.validate(slide, createInteractionContext());
      if (moduleValidation && moduleValidation.valid === false) return moduleValidation;
    }

    if (interactionType === "free-response") {
      const value = (getResponse(slide.id, key, "") || "").trim();
      if (!value) return { valid: false, message: "Please add your response before moving on." };
    }

    if (["single-choice", "multi-select"].includes(interactionType)) {
      const picked = getResponse(slide.id, key, []);
      if (!picked.length) return { valid: false, message: "Please select an option before moving on." };
      if (slide.correctAnswers && !getResponse(slide.id, getSubmitKey(slide), false)) {
        return { valid: false, message: "Please submit your answer to view the formative feedback before moving on." };
      }
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

    const feedback = document.createElement("div");
    feedback.id = "feedback-card";
    feedback.className = "feedback-card";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    feedback.setAttribute("aria-atomic", "true");
    feedback.innerHTML = '<div class="feedback-title">Feedback</div><div class="feedback-body"></div>';

    card.append(badge, title);
    const renderer = renderByInteractionType[interactionType] || renderTextSlide;
    renderer(card, slide);
    card.appendChild(feedback);

    if (getResponse(slide.id, getSubmitKey(slide), false)) {
      const seed = getResponse(slide.id, slide.responseKey, []);
      renderFeedback(slide, Array.isArray(seed) ? seed : []);
    }
    if (interactionType === "yes-no-matrix") {
      const saved = getResponse(slide.id, slide.responseKey, {});
      renderYesNoFeedback(slide, saved);
    }

    el.container.appendChild(card);

    el.section.textContent = slide.section;
    el.slideId.textContent = `Slide ${slide.id}`;
    el.counter.textContent = `Slide ${state.index + 1} of ${slides.length}`;
    el.progress.style.width = `${((state.index + 1) / slides.length) * 100}%`;

    el.prev.disabled = state.index === 0;
    el.next.textContent = state.index === slides.length - 1 ? "Submit" : "Next";

    const completionMessageId = "completion-message";
    const existingMessage = document.getElementById(completionMessageId);
    if (existingMessage) existingMessage.remove();
    if (state.completed && slide.id === "7.2") {
      const completionMessage = document.createElement("p");
      completionMessage.id = completionMessageId;
      completionMessage.className = "completion-message";
      completionMessage.textContent =
        "Thank you for completing this session. Your responses have been recorded. See you in the next lesson!";
      card.appendChild(completionMessage);
    }
  }

  el.prev.addEventListener("click", () => jumpTo(state.index - 1));
  el.next.addEventListener("click", () => {
    const validation = validateCurrentSlide();
    if (!validation.valid) {
      setFeedback("Hold on", validation.message, true);
      return;
    }

    if (state.index === slides.length - 1) {
      state.completed = true;
      persistState(state);
      const payload = window.deckHooks.exportResponses();
      if (typeof state.beforeExportHook === "function") state.beforeExportHook(payload);
      window.dispatchEvent(new CustomEvent("deck:complete", { detail: payload }));
      render();
      return;
    }

    jumpTo(state.index + 1);
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
