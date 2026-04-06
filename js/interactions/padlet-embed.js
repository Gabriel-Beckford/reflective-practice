(() => {
  const TYPE = "padlet-embed";

  function render(card, slide, ctx) {
    const wrap = document.createElement("section");
    wrap.className = "padlet-embed-renderer";

    const iframe = document.createElement("iframe");
    iframe.title = slide.title || "Padlet embed";
    iframe.src = slide.padletUrl || "about:blank";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.style.width = "100%";
    iframe.style.minHeight = "320px";
    iframe.className = "md-elevated-card";

    const warning = document.createElement("p");
    warning.className = "slide-copy";
    warning.textContent = "If the Padlet wall does not load, use Copy text and post directly later.";

    const input = document.createElement("textarea");
    const sourceTextKey = slide.padletShareTextKey || `${slide.responseKey}__shareText`;
    input.placeholder = "Write your one-sentence summary here.";
    input.value = ctx.getResponse(slide.id, sourceTextKey, "");
    input.addEventListener("input", () => {
      ctx.saveResponse(slide.id, sourceTextKey, input.value);
    });

    const copyStatusKey = `${sourceTextKey}__copyStatus`;
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "submit-btn";
    copyBtn.textContent = "Copy text";

    const copyStatus = document.createElement("p");
    copyStatus.className = "slide-copy";
    copyStatus.textContent = ctx.getResponse(slide.id, copyStatusKey, "");

    copyBtn.addEventListener("click", async () => {
      const learnerInput = (input.value || "").trim();
      const template = slide.copyTextTemplate || "{{learnerInput}}";
      const textToCopy = template.replace("{{learnerInput}}", learnerInput || "(No summary entered yet)");
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyStatus.textContent = "Copied to clipboard. Paste into Padlet when ready.";
      } catch (error) {
        copyStatus.textContent = slide.fallbackCopyText || "Copy unavailable in this browser. Select the text manually.";
      }
      ctx.saveResponse(slide.id, slide.responseKey, textToCopy);
      ctx.saveResponse(slide.id, copyStatusKey, copyStatus.textContent);
    });

    wrap.append(iframe, warning, input, copyBtn, copyStatus);
    card.appendChild(wrap);
  }

  function validate() {
    return { valid: true };
  }

  window.DeckInteractionModules = window.DeckInteractionModules || {};
  window.DeckInteractionModules[TYPE] = { render, validate };
})();
