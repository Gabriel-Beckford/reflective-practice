(() => {
  const { slides: rawSlides = [] } = window.DECK_DATA;
  const RESPONSE_REQUIRED_TYPES = new Set([
    "single-choice",
    "multi-choice",
    "multi-yn",
    "input",
    "drag-drop",
    "pelmanism",
    "table-completion",
    "short-answer",
    "gapfill",
    "matrix",
    "linking"
  ]);

  function buildSectionId(sectionLabel = "", fallback = "section-generic") {
    const slug = String(sectionLabel || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || fallback;
  }

  function standardizeSlide(slide = {}) {
    const normalizedType = slide.type || "content";
    const normalizedSectionId = slide.sectionId || buildSectionId(slide.section);
    const responseKey =
      slide.responseKey ||
      (RESPONSE_REQUIRED_TYPES.has(normalizedType) ? `${slide.id || normalizedSectionId}_${normalizedType}_response` : null);

    return {
      ...slide,
      type: normalizedType,
      sectionId: normalizedSectionId,
      responseKey,
      timingMeta: slide.timingMeta && typeof slide.timingMeta === "object" ? slide.timingMeta : {},
      pathwayTags: Array.isArray(slide.pathwayTags) ? slide.pathwayTags : [],
      assets: slide.assets && typeof slide.assets === "object" ? slide.assets : { media: slide.media || null },
      aiConfig: slide.aiConfig && typeof slide.aiConfig === "object" ? slide.aiConfig : {}
    };
  }

  const slides = rawSlides.map(standardizeSlide);
  const STORAGE_KEY = "reflective-practice.deck-state.v1";
  const PATHWAY_STORAGE_KEY = "reflective-practice.selected-pathway.v1";
  const SESSION_KEY_API_PRESENT = "apiKeyPresent";
  const SESSION_KEY_CONNECTED = "connectionEstablished";
  const SHARED_RESPONSE_SLIDE_ID = "__shared__";
  const ALWAYS_INCLUDED_SECTION_PREFIXES = ["SECTION 6:", "SECTION 7:"];
  const urlParams = new URLSearchParams(window.location.search);
  const storyboardMode = urlParams.get("storyboard") === "1";
  const forcedSlide = Number.parseInt(urlParams.get("slide"), 10);
  const forcedIndex = Number.isFinite(forcedSlide)
    ? Math.max(0, Math.min(forcedSlide - 1, slides.length - 1))
    : null;
  let memoryState = null;
  let storageEnabled = forcedIndex === null;

  function normalizeSavedState(saved) {
    if (!saved || typeof saved !== "object") {
      return {
        index: 0,
        responses: {},
        completed: false,
        section3View: "linear",
        selectedPathway: null,
        selectedSections: null
      };
    }

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
    if (forcedIndex !== null) {
      return { index: forcedIndex, responses: {}, completed: false, section3View: "linear", selectedPathway: null, selectedSections: null };
    }
    if (!storageEnabled || !window.localStorage) {
      return memoryState || { index: 0, responses: {}, completed: false, section3View: "linear", selectedPathway: null, selectedSections: null };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { index: 0, responses: {}, completed: false, section3View: "linear", selectedPathway: null, selectedSections: null };
      return normalizeSavedState(JSON.parse(raw));
    } catch (error) {
      console.warn("Unable to hydrate saved deck responses.", error);
      storageEnabled = false;
      return { index: 0, responses: {}, completed: false, section3View: "linear", selectedPathway: null, selectedSections: null };
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
  const persistedPathwayRaw = window.localStorage ? window.localStorage.getItem(PATHWAY_STORAGE_KEY) : null;
  let persistedPathway = null;
  if (persistedPathwayRaw) {
    try {
      persistedPathway = JSON.parse(persistedPathwayRaw);
    } catch (error) {
      persistedPathway = null;
    }
  }
  const state = {
    index: forcedIndex !== null ? forcedIndex : Math.max(0, Math.min(persisted.index || 0, slides.length - 1)),
    responses: persisted.responses || {},
    completed: Boolean(persisted.completed),
    section3View: persisted.section3View === "carousel" ? "carousel" : "linear",
    selectedPathway: persistedPathway?.selectedPathway || persisted.selectedPathway || null,
    selectedSections: persistedPathway?.selectedSections || persisted.selectedSections || null,
    beforeExportHook: null,
    sectionMenuOpen: false,
    apiConnected: window.sessionStorage?.getItem(SESSION_KEY_CONNECTED) === "true",
    testingConnection: false
  };

  const el = {
    container: document.getElementById("slide-container"),
    section: document.getElementById("section-label"),
    counter: document.getElementById("slide-counter"),
    progress: document.getElementById("progress-fill"),
    slideId: document.getElementById("slide-id"),
    prev: document.getElementById("prev-btn"),
    next: document.getElementById("next-btn"),
    menuToggle: document.getElementById("menu-toggle"),
    menuClose: document.getElementById("menu-close"),
    menu: document.getElementById("section-menu"),
    menuOverlay: document.getElementById("menu-overlay"),
    sectionNav: document.getElementById("section-nav"),
    avatarShell: document.getElementById("avatar-shell"),
    avatarStatus: document.getElementById("avatar-status"),
    thinkingIndicator: document.getElementById("thinking-indicator"),
    connectionStatus: document.getElementById("connection-status"),
    apiGate: document.getElementById("api-gate"),
    apiKeyInput: document.getElementById("api-key-input"),
    apiTestBtn: document.getElementById("api-test-btn"),
    apiGateStatus: document.getElementById("api-gate-status")
  };

  if (storyboardMode) {
    document.body.classList.add("storyboard-frame");
  }

  function setAvatarState(mode, message) {
    if (!el.avatarShell) return;
    ["idle", "listening", "thinking", "responding"].forEach((stateClass) => {
      el.avatarShell.classList.toggle(stateClass, mode === stateClass);
    });
    if (el.avatarStatus && message) el.avatarStatus.textContent = message;
    if (el.thinkingIndicator) {
      const showThinking = mode === "thinking";
      el.thinkingIndicator.hidden = !showThinking;
      el.thinkingIndicator.setAttribute("aria-hidden", showThinking ? "false" : "true");
    }
  }

  function setConnectionMessage(message, ok = false) {
    if (el.connectionStatus) {
      el.connectionStatus.textContent = message;
      el.connectionStatus.classList.toggle("ok", ok);
    }
    if (el.apiGateStatus) el.apiGateStatus.textContent = message;
  }

  function setApiLocked(locked) {
    document.body.classList.toggle("api-locked", locked);
    if (el.apiGate) el.apiGate.hidden = !locked;
    if (locked) {
      if (state.index !== 0) {
        state.index = 0;
        persistState(state);
      }
      setAvatarState("listening", "Waiting for AI workspace connection.");
      setConnectionMessage("AI connection required before progression.", false);
    } else {
      setAvatarState("idle", "Connected and ready.");
      setConnectionMessage("AI connection established. You can navigate freely.", true);
    }
  }

  function isAlwaysIncludedSection(sectionLabel = "") {
    return ALWAYS_INCLUDED_SECTION_PREFIXES.some((prefix) => String(sectionLabel || "").startsWith(prefix));
  }

  function isSlideIncludedByPathway(slide) {
    if (!state.selectedSections || !Array.isArray(state.selectedSections) || !state.selectedSections.length) return true;
    if (!slide || !slide.section) return true;
    if (slide.section.startsWith("SECTION 0:")) return true;
    if (slide.section.startsWith("SECTION 1:")) return true;
    if (isAlwaysIncludedSection(slide.section)) return true;
    return state.selectedSections.includes(slide.section);
  }

  function persistPathwaySelection(pathwayId, selectedSections) {
    state.selectedPathway = pathwayId || null;
    state.selectedSections = Array.isArray(selectedSections) ? selectedSections : null;
    if (window.localStorage) {
      window.localStorage.setItem(
        PATHWAY_STORAGE_KEY,
        JSON.stringify({
          selectedPathway: state.selectedPathway,
          selectedSections: state.selectedSections
        })
      );
    }
    persistState(state);
    sectionSummaries = buildSectionSummaries();
  }

  function findNextIncludedIndex(startIndex, direction = 1) {
    let next = startIndex;
    while (next >= 0 && next < slides.length) {
      if (isSlideIncludedByPathway(slides[next])) return next;
      next += direction;
    }
    return Math.max(0, Math.min(startIndex, slides.length - 1));
  }

  function saveResponse(slideId, fieldKey, value) {
    if (!slideId || !fieldKey) return;
    const currentSlideResponses = state.responses[slideId] || {};
    state.responses[slideId] = { ...currentSlideResponses, [fieldKey]: value };

    if (fieldKey === "criticalIncidentText" || fieldKey === "theory_critical_incident") {
      const shared = state.responses[SHARED_RESPONSE_SLIDE_ID] || {};
      state.responses[SHARED_RESPONSE_SLIDE_ID] = { ...shared, criticalIncidentText: value };
    }

    persistState(state);
  }

  function saveSharedResponse(fieldKey, value) {
    if (!fieldKey) return;
    const shared = state.responses[SHARED_RESPONSE_SLIDE_ID] || {};
    state.responses[SHARED_RESPONSE_SLIDE_ID] = { ...shared, [fieldKey]: value };
    persistState(state);
  }

  function getSharedResponse(fieldKey, fallback = null) {
    const shared = state.responses[SHARED_RESPONSE_SLIDE_ID];
    if (!shared || typeof shared !== "object") return fallback;
    return Object.prototype.hasOwnProperty.call(shared, fieldKey) ? shared[fieldKey] : fallback;
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

  const LINE_PATTERNS = [
    { regex: /^typical questions:\s*/i, variantClass: "question-set", labelClass: "label-line" },
    { regex: /^ask:\s*/i, variantClass: "question-set", labelClass: "label-line" },
    { regex: /^contextual example:\s*/i, variantClass: "example-block", labelClass: "label-line" },
    { regex: /^example:\s*/i, variantClass: "example-block", labelClass: "label-line" }
  ];

  function classifyLine(line) {
    if (typeof line !== "string") return { text: "", variantClass: "", label: "" };
    const trimmed = line.trim();
    const hit = LINE_PATTERNS.find(({ regex }) => regex.test(trimmed));
    if (!hit) return { text: line, variantClass: "", label: "" };

    const labelMatch = trimmed.match(/^([^:]{3,40}:)\s*(.*)$/);
    return {
      text: labelMatch ? labelMatch[2] : trimmed,
      variantClass: hit.variantClass,
      label: labelMatch ? labelMatch[1] : ""
    };
  }

  function appendBodyCopy(target, lines = [], className = "slide-copy") {
    lines.forEach((line) => {
      const { text, variantClass, label } = classifyLine(line);
      const p = document.createElement("p");
      p.className = [className, variantClass].filter(Boolean).join(" ");
      if (label) {
        const labelSpan = document.createElement("span");
        labelSpan.className = "label-line";
        labelSpan.textContent = `${label} `;
        p.appendChild(labelSpan);
      }
      p.append(document.createTextNode(text));
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
    const keyPoints = Array.isArray(slide.keyPoints) ? slide.keyPoints : normalizeBodyToKeyPoints(body);
    const questionSet =
      Array.isArray(slide.questionSet) ? slide.questionSet : keyPoints.filter((point) => /^(ask|typical questions):/i.test(point));
    const normalizedKeyPoints = keyPoints.filter((point) => !questionSet.includes(point));
    return {
      lead: slide.lead || body[0] || "",
      keyPoints: normalizedKeyPoints,
      questionSet,
      callouts: Array.isArray(slide.callouts) ? slide.callouts : slide.callout ? [slide.callout] : [],
      examples: Array.isArray(slide.examples) ? slide.examples : [],
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

    const { lead, keyPoints, questionSet, callouts, examples, actionPrompt } = getSlideTextRegions(slide);

    if (lead) {
      const leadHeader = document.createElement("header");
      leadHeader.className = "text-region text-region-lead";
      appendBodyCopy(leadHeader, [lead], "slide-lead");
      target.appendChild(leadHeader);
    }

    appendSlideMedia(target, slide.assets?.media || slide.media);

    if (keyPoints.length || slide.listTitle || slide.bullets?.length) {
      const keyPointsSection = document.createElement("section");
      keyPointsSection.className = "text-region text-region-key-points";
      appendBodyCopy(keyPointsSection, keyPoints);
      appendOptionalList(keyPointsSection, slide);
      target.appendChild(keyPointsSection);
    }

    if (questionSet.length) {
      const questionSection = document.createElement("section");
      questionSection.className = "text-region text-region-questions";
      appendBodyCopy(questionSection, questionSet, "slide-copy question-set");
      target.appendChild(questionSection);
    }

    if (examples.length) {
      const exampleSection = document.createElement("section");
      exampleSection.className = "text-region text-region-examples";
      examples.forEach((line) => {
        const card = document.createElement("article");
        card.className = "md-elevated-card";
        appendBodyCopy(card, [line], "slide-copy example-block");
        exampleSection.appendChild(card);
      });
      target.appendChild(exampleSection);
    }

    if (callouts.length) {
      const calloutAside = document.createElement("aside");
      calloutAside.className = "text-region text-region-callout";
      appendBodyCopy(calloutAside, callouts, "slide-callout");
      target.appendChild(calloutAside);
    }

    if (actionPrompt) {
      const actionSection = document.createElement("section");
      actionSection.className = "text-region text-region-action";
      appendBodyCopy(actionSection, [actionPrompt], "slide-action");
      target.appendChild(actionSection);
    }
  }

  function appendSlideMedia(target, media) {
    if (!media || typeof media !== "object") return;
    const isImage = media.type === "image" || media.type === "image-bordered";
    const isIcon = media.type === "icon" || media.type === "icon-bordered";
    if (!isImage && !isIcon) return;
    if (!media.src) return;

    const figure = document.createElement("figure");
    figure.className = "slide-media";
    if (media.type === "image-bordered" || media.type === "icon-bordered") figure.classList.add("slide-media--bordered");

    if (isImage) {
      const image = document.createElement("img");
      image.className = "slide-media-image";
      image.src = media.src;
      image.alt = media.alt || "";
      image.loading = "lazy";
      image.decoding = "async";
      figure.appendChild(image);
    } else if (isIcon) {
      const icon = document.createElement("span");
      icon.className = "material-symbols-rounded slide-media-icon";
      icon.textContent = media.src;
      icon.setAttribute("role", "img");
      icon.setAttribute("aria-label", media.alt || media.src);
      figure.appendChild(icon);
    }

    if (media.caption || media.credit) {
      const caption = document.createElement("figcaption");
      caption.className = "slide-media-caption";
      caption.textContent = media.caption || "";
      if (media.credit) {
        const credit = document.createElement("span");
        credit.className = "slide-media-credit";
        credit.textContent = ` ${media.credit}`;
        caption.appendChild(credit);
      }
      figure.appendChild(caption);
    }

    target.appendChild(figure);
  }

  function createPhaseChip(phaseTag) {
    if (!phaseTag) return null;
    const chip = document.createElement("span");
    chip.className = "md-chip phase-chip";
    chip.textContent = phaseTag;
    return chip;
  }

  function createSegmentedControl(activeMode = "linear") {
    const control = document.createElement("div");
    control.className = "md-segmented-control";
    control.setAttribute("role", "tablist");
    control.setAttribute("aria-label", "Section 3 view mode");

    const modes = [{ value: "linear", label: "Linear" }];
    if (supportsPairedCarousel()) modes.push({ value: "carousel", label: "Paired carousel" });

    modes.forEach((mode) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "md-segment";
      btn.textContent = mode.label;
      btn.dataset.mode = mode.value;
      btn.setAttribute("role", "tab");
      const selected = mode.value === activeMode;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      btn.classList.toggle("active", selected);
      btn.addEventListener("click", () => {
        state.section3View = mode.value;
        persistState(state);
        render();
      });
      control.appendChild(btn);
    });

    return control;
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
  const SECTION_THEMES = ["dawn", "sage", "amber", "violet"];
  const SECTION3_LABEL = "SECTION 3: IDENTIFY THE PHASE";
  const pairedGroups = buildPairedGroups();
  let sectionSummaries = buildSectionSummaries();

  function buildSectionSummaries() {
    const map = new Map();
    slides.forEach((slide, index) => {
      if (!isSlideIncludedByPathway(slide)) return;
      if (!map.has(slide.section)) {
        map.set(slide.section, {
          section: slide.section,
          firstIndex: index,
          lastIndex: index,
          title: slide.title
        });
      } else {
        map.get(slide.section).lastIndex = index;
      }
    });
    return [...map.values()];
  }

  function getSectionProgress(index = state.index) {
    const visibleIndex = findNextIncludedIndex(index, -1);
    return sectionSummaries.map((entry) => {
      const done = visibleIndex > entry.lastIndex;
      const active = visibleIndex >= entry.firstIndex && visibleIndex <= entry.lastIndex;
      return { ...entry, done, active };
    });
  }

  function toggleMenu(open) {
    state.sectionMenuOpen = Boolean(open);
    if (el.menu) el.menu.hidden = !state.sectionMenuOpen;
    if (el.menuOverlay) el.menuOverlay.hidden = !state.sectionMenuOpen;
    if (el.menuToggle) el.menuToggle.setAttribute("aria-expanded", state.sectionMenuOpen ? "true" : "false");
  }

  function renderSectionMenu() {
    if (!el.sectionNav) return;
    const list = document.createElement("ul");
    list.className = "section-nav-list";
    getSectionProgress().forEach((sectionEntry) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-link";
      if (sectionEntry.active) button.classList.add("active");
      if (sectionEntry.done) button.classList.add("done");
      button.disabled = !state.apiConnected;
      button.innerHTML = `<strong>${sectionEntry.section}</strong><small>${sectionEntry.title}</small>`;
      button.addEventListener("click", () => {
        if (!state.apiConnected) return;
        jumpTo(sectionEntry.firstIndex);
        toggleMenu(false);
      });
      item.appendChild(button);
      list.appendChild(item);
    });
    el.sectionNav.innerHTML = "";
    el.sectionNav.appendChild(list);
  }

  function getSectionMeta(sectionLabel = "") {
    const normalizedLabel = String(sectionLabel || "").trim();
    const sectionMatch = normalizedLabel.match(/section\s*(\d+)/i);
    const sectionNumber = sectionMatch ? Number.parseInt(sectionMatch[1], 10) : null;
    const sectionKey = Number.isInteger(sectionNumber) ? `section-${sectionNumber}` : "section-generic";
    const sectionTheme = Number.isInteger(sectionNumber)
      ? SECTION_THEMES[(sectionNumber - 1) % SECTION_THEMES.length]
      : SECTION_THEMES[0];

    return { sectionKey, sectionTheme };
  }

  function buildPairedGroups() {
    const groups = [];
    const byId = new Map();

    slides.forEach((slide, index) => {
      if (!slide.pairingId) return;
      if (!byId.has(slide.pairingId)) {
        const group = {
          pairingId: slide.pairingId,
          excerptIndex: null,
          questionIndex: null,
          indices: [],
          phaseTag: slide.phaseTag || ""
        };
        byId.set(slide.pairingId, group);
        groups.push(group);
      }

      const group = byId.get(slide.pairingId);
      group.indices.push(index);
      if (slide.type === "content" && group.excerptIndex === null) group.excerptIndex = index;
      if (slide.type === "single-choice" && group.questionIndex === null) group.questionIndex = index;
      if (!group.phaseTag && slide.phaseTag) group.phaseTag = slide.phaseTag;
    });

    return groups.filter((group) => Number.isInteger(group.excerptIndex) && Number.isInteger(group.questionIndex));
  }

  function getPairingIdForSlide(slide) {
    if (!slide) return null;
    if (slide.pairingId) return slide.pairingId;
    if (!slide.pairedExcerptId) return null;
    const source = slides.find((item) => item.id === slide.pairedExcerptId);
    return source?.pairingId || null;
  }

  function getPairGroupByIndex(index) {
    const slide = slides[index];
    if (!slide || slide.section !== SECTION3_LABEL) return null;
    const pairingId = getPairingIdForSlide(slide);
    if (!pairingId) return null;
    return pairedGroups.find((group) => group.pairingId === pairingId) || null;
  }

  function supportsPairedCarousel() {
    const canSnap = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("scroll-snap-type: x mandatory");
    const touchLikely =
      (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
      "ontouchstart" in window;
    return Boolean(canSnap && touchLikely);
  }

  function isCarouselModeActive(index = state.index) {
    if (state.section3View !== "carousel") return false;
    if (!supportsPairedCarousel()) return false;
    return Boolean(getPairGroupByIndex(index));
  }

  function getInteractionModule(type) {
    return interactionModules[type] || null;
  }

  function createInteractionContext() {
    return {
      saveResponse,
      getResponse,
      setFeedback,
      hideFeedback,
      saveSharedResponse,
      getSharedResponse,
      isApiConnected: () => Boolean(state.apiConnected),
      requestAiReply: async (message) => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || "AI request failed");
        }
        return payload.reply || payload.message || "";
      }
    };
  }

  function renderUnknownInteraction(card, slide, interactionType) {
    console.warn(`[deck] Unknown interaction type "${interactionType}" for slide ${slide.id}. Rendering safe fallback.`);
    const wrap = document.createElement("section");
    wrap.className = "text-renderer unknown-interaction-renderer";
    const warning = document.createElement("p");
    warning.className = "slide-copy";
    warning.textContent = "This slide type is not yet supported in the learner renderer. Showing text fallback.";
    wrap.appendChild(warning);
    appendStructuredText(wrap, slide);
    card.appendChild(wrap);
  }

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
      "multi-yn": "yes-no-matrix",
      input: "free-response",
      matrix: "matrix",
      "drag-drop": "drag-drop",
      pelmanism: "pelmanism",
      "table-completion": "table-completion",
      "short-answer": "short-answer",
      gapfill: "gapfill",
      linking: "linking",
      "chatbot-route": "chatbot-route",
      "pond-game": "pond-game"
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

  function renderSectionTitle(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer section-title-renderer";
    if (slide.backgroundImage) wrap.style.backgroundImage = `url(${slide.backgroundImage})`;
    appendStructuredText(wrap, slide);
    card.appendChild(wrap);
  }

  function renderGrounding321(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "free-response-renderer grounding-321-renderer";
    if (slide.backgroundImage) wrap.style.backgroundImage = `url(${slide.backgroundImage})`;
    appendStructuredText(wrap, slide);

    if (Array.isArray(slide.groundingPrompts) && slide.groundingPrompts.length) {
      const prompts = document.createElement("div");
      prompts.className = "grounding-prompt-list";
      slide.groundingPrompts.forEach((item) => {
        const chip = document.createElement("p");
        chip.className = "slide-copy grounding-chip";
        chip.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${item.icon}</span> <strong>${item.label}</strong>: ${item.prompt}`;
        prompts.appendChild(chip);
      });
      wrap.appendChild(prompts);
    }

    const area = document.createElement("textarea");
    const areaId = `grounding-${slide.id}`;
    area.id = areaId;
    area.value = getResponse(slide.id, slide.responseKey, "");
    area.addEventListener("input", () => saveResponse(slide.id, slide.responseKey, area.value));
    wrap.appendChild(area);

    const sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "submit-btn";
    sendBtn.textContent = "Send to AI";
    const aiReply = document.createElement("p");
    aiReply.className = "slide-copy";
    aiReply.textContent = getResponse(slide.id, `${slide.responseKey}__ai`, "AI reply will appear here after you send.");
    sendBtn.addEventListener("click", async () => {
      const text = (area.value || "").trim();
      if (!text) {
        aiReply.textContent = "Please enter your 3-2-1 response first.";
        return;
      }
      if (!state.apiConnected) {
        aiReply.textContent = "AI connection is not established yet. Your response is still saved.";
        saveResponse(slide.id, `${slide.responseKey}__ai`, aiReply.textContent);
        return;
      }
      aiReply.textContent = "Thinking...";
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `Respond briefly and warmly to this 3-2-1 grounding note:\n${text}` })
        });
        const payload = await response.json().catch(() => ({}));
        aiReply.textContent = payload.reply || payload.message || "Thanks for grounding yourself before learning.";
      } catch (error) {
        aiReply.textContent = "Unable to fetch AI response right now. Your reflection has been saved.";
      }
      saveResponse(slide.id, `${slide.responseKey}__ai`, aiReply.textContent);
    });
    wrap.append(sendBtn, aiReply);
    card.appendChild(wrap);
  }

  function renderIloStack(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "free-response-renderer ilo-stack-renderer";
    appendStructuredText(wrap, slide);
    if (Array.isArray(slide.iloLayers)) {
      const stack = document.createElement("div");
      stack.className = "ilo-stack";
      slide.iloLayers.forEach((layer, index) => {
        const row = document.createElement("div");
        row.className = "ilo-layer";
        row.style.setProperty("--ilo-index", String(index));
        row.innerHTML = `<strong>${layer.level}</strong><span>${layer.text}</span>`;
        stack.appendChild(row);
      });
      wrap.appendChild(stack);
    }
    const area = document.createElement("textarea");
    area.value = getResponse(slide.id, slide.responseKey, "");
    area.addEventListener("input", () => saveResponse(slide.id, slide.responseKey, area.value));
    wrap.appendChild(area);
    card.appendChild(wrap);
  }

  function renderPersonalisationMbti(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer personalisation-renderer";
    appendStructuredText(wrap, slide);
    const optionsWrap = document.createElement("div");
    optionsWrap.className = "choice-list";
    const selected = getResponse(slide.id, slide.responseKey, "");
    (slide.mbtiOptions || []).forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-item";
      btn.textContent = option;
      if (selected === option) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        saveResponse(slide.id, slide.responseKey, option);
        saveResponse(slide.id, "mbtiSkipped", false);
        render();
      });
      optionsWrap.appendChild(btn);
    });
    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "submit-btn";
    skip.textContent = "Skip";
    skip.addEventListener("click", () => {
      saveResponse(slide.id, slide.responseKey, "");
      saveResponse(slide.id, "mbtiSkipped", true);
      render();
    });
    wrap.append(optionsWrap, skip);
    card.appendChild(wrap);
  }

  function renderPathwaySelector(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer pathway-selector-renderer";
    appendStructuredText(wrap, slide);
    const list = document.createElement("div");
    list.className = "choice-list";
    const selectedPathway = state.selectedPathway || getResponse(slide.id, slide.responseKey, "");
    (slide.pathways || []).forEach((pathway) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-item";
      if (selectedPathway === pathway.id) btn.classList.add("selected");
      btn.innerHTML = `<strong>${pathway.label}</strong><small>${pathway.timing}</small>`;
      btn.addEventListener("click", () => {
        saveResponse(slide.id, slide.responseKey, pathway.id);
        saveResponse(slide.id, "selectedSections", pathway.sections || []);
        persistPathwaySelection(pathway.id, pathway.sections || []);
        render();
      });
      list.appendChild(btn);
    });
    wrap.appendChild(list);
    card.appendChild(wrap);
  }

  function renderApiGateConnect(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer api-gate-connect-renderer";
    appendStructuredText(wrap, slide);
    if (el.apiGate) el.apiGate.hidden = true;
    const status = document.createElement("p");
    const statusText = state.testingConnection
      ? slide.statusLabels?.testing
      : (state.apiConnected ? slide.statusLabels?.connected : slide.statusLabels?.idle);
    status.className = "slide-copy";
    status.textContent = `Status: ${statusText || "Not connected"}`;
    wrap.appendChild(status);
    card.appendChild(wrap);
  }

  function renderApiGateConfirm(card, slide) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer api-gate-confirm-renderer";
    appendStructuredText(wrap, slide);
    const ctaBtn = document.createElement("button");
    ctaBtn.type = "button";
    ctaBtn.className = "cta-btn";
    ctaBtn.textContent = slide.ctaLabel || "Continue";
    ctaBtn.disabled = !state.apiConnected;
    ctaBtn.addEventListener("click", () => jumpTo(getNextIndex()));
    wrap.appendChild(ctaBtn);
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

  const MODULE_INTERACTION_TYPES = new Set([
    "matrix",
    "drag-drop",
    "pelmanism",
    "table-completion",
    "short-answer",
    "gapfill",
    "accordion",
    "quote-card",
    "interactive-diagram",
    "padlet-embed",
    "ai-chat",
    "chatbot-route",
    "pond-game"
  ]);

  const builtInRenderers = {
    text: renderTextSlide,
    "section-title": renderSectionTitle,
    "grounding-321": renderGrounding321,
    "ilo-stack": renderIloStack,
    "personalisation-mbti": renderPersonalisationMbti,
    "pathway-selector": renderPathwaySelector,
    "api-gate-connect": renderApiGateConnect,
    "api-gate-confirm": renderApiGateConfirm,
    "single-choice": renderSingleChoice,
    "multi-select": renderMultiSelect,
    "yes-no-matrix": renderYesNoMatrix,
    "free-response": renderFreeResponse,
    cta: renderCtaSlide,
    transition: renderTransitionSlide
  };

  function renderSlideByInteractionType(card, slide, interactionType) {
    if (MODULE_INTERACTION_TYPES.has(interactionType)) {
      const module = getInteractionModule(interactionType);
      if (module && typeof module.render === "function") {
        module.render(card, slide, createInteractionContext());
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

  function renderSection3PairedUnit(card, pairGroup) {
    const excerptSlide = slides[pairGroup.excerptIndex];
    const questionSlide = slides[pairGroup.questionIndex];
    if (!excerptSlide || !questionSlide) return;

    const wrap = document.createElement("section");
    wrap.className = "paired-unit";

    const excerptPanel = document.createElement("article");
    excerptPanel.className = "md-elevated-card paired-panel";
    const excerptTitle = document.createElement("h2");
    excerptTitle.className = "paired-panel-title";
    excerptTitle.textContent = excerptSlide.title;
    excerptPanel.appendChild(excerptTitle);
    appendStructuredText(excerptPanel, excerptSlide);

    const questionPanel = document.createElement("article");
    questionPanel.className = "md-elevated-card paired-panel";
    const questionTitle = document.createElement("h2");
    questionTitle.className = "paired-panel-title";
    questionTitle.textContent = questionSlide.title;
    questionPanel.appendChild(questionTitle);
    renderSingleChoice(questionPanel, questionSlide);

    wrap.append(excerptPanel, questionPanel);
    card.appendChild(wrap);

    let touchStartX = null;
    card.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches?.[0]?.screenX ?? null;
    }, { passive: true });
    card.addEventListener("touchend", (event) => {
      if (touchStartX === null) return;
      const touchEndX = event.changedTouches?.[0]?.screenX ?? touchStartX;
      const deltaX = touchEndX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) < 44) return;
      if (deltaX < 0) jumpTo(getNextIndex());
      if (deltaX > 0) jumpTo(getPrevIndex());
    }, { passive: true });
  }

  function getValidationSlide() {
    if (!isCarouselModeActive(state.index)) return slides[state.index];
    const group = getPairGroupByIndex(state.index);
    if (!group) return slides[state.index];
    return slides[group.questionIndex];
  }

  function validateCurrentSlide() {
    const slide = getValidationSlide();
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

  function getNextIndex() {
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

  function getPrevIndex() {
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
    render();
  }

  async function testApiConnection() {
    if (state.testingConnection) return;
    const apiKey = (el.apiKeyInput?.value || "").trim();
    if (!apiKey) {
      window.sessionStorage?.setItem(SESSION_KEY_API_PRESENT, "false");
      setConnectionMessage("No API key provided. Paste a key to continue.", false);
      setAvatarState("listening", "Awaiting key input.");
      return;
    }

    state.testingConnection = true;
    if (el.apiTestBtn) el.apiTestBtn.disabled = true;
    setConnectionMessage("Testing connection via /api/gemini/test...", false);
    setAvatarState("thinking", "Testing connection.");

    try {
      window.sessionStorage?.setItem(SESSION_KEY_API_PRESENT, "true");
      const response = await fetch("/api/gemini/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeyPresent: true })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.message || "Connection failed.";
        throw new Error(message);
      }
      state.apiConnected = true;
      window.sessionStorage?.setItem(SESSION_KEY_CONNECTED, "true");
      setAvatarState("responding", "Connection successful.");
      setConnectionMessage("Connected. Deck navigation unlocked.", true);
      setApiLocked(false);
      render();
      window.setTimeout(() => setAvatarState("idle", "Connected and ready."), 900);
    } catch (error) {
      state.apiConnected = false;
      window.sessionStorage?.setItem(SESSION_KEY_CONNECTED, "false");
      setAvatarState("responding", "Connection failed.");
      setConnectionMessage(`Connection failed: ${error.message}`, false);
      setApiLocked(true);
    } finally {
      state.testingConnection = false;
      if (el.apiTestBtn) el.apiTestBtn.disabled = false;
    }
  }

  function render() {
    if (!isSlideIncludedByPathway(slides[state.index])) {
      state.index = findNextIncludedIndex(state.index, 1);
    }
    const slide = slides[state.index];
    const interactionType = resolveInteractionType(slide);
    const pairGroup = getPairGroupByIndex(state.index);
    const carouselActive = isCarouselModeActive(state.index);
    const { sectionKey, sectionTheme } = getSectionMeta(slide.section);
    const previousSectionKey = el.container.dataset.currentSection || "";
    el.container.innerHTML = "";

    const card = document.createElement("article");
    card.className = "slide active";
    card.dataset.section = sectionKey;
    card.dataset.theme = sectionTheme;
    if (previousSectionKey && previousSectionKey !== sectionKey) {
      card.classList.add("section-enter");
      el.container.dataset.sectionTransition = `${previousSectionKey}-to-${sectionKey}`;
    } else {
      delete el.container.dataset.sectionTransition;
    }
    el.container.dataset.currentSection = sectionKey;

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
    if (slide.section === SECTION3_LABEL && pairGroup) {
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

    el.container.appendChild(card);

    el.section.textContent = slide.section;
    const activeSection = sectionSummaries.find((entry) => state.index >= entry.firstIndex && state.index <= entry.lastIndex);
    const sectionOffset = activeSection ? state.index - activeSection.firstIndex + 1 : state.index + 1;
    const sectionSpan = activeSection ? activeSection.lastIndex - activeSection.firstIndex + 1 : slides.length;

    if (carouselActive && pairGroup) {
      const pairIndex = pairedGroups.findIndex((group) => group.pairingId === pairGroup.pairingId);
      el.slideId.textContent = `Pair ${pairIndex + 1}`;
      el.counter.textContent = `Pair ${pairIndex + 1} of ${pairedGroups.length} · ${activeSection?.section || "Section"}`;
    } else {
      el.slideId.textContent = `Slide ${slide.id}`;
      el.counter.textContent = `Slide ${state.index + 1} of ${slides.length} · Section progress ${sectionOffset}/${sectionSpan}`;
    }
    el.progress.style.width = `${(sectionOffset / sectionSpan) * 100}%`;

    const lockActive = !state.apiConnected;
    el.prev.disabled = lockActive || state.index === 0;
    el.next.disabled = lockActive;
    el.next.textContent = state.index === slides.length - 1 ? "Submit" : "Next";
    renderSectionMenu();

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

  el.prev.addEventListener("click", () => jumpTo(getPrevIndex()));
  if (el.menuToggle) el.menuToggle.addEventListener("click", () => toggleMenu(!state.sectionMenuOpen));
  if (el.menuClose) el.menuClose.addEventListener("click", () => toggleMenu(false));
  if (el.menuOverlay) el.menuOverlay.addEventListener("click", () => toggleMenu(false));
  if (el.apiTestBtn) el.apiTestBtn.addEventListener("click", testApiConnection);

  el.next.addEventListener("click", () => {
    if (!state.apiConnected) {
      setFeedback("Connection required", "Connect to the API workspace before moving to the next slide.", true);
      setApiLocked(true);
      return;
    }

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

    jumpTo(getNextIndex());
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

  setApiLocked(!state.apiConnected);
  renderSectionMenu();
  render();
})();
