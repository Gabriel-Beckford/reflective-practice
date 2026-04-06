(() => {
  const TYPE = "drag-drop";

  function normaliseMap(value) {
    return value && typeof value === "object" ? { ...value } : {};
  }

  function getPriorReflection(slide, ctx) {
    const prior = slide.priorReflection || {};
    const sharedKey = prior.sharedKey || "criticalIncidentText";
    const shared = typeof ctx.getSharedResponse === "function" ? ctx.getSharedResponse(sharedKey, "") : "";
    if (shared && String(shared).trim()) return String(shared).trim();

    const from02_2 = ctx.getResponse("02.2", "theory_critical_incident", "");
    if (from02_2 && String(from02_2).trim()) return String(from02_2).trim();
    return prior.fallback || "No prior reflection available yet.";
  }

  function score(slide, placements) {
    const pairs = slide.pairs || [];
    const expectedByTargetId = Object.fromEntries(pairs.map((pair) => [pair.targetId, pair.id]));
    const targetIds = Object.keys(expectedByTargetId);
    const placedIds = Object.keys(placements);
    const correct = targetIds.filter((targetId) => placements[targetId] === expectedByTargetId[targetId]).length;
    const complete = placedIds.length === targetIds.length;
    const allCorrect = complete && correct === targetIds.length;
    return { correct, total: targetIds.length, complete, allCorrect };
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "drag-drop-renderer";

    const instructions = document.createElement("p");
    instructions.className = "slide-copy";
    instructions.textContent = slide.instructions || "Match each item to the best drop zone.";
    wrap.appendChild(instructions);

    const placements = normaliseMap(ctx.getResponse(slide.id, slide.responseKey, {}));
    let activeDragId = null;
    const pairs = slide.pairs || [];
    const showTargetLabels = slide.showTargetLabels !== false;

    const layout = document.createElement("div");
    layout.className = "drag-drop-layout";

    if (slide.priorReflection) {
      const priorPanel = document.createElement("article");
      priorPanel.className = "md-elevated-card prior-reflection-panel";

      const heading = document.createElement("h3");
      heading.className = "paired-panel-title";
      heading.textContent = slide.priorReflection.title || "Prior reflection";

      const body = document.createElement("p");
      body.className = "slide-copy";
      body.textContent = getPriorReflection(slide, ctx);

      priorPanel.append(heading, body);
      layout.appendChild(priorPanel);
    }

    const board = document.createElement("div");
    board.className = "drag-drop-board";

    const tray = document.createElement("div");
    tray.className = "choice-list";
    tray.setAttribute("role", "list");
    tray.setAttribute("aria-label", "Draggable items");

    const zones = document.createElement("div");
    zones.className = "drag-drop-zones";

    function markIncompleteZones() {
      zones.querySelectorAll("[data-target-id]").forEach((zone) => {
        const id = zone.dataset.targetId;
        zone.classList.toggle("incomplete", !placements[id]);
      });
    }

    function saveAndFeedback() {
      ctx.saveResponse(slide.id, slide.responseKey, placements);
      markIncompleteZones();
      const result = score(slide, placements);
      if (!result.complete) {
        ctx.setFeedback("Keep going", `Matched ${result.correct}/${result.total}. Place every card to continue.`, true);
        return;
      }
      if (result.allCorrect) {
        ctx.setFeedback("Great match", `All ${result.total} matches are correct. ${slide.feedbackSuccess || ""}`.trim(), false);
      } else {
        ctx.setFeedback(
          "Try one more pass",
          `Matched ${result.correct}/${result.total} correctly. ${slide.feedbackNeedsWork || "Review labels and adjust any mismatches."}`,
          true
        );
      }
    }

    function unassign(draggableId) {
      Object.keys(placements).forEach((key) => {
        if (placements[key] === draggableId) delete placements[key];
      });
    }

    function assign(draggableId, targetId) {
      unassign(draggableId);
      const previousId = placements[targetId];
      if (previousId) {
        const oldItem = tray.querySelector(`[data-draggable-id="${previousId}"]`);
        if (oldItem) tray.appendChild(oldItem);
      }
      placements[targetId] = draggableId;
      const item = tray.querySelector(`[data-draggable-id="${draggableId}"]`) || zones.querySelector(`[data-draggable-id="${draggableId}"]`);
      const target = zones.querySelector(`[data-target-id="${targetId}"] .drop-zone-slot`);
      if (item && target) target.appendChild(item);
      saveAndFeedback();
    }

    function createDraggable(item) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-item";
      btn.dataset.draggableId = item.id;
      btn.setAttribute("draggable", "true");
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-grabbed", "false");
      btn.textContent = item.label;

      btn.addEventListener("dragstart", (event) => {
        activeDragId = item.id;
        btn.setAttribute("aria-grabbed", "true");
        event.dataTransfer?.setData("text/plain", item.id);
      });

      btn.addEventListener("dragend", () => {
        activeDragId = null;
        btn.setAttribute("aria-grabbed", "false");
      });

      btn.addEventListener("click", () => {
        activeDragId = activeDragId === item.id ? null : item.id;
        board.querySelectorAll("[data-draggable-id]").forEach((node) => node.classList.remove("selected"));
        if (activeDragId) btn.classList.add("selected");
      });

      return btn;
    }

    function createZone(target, index) {
      const block = document.createElement("div");
      block.className = "input-wrap drag-drop-zone";
      block.dataset.targetId = target.id;

      if (showTargetLabels) {
        const label = document.createElement("p");
        label.className = "slide-copy";
        label.textContent = target.label || `Target ${index + 1}`;
        block.appendChild(label);
      } else {
        const hiddenLabel = document.createElement("p");
        hiddenLabel.className = "sr-only";
        hiddenLabel.textContent = target.label || `Drop zone ${index + 1}`;
        block.appendChild(hiddenLabel);
      }

      const slot = document.createElement("div");
      slot.className = "choice-list drop-zone-slot";
      slot.setAttribute("role", "button");
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("aria-label", showTargetLabels ? `Drop zone for ${target.label || `target ${index + 1}`}` : `Unlabelled drop zone ${index + 1}`);

      const place = (id) => {
        if (!id) return;
        assign(id, target.id);
      };

      slot.addEventListener("dragover", (event) => event.preventDefault());
      slot.addEventListener("drop", (event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer?.getData("text/plain") || activeDragId;
        place(draggedId);
      });
      slot.addEventListener("click", () => place(activeDragId));
      slot.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        place(activeDragId);
      });

      block.appendChild(slot);
      return block;
    }

    (slide.items || []).forEach((item) => tray.appendChild(createDraggable(item)));
    (slide.targets || []).forEach((target, index) => zones.appendChild(createZone(target, index)));

    Object.entries(placements).forEach(([targetId, draggableId]) => assign(draggableId, targetId));

    board.append(tray, zones);
    layout.appendChild(board);
    wrap.appendChild(layout);
    card.appendChild(wrap);
    saveAndFeedback();
  }

  function validate(slide, ctx) {
    const placements = normaliseMap(ctx.getResponse(slide.id, slide.responseKey, {}));
    const expected = slide.targets?.length || 0;
    if (Object.keys(placements).length < expected) {
      return { valid: false, message: "Please complete all drag-and-drop matches before moving on." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
