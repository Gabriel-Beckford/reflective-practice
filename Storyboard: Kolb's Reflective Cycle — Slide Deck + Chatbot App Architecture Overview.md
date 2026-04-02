Storyboard: Kolb's Reflective Cycle — Slide Deck + Chatbot App
Architecture Overview

The artefact is split into two deliverables:

Slide Deck (main artefact) — Sections 1–4, 6, 7. Content presentation, comprehension questions, phase identification, and evaluation. All interactions use the CSS design system (Material Design 3 tokens, .slide, .choice-item, .feedback-card, .reveal-step classes, etc.). Features a built-in PDF export for deck-based reflections.

Chatbot App (separate standalone app) — Section 5. AI-scaffolded micro-reflection with responsive Gemini dialogue (progressive questioning), speech-to-text, separate PDF export, and peer excerpt opt-in. Linked from a transition slide in the deck.

CSS & Visual Reference: All slides use the project CSS file's token system: --md-primary: #6750A4, --md-secondary: #4A635D, --md-tertiary: #B28600, surface/container hierarchy, --radius-sm/md/lg/xl, animation durations --dur-short/med/long, and the --ease cubic-bezier curve. Typography uses DM Sans for body and Fraunces for .slide-question headings.
Iconography Note: All animated icons must be visually consistent in character and style throughout the entire project (e.g., using LordIcon or a unified Lottie icon set).

Total Slide Count (Deck): 44 slides
Section	Slides	Count
1 — Welcome & Warm-Up	1.1–1.2	2
2 — Theory	2.1–2.14	14
3 — Phase Identification	3.1–3.17	17
4 — Evaluation & Connection	4.1–4.7	7
Transition to Chatbot	T.1	1
6 — Download Deck Reflection	6.1	1
7 — Feedback & Close	7.1–7.2	2
Total		44
Build Tasks Overview
Task	Slides	Section	Focus
Task 1	1.1, 1.2, 2.1, 2.2	Sections 1–2	Title, Pyramid Goals, 3-2-1 Grounding, Kolb intro
Task 2	2.3, 2.4, 2.5, 2.6	Section 2	Kolb Overview + CE
Task 3	2.7, 2.8, 2.9, 2.10	Section 2	RO + AC
Task 4	2.11, 2.12, 2.13, 2.14	Section 2	AE + Chained micro-reflection analysis (short answer)
Task 5	3.1, 3.2, 3.3, 3.4, 3.5	Section 3	Instructions + first 2 excerpt pairs
Task 6	3.6–3.9	Section 3	Excerpt pairs 3–4
Task 7	3.10–3.13	Section 3	Excerpt pairs 5–6
Task 8	3.14–3.17	Section 3	Excerpt pairs 7–8
Task 9	4.1, 4.2, 4.3	Section 4	Instructions + strong example + evaluation
Task 10	4.4, 4.5, 4.6, 4.7, T.1	Sections 4 + Transition	Weak example + comparison + emotional connection + chatbot link
Task 11	6.1, 7.1, 7.2	Sections 6–7	Deck PDF Download, Google Form feedback, Closing Grounding
Task 12	Chatbot App	Section 5	Separate app — AI dialogue (responsive), STT, PDF export
TASK 1 — Welcome, Warm-Up & Experiential Learning Intro

Slides: 1.1, 1.2, 2.1, 2.2

Slide 1.1 — Title & Learning Goals (Content)

Type: Title & Content (piecemeal reveal)
CSS classes: .slide, .reveal-step with .delay-1 through .delay-3
Section badge: .slide-badge — "SECTION 1 · LEAD-IN"

Visual elements:

Consistent animated icon (LordIcon style): waving hand or goal flag

Progress bar at 0% (.progress-fill { width: 0% })

CSS Pyramid structure for goals: three stacked, centered blocks. Base is widest, middle is narrower, top is narrowest.

Content (3 piecemeal steps — user taps to reveal each):

Step 1 (.reveal-step.delay-1): Icon + heading text in DM Sans:

