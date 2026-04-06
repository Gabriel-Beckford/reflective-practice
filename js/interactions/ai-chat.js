(() => {
  const TYPE = "ai-chat";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function canUseAi(ctx) {
    if (typeof ctx.isApiConnected === "function") return ctx.isApiConnected();
    return false;
  }

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "ai-chat-renderer";

    const input = document.createElement("textarea");
    input.placeholder = slide.placeholder || "Type your response...";
    input.value = ctx.getResponse(slide.id, slide.responseKey, "");
    input.addEventListener("input", () => {
      ctx.saveResponse(slide.id, slide.responseKey, input.value);
    });

    const buttonRow = document.createElement("div");
    buttonRow.className = "choice-list";

    const status = document.createElement("p");
    status.className = "slide-copy";

    const promptDefs = ensureArray(slide.aiPrompts);
    promptDefs.forEach((promptDef, index) => {
      const promptId = promptDef.id || `prompt-${index + 1}`;
      const outputKey = `${slide.responseKey}__${promptId}__output`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "submit-btn";
      btn.textContent = promptDef.label || `Prompt ${index + 1}`;

      const reply = document.createElement("p");
      reply.className = "slide-copy";
      reply.textContent = ctx.getResponse(slide.id, outputKey, "");

      btn.addEventListener("click", async () => {
        const learnerInput = (input.value || "").trim();
        if (!learnerInput) {
          reply.textContent = "Please add your reflection text first.";
          ctx.saveResponse(slide.id, outputKey, reply.textContent);
          return;
        }

        if (!canUseAi(ctx)) {
          reply.textContent = promptDef.fallbackText || "AI is currently unavailable. Continue with your own reflection notes.";
          ctx.saveResponse(slide.id, outputKey, reply.textContent);
          return;
        }

        status.textContent = "thinking...";
        const payloadPrompt = (promptDef.promptTemplate || "{{learnerInput}}")
          .replace("{{learnerInput}}", learnerInput);

        try {
          const aiReply = await ctx.requestAiReply(payloadPrompt);
          reply.textContent = aiReply || promptDef.fallbackText || "No AI response received. Continue your reflection manually.";
        } catch (error) {
          reply.textContent = promptDef.fallbackText || "AI service unavailable right now. Continue with your own reflective response.";
        } finally {
          status.textContent = "";
          ctx.saveResponse(slide.id, outputKey, reply.textContent);
        }
      });

      buttonRow.appendChild(btn);
      wrap.append(reply);
    });

    wrap.prepend(input);
    wrap.append(buttonRow, status);
    card.appendChild(wrap);
  }

  function validate(slide, ctx) {
    const value = (ctx.getResponse(slide.id, slide.responseKey, "") || "").trim();
    if (!value) return { valid: false, message: "Please enter your reflection before continuing." };
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
