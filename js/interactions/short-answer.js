(() => {
  const TYPE = "short-answer";

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "short-answer-renderer";

    const q = document.createElement("p");
    q.className = "slide-copy";
    q.textContent = slide.question || slide.prompt || "Answer briefly:";

    const input = document.createElement("input");
    input.type = "text";
    input.value = ctx.getResponse(slide.id, slide.responseKey, "");
    input.setAttribute("aria-label", slide.prompt || "Short answer input");
    input.addEventListener("input", () => {
      ctx.saveResponse(slide.id, slide.responseKey, input.value);
      const minWords = slide.minWords || 3;
      const words = input.value.trim().split(/\s+/).filter(Boolean).length;
      const done = words >= minWords;
      ctx.setFeedback(
        done ? "Response captured" : "Keep writing",
        done
          ? slide.feedbackSuccess || "Great. You can continue when ready."
          : `Add at least ${minWords} words for a complete response.`,
        !done
      );
    });

    wrap.append(q, input);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const minWords = slide.minWords || 3;
    const value = (ctx.getResponse(slide.id, slide.responseKey, "") || "").trim();
    const words = value.split(/\s+/).filter(Boolean).length;
    if (words < minWords) {
      return { valid: false, message: `Please enter at least ${minWords} words before moving on.` };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
