(() => {
  const TYPE = "accordion";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "accordion-renderer";

    const intro = document.createElement("p");
    intro.className = "slide-copy";
    intro.textContent = slide.prompt || "Expand each section to explore the details.";
    wrap.appendChild(intro);

    const viewedKey = slide.accordionViewedKey || `${slide.responseKey}__viewed`;
    const viewedIds = new Set(ctx.getResponse(slide.id, viewedKey, []));

    ensureArray(slide.sections).forEach((section, index) => {
      const details = document.createElement("details");
      details.className = "md-elevated-card";

      const summary = document.createElement("summary");
      summary.textContent = section.heading || `Section ${index + 1}`;
      details.appendChild(summary);

      const list = document.createElement("ul");
      list.className = "slide-copy";
      ensureArray(section.bullets).forEach((bullet) => {
        const li = document.createElement("li");
        li.textContent = bullet;
        list.appendChild(li);
      });
      details.appendChild(list);

      details.addEventListener("toggle", () => {
        if (!details.open) return;
        viewedIds.add(section.heading || `section-${index + 1}`);
        ctx.saveResponse(slide.id, viewedKey, [...viewedIds]);
      });

      wrap.appendChild(details);
    });

    card.appendChild(wrap);
  }

  function validate() {
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
