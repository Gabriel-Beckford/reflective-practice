import { createResponsePayload, getResponseValue } from "./responsePayload.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeDescriptorOptions(options = []) {
  return options.map((label) => ({ key: label, label }));
}

export function validateInteraction(slide, response) {
  const value = getResponseValue(response);

  if (slide.required?.type === "minLength") {
    const text = String(value ?? "").trim();
    const valid = text.length >= slide.required.value;
    return { valid, message: valid ? "" : slide.required.message };
  }

  if (slide.required?.type === "minSelections") {
    const count = Array.isArray(value)
      ? value.length
      : value && typeof value === "object"
        ? Object.values(value).filter((entry) => entry === true).length
        : 0;
    const valid = count >= slide.required.value;
    return { valid, message: valid ? "" : slide.required.message };
  }

  if (slide.required?.type === "allMatched") {
    const requiredCount = slide.interactionConfig?.pairs?.length || 0;
    const currentCount = value?.matches ? Object.keys(value.matches).length : 0;
    const valid = currentCount === requiredCount;
    return { valid, message: valid ? "" : slide.required.message };
  }

  return { valid: true, message: "" };
}

export function createFeedbackPlaceholder(slide, validation) {
  if (!validation.valid) {
    return validation.message;
  }

  return `Saved locally. AI feedback for ${slide.title} is pending...`;
}

function createPayload(slide, value, metadata = {}, event = "input") {
  const validation = validateInteraction(slide, { value });
  return createResponsePayload({
    slideId: slide.id,
    interactionType: slide.interactionType,
    value,
    isValid: validation.valid,
    localFeedback: createFeedbackPlaceholder(slide, validation),
    metadata,
    event
  });
}

