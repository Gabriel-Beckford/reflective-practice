let userWarmUpResponse = '';
let userWarmUpFollowUp = '';

const GEMINI_MODEL = 'gemini-3.1-pro-preview';
const GEMINI_API_KEY = window.GEMINI_API_KEY || 'AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const state = {
  currentSlide: 0,
  reveals: { '1.1': 0, '2.1': 0 },
  slide12Submitted: false,
  slide12Pending: false,
  slide12Feedback:
    "Thank you for sharing. I hear the tensions and priorities in your classroom context. To deepen your reflection:\n\nFollow-up: Which one challenge most affects your students' learning right now, and why?",
};

const slides = [
  {
    id: '1.1',
    sectionShort: 'Section 1',
    progress: '0%',
    render: () => `
      <article class="slide active" data-slide="1.1">
        <span class="slide-badge">SECTION 1 · LEAD-IN</span>
        <section class="reveal-step ${state.reveals['1.1'] >= 1 ? 'revealed' : ''}">
          <span class="material-symbols-rounded icon-chip" aria-hidden="true">waving_hand</span>
          <h2 class="slide-question">Welcome to your asynchronous session on Kolb's Reflective Cycle.</h2>
        </section>
        <p class="slide-copy reveal-step ${state.reveals['1.1'] >= 2 ? 'revealed' : ''}">
          In today's session, you are going to progress through three stages of learning:
        </p>
        <div class="goals-pyramid reveal-step ${state.reveals['1.1'] >= 3 ? 'revealed' : ''}">
          <div class="goal-tier top"><strong>Create:</strong> Co-construct a micro-reflection based on a personal teaching experience.</div>
          <div class="goal-tier mid"><strong>Analyze/Evaluate:</strong> Distinguish between effective and weak reflective writing.</div>
          <div class="goal-tier base"><strong>Understand:</strong> Identify the four phases of Kolb's reflective cycle.</div>
        </div>
        ${footer(false, true, '1 / 44')}
      </article>
    `,
  },
  {
    id: '1.2',
    sectionShort: 'Section 1',
    progress: '2.5%',
    render: () => `
      <article class="slide active" data-slide="1.2">
        <span class="slide-badge">REFLECT</span>
        <span class="material-symbols-rounded icon-chip" aria-hidden="true">lightbulb</span>
        <h2 class="slide-question">Let's begin with a 3-2-1 grounding activity.</h2>
        <p class="slide-copy grounding-intro">Please capture a quick snapshot of your current teaching context before we move into theory.</p>
        <section class="activity-321" aria-label="3-2-1 grounding prompts">
          <article class="activity-item" data-tone="primary">
            <span class="material-symbols-rounded" aria-hidden="true">visibility</span>
            <div>
              <h3>3 observations</h3>
              <p>Three things you notice about your current teaching practice.</p>
            </div>
          </article>
          <article class="activity-item" data-tone="secondary">
            <span class="material-symbols-rounded" aria-hidden="true">warning</span>
            <div>
              <h3>2 challenges</h3>
              <p>Two challenges you are currently facing in your Haitian classroom.</p>
            </div>
          </article>
          <article class="activity-item" data-tone="tertiary">
            <span class="material-symbols-rounded" aria-hidden="true">flag</span>
            <div>
              <h3>1 session goal</h3>
              <p>One goal you want to prioritize during this session.</p>
            </div>
          </article>
        </section>
        <div class="input-wrap">
          <textarea id="warmup-input" placeholder="1. I notice...\n2. My challenges are...\n3. My goal is...">${escapeHtml(userWarmUpResponse)}</textarea>
          <button class="nav-btn submit-btn" id="submit-warmup">Submit</button>
        </div>
        <div class="feedback-card ${state.slide12Submitted ? 'visible' : 'hidden'}" id="warmup-feedback">
          ${formatWarmupFeedback(state.slide12Feedback, state.slide12Pending)}
        </div>
        <div class="input-wrap ${state.slide12Submitted ? '' : 'hidden'}" id="followup-wrap">
          <textarea id="followup-input" placeholder="Optional follow-up response...">${escapeHtml(userWarmUpFollowUp)}</textarea>
        </div>
        ${footer(true, state.slide12Submitted, '2 / 44')}
      </article>
    `,
  },
  {
    id: '2.1',
    sectionShort: 'Section 2',
    progress: '5%',
    render: () => `
      <article class="slide active" data-slide="2.1">
        <span class="slide-badge">SECTION 2 · THEORY</span>
        <span class="material-symbols-rounded icon-chip" aria-hidden="true">menu_book</span>
        <p class="slide-copy reveal-step ${state.reveals['2.1'] >= 1 ? 'revealed' : ''}">
          David Kolb argued that <span class="accent">knowledge is created through the transformation of experience</span>. Experiential learning is best conceived as a process, not in terms of fixed outcomes.
        </p>
        <p class="slide-copy reveal-step ${state.reveals['2.1'] >= 2 ? 'revealed' : ''}">
          Learning is a continuous, holistic process grounded in experience. It involves the whole person—your thoughts, your feelings, and your actions.
        </p>
        <p class="slide-copy reveal-step ${state.reveals['2.1'] >= 3 ? 'revealed' : ''}">
          Crucially, experiential learning and reflective practice co-exist. You cannot transform an experience into knowledge without intentionally reflecting upon it.
        </p>
        ${footer(true, true, '3 / 44')}
      </article>
    `,
  },
];

