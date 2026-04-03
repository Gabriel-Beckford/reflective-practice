(() => {
  const TYPE = "matrix";

  function toRecord(value) {
    return value && typeof value === "object" ? { ...value } : {};
  }

  function evaluate(slide, answers) {
    const rows = slide.rows || [];
    const expected = slide.expectedAnswers || {};
    const answeredCount = rows.reduce((count, row) => (answers[row.id] ? count + 1 : count), 0);
    const correctCount = rows.reduce((count, row) => (expected[row.id] && answers[row.id] === expected[row.id] ? count + 1 : count), 0);
    const complete = answeredCount === rows.length;
    const allCorrect = complete && correctCount === rows.length;
    return { answeredCount, correctCount, total: rows.length, complete, allCorrect };
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "matrix-renderer";

    if (slide.question) {
      const q = document.createElement("p");
      q.className = "slide-copy";
      q.textContent = `Question: ${slide.question}`;
      wrap.appendChild(q);
    }

    const answers = toRecord(ctx.getResponse(slide.id, slide.responseKey, {}));
    const options = slide.columns || ["Yes", "No"];

    (slide.rows || []).forEach((row, rowIndex) => {
      const group = document.createElement("div");
      group.className = "input-wrap";

      const label = document.createElement("p");
      label.className = "slide-copy";
      label.textContent = row.label;
      group.appendChild(label);

      const rowChoices = document.createElement("div");
      rowChoices.className = "choice-list";

      options.forEach((option) => {
        const optionId = `${slide.id}-${row.id}-${option}`;
        const item = document.createElement("label");
        item.className = "choice-item";
        item.setAttribute("for", optionId);

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `${slide.id}-${row.id}`;
        input.id = optionId;
        input.className = "choice-input";
        input.checked = answers[row.id] === option;

        const marker = document.createElement("span");
        marker.className = "choice-marker";
        const text = document.createElement("span");
        text.className = "choice-text";
        text.textContent = option;

        input.addEventListener("change", () => {
          answers[row.id] = option;
          ctx.saveResponse(slide.id, slide.responseKey, answers);
          const result = evaluate(slide, answers);
          const title = result.complete ? "Matrix complete" : "Matrix in progress";
          const body = result.complete
            ? `Score ${result.correctCount}/${result.total}. ${result.allCorrect ? (slide.feedbackSuccess || "Excellent choices.") : (slide.feedbackNeedsWork || "Re-check the rows and adjust as needed.")}`
            : `Answered ${result.answeredCount}/${result.total} row(s).`;
          ctx.setFeedback(title, body, result.complete && !result.allCorrect);
        });

        item.append(input, marker, text);
        rowChoices.appendChild(item);
      });

      group.appendChild(rowChoices);
      wrap.appendChild(group);
    });

    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const answers = toRecord(ctx.getResponse(slide.id, slide.responseKey, {}));
    const missing = (slide.rows || []).some((row) => !answers[row.id]);
    if (missing) return { valid: false, message: "Please answer every matrix row before moving on." };
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
