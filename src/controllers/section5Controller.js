const PHASES = [
  { id: "observe", label: "Observe" },
  { id: "analyze", label: "Analyze" },
  { id: "reframe", label: "Reframe" },
  { id: "commit", label: "Commit" }
];

const SYSTEM_PROMPT = `You are a Section 5 reflection coach. Follow this strict phase order: Observe, Analyze, Reframe, Commit. Ask exactly one question for the current phase, and never skip ahead.`;

function enforceSingleQuestion(text, fallback) {
  const firstPart = (text || "").split("?")[0].trim();
  return firstPart ? `${firstPart}?` : fallback;
}

export function createSection5Controller({ callModel, onPersist }) {
  const state = {
    started: false,
    completed: false,
    activePhaseIndex: 0,
    awaitingLearner: false,
    transcript: [],
    phases: {}
  };

  function persist() {
    onPersist({
      completed: state.completed,
      activePhase: PHASES[state.activePhaseIndex]?.id || null,
      phases: state.phases,
      transcript: state.transcript
    });
  }

  async function askCurrentPhaseQuestion() {
    const phase = PHASES[state.activePhaseIndex];
    if (!phase) {
      return;
    }

    const ai = await callModel(
      SYSTEM_PROMPT,
      `Ask one ${phase.label} phase question only.`,
      state.transcript
    );

    const fallback = `(${phase.label}) What is most important for this phase right now?`;
    state.transcript.push({ role: "assistant", phase: phase.id, content: enforceSingleQuestion(ai.text, fallback) });
    state.awaitingLearner = true;
    persist();
  }

  async function ensureStarted() {
    if (state.started) {
      return;
    }

    state.started = true;
    await askCurrentPhaseQuestion();
  }

  async function handleLearnerResponse(text) {
    await ensureStarted();

    if (!state.awaitingLearner) {
      return { ok: false, message: "Please wait for the current phase question before responding." };
    }

    const response = (text || "").trim();
    if (!response) {
      return { ok: false, message: "Please add your response before sending." };
    }

    const phase = PHASES[state.activePhaseIndex];
    state.transcript.push({ role: "user", phase: phase.id, content: response });
    state.phases[phase.id] = {
      phase: phase.label,
      response
    };

    state.awaitingLearner = false;

    if (state.activePhaseIndex === PHASES.length - 1) {
      state.completed = true;
      state.transcript.push({ role: "assistant", content: "You completed all Section 5 phases. Continue to the next section when ready." });
      persist();
      return { ok: true, completed: true };
    }

    state.activePhaseIndex += 1;
    await askCurrentPhaseQuestion();
    return { ok: true, completed: false };
  }

  return {
    ensureStarted,
    handleLearnerResponse,
    isComplete: () => state.completed,
    getTranscript: () => [...state.transcript]
  };
}