"Welcome to your asynchronous session on Kolb's Reflective Cycle."

Step 2 (.reveal-step.delay-2): Lead-in text:

"In today's session, you are going to progress through three stages of learning:"

Step 3 (.reveal-step.delay-3): Bloom's Taxonomy Goals presented in a pyramid layout:

[Top Tier — Create] Co-construct a micro-reflection based on a personal teaching experience.
[Middle Tier — Analyze/Evaluate] Distinguish between effective and weak reflective writing.
[Base Tier — Understand] Identify the four phases of Kolb's reflective cycle.

Footer: .nav-btn.primary "Next →" (right-aligned). Slide counter: "1 / 44"

Notes: No back button on the first slide. The slideUp animation fires on load.

Slide 1.2 — 3-2-1 Grounding Activity (Input + AI Co-construction)

Type: Input prompt (AI-mediated short answer)
CSS classes: .slide, .slide-question

Visual elements:

Consistent animated icon: lightbulb / thinking icon

Material Design outlined text field (multi-line, min-height 120px)

.slide-badge — "REFLECT"

.feedback-card (hidden until submitted)

Content:

Prompt (.slide-question in Fraunces):

"Let's begin with a 3-2-1 grounding activity to anchor our session. Please write down:

3 things you notice about your current teaching practice.

2 challenges you are currently facing in your Haitian classroom.

1 goal you have for this session."

Text field: Material Design outlined textarea, placeholder text: "1. I notice... \n2. My challenges are... \n3. My goal is..."

Submit flow: Learner types → taps "Submit" → Gemini API evaluates the input and provides a dialogic response.

Feedback (.feedback-card):

AI acknowledges the learner's specific challenges and goals to establish co-construction and self-regulation.

Crucial: The AI must ask one follow-up question to tease out more detail about one of the points mentioned.

Learner can optionally reply to this follow-up via a newly revealed text field, or just proceed.

Footer: "← Back" | "2 / 44" | "Next →" (Enabled after initial submission)

Behaviour: The learner's text is stored in a JavaScript variable (userWarmUpResponse) to be included in the final Deck PDF export.

Slide 2.1 — Why Experiential Learning? (Content)

Type: Content (piecemeal reveal)
Section transition: New section badge appears — "SECTION 2 · THEORY"
CSS classes: .slide, .reveal-step

Visual elements:

Consistent animated icon: book/theory icon

.slide-badge — "SECTION 2 · THEORY"

Progress bar updates to ~5%

Content (3 piecemeal steps):

Step 1: Core theoretical claim (keywords in --md-primary bold):

"David Kolb argued that knowledge is created through the transformation of experience. Experiential learning is best conceived as a process, not in terms of fixed outcomes."

Step 2: Holistic nature:

"Learning is a continuous, holistic process grounded in experience. It involves the whole person—your thoughts, your feelings, and your actions."

Step 3: The role of reflection:

"Crucially, experiential learning and reflective practice co-exist. You cannot transform an experience into knowledge without intentionally reflecting upon it."

Footer: "← Back" | "3 / 44" | "Next →"

Slide 2.2 — Why Experiential Learning? (Question)

Type: Multiple choice — single answer
CSS classes: .slide, .slide-question, .choice-list, .choice-item

Visual elements:

.slide-badge — "QUESTION"

Four .choice-item buttons stacked vertically in .choice-list

.feedback-card

Content:

Question (.slide-question):

"According to Kolb, experiential learning is best understood as..."

Options (.choice-list):

(a) "a set of fixed outcomes and facts to memorize"

(b) "a continuous, holistic process of transforming experience" ✓

(c) "an innate talent that some educators possess naturally"

(d) "a theory completely separated from classroom action"

Interaction: Learner taps option → "Check" → .correct/.incorrect states → AI feedback.

Feedback (.feedback-card): Formative AI feedback + brief bridge to the cycle.

Footer: "← Back" | "4 / 44" | "Next →"

TASK 2 — Kolb's Cycle Overview + Concrete Experience

