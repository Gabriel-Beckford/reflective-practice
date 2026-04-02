# Comprehensive Build Plan v3: Kolb's Reflective Cycle — Multimodal Digital Artefact

## Project Overview

| Field | Detail |
|---|---|
| **Module** | ET5523/ET5623 Technology for Teaching |
| **Assessment** | Coursework Task 2 — Multimodal Digital Artefact + Teaching Guide |
| **Target engagement** | 15–20 minutes |
| **Target learners** | ELT teaching professionals working in Haiti. All hold undergraduate degrees. They have had some workshop-level exposure to Kolb's reflective cycle (ZAD) and will use it extensively throughout the course in action research, classroom activities, personal development, and student training. |
| **Pedagogical context** | This is an **asynchronous** activity that supplements and complements a face-to-face session where learners discussed an experience using the cycle. It provides the theoretical background and guides them through the systematic process. The next lesson will deepen the learning further. |
| **Theoretical grounding** | Vygotskian sociocultural theory (ZPD/ZAD scaffolding) |
| **Design priority** | Mobile-first |
| **Tech stack** | HTML / CSS / JavaScript (single-page app, no frameworks) |
| **AI model** | Google Gemini 3.1 Pro (`gemini-3.1-pro-preview`) |
| **API key** | `AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU` (private repo) |
| **UI library** | Google Material Design 3 (Material Web Components via CDN) |
| **Animations** | Lottie animated icons from https://lottiefiles.com/free-animations/icon |
| **Speech input** | Web Speech API (built-in browser STT; no extra key required) |
| **PDF export** | jsPDF — compile all student responses into downloadable PDF |
| **Social layer** | Google Sheets + Apps Script (peer excerpt store) + Gemini AI screening + manual moderation |
| **Build tool** | Claude Code |

---

## Learning Outcomes

By the end of this artefact, learners should be able to:

1. **Understand** how Kolb's Experiential Learning Cycle works, including its roots in Dewey and Piaget
2. **Apply** that understanding by identifying the phases in authentic examples of reflective writing — including excerpts contributed by peers
3. **Evaluate** strong and weak samples of reflective writing against quality criteria
4. **Create** a structured micro-reflection using AI-scaffolded dialogue, producing a downloadable plan
5. **Share** their reflection via Padlet for peer learning, and optionally contribute excerpts for future learners

---

## Pedagogical Framework: Vygotskian Scaffolding

**Zone of Actual Development (ZAD):** Learners have workshop-level familiarity with Kolb's cycle. They have already discussed a concrete experience using the cycle in a face-to-face session. They can name the four phases and have a general sense of the process.

**Zone of Proximal Development (ZPD):** Learners need to move from surface recognition to:
- understanding the theoretical rationale (why four phases; Dewey, Piaget)
- reliably identifying phases in authentic writing
- evaluating the quality of reflective writing
- independently producing structured reflections

