(() => {
  const TYPE = "linking";

  function toRecord(value) {
    return value && typeof value === "object" ? { ...value } : {};
  }

  function getPriorReflection(slide, ctx) {
    const prior = slide.priorReflection || {};
    const sharedKey = prior.sharedKey || "criticalIncidentText";
    const shared = typeof ctx.getSharedResponse === "function" ? ctx.getSharedResponse(sharedKey, "") : "";
    if (shared && String(shared).trim()) return String(shared).trim();

    const fromSlide = ctx.getResponse("02.2", "theory_critical_incident", "");
    if (fromSlide && String(fromSlide).trim()) return String(fromSlide).trim();

    return prior.fallback || "No prior reflection found.";
  }

  function evaluate(slide, links) {
    const descriptors = slide.descriptors || [];
    const expected = slide.expectedLinks || {};
    const total = descriptors.length;
    const answered = descriptors.filter((descriptor) => links[descriptor.id]).length;
    const correct = descriptors.filter((descriptor) => expected[descriptor.id] && expected[descriptor.id] === links[descriptor.id]).length;
    const complete = answered === total;
    return { total, answered, correct, complete, allCorrect: complete && correct === total };
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "linking-renderer";

    const instructions = document.createElement("p");
    instructions.className = "slide-copy";
    instructions.textContent = slide.instructions || "Link each descriptor to the best matching phase.";

    const reflectionPanel = document.createElement("article");
    reflectionPanel.className = "md-elevated-card prior-reflection-panel";

    const reflectionTitle = document.createElement("h3");
    reflectionTitle.className = "paired-panel-title";
    reflectionTitle.textContent = slide.priorReflection?.title || "Prior reflection";

    const reflectionBody = document.createElement("p");
    reflectionBody.className = "slide-copy";
    reflectionBody.textContent = getPriorReflection(slide, ctx);

    reflectionPanel.append(reflectionTitle, reflectionBody);

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = slide.reviewTitle || "Review phase definitions";
    details.appendChild(summary);
    (slide.phaseDefinitions || []).forEach((phase) => {
      const item = document.createElement("p");
      item.className = "slide-copy";
      item.innerHTML = `<strong>${phase.label}</strong>: ${phase.text}`;
      details.appendChild(item);
    });

    const links = toRecord(ctx.getResponse(slide.id, slide.responseKey, {}));
    const phases = slide.phaseDefinitions || [];
    const grid = document.createElement("div");
    grid.className = "input-wrap";

    const syncFeedback = () => {
      const result = evaluate(slide, links);
      if (!result.complete) {
        ctx.setFeedback("Linking in progress", `Linked ${result.answered}/${result.total}. Complete all links before continuing.`, true);
        return;
      }
      if (result.allCorrect) {
        ctx.setFeedback("Links complete", `Great work. You linked ${result.correct}/${result.total} correctly.`, false);
      } else {
        ctx.setFeedback("Links complete", `You linked ${result.correct}/${result.total} correctly. Review and adjust where needed.`, true);
      }
    };

    (slide.descriptors || []).forEach((descriptor) => {
      const row = document.createElement("div");
      row.className = "choice-list";

      const label = document.createElement("label");
      label.className = "slide-copy";
      label.textContent = descriptor.label;
      label.setAttribute("for", `${slide.id}-${descriptor.id}`);

      const select = document.createElement("select");
      select.id = `${slide.id}-${descriptor.id}`;
      select.className = "text-input";

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "Select a phase";
      select.appendChild(emptyOpt);

      phases.forEach((phase) => {
        const option = document.createElement("option");
        option.value = phase.id;
        option.textContent = phase.label;
        if (links[descriptor.id] === phase.id) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        if (!select.value) {
          delete links[descriptor.id];
        } else {
          links[descriptor.id] = select.value;
        }
        ctx.saveResponse(slide.id, slide.responseKey, links);
        syncFeedback();
      });

      row.append(label, select);
      grid.appendChild(row);
    });

    wrap.append(instructions, reflectionPanel, details, grid);
    card.appendChild(wrap);
    syncFeedback();
  }

  function validate(slide, ctx) {
    const links = toRecord(ctx.getResponse(slide.id, slide.responseKey, {}));
    const missing = (slide.descriptors || []).some((descriptor) => !links[descriptor.id]);
    if (missing) return { valid: false, message: "Please complete all descriptor links before moving on." };
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
