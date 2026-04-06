(() => {
  const TYPE = "pond-game";
  const PHASES = [
    {
      key: "CE",
      label: "Concrete Experience",
      prompt: "Briefly describe one concrete classroom moment (what happened, who was involved)."
    },
    {
      key: "RO",
      label: "Reflective Observation",
      prompt: "What did you notice and feel in that moment?"
    },
    {
      key: "AC",
      label: "Abstract Conceptualisation",
      prompt: "Which idea, framework, or pattern helps explain why it happened?"
    },
    {
      key: "AE",
      label: "Active Experimentation",
      prompt: "What specific step will you test next time?"
    }
  ];

  function getState(slide, ctx) {
    const initial = {
      phaseIndex: 0,
      answers: {},
      systemPromptLoaded: false,
      systemPromptSnippet: ""
    };
    const saved = ctx.getResponse(slide.id, slide.responseKey, initial) || initial;
    return {
      ...initial,
      ...saved,
      answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {}
    };
  }

  function saveState(slide, ctx, state) {
    ctx.saveResponse(slide.id, slide.responseKey, state);
    if (typeof ctx.saveSharedResponse === "function") {
      ctx.saveSharedResponse("pondPhaseProgress", {
        phaseIndex: state.phaseIndex,
        completed: Math.min(state.phaseIndex, PHASES.length),
        total: PHASES.length
      });
      ctx.saveSharedResponse("pondPhaseAnswers", state.answers);
    }
  }

  function renderPhaseChips(activeIndex) {
    const row = document.createElement("div");
    row.className = "pond-phase-row";
    PHASES.forEach((phase, index) => {
      const chip = document.createElement("span");
      const cls = index < activeIndex ? "done" : index === activeIndex ? "active" : "";
      chip.className = `phase-chip pond-phase-chip ${cls}`.trim();
      chip.textContent = phase.key;
      chip.title = phase.label;
      row.appendChild(chip);
    });
    return row;
  }

  function startPondAnimation(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    const dpr = window.devicePixelRatio || 1;
    const reduceMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fish = Array.from({ length: 5 }, (_, i) => ({
      x: (i + 1) * 90,
      y: 40 + (i % 3) * 38,
      vx: 0.35 + Math.random() * 0.6,
      vy: (Math.random() - 0.5) * 0.18,
      size: 8 + Math.random() * 6,
      hue: 18 + Math.random() * 30
    }));

    const lilies = Array.from({ length: 4 }, (_, i) => ({
      x: 80 + i * 120,
      y: 50 + (i % 2) * 90,
      r: 14 + Math.random() * 7,
      phase: Math.random() * Math.PI * 2
    }));

    const ripples = [];
    let raf = null;

    function resize() {
      const width = canvas.clientWidth || 520;
      const height = canvas.clientHeight || 220;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame(t) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const water = ctx.createLinearGradient(0, 0, 0, h);
      water.addColorStop(0, "#d8f3ff");
      water.addColorStop(1, "#9cc9df");
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);

      lilies.forEach((lily) => {
        const bob = reduceMotion ? 0 : Math.sin(t * 0.0014 + lily.phase) * 2.2;
        ctx.fillStyle = "rgba(68, 153, 93, 0.92)";
        ctx.beginPath();
        ctx.arc(lily.x, lily.y + bob, lily.r, 0.4, Math.PI * 2 - 0.4);
        ctx.lineTo(lily.x, lily.y + bob);
        ctx.closePath();
        ctx.fill();
      });

      if (!reduceMotion) {
        fish.forEach((f) => {
          f.x += f.vx;
          f.y += f.vy;
          if (f.x > w + f.size) f.x = -f.size;
          if (f.y < 22 || f.y > h - 18) f.vy *= -1;

          if (Math.random() < 0.02) {
            ripples.push({ x: f.x, y: f.y, r: 2, alpha: 0.35 });
          }

          ctx.fillStyle = `hsl(${f.hue} 75% 55%)`;
          ctx.beginPath();
          ctx.ellipse(f.x, f.y, f.size, f.size * 0.56, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(f.x - f.size * 0.9, f.y);
          ctx.lineTo(f.x - f.size * 1.7, f.y - f.size * 0.65);
          ctx.lineTo(f.x - f.size * 1.7, f.y + f.size * 0.65);
          ctx.closePath();
          ctx.fill();
        });

        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const ripple = ripples[i];
          ripple.r += 0.6;
          ripple.alpha -= 0.01;
          ctx.strokeStyle = `rgba(255,255,255,${Math.max(ripple.alpha, 0)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
          ctx.stroke();
          if (ripple.alpha <= 0) ripples.splice(i, 1);
        }
      } else {
        fish.forEach((f) => {
          ctx.fillStyle = `hsl(${f.hue} 72% 58%)`;
          ctx.beginPath();
          ctx.ellipse(f.x, f.y, f.size, f.size * 0.56, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      raf = window.requestAnimationFrame(drawFrame);
    }

    resize();
    drawFrame(0);
    window.addEventListener("resize", resize);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  async function loadSystemPrompt(slide, ctx, state, statusNode) {
    if (state.systemPromptLoaded) return;
    try {
      const response = await fetch("system_prompts/chatbot_system_prompt.xml", { cache: "no-store" });
      if (!response.ok) throw new Error("prompt unavailable");
      const xml = await response.text();
      const snippet = xml.replace(/\s+/g, " ").trim().slice(0, 220);
      const nextState = {
        ...state,
        systemPromptLoaded: true,
        systemPromptSnippet: snippet
      };
      saveState(slide, ctx, nextState);
      statusNode.textContent = "System prompt loaded for inline coaching.";
    } catch (error) {
      statusNode.textContent = "System prompt could not be loaded. You can still continue manually.";
    }
  }

  function render(card, slide, ctx) {
    const state = getState(slide, ctx);
    const wrap = document.createElement("section");
    wrap.className = "pond-game-renderer";

    const canvas = document.createElement("canvas");
    canvas.className = "pond-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Decorative pond with fish, ripples, and floating lily pads.");

    const phaseIndex = Math.min(state.phaseIndex, PHASES.length - 1);
    const phase = PHASES[phaseIndex];

    const phaseRow = renderPhaseChips(state.phaseIndex);
    const prompt = document.createElement("p");
    prompt.className = "slide-copy";
    prompt.textContent = `${phase.key} · ${phase.label}: ${phase.prompt}`;

    const area = document.createElement("textarea");
    area.placeholder = `Add your ${phase.key} reflection...`;
    area.value = state.answers[phase.key] || "";

    const status = document.createElement("p");
    status.className = "slide-copy";
    status.textContent = state.systemPromptLoaded
      ? "System prompt loaded for inline coaching."
      : "Loading chatbot system prompt...";

    const snippet = document.createElement("p");
    snippet.className = "slide-copy pond-prompt-snippet";
    snippet.textContent = state.systemPromptSnippet
      ? `Prompt context: ${state.systemPromptSnippet}...`
      : "";

    const actions = document.createElement("div");
    actions.className = "choice-list";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "submit-btn";
    saveBtn.textContent = "Save phase";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "submit-btn";
    nextBtn.textContent = state.phaseIndex >= PHASES.length - 1 ? "All phases complete" : "Next phase";

    const cleanup = startPondAnimation(canvas);

    saveBtn.addEventListener("click", () => {
      const nextState = {
        ...state,
        answers: { ...state.answers, [phase.key]: area.value.trim() }
      };
      saveState(slide, ctx, nextState);
    });

    nextBtn.addEventListener("click", () => {
      const nextState = {
        ...state,
        answers: { ...state.answers, [phase.key]: area.value.trim() },
        phaseIndex: Math.min(state.phaseIndex + 1, PHASES.length - 1)
      };
      saveState(slide, ctx, nextState);
      cleanup();
      card.innerHTML = "";
      render(card, slide, ctx);
    });

    actions.append(saveBtn, nextBtn);
    wrap.append(canvas, phaseRow, prompt, area, actions, status, snippet);
    card.appendChild(wrap);

    loadSystemPrompt(slide, ctx, state, status);
  }

  function validate(slide, ctx) {
    const state = getState(slide, ctx);
    const completedAny = Object.values(state.answers || {}).some((value) => String(value || "").trim().length > 0);
    if (!completedAny) {
      return { valid: false, message: "Please add at least one phase response before continuing." };
    }
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