Slides: 2.3, 2.4, 2.5, 2.6

Slide 2.3 — Kolb's Four-Stage Cycle: Overview (Content)

Type: Content (piecemeal reveal, 4 steps)
CSS classes: .slide, .reveal-step

Visual elements:

Consistent animated icon: cycle/refresh loop

.slide-badge — "KOLB'S CYCLE"

Animated SVG diagram of the cycle

Progress bar: ~9%

Content (4 piecemeal steps):

Step 1:

"To make this process practical, Kolb proposed that effective learning moves through four phases, organised in a continuous cycle."

Step 2: Animated SVG diagram:

Circular layout: CE → RO → AC → AE → CE

Colour-coded: CE (gold), RO (purple), AC (green), AE (grey).

Animation highlights phases sequentially.

Step 3: Dimensions explained:

"The cycle maps two dimensions:"
— Grasping an experience: from concrete experience (CE) to abstract conceptualisation (AC).
— Transforming an experience: from reflective observation (RO) to active experimentation (AE).

Step 4:

"Each phase builds directly upon the previous one. Let's look at them individually."

Footer: "← Back" | "5 / 44" | "Next →"

Slide 2.4 — Kolb's Four-Stage Cycle: Overview (Question)

Type: Multiple choice — multiple answer (select all that apply)
CSS classes: .slide, .slide-question, .choice-list, .choice-item (checkboxes)

Visual elements:

.slide-badge — "QUESTION"

Six .choice-item elements with checkbox styling

.feedback-card

Content:

Question (.slide-question):

"Select ALL the stages that make up Kolb's Experiential Learning Cycle:"

Options:

☑ Concrete Experience ✓

☐ Behavioural Conditioning

☑ Reflective Observation ✓

☑ Abstract Conceptualisation ✓

☑ Active Experimentation ✓

☐ Summative Assessment

Feedback: AI confirms the four correct stages + one follow-up.

Footer: "← Back" | "6 / 44" | "Next →"

Slide 2.5 — Concrete Experience (CE) (Content)

Type: Content (piecemeal reveal, 4 steps)
CSS classes: .slide, .reveal-step

Visual elements:

Consistent animated icon: eye/observation icon

.slide-badge — "CE · CONCRETE EXPERIENCE" (background: --md-tertiary-container)

Progress bar: ~14%

Content (4 piecemeal steps):

Step 1:

"Concrete Experience (CE) is the starting point: a specific event or situation you have lived through."

Step 2:

"The key is full involvement — being open, present, and willing to engage without preconceptions."

Step 3: Guiding questions:

"Typical questions at this stage: What happened? When did it happen? Who was involved? What did you do?"

Step 4: Contextual example (Material Design card):

"You're teaching a reading comprehension lesson in Port-au-Prince. You use group work for the first time. One group finishes early and chats in Kreyòl; another struggles with vocabulary; a third group is deeply engaged."

Footer: "← Back" | "7 / 44" | "Next →"

Slide 2.6 — CE (Question)

Type: Multiple choice — single answer
CSS classes: .slide, .slide-question, .choice-list, .choice-item

Content:

Question (.slide-question):

"At the Concrete Experience stage, what is the learner primarily doing?"

Options:

(a) "Analysing why things happened"

(b) "Planning what to do next time"

(c) "Fully engaging in a specific, lived event" ✓

(d) "Reading relevant literature"

Feedback: AI formative feedback + follow-up question.

Footer: "← Back" | "8 / 44" | "Next →"

TASK 3 — Reflective Observation + Abstract Conceptualisation

Slides: 2.7, 2.8, 2.9, 2.10

Slide 2.7 — Reflective Observation (RO) (Content)

Type: Content (piecemeal reveal, 4 steps)
CSS classes: .slide, .reveal-step

Visual elements:

Consistent animated icon: mirror icon

.slide-badge — "RO · REFLECTIVE OBSERVATION" (background: --md-primary-container)

Progress bar: ~18%

Content (4 piecemeal steps):

Step 1:

