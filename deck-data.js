window.DECK_DATA = {
  title: "Content Storyboard: Kolb's Reflective Cycle",
  interactionSchema: {
    supportedTypes: [
      "content",
      "single-choice",
      "multi-choice",
      "multi-yn",
      "input",
      "drag-drop",
      "pelmanism",
      "table-completion",
      "short-answer",
      "gapfill",
      "matrix"
    ]
  },
  slides: [
    {
      id: "1.1",
      section: "SECTION 1: LEAD-IN",
      type: "content",
      badge: "Slide 1.1",
      title: "Welcome to your asynchronous session on Kolb's Reflective Cycle.",
      body: [
        "In today's session, you are going to progress through three stages of learning:"
      ],
      listTitle: "Learning Goals (Bottom to Top):",
      bullets: [
        "[Understand] Understand the basic principles of Kolb’s reflective cycle.",
        "[Understand] Identify the four phases of Kolb's reflective cycle.",
        "[Analyze/Evaluate] Distinguish between effective and weak reflective writing.",
        "[Create] Reflect on a personal critical incident."
      ]
    },
    {
      id: "1.2",
      section: "SECTION 1: LEAD-IN",
      type: "input",
      badge: "Slide 1.2",
      title: "3-2-1 Grounding Activity",
      body: [
        "Before we begin, I would like you to take a moment to centre your attention and ground yourself in the present moment. Close your eyes, take a deep breath and notice…",
        "3 things you can see.",
        "2 things you can touch.",
        "1 thing you can hear."
      ],
      prompt: "Action:[Learner types their response to be saved for their final export.]",
      responseKey: "grounding_open"
    },
    {
      id: "2.1",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.1",
      title: "Why Experiential Learning?",
      lead:
        "David Kolb argued that knowledge is created through the transformation of experience.",
      keyPoints: [
        "Experiential learning is best conceived as a process, not in terms of fixed outcomes.",
        "Learning is continuous and holistic: it involves your thoughts, feelings, and actions."
      ],
      callout: "Experiential learning and reflective practice co-exist.",
      actionPrompt: "As you progress, focus on how reflection turns experience into knowledge."
    },
    {
      id: "2.2",
      section: "SECTION 2: THEORY",
      type: "single-choice",
      badge: "Slide 2.2",
      title: "Knowledge Check",
      question: "According to Kolb, experiential learning is best understood as...",
      options: [
        "(a) a set of fixed outcomes and facts to memorize",
        "(b) a continuous, holistic process of transforming experience [Correct]",
        "(c) an innate talent that some educators possess naturally",
        "(d) a theory completely separated from classroom action"
      ],
      correctAnswers: [1],
      feedbackBridge: "How does seeing learning as a process (not a fixed outcome) prepare you to move through CE → RO → AC → AE?",
      responseKey: "check_2_2"
    },
    {
      id: "2.3",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.3",
      title: "Kolb's Four-Stage Cycle: Overview",
      lead:
        "Kolb proposed four phases organised in a continuous cycle to make experiential learning practical.",
      keyPoints: [
        "Diagram: Concrete Experience (CE) → Reflective Observation (RO) → Abstract Conceptualisation (AC) → Active Experimentation (AE) → back to CE.",
        "The cycle maps two dimensions:",
        "Grasping experience: CE to AC.",
        "Transforming experience: RO to AE."
      ],
      callouts: ["Each phase builds directly upon the previous one."],
      actionPrompt: "As you read the next slides, identify what changes from one phase to the next."
    },
    {
      id: "2.4",
      section: "SECTION 2: THEORY",
      type: "multi-choice",
      badge: "Slide 2.4",
      title: "Knowledge Check",
      question: "Select ALL the stages that make up Kolb's Experiential Learning Cycle:",
      options: [
        "Concrete Experience [Correct]",
        "Behavioural Conditioning",
        "Reflective Observation [Correct]",
        "Abstract Conceptualisation [Correct]",
        "Active Experimentation [Correct]",
        "Summative Assessment"
      ],
      correctAnswers: [0, 2, 3, 4],
      feedbackBridge: "Which of the four phases do you naturally start with in your own reflection, and which phase do you usually skip?",
      responseKey: "check_2_4"
    },
    {
      id: "2.5",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.5",
      title: "Concrete Experience (CE)",
      lead: "Concrete Experience (CE) starts with a specific event you lived through.",
      keyPoints: [
        "Stay fully involved: open, present, and engaged without preconceptions."
      ],
      questionSet: ["Typical questions: What happened? When did it happen? Who was involved? What did I do?"],
      examples: [
        "Contextual example: In a Port-au-Prince reading lesson, one group finishes early and chats in Kreyòl, one struggles with vocabulary, and one is deeply engaged."
      ],
      actionPrompt: "Capture only what happened first—interpretation comes later."
    },
    {
      id: "2.6",
      section: "SECTION 2: THEORY",
      type: "single-choice",
      badge: "Slide 2.6",
      title: "Knowledge Check",
      question: "At the Concrete Experience stage, what is the learner primarily doing?",
      options: [
        "(a) Analysing why things happened",
        "(b) Planning what to do next time",
        "(c) Fully engaging in a specific, lived event [Correct]",
        "(d) Reading relevant literature"
      ],
      correctAnswers: [2],
      feedbackBridge: "Think of one recent classroom moment. Which details belong to CE (just what happened) before interpretation begins?",
      responseKey: "check_2_6"
    },
    {
      id: "2.7",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.7",
      title: "Reflective Observation (RO)",
      lead: "Reflective Observation (RO) is where you step back and examine the event from multiple perspectives.",
      keyPoints: [
        "Focus on feelings, reactions, and outcomes."
      ],
      questionSet: ["Typical questions: How did I feel? What went well? What was surprising? What would a colleague have noticed?"],
      examples: [
        "Contextual example: You felt frustrated when one group switched to Kreyòl, but pleased by another group's engagement."
      ],
      actionPrompt: "Name at least one feeling and one observed pattern before moving to theory."
    },
    {
      id: "2.8",
      section: "SECTION 2: THEORY",
      type: "single-choice",
      badge: "Slide 2.8",
      title: "Knowledge Check",
      question: "Which of these is a Reflective Observation question?",
      options: [
        "(a) What will I do differently next time?",
        "(b) What does the literature say about group work?",
        "(c) How did I feel when the group switched to Kreyòl? [Correct]",
        "(d) What specific text did I use for the lesson?"
      ],
      correctAnswers: [2],
      feedbackBridge: "What feeling from your own practice might be useful to examine through an RO lens this week?",
      responseKey: "check_2_8"
    },
    {
      id: "2.9",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.9",
      title: "Abstract Conceptualisation (AC)",
      lead: "Abstract Conceptualisation (AC) moves from personal observation to broader analysis.",
      keyPoints: [
        "Use theory, research, or general principles to make sense of what happened."
      ],
      questionSet: ["Typical questions: What does the literature say? What pattern is emerging? Which framework explains this?"],
      examples: [
        "Contextual example: Cummins' BICS/CALP and Vygotsky's ZPD help explain why one group struggled with academic literacy demands."
      ],
      actionPrompt: "Connect your observation to at least one theory before planning next steps."
    },
    {
      id: "2.10",
      section: "SECTION 2: THEORY",
      type: "single-choice",
      badge: "Slide 2.10",
      title: "Knowledge Check",
      question: "At the Abstract Conceptualisation stage, a teacher is primarily...",
      options: [
        "(a) Describing what happened during the lesson",
        "(b) Expressing how the lesson made them feel",
        "(c) Drawing on theory and principles to explain the experience [Correct]",
        "(d) Trying out a new teaching strategy"
      ],
      correctAnswers: [2],
      feedbackBridge: "Name one concept or framework you could use to explain a teaching incident you recently observed.",
      responseKey: "check_2_10"
    },
    {
      id: "2.11",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.11",
      title: "Active Experimentation (AE)",
      lead: "Active Experimentation (AE) is where you plan and test new approaches.",
      keyPoints: [
        "Translate conceptual understanding into practical action.",
        "This stage feeds directly into a new Concrete Experience.",
      ],
      questionSet: [
        "Typical questions: What will I do differently? How will I test it? What exact steps will I take?"
      ],
      examples: [
        "Contextual example: Differentiate the next reading task with glossary support for one group and extension tasks for early finishers."
      ],
      actionPrompt: "Choose one specific, observable change to trial in your next lesson."
    },
    {
      id: "2.12",
      section: "SECTION 2: THEORY",
      type: "single-choice",
      badge: "Slide 2.12",
      title: "Knowledge Check",
      question: "Which of these best represents Active Experimentation?",
      options: [
        "(a) I felt frustrated when the group was off-task",
        "(b) Cummins' BICS/CALP framework explains the vocabulary gap",
        "(c) I taught a reading lesson using group work",
        "(d) Next time, I'll provide a glossary and differentiate the text by level [Correct]"
      ],
      correctAnswers: [3],
      feedbackBridge: "What is one specific, testable step you could take in your next lesson as AE?",
      responseKey: "check_2_12"
    },
    {
      id: "2.13",
      section: "SECTION 2: THEORY",
      type: "content",
      badge: "Slide 2.13",
      title: "Chaining Micro-Reflections",
      lead:
        "Micro-reflections are brief passes through Kolb's cycle that remain powerful in busy teaching contexts.",
      keyPoints: [
        "Chaining multiple micro-reflections across a week or term reveals learning patterns hidden in a single cycle.",
        "Cycle 1 (Monday): Group work failed; I felt overwhelmed; theory suggested weak scaffolding; next step was explicit roles.",
        "Cycle 2 (Wednesday): Explicit roles improved engagement, but one learner dominated; next step was teaching turn-taking with a talking token.",
        "Cycle 3 (Friday): Talking tokens increased quieter students' participation; peer scaffolding was evident; next step was testing in another subject."
      ],
      callout: "Pattern-based growth appears when reflection is repeated, not one-off.",
      actionPrompt: "On the next slide, identify what professional learning shifted across these three cycles."
    },
    {
      id: "2.14",
      section: "SECTION 2: THEORY",
      type: "input",
      badge: "Slide 2.14",
      title: "Micro-Reflection Analysis",
      body: [
        "Review the three chained micro-reflections from the previous slide. In your own words, theorize what actual learning or professional growth took place across these cycles. What shifted for the teacher?"
      ],
      prompt: "Action: [Learner types short answer.]",
      feedback: "[AI evaluates the answer, highlighting how the learner correctly identified the evolution from blaming 'group work' to addressing specific pedagogical mechanics like roles and equity.]",
      responseKey: "micro_reflection_analysis"
    },
    {
      id: "3.1",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "content",
      badge: "Slide 3.1",
      title: "Instructions",
      body: [
        "Now you'll read short excerpts of reflective writing from teaching professionals.",
        "Your task is to identify which phase of Kolb's cycle each excerpt belongs to: CE, RO, AC, or AE.",
        "Read carefully — some phases can seem similar. Focus on what the writer is doing in the excerpt."
      ]
    },
    {
      id: "3.2",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "content",
      badge: "Slide 3.2",
      title: "Excerpt Reading",
      pairingId: "pair_3_2_3_3",
      body: [
        "Last Tuesday, I taught a vocabulary lesson on health topics. Half the class finished quickly, while another group could not complete the matching task without support."
      ]
    },
    {
      id: "3.3",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "single-choice",
      badge: "Slide 3.3",
      title: "Excerpt Identification",
      question: "Which phase of Kolb's cycle does the previous excerpt represent?",
      options: [
        "Concrete Experience (CE)",
        "Reflective Observation (RO)",
        "Abstract Conceptualisation (AC)",
        "Active Experimentation (AE)"
      ],
      correctAnswers: [0],
      pairedExcerptId: "3.2",
      feedbackBridge: "What specific words in the excerpt show the writer is recounting events rather than analysing or planning?",
      rationaleByOption: {
        0: "Correct: the writer is describing what happened in a specific classroom event (CE).",
        1: "Not quite: RO focuses on interpretation of reactions or perspectives, which is not central here.",
        2: "Not quite: AC would connect the event to theory or general principles.",
        3: "Not quite: AE would propose a next-step action to test in future teaching."
      },
      responseKey: "phase_3_3"
    },
    {
      id: "3.4",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "content",
      badge: "Slide 3.4",
      title: "Excerpt Reading",
      pairingId: "pair_3_4_3_5",
      body: [
        "After class, I felt frustrated that stronger students dominated discussion. Looking back, I realize quieter students stopped volunteering after the first ten minutes."
      ]
    },
    { id: "3.5", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.5", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [1], pairedExcerptId: "3.4", feedbackBridge: "Which phrase signals observation and reflection on reactions rather than theory or action planning?", rationaleByOption: { 0: "Not quite: CE retells the event itself, but this excerpt mainly interprets reactions and outcomes.", 1: "Correct: the writer is stepping back to notice feelings and patterns in participation (RO).", 2: "Not quite: AC would explicitly connect to models, concepts, or research.", 3: "Not quite: AE would state a concrete strategy for the next lesson." }, responseKey: "phase_3_5" },
    { id: "3.6", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.6", title: "Excerpt Reading", pairingId: "pair_3_6_3_7", body: ["Reading about wait-time research, I realized my rapid questioning rewards confident students and disadvantages emerging bilingual learners."] },
    { id: "3.7", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.7", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [2], pairedExcerptId: "3.6", feedbackBridge: "What shows the writer is using conceptual knowledge to explain classroom dynamics?", rationaleByOption: { 0: "Not quite: CE would describe the original classroom event in detail.", 1: "Not quite: RO focuses on noticing responses, while this excerpt goes further into explanation.", 2: "Correct: the writer uses research to interpret experience, which is AC.", 3: "Not quite: AE would specify the next intervention to test." }, responseKey: "phase_3_7" },
    { id: "3.8", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.8", title: "Excerpt Reading", pairingId: "pair_3_8_3_9", body: ["In my next reading lesson, I will pre-teach three key terms, provide a bilingual glossary, and compare exit-ticket scores with today's lesson."] },
    { id: "3.9", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.9", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [3], pairedExcerptId: "3.8", feedbackBridge: "Which verbs in the excerpt indicate planned action and testing?", rationaleByOption: { 0: "Not quite: CE is past-tense description of what happened.", 1: "Not quite: RO would emphasise noticing and reflection rather than intervention.", 2: "Not quite: AC would centre explanatory theory or principles.", 3: "Correct: the writer is planning concrete, testable next steps, which is AE." }, responseKey: "phase_3_9" },
    { id: "3.10", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.10", title: "Excerpt Reading", pairingId: "pair_3_10_3_11", body: ["During the pair-work debate, two students switched to Kreyòl while one group finished early and began chatting off-task."] },
    { id: "3.11", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.11", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [0], pairedExcerptId: "3.10", feedbackBridge: "Does the excerpt mostly describe an event, reflect on it, theorize it, or redesign instruction?", rationaleByOption: { 0: "Correct: this is direct event description with no interpretation, fitting CE.", 1: "Not quite: RO would include reflection on meanings, reactions, or perspectives.", 2: "Not quite: AC would involve theoretical framing.", 3: "Not quite: AE would include a forward-looking action plan." }, responseKey: "phase_3_11" },
    { id: "3.12", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.12", title: "Excerpt Reading", pairingId: "pair_3_12_3_13", body: ["I noticed I only redirected off-task behaviour in one group; that may have signalled unequal expectations and lowered accountability in other groups."] },
    { id: "3.13", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.13", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [1], pairedExcerptId: "3.12", feedbackBridge: "Which part of the writing shows the teacher is reflecting on patterns and implications?", rationaleByOption: { 0: "Not quite: CE would stay at factual description of the lesson event.", 1: "Correct: the writer is reflecting on observed behaviour and possible implications (RO).", 2: "Not quite: AC would explicitly connect to an external concept or framework.", 3: "Not quite: AE would provide a specific next action to trial." }, responseKey: "phase_3_13" },
    { id: "3.14", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.14", title: "Excerpt Reading", pairingId: "pair_3_14_3_15", body: ["Using Vygotsky's ZPD helped me see that my extension task was too independent; students needed scaffolded prompts before open-ended discussion."] },
    { id: "3.15", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.15", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [2], pairedExcerptId: "3.14", feedbackBridge: "How does naming ZPD shift this excerpt from observation toward conceptual explanation?", rationaleByOption: { 0: "Not quite: CE would narrate what happened without theory.", 1: "Not quite: RO might include feeling/observation, but no theoretical lens.", 2: "Correct: the writer applies theory (ZPD) to interpret the experience, which is AC.", 3: "Not quite: AE would focus on planned changes and implementation." }, responseKey: "phase_3_15" },
    { id: "3.16", section: "SECTION 3: IDENTIFY THE PHASE", type: "content", badge: "Slide 3.16", title: "Excerpt Reading", pairingId: "pair_3_16_3_17", body: ["Tomorrow, I'll assign rotating discussion roles and track turn-taking with a participation chart to test whether quieter students contribute more."] },
    { id: "3.17", section: "SECTION 3: IDENTIFY THE PHASE", type: "single-choice", badge: "Slide 3.17", title: "Excerpt Identification", question: "Which phase of Kolb's cycle does the previous excerpt represent?", options: ["Concrete Experience (CE)", "Reflective Observation (RO)", "Abstract Conceptualisation (AC)", "Active Experimentation (AE)"], correctAnswers: [3], pairedExcerptId: "3.16", feedbackBridge: "Which evidence in the sentence shows a deliberate experiment with a measurable outcome?", rationaleByOption: { 0: "Not quite: CE would describe a completed event.", 1: "Not quite: RO reflects on what happened rather than implementing a trial.", 2: "Not quite: AC interprets through ideas; this excerpt is about action testing.", 3: "Correct: the writer plans a concrete intervention and measurement, which defines AE." }, responseKey: "phase_3_17" },
    {
      id: "4.1",
      section: "SECTION 4: EVALUATE",
      type: "content",
      badge: "Slide 4.1",
      title: "Evaluation Instructions",
      body: [
        "Now you'll evaluate two complete pieces of reflective writing.",
        "One is strong; one has significant weaknesses.",
        "Your task is to identify the qualities that make reflective writing effective."
      ]
    },
    {
      id: "4.2",
      section: "SECTION 4: EVALUATE",
      type: "content",
      badge: "Slide 4.2",
      title: "Strong Example (Example A)",
      fixedTextBlock: true,
      body: [
        "During Thursday's speaking lesson... I asked students to role-play a job interview (CE). I noticed I felt anxious because several students kept switching to Kreyòl... A visiting teacher told me the students seemed confident using Kreyòl as a bridge (RO). Reading about translanguaging (García & Wei, 2014), I realised allowing strategic use of Kreyòl might support English development (AC). Next week, I will explicitly build in 'Kreyòl bridge' moments where students draft in Kreyòl before performing in English (AE)."
      ]
    },
    {
      id: "4.3",
      section: "SECTION 4: EVALUATE",
      type: "multi-yn",
      badge: "Slide 4.3",
      title: "Strong Example Evaluation",
      question: "Does this reflection demonstrate each of the following qualities? (Select Yes or No for each)",
      statements: [
        "Describes specific experience",
        "Includes feelings/observations",
        "Considers multiple perspectives",
        "Connects to theory",
        "Proposes actionable steps",
        "Explains how to measure effect"
      ],
      expectedAnswers: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
      feedbackSuccess:
        "Strong reflection is specific, emotionally aware, and multi-perspective. It also uses theory to explain the event and includes clear, testable next steps.",
      feedbackNeedsWork:
        "For this strong example, each criterion should be marked Yes. Recheck where the writer describes evidence, uses theory, and plans measurable action.",
      responseKey: "eval_4_3"
    },
    {
      id: "4.4",
      section: "SECTION 4: EVALUATE",
      type: "content",
      badge: "Slide 4.4",
      title: "Weak Example (Example B)",
      fixedTextBlock: true,
      body: [
        "I taught a speaking lesson. It went okay. Some students spoke in Kreyòl which was a problem. I think group work is sometimes difficult in my context. Maybe I should try something different next time. I need to read more. Overall, the lesson was fine."
      ]
    },
    {
      id: "4.5",
      section: "SECTION 4: EVALUATE",
      type: "multi-yn",
      badge: "Slide 4.5",
      title: "Weak Example Evaluation",
      question: "Does this reflection demonstrate each of the following qualities? (Select Yes or No for each)",
      statements: [
        "Describes specific experience",
        "Includes feelings/observations",
        "Considers multiple perspectives",
        "Connects to theory",
        "Proposes actionable steps",
        "Explains how to measure effect"
      ],
      expectedAnswers: ["No", "No", "No", "No", "No", "No"],
      feedbackSuccess:
        "Weak reflection stays general and lacks evidence, theoretical grounding, and measurable next actions. This is why each criterion is No.",
      feedbackNeedsWork:
        "For this weak example, each criterion should be marked No. Review what is missing: specificity, multiple perspectives, theory, and concrete measurable action.",
      responseKey: "eval_4_5"
    },
    {
      id: "4.6",
      section: "SECTION 4: EVALUATE",
      type: "content",
      badge: "Slide 4.6",
      title: "Comparison Summary",
      body: [
        "Strong reflection is specific, multi-perspective, theoretically grounded, and action-oriented.",
        "Weak reflection is vague, surface-level, and lacks theoretical connection."
      ]
    },
    {
      id: "4.7",
      section: "SECTION 4: EVALUATE",
      type: "input",
      badge: "Slide 4.7",
      title: "Emotional Connection",
      body: [
        "Think about the strong example we just reviewed involving the tension between using English only vs. allowing a Kreyòl bridge. Have you experienced a similar situation or tension in your own classroom? Connect to this experience emotionally: how did it make you feel when it happened?"
      ],
      prompt: "Action: [Learner types their short answer.]",
      feedback: "[AI responds with empathy, explicitly connecting the learner's emotion to Kolb's Reflective Observation (RO) stage, validating that emotion is a critical data point in experiential learning.]",
      responseKey: "emotional_connection"
    },
    {
      id: "T.1",
      section: "Slide T.1: Transition to Chatbot",
      type: "transition",
      badge: "Slide T.1",
      title: "Transition to Chatbot",
      body: [
        "You're now ready to create your own micro-reflection. The AI will act as a conversational partner, dynamically guiding you through Kolb's cycle.",
        "You can type or speak. At the end, you'll download your full micro-reflection as a PDF."
      ],
      ctaLabel: "Start Micro-Reflection Chatbot",
      ctaUrl: "chatbot.html",
      ctaHelperText: "After you finish and download your chatbot PDF, return here to complete the module."
    },
    {
      id: "5.1",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "content",
      badge: "Screen 1",
      title: "Welcome",
      lead: "Heading: Micro-Reflection",
      actionPrompt: "Learner selects 'Type' or 'Speak', then clicks 'Begin'."
    },
    {
      id: "5.2",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "content",
      badge: "Screen 2",
      title: "Phase Dialogue (Dynamic Progressive AI)",
      lead:
        "The AI asks an initial prompt and up to two dynamic follow-up questions for each phase.",
      keyPoints: [
        "The dialogue flow covers CE, RO, AC, and AE in sequence."
      ],
      examples: [
        "Example: Phase 1 (CE) prompt — \"Let's begin with a Concrete Experience... what happened and who was involved?\"",
        "Example: Phase 2 (RO) transition — \"How did this moment make you feel, and what were students feeling?\"",
        "Example: Phase 3 (AC) transition — \"Can you connect this to frameworks, or explain why it happened more broadly?\"",
        "Example: Phase 4 (AE) transition — \"What specific step will you take differently next time?\""
      ],
      callouts: [
        "After each user response, AI asks 1–2 contextual follow-ups to deepen detail rather than using a rigid script.",
      ],
      actionPrompt: "Track how each follow-up clarifies evidence, interpretation, theory, and next action."
    },
    {
      id: "5.3",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "content",
      badge: "Screen 3",
      title: "Summary & Export",
      lead: "Display learner summaries mapped to CE, RO, AC, and AE.",
      keyPoints: [
        "Learner can opt in to share excerpts with peers.",
        "Learner can download a PDF export."
      ],
      actionPrompt: "After export, return to the slide deck to complete the module."
    },
    {
      id: "6.1",
      section: "SECTION 6: EXPORT",
      type: "content",
      badge: "Slide 6.1",
      title: "Download Deck Reflections",
      body: [
        "Throughout this deck, you've completed grounding activities, analysed micro-reflections, and made emotional connections to the material.",
        "Click below to download these insights as a PDF. Note: This is separate from the micro-reflection PDF you generated in the chatbot.",
        "Call-to-Action: Download Deck Responses (Compiles Warm-Up, Micro-Reflection Analysis, Emotional Connection, and Closing 3-2-1 responses)."
      ]
    },
    {
      id: "7.1",
      section: "SECTION 7: FEEDBACK & CLOSE",
      type: "content",
      badge: "Slide 7.1",
      title: "Quick Feedback",
      body: [
        "To help us improve these asynchronous modules, please take 30 seconds to leave your feedback.",
        "Call-to-Action: Open Feedback Form"
      ]
    },
    {
      id: "7.2",
      section: "SECTION 7: FEEDBACK & CLOSE",
      type: "input",
      badge: "Slide 7.2",
      title: "Closing 3-2-1 Grounding",
      body: [
        "To close our session, let's complete a final 3-2-1 grounding activity. Based on what you learned today, write down:",
        "3 key takeaways about Kolb's experiential learning cycle.",
        "2 ideas you plan to test in your classroom (Active Experimentation).",
        "1 lingering question you still have.",
        "Thank You Message (Post-Submit): Thank you for completing this session. Your responses have been recorded. See you in the next lesson!"
      ],
      prompt: "Action:[Learner types their final response.]",
      responseKey: "closing_grounding"
    }
  ]
};
