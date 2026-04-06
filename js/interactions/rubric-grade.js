(() => {
  const TYPE = "rubric-grade";

  function getScoreOptions(slide) {
    const options = slide?.rubricMeta?.scoreLabels;
    if (Array.isArray(options) && options.length) return options;
    return [
      { value: "1", label: "1 — Emerging" },
      { value: "2", label: "2 — Developing" },
      { value: "3", label: "3 — Proficient" },
      { value: "4", label: "4 — Advanced" }
    ];
  }

  function interpolatePrompt(template, variables) {
    return String(template || "{{rationale}}")
      .replace(/{{criterion}}/g, variables.criterion)
      .replace(/{{grade}}/g, variables.grade)
      .replace(/{{gradeLabel}}/g, variables.gradeLabel)
      .replace(/{{rationale}}/g, variables.rationale)
      .replace(/{{exemplar}}/g, variables.exemplar);
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "rubric-grade-renderer";

    const rubricPanel = document.createElement("section");
    rubricPanel.className = "rubric-panel";

    const rubricTitle = document.createElement("h3");
    rubricTitle.className = "rubric-panel-title";
    rubricTitle.textContent = slide?.rubricMeta?.criterion || "Rubric criterion";

    const rubricMeta = document.createElement("p");
    rubricMeta.className = "slide-copy";
    rubricMeta.textContent = `Rubric: ${slide?.rubricMeta?.rubricId || "Default rubric"}`;

    const exemplarWrap = document.createElement("article");
    exemplarWrap.className = "exemplar-text";
    const exemplarTitle = document.createElement("h4");
    exemplarTitle.className = "exemplar-title";
    exemplarTitle.textContent = slide?.exemplarPayload?.title || "Exemplar";
    const exemplarBody = document.createElement("p");
    exemplarBody.className = "slide-copy";
    exemplarBody.textContent = slide?.exemplarPayload?.text || "";
    exemplarWrap.append(exemplarTitle, exemplarBody);

    rubricPanel.append(rubricTitle, rubricMeta, exemplarWrap);

    const form = document.createElement("section");
    form.className = "rubric-grade-form";

    const gradeLabel = document.createElement("label");
    gradeLabel.className = "slide-copy";
    gradeLabel.setAttribute("for", `rubric-grade-${slide.id}`);
    gradeLabel.textContent = "Grade selection";

    const gradeSelect = document.createElement("select");
    gradeSelect.id = `rubric-grade-${slide.id}`;
    gradeSelect.className = "rubric-grade-select";

    const gradeKey = `${slide.responseKey}__grade`;
    const rationaleKey = `${slide.responseKey}__rationale`;
    const feedbackKey = `${slide.responseKey}__ai_feedback`;
    const feedbackStateKey = `${slide.responseKey}__ai_feedback_state`;

    const selected = ctx.getResponse(slide.id, gradeKey, "");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a rubric grade";
    gradeSelect.appendChild(placeholder);

    getScoreOptions(slide).forEach((opt) => {
      const option = document.createElement("option");
      option.value = String(opt.value);
      option.textContent = opt.label;
      if (String(opt.value) === String(selected)) option.selected = true;
      gradeSelect.appendChild(option);
    });

    gradeSelect.addEventListener("change", () => {
      ctx.saveResponse(slide.id, gradeKey, gradeSelect.value);
      ctx.saveResponse(slide.id, slide.responseKey, {
        grade: gradeSelect.value,
        rationale: rationale.value
      });
    });

    const rationaleLabel = document.createElement("label");
    rationaleLabel.className = "slide-copy";
    rationaleLabel.setAttribute("for", `rubric-rationale-${slide.id}`);
    rationaleLabel.textContent = "Rationale";

    const rationale = document.createElement("textarea");
    rationale.id = `rubric-rationale-${slide.id}`;
    rationale.className = "rubric-rationale";
    rationale.placeholder = "Explain why this exemplar earned that grade.";
    rationale.value = ctx.getResponse(slide.id, rationaleKey, "");
    rationale.addEventListener("input", () => {
      ctx.saveResponse(slide.id, rationaleKey, rationale.value);
      ctx.saveResponse(slide.id, slide.responseKey, {
        grade: gradeSelect.value,
        rationale: rationale.value
      });
    });

    const buttonRow = document.createElement("div");
    buttonRow.className = "rubric-feedback-actions";

    const aiButton = document.createElement("button");
    aiButton.type = "button";
    aiButton.className = "submit-btn";
    aiButton.textContent = "Generate AI feedback";

    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "submit-btn muted";
    retryButton.textContent = "Retry feedback";

    const aiRegion = document.createElement("div");
    aiRegion.className = "ai-feedback-region";
    aiRegion.setAttribute("role", "status");
    aiRegion.setAttribute("aria-live", "polite");
    aiRegion.textContent = ctx.getResponse(slide.id, feedbackKey, "AI feedback will appear here.");

    function setDeferredMessage() {
      const fallback = slide.aiFallbackText || "AI feedback deferred. Retry when available.";
      aiRegion.textContent = fallback;
      ctx.saveResponse(slide.id, feedbackKey, fallback);
      ctx.saveResponse(slide.id, feedbackStateKey, "deferred");
    }

    async function runFeedback() {
      const grade = gradeSelect.value;
      const rationaleText = rationale.value.trim();
      if (!grade || !rationaleText) {
        aiRegion.textContent = "Please select a grade and write a rationale before requesting AI feedback.";
        ctx.saveResponse(slide.id, feedbackKey, aiRegion.textContent);
        return;
      }

      if (typeof ctx.isApiConnected === "function" && !ctx.isApiConnected()) {
        setDeferredMessage();
        return;
      }

      aiRegion.textContent = "Generating feedback...";
      const gradeOption = getScoreOptions(slide).find((item) => String(item.value) === String(grade));
      const prompt = interpolatePrompt(slide.aiFeedbackPromptTemplate, {
        criterion: slide?.rubricMeta?.criterion || "Rubric criterion",
        grade,
        gradeLabel: gradeOption?.label || grade,
        rationale: rationaleText,
        exemplar: slide?.exemplarPayload?.text || ""
      });

      try {
        const reply = await ctx.requestAiReply(prompt);
        aiRegion.textContent = reply || slide.aiFallbackText || "No AI feedback received. You can retry.";
        ctx.saveResponse(slide.id, feedbackStateKey, "ready");
      } catch (error) {
        setDeferredMessage();
      }

      ctx.saveResponse(slide.id, feedbackKey, aiRegion.textContent);
    }

    aiButton.addEventListener("click", runFeedback);
    retryButton.addEventListener("click", runFeedback);

    const feedbackState = ctx.getResponse(slide.id, feedbackStateKey, "");
    if (feedbackState === "deferred" && !ctx.getResponse(slide.id, feedbackKey, "")) {
      setDeferredMessage();
    }

    buttonRow.append(aiButton, retryButton);
    form.append(gradeLabel, gradeSelect, rationaleLabel, rationale, buttonRow, aiRegion);

    wrap.append(rubricPanel, form);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const grade = (ctx.getResponse(slide.id, `${slide.responseKey}__grade`, "") || "").trim();
    const rationale = (ctx.getResponse(slide.id, `${slide.responseKey}__rationale`, "") || "").trim();
    if (!grade) return { valid: false, message: "Please select a rubric grade before continuing." };
    if (rationale.split(/\s+/).filter(Boolean).length < 8) {
      return { valid: false, message: "Please provide at least 8 words of rationale before continuing." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