"Reflective Observation (RO) is where you step back to examine the experience from multiple perspectives."

Step 2:

"You pay attention to feelings, reactions, and outcomes."

Step 3: Guiding questions:

"Typical questions: How did I feel? What went well? What was surprising? What would a colleague observing my class have noticed?"

Step 4: Contextual example:

"After the reading lesson, you notice you felt frustrated when the first group switched to Kreyòl. You also recall feeling pleased that the third group was so engaged. You wonder what your head of department would have observed."

Footer: "← Back" | "9 / 44" | "Next →"

Slide 2.8 — RO (Question)

Type: Multiple choice — single answer

Content:

Question (.slide-question):

"Which of these is a Reflective Observation question?"

Options:

(a) "What will I do differently next time?"

(b) "What does the literature say about group work?"

(c) "How did I feel when the group switched to Kreyòl?" ✓

(d) "What specific text did I use for the lesson?"

Feedback: AI formative feedback + follow-up.

Footer: "← Back" | "10 / 44" | "Next →"

Slide 2.9 — Abstract Conceptualisation (AC) (Content)

Type: Content (piecemeal reveal, 4 steps)

Visual elements:

Consistent animated icon: brain icon

.slide-badge — "AC · ABSTRACT CONCEPTUALISATION" (background: --md-secondary-container)

Progress bar: ~22%

Content (4 piecemeal steps):

Step 1:

"Abstract Conceptualisation (AC) is where you move from personal observation to broader analysis."

Step 2:

"You draw on theory, research, or general principles to make sense of the experience."

Step 3: Guiding questions:

"Typical questions: What does the literature say? Can I identify a pattern? What framework helps explain what happened?"

Step 4: Contextual example:

"You read about Cummins' (1979) distinction between BICS and CALP and realise the struggling group may lack the academic literacy to decode the text independently. You also consider Vygotsky's ZPD."

Footer: "← Back" | "11 / 44" | "Next →"

Slide 2.10 — AC (Question)

Type: Multiple choice — single answer

Content:

Question (.slide-question):

"At the Abstract Conceptualisation stage, a teacher is primarily..."

Options:

(a) "Describing what happened during the lesson"

(b) "Expressing how the lesson made them feel"

(c) "Drawing on theory and principles to explain the experience" ✓

(d) "Trying out a new teaching strategy"

Feedback: AI formative feedback + follow-up.

Footer: "← Back" | "12 / 44" | "Next →"

TASK 4 — Active Experimentation + Micro-Reflection Analysis

Slides: 2.11, 2.12, 2.13, 2.14

Slide 2.11 — Active Experimentation (AE) (Content)

Type: Content (piecemeal reveal, 5 steps)

Visual elements:

Consistent animated icon: rocket icon

.slide-badge — "AE · ACTIVE EXPERIMENTATION" (background: --md-surface-high)

Progress bar: ~27%

Content (5 piecemeal steps):

Step 1:

"Active Experimentation (AE) is where you plan and test new approaches based on your insights."

Step 2:

"You translate your conceptual understanding into practical action."

Step 3:

"This stage feeds directly back into a new Concrete Experience, continuing the cycle."

Step 4: Guiding questions:

"Typical questions: What will I do differently? How will I test this idea? What specific steps will I take?"

Step 5: Contextual example:

"You plan a differentiated version of the reading task: a simplified text with glossary support for the struggling group, and an extension task for the group that finished early."

Footer: "← Back" | "13 / 44" | "Next →"

Slide 2.12 — AE (Question)

Type: Multiple choice — single answer

Content:

Question (.slide-question):

"Which of these best represents Active Experimentation?"

Options:

(a) "I felt frustrated when the group was off-task"

(b) "Cummins' BICS/CALP framework explains the vocabulary gap"

(c) "I taught a reading lesson using group work"

(d) "Next time, I'll provide a glossary and differentiate the text by level" ✓

Feedback: AI formative feedback + follow-up.

Footer: "← Back" | "14 / 44" | "Next →"

Slide 2.13 — Chaining Micro-Reflections (Content)