export function renderInteraction(slide, response) {
  const currentValue = getResponseValue(response);
  const validation = validateInteraction(slide, response);
  const feedback = response?.localFeedback || createFeedbackPlaceholder(slide, validation);
  const statusId = `interaction-status-${slide.id}`;

  if (slide.interactionType === "singleSelectMcq") {
    const choices = slide.interactionConfig?.options || [];
    return `
      <fieldset class="interaction-group" aria-describedby="${statusId}">
        <legend>${escapeHtml(slide.interactionConfig?.prompt || "Choose one option")}</legend>
        ${choices
          .map(
            (option, index) => `
              <label class="option-row">
                <input type="radio" name="response-input-${slide.id}" value="${escapeHtml(option.value)}" ${currentValue === option.value ? "checked" : ""} data-option-index="${index}" />
                <span>${escapeHtml(option.label)}</span>
              </label>
            `
          )
          .join("")}
      </fieldset>
      <p id="${statusId}" class="validation-message" role="status" aria-live="polite">${escapeHtml(feedback)}</p>
    `;
  }

  if (slide.interactionType === "multiSelectMcq") {
    const values = Array.isArray(currentValue) ? currentValue : [];
    const choices = slide.interactionConfig?.options || [];
    return `
      <fieldset class="interaction-group" aria-describedby="${statusId}">
        <legend>${escapeHtml(slide.interactionConfig?.prompt || "Choose all that apply")}</legend>
        ${choices
          .map(
            (option, index) => `
              <label class="option-row">
                <input type="checkbox" name="response-input-${slide.id}" value="${escapeHtml(option.value)}" ${values.includes(option.value) ? "checked" : ""} data-option-index="${index}" />
                <span>${escapeHtml(option.label)}</span>
              </label>
            `
          )
          .join("")}
      </fieldset>
      <p id="${statusId}" class="validation-message" role="status" aria-live="polite">${escapeHtml(feedback)}</p>
    `;
  }

  if (slide.interactionType === "descriptorToggles") {
    const descriptors = normalizeDescriptorOptions(slide.interactionConfig?.descriptors || []);
    const selected = currentValue && typeof currentValue === "object" ? currentValue : {};
    return `
      <div class="interaction-group descriptor-group" role="group" aria-describedby="${statusId}">
        <p>${escapeHtml(slide.interactionConfig?.prompt || "Toggle each descriptor")}</p>
        ${descriptors
          .map((descriptor) => {
            const state = selected[descriptor.key] === true;
            return `
              <button
                type="button"
                class="descriptor-chip ${state ? "is-active" : ""}"
                data-descriptor-key="${escapeHtml(descriptor.key)}"
                aria-pressed="${state ? "true" : "false"}"
              >
                ${escapeHtml(descriptor.label)}: ${state ? "Yes" : "No"}
              </button>
            `;
          })
          .join("")}
      </div>
      <p id="${statusId}" class="validation-message" role="status" aria-live="polite">${escapeHtml(feedback)}</p>
    `;
  }

  if (slide.interactionType === "shortAnswer") {
    const textValue = typeof currentValue === "string" ? currentValue : "";
    return `
      <label for="response-input-${slide.id}">${escapeHtml(slide.interactionConfig?.prompt || "Your response")}</label>
      <input
        id="response-input-${slide.id}"
        class="touch-target response-input"
        type="text"
        value="${escapeHtml(textValue)}"
        aria-describedby="${statusId}"
      />
      <p id="${statusId}" class="validation-message" role="status" aria-live="polite">${escapeHtml(feedback)}</p>
    `;
  }

  if (slide.interactionType === "tapToMatch") {
    const value = currentValue && typeof currentValue === "object" ? currentValue : { activeTerm: null, matches: {} };
    const terms = slide.interactionConfig?.pairs || [];

    return `
      <div class="interaction-group match-grid" aria-describedby="${statusId}">
        <p>${escapeHtml(slide.interactionConfig?.prompt || "Match each term to its definition")}</p>
        <div>
          <h3>Terms</h3>
          ${terms
            .map(
              (pair) => `
                <button type="button" class="match-button ${value.activeTerm === pair.term ? "is-active" : ""}" data-match-term="${escapeHtml(pair.term)}" aria-pressed="${value.activeTerm === pair.term ? "true" : "false"}">
                  ${escapeHtml(pair.term)}
                </button>
              `
            )
            .join("")}
        </div>
        <div>
          <h3>Definitions</h3>
          ${terms
            .map(
              (pair) => `
                <button type="button" class="match-button" data-match-definition="${escapeHtml(pair.definition)}">
                  ${escapeHtml(pair.definition)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
      <ul class="match-list">
        ${Object.entries(value.matches || {})
          .map(([term, definition]) => `<li><strong>${escapeHtml(term)}</strong> → ${escapeHtml(definition)}</li>`)
          .join("")}
      </ul>
      <p id="${statusId}" class="validation-message" role="status" aria-live="polite">${escapeHtml(feedback)}</p>
    `;
  }

  return "";
}

function setStatus(slide, payload) {
  const node = document.getElementById(`interaction-status-${slide.id}`);
  if (node) {
    node.textContent = payload.localFeedback;
  }
}

export function bindInteraction(slide, response, onChange) {
  if (slide.interactionType === "singleSelectMcq") {
    document.querySelectorAll(`input[name="response-input-${slide.id}"]`).forEach((radio) => {
      radio.addEventListener("change", (event) => {
        const payload = createPayload(slide, event.target.value, { selectedIndex: Number(event.target.dataset.optionIndex) }, "change");
        onChange(payload);
        setStatus(slide, payload);
      });
    });
    return;
  }

  if (slide.interactionType === "multiSelectMcq") {
    document.querySelectorAll(`input[name="response-input-${slide.id}"]`).forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const selectedValues = Array.from(document.querySelectorAll(`input[name="response-input-${slide.id}"]:checked`)).map((node) => node.value);
        const payload = createPayload(slide, selectedValues, { selectionCount: selectedValues.length }, "change");
        onChange(payload);
        setStatus(slide, payload);
      });
    });
    return;
  }

  if (slide.interactionType === "descriptorToggles") {
    const state = getResponseValue(response) && typeof getResponseValue(response) === "object" ? { ...getResponseValue(response) } : {};
    document.querySelectorAll(`[data-descriptor-key]`).forEach((button) => {
      button.addEventListener("click", (event) => {
        const key = event.currentTarget.dataset.descriptorKey;
        state[key] = !(state[key] === true);
        const payload = createPayload(slide, state, { toggledKey: key }, "toggle");
        onChange(payload);
        const nextLabel = `${key}: ${state[key] ? "Yes" : "No"}`;
        event.currentTarget.textContent = nextLabel;
        event.currentTarget.setAttribute("aria-pressed", state[key] ? "true" : "false");
        event.currentTarget.classList.toggle("is-active", state[key]);
        setStatus(slide, payload);
      });
    });
    return;
  }

  if (slide.interactionType === "shortAnswer") {
    const input = document.getElementById(`response-input-${slide.id}`);
    if (input) {
      input.addEventListener("input", (event) => {
        const payload = createPayload(slide, event.target.value, { charCount: event.target.value.length }, "input");
        onChange(payload);
        setStatus(slide, payload);
      });
    }
    return;
  }

  if (slide.interactionType === "tapToMatch") {
    const current = getResponseValue(response) && typeof getResponseValue(response) === "object" ? { ...getResponseValue(response) } : { activeTerm: null, matches: {} };
    current.matches = current.matches || {};

    document.querySelectorAll("[data-match-term]").forEach((button) => {
      button.addEventListener("click", (event) => {
        current.activeTerm = event.currentTarget.dataset.matchTerm;
        const payload = createPayload(slide, current, { activeTerm: current.activeTerm }, "select-term");
        onChange(payload);
        setStatus(slide, payload);
      });
    });

    document.querySelectorAll("[data-match-definition]").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (!current.activeTerm) {
          const payload = createPayload(slide, current, { warning: "term-required" }, "select-definition");
          payload.localFeedback = "Select a term first, then choose a definition.";
          onChange(payload);
          setStatus(slide, payload);
          return;
        }

        const definition = event.currentTarget.dataset.matchDefinition;
        current.matches[current.activeTerm] = definition;
        const payload = createPayload(slide, current, { matchedTerm: current.activeTerm }, "match");
        onChange(payload);
        setStatus(slide, payload);
      });
    });
  }
}
