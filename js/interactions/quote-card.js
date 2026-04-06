(() => {
  const TYPE = "quote-card";

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "quote-card-renderer md-elevated-card";
    if (slide.backgroundImage) {
      wrap.style.backgroundImage = `linear-gradient(135deg, rgba(12, 20, 26, 0.72), rgba(12, 20, 26, 0.48)), url(${slide.backgroundImage})`;
      wrap.style.backgroundSize = "cover";
      wrap.style.backgroundPosition = "center";
      wrap.style.color = "#fff";
    }

    const quote = document.createElement("blockquote");
    quote.className = "slide-copy";
    quote.textContent = slide.quote || "Quote unavailable.";

    const source = document.createElement("p");
    source.className = "slide-copy";
    source.innerHTML = `<strong>${slide.quoteSource || "Source not provided"}</strong>`;

    const label = document.createElement("label");
    label.className = "slide-copy";
    label.textContent = slide.prompt || "What stands out to you?";

    const note = document.createElement("textarea");
    note.value = ctx.getResponse(slide.id, slide.responseKey, "");
    note.addEventListener("input", () => {
      ctx.saveResponse(slide.id, slide.responseKey, note.value);
    });

    wrap.append(quote, source, label, note);
    card.appendChild(wrap);
  }

  function validate() {
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
