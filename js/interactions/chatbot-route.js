(() => {
  const TYPE = "chatbot-route";

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "text-renderer chatbot-route-renderer";

    const bodyLines = Array.isArray(slide.body) ? slide.body : [];
    bodyLines.forEach((line) => {
      const p = document.createElement("p");
      p.className = "slide-copy";
      p.textContent = line;
      wrap.appendChild(p);
    });

    const list = document.createElement("div");
    list.className = "choice-list";
    const selected = ctx.getResponse(slide.id, slide.responseKey, "");

    (slide.options || []).forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-item";
      if (selected === option.id) btn.classList.add("selected");
      btn.innerHTML = `<strong>${option.label}</strong><small>${option.description || ""}</small>`;
      btn.addEventListener("click", () => {
        ctx.saveResponse(slide.id, slide.responseKey, option.id);
        if (option.targetSlideId) {
          ctx.saveResponse(slide.id, `${slide.responseKey}__target`, option.targetSlideId);
        }
        card.innerHTML = "";
        render(card, slide, ctx);
      });
      list.appendChild(btn);
    });

    wrap.appendChild(list);

    const selectedOption = (slide.options || []).find((opt) => opt.id === selected);
    if (selectedOption?.id === "chatbot") {
      const openBtn = document.createElement("a");
      openBtn.className = "cta-btn";
      openBtn.href = "chatbot.html";
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.textContent = "Open chatbot in new tab";
      wrap.appendChild(openBtn);
    }
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const choice = ctx.getResponse(slide.id, slide.responseKey, "");
    if (!choice) return { valid: false, message: "Please choose whether to open the chatbot or skip." };
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
