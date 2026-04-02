const SYSTEM_PROMPT = `You are a reflective coach for Section 1 warm-up. Ask exactly one concise warm-up question per turn. Keep each turn under 45 words and supportive.`;

function enforceSingleQuestion(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return "What feels most present for you right now?";
  }

  const chunks = trimmed.split("?");
  const firstQuestion = chunks[0].trim();
  return firstQuestion ? `${firstQuestion}?` : "What feels most present for you right now?";
}

export function createSection1WarmupController({ callModel, onPersist }) {
  const state = {
    started: false,
    complete: false,
    minLearnerTurns: 2,
    transcript: []
  };

  function persist() {
    onPersist({
      transcript: state.transcript,
      completed: state.complete
    });
  }

  async function ensureStarted() {
    if (state.started) {
      return;
    }

    state.started = true;
    const ai = await callModel(SYSTEM_PROMPT, "Begin Section 1 with the first warm-up question.", state.transcript);
    state.transcript.push({ role: "assistant", content: enforceSingleQuestion(ai.text) });
    persist();
  }

  async function handleLearnerResponse(text) {
    const response = (text || "").trim();
    if (!response) {
      return { ok: false, message: "Please add your response before sending." };
    }

    await ensureStarted();
    state.transcript.push({ role: "user", content: response });

    const learnerTurns = state.transcript.filter((entry) => entry.role === "user").length;
    if (learnerTurns >= state.minLearnerTurns) {
      state.complete = true;
      state.transcript.push({ role: "assistant", content: "Great grounding work. Continue when you feel ready." });
      persist();
      return { ok: true, completed: true };
    }

    const ai = await callModel(SYSTEM_PROMPT, `Learner response: ${response}`, state.transcript);
    state.transcript.push({ role: "assistant", content: enforceSingleQuestion(ai.text) });
    persist();
    return { ok: true, completed: false };
  }

  return {
    ensureStarted,
    handleLearnerResponse,
    isComplete: () => state.complete,
    getTranscript: () => [...state.transcript]
  };
}
