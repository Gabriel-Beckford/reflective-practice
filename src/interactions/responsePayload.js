export function createResponsePayload({
  slideId,
  interactionType,
  value,
  isValid,
  localFeedback,
  metadata = {},
  event = "input"
}) {
  return {
    schemaVersion: "1.0.0",
    slideId,
    interactionType,
    event,
    value,
    isValid,
    localFeedback,
    metadata,
    updatedAt: new Date().toISOString()
  };
}

export function getResponseValue(response) {
  if (!response || typeof response !== "object") {
    return response;
  }

  if (Object.prototype.hasOwnProperty.call(response, "value")) {
    return response.value;
  }

  return response;
}
