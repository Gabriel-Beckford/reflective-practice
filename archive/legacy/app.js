/**
 * LEGACY ARCHIVE FILE (DEPRECATED)
 * Archived on: 2026-04-06
 * Reason: Replaced by canonical runtime path using index.html + deck-data.js + deck.js.
 * Do not load this file in active runtime script tags.
 */

const slides = [
  {
    id: "1.1",
    section: "SECTION 1: LEAD-IN",
    title: "Welcome to your asynchronous session on Kolb's Reflective Cycle.",
    type: "content",
    content: [
      "In today's session, you are going to progress through three stages of learning:",
      "Learning Goals (Bottom to Top):",
      "[Understand] Understand the basic principles of Kolb’s reflective cycle.",
      "[Understand] Identify the four phases of Kolb's reflective cycle.",
      "[Analyze/Evaluate] Distinguish between effective and weak reflective writing.",
      "[Create] Reflect on a personal critical incident."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "1.2",
    section: "SECTION 1: LEAD-IN",
    title: "3-2-1 Grounding Activity",
    type: "input",
    content: [
      "Before we begin, I would like you to take a moment to centre your attention and ground yourself in the present moment. Close your eyes, take a deep breath and notice…",
      "3 things you can see.",
      "2 things you can touch.",
      "1 thing you can hear."
    ],
    prompt: "Action:[Learner types their response to be saved for their final export.]",
    options: [],
    actions: ["Learner types their response to be saved for their final export."],
    feedbackMode: "none"
  },
  {
    id: "2.1",
    section: "SECTION 2: THEORY",
    title: "Why Experiential Learning?",
    type: "content",
    content: [
      "David Kolb argued that knowledge is created through the transformation of experience. Experiential learning is best conceived as a process, not in terms of fixed outcomes.",
      "Learning is a continuous, holistic process grounded in experience. It involves the whole person—your thoughts, your feelings, and your actions.",
      "Crucially, experiential learning and reflective practice co-exist. You cannot transform an experience into knowledge without intentionally reflecting upon it."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.2",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "single-choice",
    content: [],
    prompt: "According to Kolb, experiential learning is best understood as...",
    options: [
      "(a) a set of fixed outcomes and facts to memorize",
      "(b) a continuous, holistic process of transforming experience [Correct]",
      "(c) an innate talent that some educators possess naturally",
      "(d) a theory completely separated from classroom action"
    ],
    actions: [],
    feedbackMode: "[AI provides formative feedback on the chosen answer and bridges to the cycle.]"
  },
  {
    id: "2.3",
    section: "SECTION 2: THEORY",
    title: "Kolb's Four-Stage Cycle: Overview",
    type: "content",
    content: [
      "To make this process practical, Kolb proposed that effective learning moves through four phases, organised in a continuous cycle.",
      "Diagram Content: A continuous circular flow showing Concrete Experience (CE) → Reflective Observation (RO) → Abstract Conceptualisation (AC) → Active Experimentation (AE) → returning back to Concrete Experience (CE).",
      "The cycle maps two dimensions:",
      "Grasping an experience: from concrete experience (CE) to abstract conceptualisation (AC).",
      "Transforming an experience: from reflective observation (RO) to active experimentation (AE).",
      "Each phase builds directly upon the previous one. Let's look at them individually."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.4",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "multi-choice",
    content: [],
    prompt: "Select ALL the stages that make up Kolb's Experiential Learning Cycle:",
    options: [
      "Concrete Experience [Correct]",
      "Behavioural Conditioning",
      "Reflective Observation [Correct]",
      "Abstract Conceptualisation [Correct]",
      "Active Experimentation [Correct]",
      "Summative Assessment"
    ],
    actions: [],
    feedbackMode: "[AI confirms the four correct stages and asks a brief follow-up.]"
  },
  {
    id: "2.5",
    section: "SECTION 2: THEORY",
    title: "Concrete Experience (CE)",
    type: "content",
    content: [
      "Concrete Experience (CE) is the starting point: a specific event or situation you have lived through.",
      "The key is full involvement — being open, present, and willing to engage without preconceptions.",
      "Typical questions at this stage: What happened? When did it happen? Who was involved? What did you do?",
      "Contextual Example: You're teaching a reading comprehension lesson in Port-au-Prince. You use group work for the first time. One group finishes early and chats in Kreyòl; another struggles with vocabulary; a third group is deeply engaged."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.6",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "single-choice",
    content: [],
    prompt: "At the Concrete Experience stage, what is the learner primarily doing?",
    options: [
      "(a) Analysing why things happened",
      "(b) Planning what to do next time",
      "(c) Fully engaging in a specific, lived event [Correct]",
      "(d) Reading relevant literature"
    ],
    actions: [],
    feedbackMode: "[AI formative feedback + follow-up question.]"
  },
  {
    id: "2.7",
    section: "SECTION 2: THEORY",
    title: "Reflective Observation (RO)",
    type: "content",
    content: [
      "Reflective Observation (RO) is where you step back to examine the experience from multiple perspectives.",
      "You pay attention to feelings, reactions, and outcomes.",
      "Typical questions: How did I feel? What went well? What was surprising? What would a colleague observing my class have noticed?",
      "Contextual Example: After the reading lesson, you notice you felt frustrated when the first group switched to Kreyòl. You also recall feeling pleased that the third group was so engaged. You wonder what your head of department would have observed."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.8",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "single-choice",
    content: [],
    prompt: "Which of these is a Reflective Observation question?",
    options: [
      "(a) What will I do differently next time?",
      "(b) What does the literature say about group work?",
      "(c) How did I feel when the group switched to Kreyòl? [Correct]",
      "(d) What specific text did I use for the lesson?"
    ],
    actions: [],
    feedbackMode: "[AI formative feedback + follow-up.]"
  },
  {
    id: "2.9",
    section: "SECTION 2: THEORY",
    title: "Abstract Conceptualisation (AC)",
    type: "content",
    content: [
      "Abstract Conceptualisation (AC) is where you move from personal observation to broader analysis.",
      "You draw on theory, research, or general principles to make sense of the experience.",
      "Typical questions: What does the literature say? Can I identify a pattern? What framework helps explain what happened?",
      "Contextual Example: You read about Cummins' (1979) distinction between BICS and CALP and realise the struggling group may lack the academic literacy to decode the text independently. You also consider Vygotsky's ZPD."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.10",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "single-choice",
    content: [],
    prompt: "At the Abstract Conceptualisation stage, a teacher is primarily...",
    options: [
      "(a) Describing what happened during the lesson",
      "(b) Expressing how the lesson made them feel",
      "(c) Drawing on theory and principles to explain the experience [Correct]",
      "(d) Trying out a new teaching strategy"
    ],
    actions: [],
    feedbackMode: "[AI formative feedback + follow-up.]"
  },
  {
    id: "2.11",
    section: "SECTION 2: THEORY",
    title: "Active Experimentation (AE)",
    type: "content",
    content: [
      "Active Experimentation (AE) is where you plan and test new approaches based on your insights.",
      "You translate your conceptual understanding into practical action.",
      "This stage feeds directly back into a new Concrete Experience, continuing the cycle.",
      "Typical questions: What will I do differently? How will I test this idea? What specific steps will I take?",
      "Contextual Example: You plan a differentiated version of the reading task: a simplified text with glossary support for the struggling group, and an extension task for the group that finished early."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.12",
    section: "SECTION 2: THEORY",
    title: "Knowledge Check",
    type: "single-choice",
    content: [],
    prompt: "Which of these best represents Active Experimentation?",
    options: [
      "(a) I felt frustrated when the group was off-task",
      "(b) Cummins' BICS/CALP framework explains the vocabulary gap",
      "(c) I taught a reading lesson using group work",
      "(d) Next time, I'll provide a glossary and differentiate the text by level [Correct]"
    ],
    actions: [],
    feedbackMode: "[AI formative feedback + follow-up.]"
  },
  {
    id: "2.13",
    section: "SECTION 2: THEORY",
    title: "Chaining Micro-Reflections",
    type: "content",
    content: [
      "Deep reflection takes time. But in busy teaching contexts, a micro-reflection—a brief, focused pass through the cycle taking just a few minutes—is incredibly powerful.",
      "The key insight is chaining. When you chain multiple micro-reflections together over a week or a term, broader patterns of learning emerge that are invisible in a single cycle.",
      "Example Progression:",
      "Cycle 1 (Monday): Group work failed. I felt overwhelmed. Theory suggests they lacked scaffolding. Next class, I'll assign explicit roles.",
      "Cycle 2 (Wednesday): Tried explicit roles. Better engagement, but one student dominated. I realized I need to teach turn-taking. Next time, I'll use a 'talking token'.",
      "Cycle 3 (Friday): Used talking tokens. Quieter students finally spoke. It felt much more equitable. Vygotsky's peer scaffolding was evident. Next, I'll test this in a different subject.",
      "On the next slide, you'll analyse what learning transpired across this specific progression."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "2.14",
    section: "SECTION 2: THEORY",
    title: "Micro-Reflection Analysis",
    type: "input",
    content: [],
    prompt: "Review the three chained micro-reflections from the previous slide. In your own words, theorize what actual learning or professional growth took place across these cycles. What shifted for the teacher?",
    options: [],
    actions: ["Learner types short answer."],
    feedbackMode: "[AI evaluates the answer, highlighting how the learner correctly identified the evolution from blaming 'group work' to addressing specific pedagogical mechanics like roles and equity.]"
  },
  {
    id: "3.1",
    section: "SECTION 3: IDENTIFY THE PHASE",
    title: "Instructions",
    type: "content",
    content: [
      "Now you'll read short excerpts of reflective writing from teaching professionals.",
      "Your task is to identify which phase of Kolb's cycle each excerpt belongs to: CE, RO, AC, or AE.",
      "Read carefully — some phases can seem similar. Focus on what the writer is doing in the excerpt."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i * 2 + 2;
    return [
      {
        id: `3.${n}`,
        section: "SECTION 3: IDENTIFY THE PHASE",
        title: "Excerpt Reading",
        type: "content",
        content: [
          "Content: Short excerpt of reflective writing (e.g., \"Last Tuesday, I taught a vocabulary lesson...\")."
        ],
        prompt: "",
        options: [],
        actions: [],
        feedbackMode: "none"
      },
      {
        id: `3.${n + 1}`,
        section: "SECTION 3: IDENTIFY THE PHASE",
        title: "Excerpt Identification",
        type: "single-choice",
        content: [],
        prompt: "Which phase of Kolb's cycle does the previous excerpt represent?",
        options: [
          "Concrete Experience (CE)",
          "Reflective Observation (RO)",
          "Abstract Conceptualisation (AC)",
          "Active Experimentation (AE)"
        ],
        actions: [],
        feedbackMode: "[AI provides explanation of why the chosen phase is correct or incorrect based on what the writer is doing.]"
      }
    ];
  }).flat(),
  {
    id: "4.1",
    section: "SECTION 4: EVALUATE",
    title: "Evaluation Instructions",
    type: "content",
    content: [
      "Now you'll evaluate two complete pieces of reflective writing.",
      "One is strong; one has significant weaknesses.",
      "Your task is to identify the qualities that make reflective writing effective."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "4.2",
    section: "SECTION 4: EVALUATE",
    title: "Strong Example (Example A)",
    type: "content",
    content: [
      "During Thursday's speaking lesson... I asked students to role-play a job interview (CE). I noticed I felt anxious because several students kept switching to Kreyòl... A visiting teacher told me the students seemed confident using Kreyòl as a bridge (RO). Reading about translanguaging (García & Wei, 2014), I realised allowing strategic use of Kreyòl might support English development (AC). Next week, I will explicitly build in 'Kreyòl bridge' moments where students draft in Kreyòl before performing in English (AE)."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "4.3",
    section: "SECTION 4: EVALUATE",
    title: "Strong Example Evaluation",
    type: "multi-yn",
    content: [],
    prompt: "Does this reflection demonstrate each of the following qualities? (Select Yes or No for each)",
    options: [
      "Describes specific experience [Yes]",
      "Includes feelings/observations [Yes]",
      "Considers multiple perspectives [Yes]",
      "Connects to theory [Yes]",
      "Proposes actionable steps [Yes]",
      "Explains how to measure effect [Yes]"
    ],
    actions: [],
    feedbackMode: "[AI confirms why this is a strong reflection and asks a follow-up.]"
  },
  {
    id: "4.4",
    section: "SECTION 4: EVALUATE",
    title: "Weak Example (Example B)",
    type: "content",
    content: [
      "I taught a speaking lesson. It went okay. Some students spoke in Kreyòl which was a problem. I think group work is sometimes difficult in my context. Maybe I should try something different next time. I need to read more. Overall, the lesson was fine."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "4.5",
    section: "SECTION 4: EVALUATE",
    title: "Weak Example Evaluation",
    type: "multi-yn",
    content: [],
    prompt: "Does this reflection demonstrate each of the following qualities? (Select Yes or No for each)",
    options: [
      "Describes specific experience [No]",
      "Includes feelings/observations [No]",
      "Considers multiple perspectives [No]",
      "Connects to theory [No]",
      "Proposes actionable steps [No]",
      "Explains how to measure effect [No]"
    ],
    actions: [],
    feedbackMode: "[AI explains what is missing from this reflection.]"
  },
  {
    id: "4.6",
    section: "SECTION 4: EVALUATE",
    title: "Comparison Summary",
    type: "content",
    content: [
      "Strong reflection is specific, multi-perspective, theoretically grounded, and action-oriented.",
      "Weak reflection is vague, surface-level, and lacks theoretical connection."
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "4.7",
    section: "SECTION 4: EVALUATE",
    title: "Emotional Connection",
    type: "input",
    content: [],
    prompt: "Think about the strong example we just reviewed involving the tension between using English only vs. allowing a Kreyòl bridge. Have you experienced a similar situation or tension in your own classroom? Connect to this experience emotionally: how did it make you feel when it happened?",
    options: [],
    actions: ["Learner types their short answer."],
    feedbackMode: "[AI responds with empathy, explicitly connecting the learner's emotion to Kolb's Reflective Observation (RO) stage, validating that emotion is a critical data point in experiential learning.]"
  },
  {
    id: "T.1",
    section: "TRANSITION",
    title: "Transition to Chatbot",
    type: "transition",
    content: [
      "You're now ready to create your own micro-reflection. The AI will act as a conversational partner, dynamically guiding you through Kolb's cycle.",
      "You can type or speak. At the end, you'll download your full micro-reflection as a PDF.",
      "Subtext: When you've finished and downloaded that PDF, return here to complete the module."
    ],
    prompt: "",
    options: [],
    actions: ["Call-to-Action: Start Micro-Reflection Chatbot"],
    feedbackMode: "none"
  },
  {
    id: "5.1",
    section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
    title: "Welcome",
    type: "content",
    content: [
      "Heading: Micro-Reflection"
    ],
    prompt: "",
    options: [],
    actions: ["Learner selects \"Type\" or \"Speak\", then clicks \"Begin\"."],
    feedbackMode: "none"
  },
  {
    id: "5.2",
    section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
    title: "Phase Dialogue (Dynamic Progressive AI)",
    type: "content",
    content: [
      "Note: AI does not ask linear blocks of questions. It asks an initial prompt, then up to 2 dynamic follow-up questions to tease out details based specifically on what the user said.",
      "Phase 1 - Concrete Experience (CE):",
      "AI Initial Prompt: \"Let's begin with a Concrete Experience. Think of a recent teaching event. Briefly, what happened and who was involved?\"",
      "[User responds. AI asks 1-2 dynamic follow-ups based on the response. e.g., \"You mentioned the students were confused. What specific task were they trying to do when that confusion started?\"]",
      "Phase 2 - Reflective Observation (RO):",
      "AI Transition: \"Thank you, that gives a clear picture. Let's move to Reflective Observation. How did this specific moment make you feel, and what do you think the students were feeling?\"",
      "[User responds. AI asks 1-2 dynamic follow-ups based on the response.]",
      "Phase 3 - Abstract Conceptualisation (AC):",
      "AI Transition: \"[Validates reflection]. Now for Abstract Conceptualisation. Can you connect this to any teaching frameworks, or why do you think this happened on a broader level?\"",
      "[User responds. AI asks 1-2 dynamic follow-ups based on the response.]",
      "Phase 4 - Active Experimentation (AE):",
      "AI Transition: \"Finally, let's look at Active Experimentation. Based on these insights, what specific step will you take differently next time?\"",
      "[User responds. AI asks 1-2 dynamic follow-ups based on the response.]"
    ],
    prompt: "",
    options: [],
    actions: [],
    feedbackMode: "none"
  },
  {
    id: "5.3",
    section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
    title: "Summary & Export",
    type: "content",
    content: [
      "Content: Display summaries of the learner's responses mapped to CE, RO, AC, and AE."
    ],
    prompt: "",
    options: [],
    actions: [
      "Learner can opt-in to share excerpts with peers.",
      "Download PDF.",
      "Return to the slide deck."
    ],
    feedbackMode: "none"
  },
  {
    id: "6.1",
    section: "SECTION 6: EXPORT",
    title: "Download Deck Reflections",
    type: "content",
    content: [
      "Throughout this deck, you've completed grounding activities, analysed micro-reflections, and made emotional connections to the material.",
      "Click below to download these insights as a PDF. Note: This is separate from the micro-reflection PDF you generated in the chatbot."
    ],
    prompt: "",
    options: [],
    actions: ["Call-to-Action: Download Deck Responses (Compiles the Warm-Up, Micro-Reflection Analysis, and Emotional Connection responses)."],
    feedbackMode: "none"
  },
  {
    id: "7.1",
    section: "SECTION 7: FEEDBACK & CLOSE",
    title: "Quick Feedback",
    type: "content",
    content: [],
    prompt: "To help us improve these asynchronous modules, please take 30 seconds to leave your feedback.",
    options: [],
    actions: ["Call-to-Action: Open Feedback Form"],
    feedbackMode: "none"
  },
  {
    id: "7.2",
    section: "SECTION 7: FEEDBACK & CLOSE",
    title: "Closing 3-2-1 Grounding",
    type: "input",
    content: [
      "To close our session, let's complete a final 3-2-1 grounding activity. Based on what you learned today, write down:",
      "3 key takeaways about Kolb's experiential learning cycle.",
      "2 ideas you plan to test in your classroom (Active Experimentation).",
      "1 lingering question you still have.",
      "Thank You Message (Post-Submit): Thank you for completing this session. Your responses have been recorded. See you in the next lesson!"
    ],
    prompt: "Action:[Learner types their final response.]",
    options: [],
    actions: ["Learner types their final response."],
    feedbackMode: "none"
  }
];

window.APP_STORYBOARD = { slides };