function footer(showBack, canNext, counter) {
  return `
    <footer class="slide-footer">
      ${showBack ? '<button class="nav-btn secondary" id="back-btn"><span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>Back</button>' : '<span></span>'}
      <span class="slide-count">${counter}</span>
      <button class="nav-btn primary" id="next-btn" ${canNext ? '' : 'disabled'}>Next<span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span></button>
    </footer>
  `;
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function render() {
  const slide = slides[state.currentSlide];
  document.getElementById('slide-container').innerHTML = slide.render();
  document.getElementById('header-slide-id').textContent = slide.id;
  document.getElementById('header-section').textContent = slide.sectionShort;
  document.getElementById('progress-fill').style.width = slide.progress;

  wireNav();
  wireSlideSpecificHandlers(slide.id);
}

function wireNav() {
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');

  backBtn?.addEventListener('click', () => {
    if (state.currentSlide > 0) {
      state.currentSlide -= 1;
      render();
    }
  });

  nextBtn?.addEventListener('click', () => {
    const id = slides[state.currentSlide].id;

    if (id === '1.1' && state.reveals['1.1'] < 3) {
      state.reveals['1.1'] += 1;
      render();
      return;
    }

    if (id === '2.1' && state.reveals['2.1'] < 3) {
      state.reveals['2.1'] += 1;
      render();
      return;
    }

    if (state.currentSlide < slides.length - 1) {
      state.currentSlide += 1;
      render();
    }
  });
}

function wireSlideSpecificHandlers(slideId) {
  if (slideId !== '1.2') return;

  const input = document.getElementById('warmup-input');
  const followUpInput = document.getElementById('followup-input');
  const submitBtn = document.getElementById('submit-warmup');

  input?.addEventListener('input', (e) => {
    userWarmUpResponse = e.target.value;
  });

  followUpInput?.addEventListener('input', (e) => {
    userWarmUpFollowUp = e.target.value;
  });

  submitBtn?.addEventListener('click', async () => {
    userWarmUpResponse = input.value.trim();
    if (!userWarmUpResponse) {
      input.focus();
      return;
    }

    if (state.slide12Pending) {
      return;
    }

    state.slide12Submitted = true;
    state.slide12Pending = true;
    state.slide12Feedback =
      "Thank you for sharing. I hear the tensions and priorities in your classroom context. Let me generate a tailored follow-up question...";
    render();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Thinking...';

    const aiFollowUp = await requestGeminiFollowUp(userWarmUpResponse);
    state.slide12Pending = false;
    state.slide12Feedback = `Thank you for sharing. I hear the tensions and priorities in your classroom context.\n\nFollow-up: ${aiFollowUp}`;
    render();

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  });
}

function formatWarmupFeedback(message, isPending) {
  const escaped = escapeHtml(message);
  const withBreaks = escaped.replaceAll('\n', '<br>');
  const pendingBadge = isPending ? '<br><br><em>Thinking...</em>' : '';
  return `${withBreaks}${pendingBadge}`;
}

async function requestGeminiFollowUp(userText) {
  const prompt = `
You are coaching an ELT teacher in Haiti using Kolb's reflective cycle.
Given the teacher's response below, provide exactly one short follow-up question that helps them deepen reflection.
Keep it to one sentence and under 30 words.

Teacher response:
${userText}
`.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 60,
        },
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Gemini response did not contain text.');
    }

    return normalizeFollowUpQuestion(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Which one challenge currently has the biggest impact on student learning, and what makes it so significant right now?";
  }
}

function normalizeFollowUpQuestion(text) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return "Which one challenge currently has the biggest impact on student learning, and what makes it so significant right now?";
  }

  const firstSentence = compact.split(/(?<=[.?!])\s+/)[0];
  const cleaned = firstSentence.replace(/^["'“”]+|["'“”]+$/g, '').trim();

  if (cleaned.endsWith('?')) {
    return cleaned;
  }

  return `${cleaned.replace(/[.!,;:]+$/, '')}?`;
}

render();