Type: Content (piecemeal reveal, 4 steps)

Visual elements:

Consistent animated icon: chain link / infinite loop

.slide-badge — "MICRO-REFLECTION"

Progress bar: ~31%

Content (4 piecemeal steps):

Step 1:

"Deep reflection takes time. But in busy teaching contexts, a micro-reflection—a brief, focused pass through the cycle taking just a few minutes—is incredibly powerful."

Step 2: The Payoff:

"The key insight is chaining. When you chain multiple micro-reflections together over a week or a term, broader patterns of learning emerge that are invisible in a single cycle."

Step 3: Example progression card (Material Design card):

Cycle 1 (Monday): "Group work failed. I felt overwhelmed. Theory suggests they lacked scaffolding. Next class, I'll assign explicit roles."
Cycle 2 (Wednesday): "Tried explicit roles. Better engagement, but one student dominated. I realized I need to teach turn-taking. Next time, I'll use a 'talking token'."
Cycle 3 (Friday): "Used talking tokens. Quieter students finally spoke. It felt much more equitable. Vygotsky's peer scaffolding was evident. Next, I'll test this in a different subject."

Step 4: Forward Signpost:

"On the next slide, you'll analyse what learning transpired across this specific progression."

Footer: "← Back" | "15 / 44" | "Next →"

Slide 2.14 — Micro-Reflection Analysis (Question)

Type: Short answer → AI-assessed
CSS classes: .slide, .slide-question, Material Design text field

Visual elements:

.slide-badge — "ANALYSE"

Material Design text area

.feedback-card

Content:

Question (.slide-question):

"Review the three chained micro-reflections from the previous slide. In your own words, theorize what actual learning or professional growth took place across these cycles. What shifted for the teacher?"

Interaction:

Learner types their short answer.

Submits.

Gemini API reads the answer and provides rich feedback evaluating their analysis of the learning process across the cycles.

Feedback (.feedback-card): AI highlights how the learner correctly identified the evolution from blaming "group work" to addressing specific pedagogical mechanics (roles, equity).

Footer: "← Back" | "16 / 44" | "Next →"

TASK 5 — Section 3 Instructions + Excerpt Pairs 1–2

Slides: 3.1, 3.2, 3.3, 3.4, 3.5

Slide 3.1 — Phase Identification Instructions (Content)

Type: Content (piecemeal reveal, 3 steps)
Section transition: New .slide-badge — "SECTION 3 · IDENTIFY THE PHASE"

Visual elements:

Consistent animated icon: magnifying glass

Progress bar: ~36%

Content (3 piecemeal steps):

Step 1:

"Now you'll read short excerpts of reflective writing from teaching professionals."

Step 2:

"Your task is to identify which phase of Kolb's cycle each excerpt belongs to: CE, RO, AC, or AE."

Step 3:

"Read carefully — some phases can seem similar. Focus on what the writer is doing in the excerpt."

Footer: "← Back" | "17 / 44" | "Next →"

Technical note: App fetches approved peer excerpts from Apps Script endpoint, mixed with pre-written fallbacks.

Slides 3.2–3.17 — Excerpt + Phase Identification (8 pairs)

Pattern: 8 pairs (Excerpt Content Slide followed by MCQ Identification Slide).

Slide 3.2 — Excerpt 1 (Content)

Type: Content
Visuals: Material Design card containing excerpt text.
Content: Dynamically loaded excerpt (e.g., "Last Tuesday, I taught a vocabulary lesson...").
Footer: "← Back" | "18 / 44" | "Next →"

Slide 3.3 — Excerpt 1 Phase Identification (Question)

Type: Phase identification — four tappable chips (CE, RO, AC, AE).
Visuals: 2x2 grid of buttons.
Interaction: Tap chip → Check → Correct/incorrect → AI feedback explaining why.
Footer: "← Back" | "19 / 44" | "Next →"

Slide 3.4 — Excerpt 2 (Content)

Same template. Footer: "20 / 44"

Slide 3.5 — Excerpt 2 Phase Identification (Question)