**Scaffolding strategy in the artefact:**
- Content is chunked and sequenced from recognition → analysis → evaluation → creation (Bloom's taxonomy progression)
- AI acts as a "more knowledgeable other" (Vygotsky, 1978) — providing formative feedback + one follow-up question at each interaction point
- Scaffolding is gradually withdrawn: Sections 1–2 are heavily guided; Section 3 requires analysis; Section 4 requires judgment; Section 5 requires independent production
- The micro-reflection concept acknowledges that full mastery extends beyond the artefact — learning continues in subsequent lessons and practice

**Social dimension:** The peer excerpt system operationalises Vygotsky's emphasis on social mediation. Learners encounter authentic reflections from colleagues working in the same Haitian ELT context. This positions peers as co-constructors of the learning experience — each cohort's reflections become material for future cohorts, creating a community of reflective practice that grows over time. The artefact becomes a living resource rather than a static tool.

---

## Design Principles

1. **Content and questions on separate slides** — never on the same slide
2. **Content appears piecemeal with animations** — student clicks/taps through; text and elements appear progressively
3. **Lottie animated icons** enhance visual interest and signpost transitions
4. **Tap-and-drop** interactions (no desktop-style drag-and-drop; mobile-first)
5. **Consistent question types within sections** — principled selection across sections
6. **Contextually relevant examples** — all scenarios set in Haitian ELT classrooms
7. **Material Design 3** components throughout (buttons, cards, chips, text fields, progress indicators)
8. **Peer excerpts integrated as learning material** — appearing alongside pre-written examples in the phase-identification activity (Section 3), indistinguishable in presentation

---

## Peer Excerpt System: Architecture

### Overview

When learners complete Section 5 (micro-reflection), they can opt in to share individual phase excerpts with future learners. Opted-in excerpts are screened by Gemini for quality and phase clarity, then written to a Google Sheet in a "pending" state. The instructor manually approves excerpts by scanning the Sheet. Approved excerpts are served back to future learners in Section 3, where they appear as phase-identification exercises alongside pre-written fallback examples.

### Flow Diagram

```
SECTION 5 — Learner completes micro-reflection
    ↓
SUMMARY SLIDE — Opt-in checkboxes per phase
    ↓
GEMINI SCREENING — AI checks: completeness, phase clarity, 
                    contextual relevance, appropriateness
    ↓
    ├── FAIL → Excerpt discarded silently (learner not notified)
    ↓
    └── PASS → Written to Google Sheet (status: "pending")
                    ↓
              INSTRUCTOR reviews Sheet → sets status to "approved" or "rejected"
                    ↓
              SECTION 3 — Future learners encounter approved excerpts 
                          mixed with pre-written fallbacks
```

### Google Sheet Structure

**Sheet name:** `peer_excerpts`

| Column | Field | Description |
|---|---|---|
| A | `timestamp` | ISO timestamp of submission |
| B | `phase` | CE / RO / AC / AE |
| C | `excerpt` | Full text of the student's response |
| D | `ai_status` | `passed` / `failed` (set by Gemini screening) |
| E | `ai_phase_confirmed` | The phase Gemini confirmed the excerpt maps to |
| F | `moderation_status` | `pending` / `approved` / `rejected` (set by instructor) |
| G | `usage_count` | Integer — incremented each time the excerpt is served |
| H | `rejection_reason` | AI's reason for rejection, or instructor's note (nullable) |

### Google Apps Script

Two endpoints are needed:

**1. POST — Submit excerpt (called from Section 5 after Gemini screening)**

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('peer_excerpts');
  
  sheet.appendRow([
    new Date().toISOString(),       // timestamp
    data.phase,                      // CE/RO/AC/AE
    data.excerpt,                    // full text
    data.ai_status,                  // passed/failed
    data.ai_phase_confirmed,         // phase confirmed by AI
    'pending',                       // moderation_status — always starts as pending
    0,                               // usage_count
    data.rejection_reason || ''      // nullable
  ]);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

**2. GET — Fetch approved excerpts (called from Section 3 on load)**

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('peer_excerpts');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find approved excerpts
  const approved = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[5] === 'approved') { // moderation_status column
      approved.push({
        phase: row[1],
        excerpt: row[2],
        usage_count: row[6],
        row_index: i + 1 // for incrementing usage_count
      });
    }
  }
  
  // Select balanced set: up to 2 per phase, prioritising lowest usage_count
  const phases = ['CE', 'RO', 'AC', 'AE'];
  const selected = [];
  
  phases.forEach(phase => {
    const phaseExcerpts = approved
      .filter(e => e.phase === phase)
      .sort((a, b) => a.usage_count - b.usage_count);
    
    const pick = phaseExcerpts.slice(0, 2);
    selected.push(...pick);
    
    // Increment usage_count for selected excerpts
    pick.forEach(p => {
      sheet.getRange(p.row_index, 7).setValue(p.usage_count + 1);
    });
  });
  
  return ContentService.createTextOutput(
    JSON.stringify({ excerpts: selected })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

**Deployment:** The Apps Script is deployed as a web app with "Anyone" access (for the GET/POST to work from client-side JavaScript without authentication). The Sheet itself remains private — only the instructor has direct access to the moderation columns.

### Manual Moderation Workflow

1. Instructor opens the Google Sheet periodically (e.g., daily during the course, or after each cohort completes the artefact)
2. Filters column F (`moderation_status`) to show `pending` rows
3. Reads each excerpt in column C
4. Sets column F to `approved` or `rejected`
5. Optionally adds a note in column H if rejecting
6. Approved excerpts become available to the next learner who loads Section 3

**Time commitment:** Minimal — each excerpt is 2–4 sentences. With a cohort of 20 learners, each potentially contributing 1–4 excerpts, the instructor would review 20–80 short texts. Most will already have passed Gemini screening, so the rejection rate should be low. Estimated time: 10–15 minutes per cohort.

### Gemini Screening Prompt (XML)

```xml
<s>
  <role>Content screening assistant for a reflective practice learning tool</role>
  <task>
    Evaluate whether a student's reflective writing excerpt is suitable for 
    use as a learning example in a phase-identification activity. Other 
    learners will read this excerpt and try to identify which phase of 
    Kolb's Experiential Learning Cycle it belongs to. The excerpt must be 
    analytically unambiguous — a reader should be able to identify the phase 
    with confidence.
  </task>
  <selection_criteria>
    The excerpt MUST meet ALL of the following criteria to pass:
    
    1. COMPLETENESS: Contains at least two sentences expressing a complete, 
       self-contained idea. A reader unfamiliar with the writer's context 
       should be able to understand the excerpt without additional information.
       Single sentences, fragments, and bullet points must be rejected.
    
    2. PHASE_CLARITY: Clearly and unambiguously belongs to exactly one phase 
       of Kolb's cycle (CE, RO, AC, or AE). If the excerpt blends elements 
       of two or more phases — for example, describing feelings AND citing 
       theory, or narrating an event AND planning next steps — it MUST be 
       rejected. The phase the excerpt maps to must match the submitted 
       phase label.
    
    3. CONTEXTUAL_RELEVANCE: Describes a teaching, training, or professional 
       situation. Purely personal reflections unrelated to professional 
       practice must be rejected.
    
    4. APPROPRIATENESS: Does not contain names or identifying information 
       about specific students, colleagues, or institutions. Does not 
       contain content that would be uncomfortable, offensive, or 
       distressing for peers to read.
  </selection_criteria>
  <phase_definitions>
    CE (Concrete Experience): Factual description of a specific, lived event. 
       Names what happened, when, where, who was involved. Does NOT include 
       feelings, emotional reactions, theoretical analysis, or planning.
    
    RO (Reflective Observation): Examines feelings, reactions, and 
       observations about the experience. May consider multiple perspectives. 
       Does NOT include theoretical citations, framework references, or 
       action planning.
    
    AC (Abstract Conceptualisation): Connects the experience to theory, 
       research, frameworks, or general principles. Identifies patterns or 
       draws generalisable conclusions. Does NOT describe the event itself 
       or plan next steps.
    
    AE (Active Experimentation): Proposes specific, actionable next steps. 
       Describes what the learner will do differently and how they will 
       measure the effect. Does NOT describe the original event or 
       analyse feelings.
  </phase_definitions>
  <input>
    Submitted phase label: {PHASE}
    Excerpt text: {TEXT}
  </input>
  <output_format>
    Respond with ONLY a valid JSON object. No markdown formatting, no 
    backticks, no additional text before or after the JSON:
    {
      "approved": true or false,
      "phase_confirmed": "CE" or "RO" or "AC" or "AE",
      "rejection_reason": "brief explanation" or null
    }
  </output_format>
</s>
```

### Client-Side Integration

```javascript
// === PEER EXCERPT SYSTEM ===

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCNkAYXW3nOw8WRCXmN6d1QLT1EsQtG0qOWCNJaPkXAyj_xrMN7Fl3BsItMqufU2z0/exec';

// Fetch approved peer excerpts (called when Section 3 loads)
async function fetchPeerExcerpts() {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.json();
    return data.excerpts || [];
  } catch (error) {
    console.warn('Could not fetch peer excerpts. Using fallbacks only.', error);
    return [];
  }
}

// Screen and submit an opted-in excerpt (called from Section 5 summary)
async function submitPeerExcerpt(phase, excerptText) {
  // Step 1: Screen with Gemini
  const screeningPrompt = buildScreeningPrompt(phase, excerptText);
  const screeningResult = await callGemini(screeningPrompt, '');
  
  let parsed;
  try {
    parsed = JSON.parse(screeningResult.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.warn('Gemini screening returned unparseable response.');
    return { submitted: false, reason: 'screening_error' };
  }
  
  // Step 2: If passed, submit to Google Sheet
  // NOTE: Apps Script redirects POST requests, so use mode: 'no-cors'
  if (parsed.approved) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          phase: phase,
          excerpt: excerptText,
          ai_status: 'passed',
          ai_phase_confirmed: parsed.phase_confirmed,
          rejection_reason: null
        })
      });
      return { submitted: true };
    } catch (error) {
      console.warn('Could not submit excerpt to Sheet.', error);
      return { submitted: false, reason: 'network_error' };
    }
  } else {
    return { submitted: false, reason: parsed.rejection_reason };
  }
}

// Build Section 3 slide data by mixing peer excerpts with fallbacks
function buildSection3Slides(peerExcerpts, fallbackExcerpts) {
  const phases = ['CE', 'RO', 'AC', 'AE'];
  const slides = [];
  
  phases.forEach(phase => {
    const peerForPhase = peerExcerpts.filter(e => e.phase === phase);
    const fallbackForPhase = fallbackExcerpts.filter(e => e.phase === phase);
    
    // Use up to 2 peer excerpts per phase; fill remaining with fallbacks
    let excerpts = [];
    if (peerForPhase.length >= 2) {
      excerpts = peerForPhase.slice(0, 2);
    } else if (peerForPhase.length === 1) {
      excerpts = [peerForPhase[0], fallbackForPhase[0]];
    } else {
      excerpts = fallbackForPhase.slice(0, 2);
    }
    
    // Shuffle so peer and fallback excerpts are intermixed unpredictably
    excerpts = shuffleArray(excerpts);
    
    excerpts.forEach(excerpt => {
      // Content slide
      slides.push({
        type: 'content',
        content: excerpt.excerpt,
        attribution: 'A teaching professional reflected:'
      });
      // Question slide
      slides.push({
        type: 'question',
        questionType: 'phase_identification',
        correctAnswer: phase,
        options: ['CE', 'RO', 'AC', 'AE']
      });
    });
  });
  
  // Shuffle all slide pairs to avoid phase clustering
  // (shuffle in pairs so content + question stay together)
  return shufflePairs(slides);
}
```

---

## Artefact Architecture — Section by Section

---

### SECTION 1: Lead-In — AI-Guided Warm-Up (approx. 2–3 min)

**Purpose:** Activate prior knowledge from the face-to-face session. Surface an existing concrete experience. Demonstrate the reflective process before connecting it to theory.

**Lottie icon:** Lightbulb / thinking animation

#### Slide 1.1 — Welcome & Orientation
- **Content (piecemeal):**
  - [Lottie: waving hand] "Welcome to your asynchronous session on Kolb's Reflective Cycle."
  - "In our last session, you discussed a concrete experience using the cycle. Today, we'll build on that by exploring the theory behind the process and practising the mechanics."
  - "Let's start by briefly revisiting a professional experience."

#### Slide 1.2 — Describe Your Experience
- **Input:** Material Design outlined text field (multi-line)
- **Prompt:** "In a few sentences, describe a recent teaching experience that stood out to you. It could be a lesson in your Haitian classroom, a training session, a parent meeting, or any event that left an impression."
- **Alternative input:** 🎙️ Speech-to-text toggle (Web Speech API)
- Student submits → triggers Gemini API call

#### Slide 1.3 — AI Follow-Up
- **AI response:** Gemini asks 1–2 follow-up questions aligned to the cycle phases:
  - e.g., "How did that experience make you feel while it was happening?"
  - e.g., "What do you think went well, and what felt less successful?"
- Student responds → AI provides **formative feedback** + **one follow-up question**
- After the exchange, AI delivers a synthesis: "What you've just done — recalling the experience, examining your feelings, asking why things happened — is the essence of Kolb's Experiential Learning Cycle. Let's explore the theory behind it."

**Gemini system prompt (XML):**
```xml
<s>
  <role>Reflective practice facilitator for Haitian ELT professionals</role>
  <context>
    The student is an English language teaching professional working in Haiti 
    with an undergraduate degree. They have had introductory workshop exposure 
    to Kolb's reflective cycle and have already discussed a concrete experience 
    in a face-to-face session. This is an asynchronous follow-up activity.
  </context>
  <theoretical_framework>
    Vygotskian sociocultural theory. You are acting as a "more knowledgeable 
    other" scaffolding the learner through the Zone of Proximal Development. 
    The learner's ZAD includes basic familiarity with the four phases of 
    Kolb's cycle.
  </theoretical_framework>
  <task>
    The student has described a concrete professional experience. Ask 1–2 
    follow-up questions drawn from the phases of Kolb's reflective cycle 
    (feelings, what went well/badly, why, what next). Keep questions warm, 
    encouraging, and culturally sensitive to the Haitian educational context.
  </task>
  <response_format>
    Provide brief formative feedback (2–3 sentences acknowledging what the 
    student has shared) followed by exactly one follow-up question. Keep your 
    total response under 100 words. Use simple, clear academic English.
  </response_format>
  <constraints>
    Do not provide theoretical explanations yet. Do not mention Kolb by name 
    until the synthesis message. Do not ask more than one question per response.
    Do not use jargon the student may not know.
  </constraints>
</s>
```

---

### SECTION 2: Theoretical Foundations (approx. 5–6 min)

**Purpose:** Provide the theoretical background needed to implement the cycle. Cover the foundations (Dewey, Piaget), introduce the four-phase model, explain each phase in detail, and introduce micro-reflection — all contextualised for Haitian ELT.

**Lottie icons:** Book (theory), compass (Dewey), puzzle (Piaget), cycle (Kolb), eye/mirror/brain/rocket (CE/RO/AC/AE), chain (micro-reflection)

**Design:** Each content slide is followed by a separate question slide. Content appears piecemeal — student taps through elements one at a time.

---

#### Slide 2.1 — Why Experiential Learning? (Content)
- [Lottie: lightbulb]
- **Piecemeal content:**
  1. "In our last session, you used your own experience as the starting point for learning. This approach has deep theoretical roots."
  2. "Kolb (1984) argued that knowledge is created through the transformation of experience. Learning is a process of adaptation — ideas are formed and re-formed through what we live through."
  3. "This perspective draws on three key intellectual traditions: the work of Lewin, Dewey, and Piaget."

#### Slide 2.2 — Why Experiential Learning? (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "According to Kolb (1984), learning is best understood as..."
  - (a) the accumulation of facts and information
  - (b) the process of creating knowledge through transforming experience ✓
  - (c) a natural talent that some teachers are born with
  - (d) the memorisation of theoretical frameworks
- **AI feedback:** Formative feedback (correct/incorrect + brief explanation) + one follow-up question

---

#### Slide 2.3 — Dewey's Contribution (Content)
- [Lottie: compass]
- **Piecemeal content:**
  1. "John Dewey (1938) described learning as a process that integrates impulse, observation, and judgment."
  2. "He argued that we should postpone immediate action until observation and judgment can intervene — transforming raw impulse into purposeful action."
  3. "For Dewey, learning is also continuous: each experience takes something from what came before and shapes what follows."
  4. "Think about your own teaching in Haiti: after a challenging class, you probably don't just repeat the same lesson. You observe what happened, think about why, and adjust. That's Dewey's insight in action."

#### Slide 2.4 — Dewey's Contribution (Question)
- **Type:** Short answer (text field) → AI-marked
- **Question:** "Think of a time you adjusted your teaching approach after a lesson in your Haitian classroom. In one or two sentences, explain what prompted the change."
- **AI feedback:** Formative feedback connecting their example to Dewey's emphasis on observation before action + one follow-up question

---

#### Slide 2.5 — Piaget's Contribution (Content)
- [Lottie: puzzle piece]
- **Piecemeal content:**
  1. "Piaget (1970) saw learning as a cycle of interaction between the individual and the environment."
  2. "Two processes are central: **accommodation** (adjusting our mental frameworks to fit new experiences) and **assimilation** (interpreting new experiences through existing frameworks)."
  3. "Intelligent adaptation comes from a balanced tension between these two processes."
  4. "For example, when you encounter a student who doesn't respond to a teaching method that usually works, you might need to accommodate — to adjust your approach. When you use a familiar strategy in a new classroom, you're assimilating — interpreting the new context through what you already know."

#### Slide 2.6 — Piaget's Contribution (Question)
- **Type:** Tap-and-drop (match term to definition)
- **Items to match:**
  - *Accommodation* → "Adjusting your existing frameworks to fit new experiences"
  - *Assimilation* → "Interpreting new experiences through existing frameworks"
- **Feedback:** Brief confirmation + one follow-up question

---

#### Slide 2.7 — Kolb's Four-Stage Cycle: Overview (Content)
- [Lottie: cycle/refresh]
- **Piecemeal content:**
  1. "Drawing on Lewin, Dewey, and Piaget, Kolb (1984) proposed that effective learning moves through four phases, organised in a cycle."
  2. [Animated SVG diagram of the cycle: CE → RO → AC → AE → CE...]
  3. "The cycle has two dimensions:"
     - A **grasping** dimension: from concrete experience (CE) to abstract conceptualisation (AC)
     - A **transforming** dimension: from reflective observation (RO) to active experimentation (AE)
  4. "Kolb described this as the ideal journey a learner goes through. Each phase builds on the previous one."

#### Slide 2.8 — Kolb's Four-Stage Cycle: Overview (Question)
- **Type:** Multiple choice, multiple answer (select all that apply)
- **Question:** "Select ALL the stages of Kolb's Experiential Learning Cycle:"
  - ☑ Concrete Experience
  - ☐ Behavioural Conditioning
  - ☑ Reflective Observation
  - ☑ Abstract Conceptualisation
  - ☑ Active Experimentation
  - ☐ Summative Assessment
- **Feedback + follow-up**

---

#### Slide 2.9 — Concrete Experience (CE) (Content)
- [Lottie: eye]
- **Piecemeal content:**
  1. "**Concrete Experience (CE)** is the starting point: a specific event or situation you have lived through."
  2. "The key is full involvement — being open, present, and willing to engage without preconceptions."
  3. "Typical questions at this stage: *What happened? When did it happen? Who was involved? What did you do?*"
  4. **Contextual example:** "You're teaching a reading comprehension lesson to a secondary class in Port-au-Prince. You use group work for the first time, assigning each group a different section of the text. One group finishes early and starts chatting in Kreyòl; another group struggles with vocabulary; a third group is deeply engaged."

#### Slide 2.10 — CE (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "At the Concrete Experience stage, what is the learner primarily doing?"
  - (a) Analysing why things happened
  - (b) Planning what to do next time
  - (c) Fully engaging in a specific, lived event ✓
  - (d) Reading relevant literature
- **Feedback + follow-up**

---

#### Slide 2.11 — Reflective Observation (RO) (Content)
- [Lottie: mirror]
- **Piecemeal content:**
  1. "**Reflective Observation (RO)** is where you step back to examine the experience from multiple perspectives."
  2. "You pay attention to feelings, reactions, and outcomes."
  3. "Typical questions: *How did I feel? What went well? What was surprising? What would a colleague observing my class have noticed?*"
  4. **Contextual example:** "After the reading lesson, you notice you felt frustrated when the first group switched to Kreyòl. You also recall feeling pleased that the third group was so engaged. You wonder whether the vocabulary level was appropriate for the struggling group, and you think about what your head of department would have observed."

#### Slide 2.12 — RO (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "Which of these is a Reflective Observation question?"
  - (a) "What will I do differently next time?"
  - (b) "What does the literature say about group work?"
  - (c) "How did I feel when the group switched to Kreyòl?" ✓
  - (d) "What specific text did I use for the lesson?"
- **Feedback + follow-up**

---

#### Slide 2.13 — Abstract Conceptualisation (AC) (Content)
- [Lottie: brain]
- **Piecemeal content:**
  1. "**Abstract Conceptualisation (AC)** is where you move from personal observation to broader analysis."
  2. "You draw on theory, research, or general principles to make sense of the experience."
  3. "Typical questions: *What does the literature say? Can I identify a pattern? What framework helps explain what happened?*"
  4. **Contextual example:** "You read about Cummins' (1979) distinction between BICS and CALP and realise the struggling group may have conversational English skills but lack the academic literacy to decode the text independently. You also consider Vygotsky's ZPD — the task may have been beyond their current capacity without scaffolding."

#### Slide 2.14 — AC (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "At the Abstract Conceptualisation stage, a teacher is primarily..."
  - (a) Describing what happened during the lesson
  - (b) Expressing how the lesson made them feel
  - (c) Drawing on theory and principles to explain the experience ✓
  - (d) Trying out a new teaching strategy
- **Feedback + follow-up**

---

#### Slide 2.15 — Active Experimentation (AE) (Content)
- [Lottie: rocket]
- **Piecemeal content:**
  1. "**Active Experimentation (AE)** is where you plan and test new approaches based on your insights."
  2. "You translate your conceptual understanding into practical action."
  3. "This stage feeds directly back into a new Concrete Experience, continuing the cycle."
  4. "Typical questions: *What will I do differently? How will I test this idea? What specific steps will I take?*"
  5. **Contextual example:** "You plan a differentiated version of the reading task: a simplified text with glossary support for the struggling group, the original text for the engaged group, and an extension task for the group that finished early. You also decide to set a brief Kreyòl-to-English vocabulary activation task at the start."

#### Slide 2.16 — AE (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "Which of these best represents Active Experimentation?"
  - (a) "I felt frustrated when the group was off-task"
  - (b) "Cummins' BICS/CALP framework explains the vocabulary gap"
  - (c) "I taught a reading lesson using group work"
  - (d) "Next time, I'll provide a glossary and differentiate the text by level" ✓
- **Feedback + follow-up**

---

#### Slide 2.17 — Micro-Reflection: Chaining the Cycle (Content)
- [Lottie: chain link / infinite loop]
- **Piecemeal content:**
  1. "Deep, extended reflection is valuable — yet in busy teaching contexts in Haiti, time is limited."
  2. "A **micro-reflection** is a brief, focused pass through the cycle lasting 5–10 minutes."
  3. "The key insight: when you chain micro-reflections together over time, patterns and insights emerge that are invisible in a single cycle. The whole becomes greater than the sum of its parts."
  4. "Making micro-reflection a regular habit — after a lesson, a meeting, a training session — builds continuous professional learning."
  5. "Later in this session, you'll create your own micro-reflection with AI scaffolding."

#### Slide 2.18 — Micro-Reflection (Question)
- **Type:** Multiple choice (single answer)
- **Question:** "The main advantage of chaining multiple micro-reflections together is that..."
  - (a) Each individual reflection becomes more thorough
  - (b) Patterns and insights emerge across cycles that are invisible in a single reflection ✓
  - (c) It eliminates the need for extended reflection
  - (d) It saves time by skipping some phases of the cycle
- **Feedback + follow-up**

---

### SECTION 3: Identifying Phases in Reflective Writing (approx. 2–3 min)

**Purpose:** Learners read excerpts of reflective writing and identify which phase of Kolb's cycle each belongs to. This section draws on **both pre-written fallback examples and approved peer excerpts** from the Google Sheet, creating a living, socially constructed activity.

**Lottie icon:** Magnifying glass / analysis

**Design principle:** Consistent interaction pattern throughout — **read excerpt → identify phase**. Excerpts are presented with the attribution "A teaching professional reflected:" regardless of whether they are pre-written or peer-contributed. The learner doesn't know the source.

---

#### How excerpts are selected

On section load, the artefact calls the Apps Script GET endpoint. It receives up to 2 approved peer excerpts per phase (8 total, if available). These are mixed with the pre-written fallbacks to produce a set of **8 excerpts** (2 per phase). The order is randomised so phases don't appear in a predictable sequence.

If peer excerpts are unavailable for a given phase (e.g., early in the course before the Sheet has populated), pre-written fallbacks fill the gap entirely. The learner experience is identical either way.

---

#### Slide 3.1 — Instructions (Content)
- **Piecemeal content:**
  1. [Lottie: magnifying glass] "Now you'll read short excerpts of reflective writing from teaching professionals."
  2. "Your task is to identify which phase of Kolb's cycle each excerpt belongs to: **CE**, **RO**, **AC**, or **AE**."
  3. "Read carefully — some phases can seem similar. Focus on *what the writer is doing* in the excerpt."

#### Slides 3.2 → 3.17 — Excerpt + Phase Identification (8 pairs)

Each excerpt is presented as a pair of slides:

**Content slide (odd):**
- Attribution: "A teaching professional reflected:"
- [Material Design elevated card containing the excerpt text]
- Student reads, then taps "Next"

**Question slide (even):**
- **Question:** "Which phase of Kolb's cycle does this excerpt represent?"
- **Options:** Four Material Design chips / tappable buttons:
  - `CE` — Concrete Experience
  - `RO` — Reflective Observation
  - `AC` — Abstract Conceptualisation
  - `AE` — Active Experimentation
- Student taps one → AI provides formative feedback explaining why the excerpt maps to the correct phase (or why the learner's choice was incorrect) + one follow-up question

**Total slides in Section 3:** 1 (instructions) + 16 (8 excerpt pairs) = **17 slides**

---

#### Pre-Written Fallback Excerpts (2 per phase, Haitian ELT context)

**CE Fallback 1:**
> "Last Tuesday, I taught a vocabulary lesson to my Form 3 class at a secondary school in Jacmel. I used flashcards with images of everyday objects and asked students to work in pairs to match the Kreyòl word to the English word. The lesson lasted 40 minutes. About half the pairs finished within 20 minutes; the others needed the full time."

**CE Fallback 2:**
> "During our end-of-term staff meeting at the school in Gonaïves, the principal asked each teacher to present one activity they had used this semester. I demonstrated a dictation activity I had adapted from a British Council resource. Five colleagues attended, and two of them asked questions about how I chose the text."

**RO Fallback 1:**
> "I felt relieved that most pairs were engaged during the vocabulary task, but I was concerned about the pairs who were slower — they seemed confused by some of the images. Looking back, a colleague observing the lesson might have noticed that I spent most of my time with the faster pairs rather than supporting those who were struggling."

**RO Fallback 2:**
> "After the staff meeting presentation, I felt quite proud of myself, but also nervous. I noticed that two colleagues seemed sceptical when I described the activity. I wonder whether they thought it was too simple, or whether they were just unfamiliar with the approach. My principal's expression was encouraging, which gave me confidence."

**AC Fallback 1:**
> "Nation's (2001) framework for vocabulary learning suggests that learners need to encounter new words in multiple contexts, with attention to form, meaning, and use. The flashcard task only addressed meaning — it didn't help students practise pronunciation (form) or use the words in sentences (use). This might explain why the struggling pairs found it difficult."

**AC Fallback 2:**
> "Reflecting on the staff meeting, I think Wenger's (1998) concept of communities of practice is relevant. The meeting created a space for teachers to share repertoire — practical resources and strategies. The scepticism I observed might reflect what Wenger calls boundary encounters, where different teaching traditions meet and create productive tension."

**AE Fallback 1:**
> "Next week, I will redesign the vocabulary task in three ways: I will add audio recordings of the English words so students can hear the pronunciation; I will include a sentence-completion activity so students practise using the words in context; and I will pair stronger students with those who need support. I will observe whether the slower pairs complete the task more quickly."

**AE Fallback 2:**
> "Before the next staff meeting, I plan to prepare a short handout summarising the research behind the dictation activity, so my colleagues can see the theoretical rationale. I will also invite one of the sceptical colleagues to co-present with me next time, so we can model collaborative professional learning. I'll ask for written feedback from attendees to gauge whether this changes the dynamic."

---

### SECTION 4: Evaluating Reflective Writing — Strong vs. Weak Examples (approx. 2–3 min)

**Purpose:** Build evaluative judgment. Learners compare strong and weak examples and identify what makes reflective writing effective.

**Lottie icon:** Scales / balance

**Design:** Present full mini-reflections (all four phases), then ask learners to evaluate using descriptor-selection (yes/no). Consistent with the interaction pattern from Section 3's focus on analysis, but now applied to holistic evaluation.

---

#### Slide 4.1 — Instructions (Content)
- **Piecemeal content:**
  1. [Lottie: scales] "Now you'll evaluate two complete pieces of reflective writing."
  2. "One is strong; one has significant weaknesses."
  3. "Your task is to identify the qualities that make reflective writing effective."

#### Slide 4.2 — Strong Example (Content)
- **Full mini-reflection (all four phases, ~120 words):**

> *"During Thursday's speaking lesson at my school in Cap-Haïtien, I asked students to role-play a job interview in English (CE). I noticed I felt anxious because several students kept switching to Kreyòl, and I wasn't sure whether to allow it. A visiting teacher from another school later told me the students seemed confident, even when using Kreyòl as a bridge (RO). Reading about translanguaging (García & Wei, 2014), I realised that allowing strategic use of Kreyòl might actually support English development by activating students' full linguistic repertoire (AC). Next week, I will explicitly build in 'Kreyòl bridge' moments where students draft their ideas in Kreyòl before performing in English, and I will observe whether this increases participation (AE)."*

#### Slide 4.3 — Strong Example Evaluation (Question)
- **Format:** Descriptor selection (Yes/No toggles)
  - Describes a specific, concrete experience → **Yes**
  - Includes personal feelings and observations → **Yes**
  - Considers multiple perspectives → **Yes**
  - Connects to relevant theory or research → **Yes**
  - Proposes specific, actionable next steps → **Yes**
  - Explains how to measure the effect of the change → **Yes**
- **AI feedback:** Confirms why this is strong + follow-up question

---

#### Slide 4.4 — Weak Example (Content)
- **Full mini-reflection (~80 words):**

> *"I taught a speaking lesson. It went okay. Some students spoke in Kreyòl which was a problem. I think group work is sometimes difficult in my context. Maybe I should try something different next time. I need to read more about how to teach speaking. Overall, the lesson was fine and I think I'm improving as a teacher."*

#### Slide 4.5 — Weak Example Evaluation (Question)
- **Format:** Descriptor selection (Yes/No toggles)
  - Describes a specific, concrete experience → **No** (too vague)
  - Includes personal feelings and observations → **No** (surface-level)
  - Considers multiple perspectives → **No**
  - Connects to relevant theory or research → **No**
  - Proposes specific, actionable next steps → **No** ("something different" is too vague)
  - Explains how to measure the effect of the change → **No**
- **AI feedback:** Explains what's missing, with specific suggestions for improvement + follow-up question

---

#### Slide 4.6 — Comparison Summary (Content)
- **Piecemeal content:**
  1. "Strong reflective writing is **specific** (names people, places, events), **multi-perspective** (considers how others saw it), **theoretically grounded** (connects to literature), and **action-oriented** (proposes concrete, measurable next steps)."
  2. "Weak reflective writing tends to be **vague**, **surface-level**, and **lacking in theoretical connection or actionable planning**."
  3. "In the next section, you'll create your own micro-reflection with AI scaffolding."

---

### SECTION 5: AI-Scaffolded Micro-Reflection (approx. 3–5 min)

**Purpose:** Learners create their own structured micro-reflection through dialogic interaction with Gemini. The AI scaffolds the process phase by phase.

**Lottie icon:** Pencil / writing

---

#### Slide 5.1 — Instructions (Content)
- **Piecemeal content:**
  1. [Lottie: pencil] "You're now going to create your own micro-reflection."
  2. "The AI will guide you through each phase of the cycle with targeted questions."
  3. "You can type your responses or use speech-to-text. 🎙️"
  4. "At the end, your responses will be compiled into a downloadable PDF."

#### Slide 5.2 — Input Mode Selection
- **Material Design segmented button / toggle:**
  - ✍️ Type
  - 🎙️ Speak (activates Web Speech API)

#### Slide 5.3 — CE Phase: AI Dialogue
- **AI prompt:** "Let's begin with a **Concrete Experience**. Describe a specific teaching event or professional situation from your work in Haiti. What happened? When and where? Who was involved?"
- Student responds (text or STT)
- **AI:** Formative feedback (2–3 sentences) + one follow-up question
- Student responds to follow-up
- **AI:** Brief acknowledgement → transitions to next phase

#### Slide 5.4 — RO Phase: AI Dialogue
- **AI prompt:** "Now let's move to **Reflective Observation**. How did this experience make you feel? What went well? What was challenging or unexpected? If a colleague had been observing, what might they have noticed?"
- Student responds → AI feedback + follow-up → student responds

#### Slide 5.5 — AC Phase: AI Dialogue
- **AI prompt:** "Let's think about **Abstract Conceptualisation**. Can you connect this experience to any theory, framework, or principle from your studies or professional knowledge? Are there patterns you recognise from similar situations?"
- Student responds → AI feedback + follow-up → student responds

#### Slide 5.6 — AE Phase: AI Dialogue
- **AI prompt:** "Finally, let's plan your **Active Experimentation**. Based on your reflection, what will you do differently next time? What specific, practical steps will you take? How will you know whether the change has been effective?"
- Student responds → AI feedback + follow-up → student responds

#### Slide 5.7 — Summary, Opt-In & PDF Export
- **Display:** All student responses compiled by phase in Material Design cards (CE / RO / AC / AE)
- **Edit:** Student can tap any phase card to revise before exporting

- **Peer excerpt opt-in:**
  - [Material Design card with explanation]
  - "Would you like to share any of your reflections with future learners? Your excerpt will appear anonymously as a learning example in this activity."
  - [Material Design checkbox per phase:]
    - ☐ Share my Concrete Experience excerpt
    - ☐ Share my Reflective Observation excerpt
    - ☐ Share my Abstract Conceptualisation excerpt
    - ☐ Share my Active Experimentation excerpt
  - "Shared excerpts are reviewed by your instructor before they appear."
  - Note: When the learner checks a box, the corresponding excerpt is sent to Gemini for screening. If it passes, it's written to the Google Sheet with `moderation_status: pending`. The learner sees a brief confirmation: "Thank you — your excerpt has been submitted for review." If Gemini rejects it, the learner sees: "This excerpt couldn't be shared this time, but your reflection is still saved in your PDF." No further detail is given.

- **Action buttons:**
  - 📥 **Download PDF** — jsPDF generates a structured document with the learner's name (optional), date, and all responses organised by phase
  - ✏️ **Edit** — tap to revise any section

- **Encouragement text:** "Well done. Use this plan to develop a full piece of reflective writing. Share your reflection on Padlet in the next section."

**Gemini system prompt for Section 5 dialogue (XML):**
```xml
<s>
  <role>
    Reflective practice facilitator grounded in Vygotskian sociocultural theory. 
    You are acting as a "more knowledgeable other" scaffolding the learner 
    through Kolb's Experiential Learning Cycle.
  </role>
  <context>
    The student is an ELT professional working in Haiti with an undergraduate 
    degree. They have workshop-level familiarity with Kolb's cycle and have 
    completed a face-to-face session where they discussed an experience using 
    the cycle. This activity provides additional theoretical grounding and 
    guided practice. Their reflection will later be used in action research, 
    classroom activities, personal development, or student training.
  </context>
  <task>
    Guide the student through a micro-reflection. Progress through the phases 
    in strict order: Concrete Experience → Reflective Observation → Abstract 
    Conceptualisation → Active Experimentation. For each phase:
    1. Present the phase-specific question
    2. Wait for the student's response
    3. Provide formative feedback (2–3 sentences that acknowledge and validate 
       what they've written, connecting it to the phase requirements)
    4. Ask exactly one follow-up question to deepen or sharpen their reflection
    5. After the student responds to the follow-up, briefly acknowledge and 
       transition to the next phase
  </task>
  <response_format>
    Keep each response under 80 words. Use warm, supportive, professional 
    language. Use simple, clear academic English. Reference the Haitian 
    teaching context naturally where appropriate.
  </response_format>
  <constraints>
    Do not skip phases. Do not move to the next phase until the student has 
    responded. Do not ask more than one question per response. Do not write 
    the student's reflection for them. Do not provide lengthy theoretical 
    explanations — this section is about the student's own reflective process.
    If the student's response is very brief or vague, gently prompt for more 
    specificity before moving on.
  </constraints>
  <current_phase>{PHASE_NAME}</current_phase>
  <conversation_history>{HISTORY}</conversation_history>
</s>
```

---

### SECTION 6: Share on Padlet (approx. 30 sec)

**Purpose:** Bridge to peer learning and the next lesson.

**Lottie icon:** Share / community

#### Slide 6.1 — Padlet Link
- **Piecemeal content:**
  1. [Lottie: share] "Share your reflection with your peers on Padlet."
  2. "You can post your downloaded PDF, or write a summary of your micro-reflection directly on the board."
  3. "Reading your peers' reflections will help you see the cycle from different perspectives — a valuable part of the learning process."
- **Material Design filled button:** "Open Padlet →" [links to Padlet URL — to be provided]

---

### SECTION 7: Feedback & Close (approx. 30 sec)

**Purpose:** Collect user feedback on the artefact. Close the session.

**Lottie icon:** Star / feedback

#### Slide 7.1 — Quick Feedback
- **Material Design slider or star rating:**
  - "How useful was this activity for your understanding of Kolb's reflective cycle?" (1–5 scale)
- **Material Design outlined text field:**
  - "Any comments or suggestions? (Optional)"
- **Submit button** (feedback can be sent to the same Google Sheet on a separate tab, or simply logged)

#### Slide 7.2 — Closing
- [Lottie: celebration / checkmark]
- "Thank you for completing this session. In our next lesson, we'll deepen your understanding of the cycle and explore how to apply it in your action research, classroom practice, and professional development. See you then!"

---

## Technical Architecture

### Libraries & CDN Resources

```html
<!-- Google Fonts (Roboto) -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Material Web Components (M3) -->
<script type="importmap">
{
  "imports": {
    "@material/web/": "https://esm.run/@material/web/"
  }
}
</script>
<script type="module">
  import '@material/web/all.js';
  import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.js';
  document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
</script>

<!-- Lottie Player -->
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

<!-- jsPDF (for PDF export) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### Gemini API Integration

```javascript
const GEMINI_API_KEY = 'AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU';
const GEMINI_MODEL = 'gemini-3.1-pro-preview';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(systemPromptXML, userMessage, conversationHistory = []) {
  const messages = [
    { role: 'user', parts: [{ text: systemPromptXML }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
    ...conversationHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        thinkingConfig: { thinkingLevel: 'low' }
      }
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';
}
```

### Speech-to-Text (Web Speech API)

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function initSpeechToText(targetTextArea) {
  if (!SpeechRecognition) {
    return null; // Show fallback message
  }
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    targetTextArea.value = transcript;
  };
  
  return recognition;
}
```

### PDF Export (jsPDF)

```javascript
function generateReflectionPDF(responses, learnerName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('My Micro-Reflection', 20, 20);
  doc.setFontSize(10);
  doc.text(`Name: ${learnerName || 'Anonymous'}`, 20, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 34);
  
  let y = 46;
  const phases = [
    { key: 'ce', label: 'Concrete Experience (CE)' },
    { key: 'ro', label: 'Reflective Observation (RO)' },
    { key: 'ac', label: 'Abstract Conceptualisation (AC)' },
    { key: 'ae', label: 'Active Experimentation (AE)' }
  ];
  
  phases.forEach(phase => {
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(phase.label, 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(responses[phase.key] || '[No response]', 170);
    doc.text(lines, 20, y);
    y += lines.length * 6 + 12;
    if (y > 260) { doc.addPage(); y = 20; }
  });
  
  doc.save('my-micro-reflection.pdf');
}
```

### Peer Excerpt System (Client-Side)

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCNkAYXW3nOw8WRCXmN6d1QLT1EsQtG0qOWCNJaPkXAyj_xrMN7Fl3BsItMqufU2z0/exec';

// Fetch approved peer excerpts (called when Section 3 loads)
async function fetchPeerExcerpts() {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.json();
    return data.excerpts || [];
  } catch (error) {
    console.warn('Could not fetch peer excerpts. Using fallbacks only.', error);
    return [];
  }
}

// Screen and submit an opted-in excerpt (called from Section 5 summary)
async function submitPeerExcerpt(phase, excerptText) {
  // Step 1: Screen with Gemini
  const screeningResult = await callGemini(SCREENING_PROMPT_XML
    .replace('{PHASE}', phase)
    .replace('{TEXT}', excerptText), '');
  
  let parsed;
  try {
    parsed = JSON.parse(screeningResult.replace(/```json|```/g, '').trim());
  } catch (e) {
    return { submitted: false, reason: 'screening_error' };
  }
  
  // Step 2: If passed, submit to Google Sheet as "pending"
  // NOTE: Apps Script redirects POST requests, so we use mode: 'no-cors'
  // to prevent the browser from following the redirect as a GET.
  // This means we cannot read the response body, but the data still writes.
  if (parsed.approved) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          phase: phase,
          excerpt: excerptText,
          ai_status: 'passed',
          ai_phase_confirmed: parsed.phase_confirmed,
          rejection_reason: null
        })
      });
      return { submitted: true };
    } catch (error) {
      return { submitted: false, reason: 'network_error' };
    }
  } else {
    return { submitted: false, reason: parsed.rejection_reason };
  }
}

