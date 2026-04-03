(() => {
  const TYPE = "pelmanism";

  function getState(slide, ctx) {
    const fallback = { matchedIds: [], moves: 0 };
    const saved = ctx.getResponse(slide.id, slide.responseKey, fallback);
    return {
      matchedIds: Array.isArray(saved?.matchedIds) ? saved.matchedIds : [],
      moves: Number.isInteger(saved?.moves) ? saved.moves : 0
    };
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "pelmanism-renderer";

    const lead = document.createElement("p");
    lead.className = "slide-copy";
    lead.textContent = slide.instructions || "Find matching pairs.";

    const status = document.createElement("p");
    status.className = "slide-copy";
    status.setAttribute("aria-live", "polite");

    const grid = document.createElement("div");
    grid.className = "choice-list";
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-label", "Memory matching cards");

    const gameState = getState(slide, ctx);
    const openCards = [];
    const cardsById = new Map();

    function save() {
      ctx.saveResponse(slide.id, slide.responseKey, { matchedIds: gameState.matchedIds, moves: gameState.moves });
    }

    function updateStatus() {
      const done = gameState.matchedIds.length === (slide.cards || []).length;
      status.textContent = done
        ? `Complete in ${gameState.moves} moves. ${slide.feedbackSuccess || "Great concentration."}`
        : `Matched ${gameState.matchedIds.length / 2} pair(s). Moves: ${gameState.moves}.`;
      ctx.setFeedback(
        done ? "Well done" : "Keep matching",
        done ? status.textContent : slide.feedbackNeedsWork || "Keep flipping cards to complete all pairs.",
        false
      );
    }

    function isMatched(card) {
      return gameState.matchedIds.includes(card.id);
    }

    function paintCard(card, button, isFaceUp) {
      const matched = isMatched(card);
      button.classList.toggle("correct", matched);
      button.classList.toggle("selected", isFaceUp && !matched);
      button.setAttribute("aria-pressed", String(isFaceUp || matched));
      button.textContent = isFaceUp || matched ? card.label : slide.cardBackLabel || "Reveal";
      button.disabled = matched;
    }

    function closeUnmatched() {
      while (openCards.length) {
        const { card } = openCards.pop();
        const btn = cardsById.get(card.id);
        if (btn) paintCard(card, btn, false);
      }
    }

    function onFlip(card) {
      if (isMatched(card)) return;
      const current = cardsById.get(card.id);
      if (!current) return;
      if (openCards.some((entry) => entry.card.id === card.id)) return;

      if (openCards.length === 2) closeUnmatched();

      paintCard(card, current, true);
      openCards.push({ card });

      if (openCards.length === 2) {
        gameState.moves += 1;
        const [a, b] = openCards;
        if (a.card.pairId === b.card.pairId) {
          gameState.matchedIds.push(a.card.id, b.card.id);
          openCards.length = 0;
        }
        save();
        updateStatus();
      }
    }

    (slide.cards || []).forEach((cardItem) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-item";
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", "Memory card");
      btn.addEventListener("click", () => onFlip(cardItem));
      btn.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onFlip(cardItem);
      });
      cardsById.set(cardItem.id, btn);
      paintCard(cardItem, btn, false);
      grid.appendChild(btn);
    });

    updateStatus();
    wrap.append(lead, status, grid);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const game = getState(slide, ctx);
    if (game.matchedIds.length !== (slide.cards || []).length) {
      return { valid: false, message: "Please complete all card matches before moving on." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