Same template. Footer: "21 / 44"

TASK 6 — Excerpt Pairs 3–4

Slides: 3.6, 3.7, 3.8, 3.9

Slide 3.6 — Excerpt 3 (Content)

Same template. Footer: "22 / 44"

Slide 3.7 — Excerpt 3 Phase Identification (Question)

Same template. Footer: "23 / 44"

Slide 3.8 — Excerpt 4 (Content)

Same template. Footer: "24 / 44"

Slide 3.9 — Excerpt 4 Phase Identification (Question)

Same template. Footer: "25 / 44"

TASK 7 — Excerpt Pairs 5–6

Slides: 3.10, 3.11, 3.12, 3.13

Slide 3.10 — Excerpt 5 (Content)

Same template. Footer: "26 / 44"

Slide 3.11 — Excerpt 5 Phase Identification (Question)

Same template. Footer: "27 / 44"

Slide 3.12 — Excerpt 6 (Content)

Same template. Footer: "28 / 44"

Slide 3.13 — Excerpt 6 Phase Identification (Question)

Same template. Footer: "29 / 44"

TASK 8 — Excerpt Pairs 7–8

Slides: 3.14, 3.15, 3.16, 3.17

Slide 3.14 — Excerpt 7 (Content)

Same template. Footer: "30 / 44"

Slide 3.15 — Excerpt 7 Phase Identification (Question)

Same template. Footer: "31 / 44"

Slide 3.16 — Excerpt 8 (Content)

Same template. Footer: "32 / 44"

Slide 3.17 — Excerpt 8 Phase Identification (Question)

Same template. Footer: "33 / 44"

TASK 9 — Section 4 Instructions + Strong Example

Slides: 4.1, 4.2, 4.3

Slide 4.1 — Evaluation Instructions (Content)

Type: Content (piecemeal reveal)
Section transition: New .slide-badge — "SECTION 4 · EVALUATE"

Visual elements:

Consistent animated icon: scales / balance

Progress bar: ~77%

Content:

Step 1: "Now you'll evaluate two complete pieces of reflective writing."

Step 2: "One is strong; one has significant weaknesses."

Step 3: "Your task is to identify the qualities that make reflective writing effective."

Footer: "← Back" | "34 / 44" | "Next →"

Slide 4.2 — Strong Example (Content)

Type: Content (full mini-reflection in card)
Visual elements: .slide-badge — "EXAMPLE A"

Content:

"During Thursday's speaking lesson... I asked students to role-play a job interview (CE). I noticed I felt anxious because several students kept switching to Kreyòl... A visiting teacher told me the students seemed confident using Kreyòl as a bridge (RO). Reading about translanguaging (García & Wei, 2014), I realised allowing strategic use of Kreyòl might support English development (AC). Next week, I will explicitly build in 'Kreyòl bridge' moments where students draft in Kreyòl before performing in English (AE)."

Footer: "← Back" | "35 / 44" | "Next →"

Slide 4.3 — Strong Example Evaluation (Question)

Type: Descriptor selection — Yes/No toggles
Visual elements: Six descriptors, each with a Yes/No toggle switch.

Content:

Question: "Does this reflection demonstrate each of the following qualities?"

Descriptors: Describes specific experience (Yes), Includes feelings/observations (Yes), Considers multiple perspectives (Yes), Connects to theory (Yes), Proposes actionable steps (Yes), Explains how to measure effect (Yes).

Feedback: AI confirms why this is strong + follow-up.

Footer: "← Back" | "36 / 44" | "Next →"

TASK 10 — Weak Example + Comparison + Emotional Connect + Link

Slides: 4.4, 4.5, 4.6, 4.7, T.1

Slide 4.4 — Weak Example (Content)

Type: Content. Visuals: "EXAMPLE B" badge.
Content:

"I taught a speaking lesson. It went okay. Some students spoke in Kreyòl which was a problem. I think group work is sometimes difficult in my context. Maybe I should try something different next time. I need to read more. Overall, the lesson was fine."
Footer: "← Back" | "37 / 44" | "Next →"

