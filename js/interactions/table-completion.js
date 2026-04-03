(() => {
  const TYPE = "table-completion";

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "table-completion-renderer";

    const intro = document.createElement("p");
    intro.className = "slide-copy";
    intro.textContent = slide.instructions || "Complete each blank cell in the table.";
    wrap.appendChild(intro);

    const table = document.createElement("table");
    table.className = "slide-copy";

    const saved = ctx.getResponse(slide.id, slide.responseKey, {});
    const header = document.createElement("tr");
    (slide.columns || []).forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      header.appendChild(th);
    });
    table.appendChild(header);

    (slide.rows || []).forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach((cell, colIndex) => {
        const td = document.createElement("td");
        if (cell && typeof cell === "object" && cell.inputKey) {
          const input = document.createElement("input");
          input.type = "text";
          input.value = saved[cell.inputKey] || "";
          input.setAttribute("aria-label", `Row ${rowIndex + 1}, column ${colIndex + 1}`);
          input.addEventListener("input", () => {
            saved[cell.inputKey] = input.value;
            ctx.saveResponse(slide.id, slide.responseKey, saved);
            ctx.setFeedback("In progress", "Fill all table cells to unlock progression.", false);
          });
          td.appendChild(input);
        } else {
          td.textContent = String(cell ?? "");
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    wrap.appendChild(table);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const saved = ctx.getResponse(slide.id, slide.responseKey, {});
    const keys = (slide.rows || []).flatMap((row) =>
      row
        .filter((cell) => cell && typeof cell === "object" && cell.inputKey)
        .map((cell) => cell.inputKey)
    );
    const allDone = keys.every((key) => (saved[key] || "").trim().length > 0);
    if (!allDone) {
      return { valid: false, message: "Please complete every table cell before moving on." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
