(() => {
  const TYPE = "gapfill";

  function normalise(saved) {
    return Array.isArray(saved) ? [...saved] : [];
  }

  function score(slide, answers) {
    const expected = slide.gaps || [];
    let correct = 0;
    expected.forEach((gap, index) => {
      const actual = (answers[index] || "").trim().toLowerCase();
      const accepted = (gap.accepted || [gap.answer]).map((item) => String(item).trim().toLowerCase());
      if (accepted.includes(actual)) correct += 1;
    });
    return { correct, total: expected.length, allCorrect: correct === expected.length };
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "gapfill-renderer";
    const saved = normalise(ctx.getResponse(slide.id, slide.responseKey, []));

    const prompt = document.createElement("p");
    prompt.className = "slide-copy";
    prompt.textContent = slide.instructions || "Fill each blank.";
    wrap.appendChild(prompt);

    const line = document.createElement("div");
    line.className = "slide-copy";

    (slide.segments || []).forEach((segment, index) => {
      line.append(document.createTextNode(segment));
      if (index < (slide.gaps || []).length) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = saved[index] || "";
        input.setAttribute("aria-label", `Gap ${index + 1}`);
        input.addEventListener("input", () => {
          saved[index] = input.value;
          ctx.saveResponse(slide.id, slide.responseKey, saved);
          const result = score(slide, saved);
          ctx.setFeedback("Gapfill progress", `Correct so far: ${result.correct}/${result.total}.`, false);
        });
        line.appendChild(input);
      }
    });

    wrap.appendChild(line);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const answers = normalise(ctx.getResponse(slide.id, slide.responseKey, []));
    if (answers.some((entry) => !String(entry || "").trim())) {
      return { valid: false, message: "Please complete every gap before moving on." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
