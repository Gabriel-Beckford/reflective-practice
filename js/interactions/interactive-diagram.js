(() => {
  const TYPE = "interactive-diagram";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "interactive-diagram-renderer";

    const viewedKey = slide.diagramViewedKey || `${slide.responseKey}__viewed`;
    const viewed = new Set(ctx.getResponse(slide.id, viewedKey, []));

    const list = document.createElement("div");
    list.className = "choice-list";

    ensureArray(slide.dimensions).forEach((dimension, index) => {
      const details = document.createElement("details");
      details.className = "md-elevated-card";
      if (viewed.has(dimension.id || `dimension-${index + 1}`)) details.open = true;

      const summary = document.createElement("summary");
      summary.textContent = dimension.label || `Dimension ${index + 1}`;
      details.appendChild(summary);

      const ul = document.createElement("ul");
      ul.className = "slide-copy";
      ensureArray(dimension.details).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      details.appendChild(ul);

      details.addEventListener("toggle", () => {
        if (!details.open) return;
        viewed.add(dimension.id || `dimension-${index + 1}`);
        ctx.saveResponse(slide.id, viewedKey, [...viewed]);
      });

      list.appendChild(details);
    });

    const prompt = document.createElement("label");
    prompt.className = "slide-copy";
    prompt.textContent = slide.prompt || "Record one insight from the dimensions above.";

    const area = document.createElement("textarea");
    area.value = ctx.getResponse(slide.id, slide.responseKey, "");
    area.addEventListener("input", () => {
      ctx.saveResponse(slide.id, slide.responseKey, area.value);
    });

    wrap.append(list, prompt, area);
    card.appendChild(wrap);
  }

  function validate() {
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