// Build Section 3 content by mixing peer excerpts with fallbacks
function buildSection3Content(peerExcerpts, fallbackExcerpts) {
  const phases = ['CE', 'RO', 'AC', 'AE'];
  const exerciseItems = [];
  
  phases.forEach(phase => {
    const peerForPhase = peerExcerpts.filter(e => e.phase === phase);
    const fallbackForPhase = fallbackExcerpts.filter(e => e.phase === phase);
    
    let excerpts = [];
    if (peerForPhase.length >= 2) {
      excerpts = peerForPhase.slice(0, 2);
    } else if (peerForPhase.length === 1) {
      excerpts = [peerForPhase[0], fallbackForPhase[0]];
    } else {
      excerpts = fallbackForPhase.slice(0, 2);
    }
    
    excerpts.forEach(excerpt => {
      exerciseItems.push({
        excerpt: excerpt.excerpt || excerpt.text,
        correctPhase: phase,
        source: excerpt.source || 'peer'
      });
    });
  });
  
  // Shuffle all items so phases appear in random order
  return shuffleArray(exerciseItems);
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## Slide Count & Timing Summary

| Section | Slides | Est. Time | Cumulative |
|---|---|---|---|
| 1. Lead-In (AI warm-up) | 3 | 2–3 min | 2–3 min |
| 2. Theoretical Foundations | 18 | 5–6 min | 7–9 min |
| 3. Identifying Phases (peer + fallback excerpts) | 17 | 2–3 min | 9–12 min |
| 4. Evaluating Strong/Weak Examples | 6 | 2–3 min | 11–15 min |
| 5. AI-Scaffolded Micro-Reflection + Opt-In | 7 | 3–5 min | 14–20 min |
| 6. Padlet Link | 1 | 0.5 min | 14.5–20.5 min |
| 7. Feedback & Close | 2 | 0.5 min | 15–21 min |
| **Total** | **~54 slides** | **15–21 min** | |

---

## Instructor Moderation Guide

### Setup (one-time)

1. Create a Google Sheet with a tab named `peer_excerpts`
2. Add column headers in Row 1: `timestamp | phase | excerpt | ai_status | ai_phase_confirmed | moderation_status | usage_count | rejection_reason`
3. Create a Google Apps Script bound to the Sheet with the `doPost` and `doGet` functions (provided above)
4. Deploy the Apps Script as a web app: Execute as "Me", Access "Anyone"
5. Copy the deployment URL into the artefact's `APPS_SCRIPT_URL` constant

### Ongoing moderation workflow

1. Open the Google Sheet (bookmark it for quick access)
2. Filter column F (`moderation_status`) to show `pending`
3. Read each excerpt in column C — it will typically be 2–4 sentences
4. Check: Is it appropriate? Is it clear enough for another learner to identify the phase? Does it contain any identifying information?
5. Set column F to `approved` or `rejected`
6. Optionally add a note in column H if rejecting (for your own records)
7. Approved excerpts become available immediately — the next learner to load Section 3 will see them

### What to look for

- **Approve if:** The excerpt is a complete idea (2+ sentences), clearly maps to one phase, describes a teaching/professional situation, and contains no identifying information about individuals or institutions
- **Reject if:** The excerpt is a fragment, blends two phases, is too personal/sensitive, contains names of students or specific schools, or is off-topic
- **Note:** Gemini will have already screened for these criteria, so most pending excerpts should be approvable. The manual check is a safety net, especially for the first cohort

### Expected volume

- Cohort of ~20 learners × up to 4 excerpts each = up to 80 excerpts to review
- Gemini screening will filter out poor-quality submissions, so the pending queue will be smaller
- Estimated moderation time: 10–15 minutes per cohort

---

## Accessibility Checklist

- [ ] Mobile-first responsive layout (Material Design 3 breakpoints)
- [ ] Minimum font size 16px on mobile (M3 typescale)
- [ ] Touch targets minimum 48×48dp (M3 spec)
- [ ] High contrast text (WCAG AA 4.5:1 minimum)
- [ ] No information conveyed by colour alone
- [ ] Keyboard navigation for all interactive elements
- [ ] Semantic HTML with ARIA labels where needed
- [ ] Alt text on all diagrams and Lottie animations (`aria-label`)
- [ ] Speech-to-text as alternative input modality
- [ ] All tap interactions work via sequential tap (no drag required)
- [ ] Progress indicator visible at all times
- [ ] Content readable by screen readers
- [ ] Language attribute set (`lang="en"`)

---

## Lottie Animation Inventory

| Location | Animation Concept | Source |
|---|---|---|
| Section 1 | Waving hand (welcome) | lottiefiles.com/free-animations/icon |
| Section 1 | Lightbulb (warm-up insight) | lottiefiles.com/free-animations/icon |
| Section 2 | Book (theory) | lottiefiles.com/free-animations/icon |
| Section 2 | Compass (Dewey) | lottiefiles.com/free-animations/icon |
| Section 2 | Puzzle piece (Piaget) | lottiefiles.com/free-animations/icon |
| Section 2 | Cycle/refresh (Kolb's cycle) | lottiefiles.com/free-animations/icon |
| Section 2 | Eye (CE), Mirror (RO), Brain (AC), Rocket (AE) | lottiefiles.com/free-animations/icon |
| Section 2 | Chain/infinity (micro-reflection) | lottiefiles.com/free-animations/icon |
| Section 3 | Magnifying glass (analysis) | lottiefiles.com/free-animations/icon |
| Section 4 | Scales/balance (evaluation) | lottiefiles.com/free-animations/icon |
| Section 5 | Pencil (writing/creation) | lottiefiles.com/free-animations/icon |
| Section 6 | Share/community | lottiefiles.com/free-animations/icon |
| Section 7 | Star (feedback) | lottiefiles.com/free-animations/icon |
| Section 7 | Checkmark/celebration (close) | lottiefiles.com/free-animations/icon |

---

## Claude Code Build Guide

### Confirmed Infrastructure

| Component | URL / Key | Status |
|---|---|---|
| Gemini 3.1 Pro API | `AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU` | Active |
| Gemini endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU` | Active |
| Apps Script (GET/POST) | `https://script.google.com/macros/s/AKfycbzCNkAYXW3nOw8WRCXmN6d1QLT1EsQtG0qOWCNJaPkXAyj_xrMN7Fl3BsItMqufU2z0/exec` | Deployed & tested |
| Google Sheet | Seeded with 4 approved excerpts (1 per phase) | Live |

### Critical Technical Notes

**Apps Script POST requires `mode: 'no-cors'`:**
Apps Script redirects all POST requests through a 302. Standard `fetch` follows the redirect as a GET, which fails. Using `mode: 'no-cors'` prevents this. The trade-off: you cannot read the response body. For write operations this is fine — the data still reaches the Sheet. The artefact should optimistically display "Excerpt submitted" rather than waiting for a server confirmation.

```javascript
// CONFIRMED WORKING — POST to Apps Script
await fetch('https://script.google.com/macros/s/AKfycbzCNkAYXW3nOw8WRCXmN6d1QLT1EsQtG0qOWCNJaPkXAyj_xrMN7Fl3BsItMqufU2z0/exec', {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify({
    phase: 'CE',
    excerpt: 'Excerpt text here',
    ai_status: 'passed',
    ai_phase_confirmed: 'CE',
    rejection_reason: null
  })
});
```

**Apps Script GET works normally** — the browser follows the redirect transparently and returns the JSON body:

```javascript
// CONFIRMED WORKING — GET from Apps Script
const response = await fetch('https://script.google.com/macros/s/AKfycbzCNkAYXW3nOw8WRCXmN6d1QLT1EsQtG0qOWCNJaPkXAyj_xrMN7Fl3BsItMqufU2z0/exec');
const data = await response.json();
// data.excerpts = [{ phase: "CE", excerpt: "..." }, ...]
```

**Gemini API call pattern:**

```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=AIzaSyDaCmCfYq1r1eLbsJphtd5YfO9Q0lzuBEU',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPromptXML }] },
        { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
        ...conversationHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        thinkingConfig: { thinkingLevel: 'low' }
      }
    })
  }
);
const data = await response.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
```

**All system prompts use XML format** as specified.

### Output

Single HTML file. All CSS inline or in a `<style>` block. All JavaScript in `<script>` blocks. No external files except CDN imports.

### CDN Dependencies

```html
<!-- Google Fonts (Roboto) -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Material Web Components (M3) -->
<script type="importmap">
{
  "imports": {
    "@material/web/": "https://esm.run/@material/web/"
  }
}
</script>
<script type="module">
  import '@material/web/all.js';
  import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.js';
  document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
</script>

<!-- Lottie Player -->
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

<!-- jsPDF (for PDF export) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### Build Sequence

Build in this order. Each step should be testable before moving to the next.

#### Phase 1: Shell & Navigation

1. **HTML shell** — viewport meta, all CDN imports above, CSS custom properties matching the Material Design 3 colour tokens from the project's CSS file (purple/green/gold theme)
2. **Slide engine** — JavaScript object array defining all slides; `renderSlide(index)` function; forward/back navigation with Material Design buttons; progress bar at the top
3. **Piecemeal reveal system** — within each slide, `.reveal-step` elements start hidden; tapping a "Continue" button reveals the next one; once all steps are revealed, the "Next slide" button appears
4. **Test:** Verify navigation works with 3–4 placeholder slides on mobile and desktop

#### Phase 2: Content Slides (Section 2)

5. **Build all 18 Section 2 slides** — 9 content slides + 9 question slides, using the exact content from the plan above
6. **Question interaction logic:**
   - Multiple choice (single): tap to select → show feedback card → "Next" button
   - Multiple choice (multiple): tap to toggle → submit button → show feedback card
   - Tap-and-drop (matching): two columns; tap item in left column, then tap target in right column to place it; visual confirmation
   - Short answer: Material Design outlined text field → submit → show AI feedback
7. **Lottie icons** — one per content slide, loaded from lottiefiles.com URLs (find appropriate free icons during build; embed the JSON URLs directly in `<lottie-player>` tags)
8. **Test:** Walk through all 18 slides on mobile; confirm piecemeal reveal, all question types work, Lottie animations load

#### Phase 3: Static Question Sections (Sections 3 & 4)

9. **Pre-written fallback excerpts** — hardcode the 8 fallback excerpts (2 per phase) from the plan as a JavaScript array
10. **Section 3 interaction** — for each excerpt: content slide shows the text in a Material Design elevated card with "A teaching professional reflected:"; question slide shows 4 tappable phase chips (CE/RO/AC/AE); on selection, show correct/incorrect feedback
11. **Section 4** — strong/weak examples with descriptor-selection (Yes/No Material Design switches per descriptor); feedback after submission
12. **Test:** Walk through Sections 3–4 with fallback data only; confirm all interactions

#### Phase 4: Gemini Integration

13. **`callGemini()` utility function** — as specified above; handles errors gracefully with retry logic
14. **Section 2 AI feedback** — wire short-answer questions (Slides 2.4) and all question feedback to Gemini; each question sends the student's answer + the correct answer + context → Gemini returns formative feedback + one follow-up
15. **AI feedback system prompt (XML):**
```xml
<s>
  <role>Formative assessment assistant for Haitian ELT professionals</role>
  <context>
    The student is completing an asynchronous activity on Kolb's Experiential 
    Learning Cycle. They are an ELT professional working in Haiti with an 
    undergraduate degree.
  </context>
  <task>
    The student has answered a comprehension question. Provide brief formative 
    feedback (2–3 sentences): if correct, affirm and deepen understanding; if 
    incorrect, explain the correct answer warmly without being condescending. 
    Then ask exactly one follow-up question to extend their thinking.
  </task>
  <question>{QUESTION_TEXT}</question>
  <correct_answer>{CORRECT_ANSWER}</correct_answer>
  <student_answer>{STUDENT_ANSWER}</student_answer>
  <response_format>
    Keep total response under 80 words. Use warm, professional language.
  </response_format>
</s>
```
16. **Section 3 AI feedback** — after phase identification, Gemini explains why the excerpt maps to the correct phase
17. **Section 1 warm-up** — full conversational AI flow using the Section 1 system prompt from the plan
18. **Test:** Verify all AI interactions return appropriate responses; check error handling when Gemini is slow or unavailable

#### Phase 5: Micro-Reflection (Section 5)

19. **Dialogic AI scaffolding** — phase-locked conversation using the Section 5 system prompt; state machine: CE → RO → AC → AE; each phase = AI question → student response → AI feedback + follow-up → student response → transition
20. **Speech-to-text toggle** — Web Speech API integration; Material Design segmented button to switch between type/speak; microphone icon pulses while recording; transcript populates the text field
21. **Response storage** — all student responses stored in a JavaScript object `{ ce: '...', ro: '...', ac: '...', ae: '...' }`
22. **Summary slide** — display all 4 responses in Material Design cards; edit button on each card
23. **PDF export** — jsPDF generates structured document; download button
24. **Test:** Complete a full micro-reflection on mobile; verify STT works in Chrome; download PDF and confirm formatting

#### Phase 6: Peer Excerpt Integration

25. **Opt-in UI** — Material Design checkboxes per phase on the Section 5 summary slide; explanatory text; confirmation messages
26. **Gemini screening** — on opt-in, send excerpt to Gemini with the screening prompt from the plan; parse JSON response
27. **POST to Apps Script** — if screening passes, POST with `mode: 'no-cors'`; show "Excerpt submitted for review" optimistically
28. **GET on Section 3 load** — fetch approved excerpts from Apps Script; mix with fallbacks using `buildSection3Content()`; if GET fails, fall back gracefully to pre-written excerpts only
29. **Test:** 
    - Opt in to share an excerpt → check Google Sheet for new `pending` row
    - Manually approve the row in the Sheet → reload the artefact → confirm the excerpt appears in Section 3 mixed with fallbacks
    - Test with no approved excerpts → confirm fallbacks work alone
    - Test with network offline → confirm graceful fallback

#### Phase 7: Remaining Sections & Polish

30. **Section 6** — Padlet link slide with Material Design filled button (Padlet URL to be provided)
31. **Section 7** — feedback form (star rating + optional comment); submit can POST to a `feedback` tab in the same Sheet, or simply log to console
32. **Welcome slide (1.1)** — orientation content with Lottie waving hand
33. **Accessibility pass:**
    - Add `aria-label` to all Lottie players
    - Verify all buttons have accessible names
    - Test keyboard navigation (Tab, Enter, Space)
    - Check colour contrast (4.5:1 minimum)
    - Ensure all text is at least 16px on mobile
    - Ensure all touch targets are at least 48×48dp
34. **Mobile testing:**
    - Test on iPhone Safari, Android Chrome, desktop Chrome
    - Verify Lottie animations don't cause jank on low-end devices
    - Verify speech-to-text works on mobile Chrome
    - Test all tap interactions (no hover-dependent interactions)
    - Test PDF download on mobile

### CSS Architecture

Use the Material Design 3 colour tokens from the project's CSS file as the base. Key tokens:

```css
:root {
  --md-primary: #6750A4;
  --md-on-primary: #FFFFFF;
  --md-primary-container: #EADDFF;
  --md-secondary: #4A635D;
  --md-secondary-container: #CCE8E0;
  --md-tertiary: #B28600;
  --md-tertiary-container: #FFDEA4;
  --md-surface: #FFFBFE;
  --md-on-surface: #1C1B1F;
  --md-outline-variant: #CAC4D0;
  /* ... full set in project CSS file */
}
```

Mobile-first breakpoints:
- Default: mobile (< 600px)
- `@media (min-width: 600px)`: tablet/desktop enhancements

### Error Handling Strategy

| Scenario | Behaviour |
|---|---|
| Gemini API timeout (>10s) | Show "Taking longer than expected..." message; retry once; if still failing, show fallback static feedback |
| Gemini returns empty/malformed response | Show generic encouraging feedback: "Good thinking. Let's continue to the next section." |
| Apps Script GET fails | Use pre-written fallback excerpts only; no error shown to learner |
| Apps Script POST fails | Show "Your excerpt couldn't be shared this time, but your reflection is saved in your PDF." |
| Web Speech API unavailable | Hide the speech toggle; show "Speech input is not available in this browser. Please type your response." |
| jsPDF fails | Show responses on screen with a "Copy to clipboard" button as fallback |
| Lottie animation fails to load | Hide the player element; content still readable without it |

---

## References (for use in the Teaching Guide commentary)

- Cummins, J. (1979). Cognitive/academic language proficiency, linguistic interdependence, the optimum age question and some other matters. *Working Papers on Bilingualism*, *19*, 121–129.
- Dewey, J. (1938). *Experience and education*. Macmillan.
- García, O., & Wei, L. (2014). *Translanguaging: Language, bilingualism and education*. Palgrave Macmillan.
- Kolb, D. A. (1984). *Experiential learning: Experience as the source of learning and development*. Prentice Hall.
- Krashen, S. D. (1985). *The input hypothesis: Issues and implications*. Longman.
- Nation, I. S. P. (2001). *Learning vocabulary in another language*. Cambridge University Press.
- Piaget, J. (1970). *Science of education and the psychology of the child*. Orion Press.
- Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.
- Wenger, E. (1998). *Communities of practice: Learning, meaning, and identity*. Cambridge University Press.

*(Additional references on micro-reflection, mobile learning, AI scaffolding, social constructivism in digital environments, and the Haitian ELT context to be sourced for the commentary.)*