Slide 4.5 — Weak Example Evaluation (Question)

Type: Yes/No toggles.
Content: Same 6 descriptors. All should be toggled No. AI feedback explains what's missing.
Footer: "← Back" | "38 / 44" | "Next →"

Slide 4.6 — Comparison Summary (Content)

Type: Content (piecemeal reveal, side-by-side comparison).
Content:

Step 1: Strong reflection is specific, multi-perspective, theoretically grounded, and action-oriented.

Step 2: Weak reflection is vague, surface-level, and lacks theoretical connection.
Footer: "← Back" | "39 / 44" | "Next →"

Slide 4.7 — Emotional Connection (Input — AI Mediated)

Type: Short answer + AI dialogue
CSS classes: .slide, .slide-question

Visual elements:

Consistent animated icon: heart / empathy

Text field for input

.feedback-card

Content:

Question (.slide-question):

"Think about the strong example we just reviewed involving the tension between using English only vs. allowing a Kreyòl bridge. Have you experienced a similar situation or tension in your own classroom? Connect to this experience emotionally: how did it make you feel when it happened?"

Interaction: Learner types their emotional response and connection.

Feedback: AI responds with empathy, explicitly connecting their emotion to Kolb's Reflective Observation (RO) stage, validating that emotion is a critical data point in experiential learning.

Footer: "← Back" | "40 / 44" | "Next →"

(Responses are saved to the deck's internal state for final PDF export).

Slide T.1 — Transition: Link to Chatbot App

Type: Call-to-action (link to separate app)

Visual elements:

Consistent animated icon: pencil / writing

.slide-badge — "ACTIVITY"

Big Material Design filled button.

Content:

Step 1: "You're now ready to create your own micro-reflection. The AI will act as a conversational partner, dynamically guiding you through Kolb's cycle."

Step 2: "You can type or speak. At the end, you'll download your full micro-reflection as a PDF."

Button: "Start Micro-Reflection Chatbot →" (Opens chatbot app in new tab. Passes warm-up responses if applicable).

Subtext: "When you've finished and downloaded that PDF, return here to complete the module."

Footer: "← Back" | "41 / 44" | "Next →"

TASK 11 — Deck Downloads, Feedback & Closing Grounding

Slides: 6.1, 7.1, 7.2

Slide 6.1 — Download Deck Reflections (Action)

Type: Action / Export
Section transition: .slide-badge — "SECTION 6 · EXPORT"

Visual elements:

Consistent animated icon: download / document

Material Design filled button

Progress bar: ~95%

Content:

Step 1: "Throughout this deck, you've completed grounding activities, analysed micro-reflections, and made emotional connections to the material."

Step 2: "Click below to download these insights as a PDF. Note: This is separate from the micro-reflection PDF you generated in the chatbot."

Button (.nav-btn.primary, full-width):

"📥 Download Deck Responses"

Action triggers jsPDF to compile userWarmUpResponse, the micro-reflection analysis (2.14), and the emotional connection response (4.7) into a structured document.

Footer: "← Back" | "42 / 44" | "Next →"

Slide 7.1 — Quick Feedback (Link)

Type: External Link
Section transition: .slide-badge — "SECTION 7 · FEEDBACK"

Visual elements:

External link icon

Progress bar: ~98%

Content:

Prompt: "To help us improve these asynchronous modules, please take 30 seconds to leave your feedback."

Button: "Open Feedback Form →" (Links directly to Google Form).

Footer: "← Back" | "43 / 44" | "Next →"

Slide 7.2 — Closing 3-2-1 Grounding (Input)

Type: Input Prompt (Final Grounding Activity)

Visual elements:

Consistent animated icon: celebration / target

Progress bar: 100%

Content:

Prompt (.slide-question):

"To close our session, let's complete a final 3-2-1 grounding activity. Based on what you learned today, write down:

3 key takeaways about Kolb's experiential learning cycle.

2 ideas you plan to test in your classroom (Active Experimentation).

1 lingering question you still have."

Text field: Material Design outlined textarea.

Submit: Tapping submit displays a final thank you message: "Thank you for completing this session. Your responses have been recorded. See you in the next lesson!"

Footer: "← Back" | "44 / 44" | No "Next" button (final slide)

TASK 12 — Chatbot App (Separate Standalone Application)

This is a separate HTML/CSS/JS application linked from Slide T.1.

Chatbot App Architecture

Purpose: Section 5 — AI-scaffolded micro-reflection. The learner is guided through each phase of Kolb's cycle via a responsive, dynamic dialogue with Gemini AI.

Tech stack: HTML/CSS/JS, Gemini API, Web Speech API, jsPDF. Shares the slide deck's CSS framework.

Chatbot App Screens
Screen 1 — Welcome & Input Mode

Visual elements:

Header with .header-label: "Micro-Reflection"

Consistent animated icon: pencil / writing

Input mode selector (✍️ Type | 🎙️ Speak)

"Begin" button

Screen 2 — Phase Dialogue (Responsive Flow)

Crucial Logic Change: The AI must not ask a linear, pre-determined block of questions. Instead, the dialogue is responsive and builds progressively.
Constraint: The AI asks an initial question, processes the user's response, and then asks up to a maximum of 2 dynamic follow-up questions per phase to tease out details before moving to the next phase (max 3 AI turns per phase).

Flow for each phase (CE → RO → AC → AE):

AI Initial Prompt (.chat-ai):

Example CE: "Let's begin with a Concrete Experience. Think of a recent teaching event. Briefly, what happened and who was involved?"

Learner responds (.chat-user)

AI Responsive Follow-up (.chat-ai):

AI evaluates the response. If it lacks detail, it asks a specific follow-up based only on what the user said (e.g., "You mentioned the students were confused. What specific task were they trying to do when that confusion started?").

Learner responds (.chat-user)

AI Phase Transition (.chat-ai):

Once sufficient detail is gathered (or max 3 turns reached), the AI briefly validates and transitions to the next phase.

Example Transition to RO: "Thank you, that gives a clear picture. Let's move to Reflective Observation. How did this specific moment make you feel, and what do you think the students were feeling?"

State machine: CE → RO → AC → AE. The app concatenates the conversation history for each phase into a JS object: { ce: '...', ro: '...', ac: '...', ae: '...' } for the final export.

Screen 3 — Summary, Edit & Export

Visual elements:

Four Material Design cards stacked vertically (CE, RO, AC, AE summaries).

Peer excerpt opt-in checkboxes.

"📥 Download PDF" button (jsPDF generates document).

"← Return to the slide deck" link.

Behaviour: Allows editing before final PDF export and database submission. Returns user to Section 6 of the deck.

CSS Reference Summary

All slides and the chatbot app share the same CSS file. Key class-to-component mappings:

CSS Class	Used For
.slide	Every slide card container (white bg, rounded corners, slide-up animation)
.slide-badge	Section/type label at top of each slide (gold container by default)
.slide-question	Question text in Fraunces serif font
.choice-list + .choice-item	MCQ option containers
.choice-item.selected	Purple highlight before answer check
.choice-item.correct	Green highlight with checkmark
.choice-item.incorrect	Faded state (opacity 0.45)
.feedback-card	AI feedback container (green bg, slides in)
.chat-bubble + .chat-ai / .chat-user	Chatbot conversation bubbles
.reveal-step + .revealed	Piecemeal content reveal animation
.delay-1 through .delay-4	Staggered animation delays
.nav-btn / .nav-btn.primary	Navigation buttons (outlined / filled)
.progress-track + .progress-fill	Top progress bar
.slide-counter	Slide number display (e.g., "12 / 44")

Colour tokens used for phase identification:

CE: --md-tertiary-container (#FFDEA4, gold)

RO: --md-primary-container (#EADDFF, purple)

AC: --md-secondary-container (#CCE8E0, green)

AE: --md-surface-high (#ECE6F0, grey)
