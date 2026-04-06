/*
Schema quick-reference (required fields by slide type)
======================================================
Shared required slide fields:
- id, section, sectionId, type, title
- timingMeta (metadata only; never learner-facing UI copy)
- pathwayTags (array)
- assets (object)
- aiConfig (object)

Interaction required fields:
- single-choice: question, options[], correctAnswers[], responseKey
- multi-choice: question, options[], correctAnswers[], responseKey
- multi-yn: question, statements[], expectedAnswers[], responseKey
- input: prompt, responseKey
- short-answer: prompt|question, responseKey
- drag-drop: instructions, items[], targets[], pairs[], responseKey
- table-completion: table schema fields + responseKey
- gapfill: segments/items + responseKey
- matrix: question, rows[], columns[]|default, expectedAnswers, responseKey

Content-only slides:
- content / transition / cta: responseKey optional
*/
window.DECK_DATA = {
  title: "Content Storyboard: Kolb's Reflective Cycle",
  interactionSchema: {
    supportedTypes: [
      "section-title",
      "pathway-selector",
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
      "matrix",
      "accordion",
      "quote-card",
      "interactive-diagram",
      "padlet-embed",
      "ai-chat",
      "linking",
      "rubric-grade"
    ]
  },
  mediaSchema: {
    supportedTypes: ["image", "image-bordered", "icon", "icon-bordered"],
    fields: ["type", "src", "alt", "caption", "credit"]
  },
  slides: [
    {
      id: "00.1",
      section: "SECTION 0: API GATE",
      type: "api-gate-connect",
      badge: "Slide 00.1",
      title: "Connect your AI workspace",
      body: [
        "Enter your API key and test your connection before starting the session."
      ],
      statusLabels: {
        idle: "Not connected",
        testing: "Testing",
        connected: "Connected",
        failed: "Failed"
      },
      responseKey: "api_connection_gate"
    },
    {
      id: "00.2",
      section: "SECTION 0: API GATE",
      type: "api-gate-confirm",
      badge: "Slide 00.2",
      title: "Connection established",
      body: [
        "Your AI workspace is connected.",
        "Continue to begin your asynchronous session on Kolb's reflective learning cycle."
      ],
      ctaLabel: "Continue to session"
    },
    {
      id: "01.1",
      section: "SECTION 1: LEAD-IN",
      type: "section-title",
      badge: "Slide 01.1",
      title: "Introduction to Kolb's Reflective Learning Cycle",
      body: [
        "Welcome to your asynchronous session."
      ],
      backgroundImage: "images/title_background_image.jpg"
    },
    {
      id: "01.2",
      section: "SECTION 1: LEAD-IN",
      type: "grounding-321",
      badge: "Slide 01.2",
      title: "3-2-1 Grounding Activity",
      body: [
        "Before we begin, take a moment to centre yourself in the present.",
        "3 things you can see.",
        "2 things you can touch.",
        "1 thing you can hear."
      ],
      groundingPrompts: [
        { icon: "visibility", label: "See", prompt: "3 things you can see" },
        { icon: "front_hand", label: "Touch", prompt: "2 things you can touch" },
        { icon: "hearing", label: "Hear", prompt: "1 thing you can hear" }
      ],
      prompt: "Type your 3-2-1 grounding response and click send.",
      responseKey: "grounding321_opening",
      backgroundImage: "images/grounding_activity_background.jpg"
    },
    {
      id: "01.3",
      section: "SECTION 1: LEAD-IN",
      type: "ilo-stack",
      badge: "Slide 01.3",
      title: "Intended Learning Outcomes",
      body: [
        "These outcomes are organised from foundational understanding to creation."
      ],
      iloLayers: [
        { level: "Understand", text: "Understand the basic principles of Kolb’s reflective cycle." },
        { level: "Understand", text: "Identify the four phases of Kolb's reflective cycle." },
        { level: "Analyze/Evaluate", text: "Distinguish between effective and weak reflective writing." },
        { level: "Create", text: "Reflect on a personal critical incident." }
      ],
      prompt: "Which ILO appeals to you most?",
      responseKey: "iloAppealResponse"
    },
    {
      id: "01.4",
      section: "SECTION 1: LEAD-IN",
      type: "personalisation-mbti",
      badge: "Slide 01.4",
      title: "Personalisation",
      body: [
        "If you know your MBTI personality type, select it below.",
        "If not, you can skip this step."
      ],
      mbtiOptions: [
        "INTJ","INTP","ENTJ","ENTP",
        "INFJ","INFP","ENFJ","ENFP",
        "ISTJ","ISFJ","ESTJ","ESFJ",
        "ISTP","ISFP","ESTP","ESFP"
      ],
      responseKey: "mbtiType"
    },
    {
      id: "01.5",
      section: "SECTION 1: LEAD-IN",
      type: "pathway-selector",
      badge: "Slide 01.5",
      title: "Choose your pathway",
      body: [
        "Select the pathway that best matches your available time and focus."
      ],
      responseKey: "selectedPathway",
      pathways: [
        { id: "full", label: "Full Journey", timing: "90 min", sections: ["SECTION 2: THEORY", "SECTION 3: IDENTIFY THE PHASE", "SECTION 4: EVALUATE", "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)"] },
        { id: "theory-focused", label: "Theory Focus", timing: "60 min", sections: ["SECTION 2: THEORY", "SECTION 4: EVALUATE"] },
        { id: "practice-focused", label: "Practice Focus", timing: "60 min", sections: ["SECTION 3: IDENTIFY THE PHASE", "SECTION 4: EVALUATE"] },
        { id: "chatbot-focused", label: "Chatbot Focus", timing: "50 min", sections: ["SECTION 2: THEORY", "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)"] },
        { id: "fast-track", label: "Fast Track", timing: "35 min", sections: ["SECTION 2: THEORY"] },
        { id: "mapping-track", label: "Input Mapping Track", timing: "45 min", sections: ["SECTION 3: IDENTIFY THE PHASE"] },
        { id: "evaluation-track", label: "Evaluation Track", timing: "45 min", sections: ["SECTION 4: EVALUATE"] },
        { id: "chatbot-only", label: "Chatbot Only", timing: "30 min", sections: ["SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)"] }
      ]
    },
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
      id: "02.1",
      section: "SECTION 2: THEORY",
      type: "section-title",
      badge: "Slide 02.1",
      title: "Kolb's Experiential Learning Cycle",
      body: [
        "In this section, you will use a critical incident from your own context to move through Kolb's reflective cycle.",
        "Capture your ideas as you go. Your notes will be saved automatically."
      ],
      responseKey: "theory_section_title"
    },
    {
      id: "02.2",
      section: "SECTION 2: THEORY",
      type: "ai-chat",
      badge: "Slide 02.2",
      title: "Using Your Experience",
      body: [
        "Describe one recent critical incident from your teaching or learning context.",
        "Aim for one concrete incident, not a general pattern."
      ],
      prompt: "What happened, where, and who was involved?",
      placeholder: "Example: During group work, one group disengaged while another dominated the task...",
      responseKey: "theory_critical_incident",
      sharedResponseKey: "criticalIncidentText",
      aiPrompts: [
        {
          id: "incident-clarify",
          label: "Ask AI to clarify the incident",
          promptTemplate: "You are a supportive instructional coach. Ask one short follow-up question that helps clarify this critical incident:\n\n{{learnerInput}}",
          fallbackText: "Try this self-check: add one specific detail about what happened first, then one detail about what happened next."
        }
      ]
    },
    {
      id: "02.3",
      section: "SECTION 2: THEORY",
      type: "padlet-embed",
      badge: "Slide 02.3",
      title: "Share to Padlet",
      body: [
        "Optional: Share a one-sentence summary of your critical incident to the class Padlet wall."
      ],
      padletUrl: "https://padlet.com/embed/placeholder",
      responseKey: "theory_padlet_share",
      padletShareTextKey: "theory_padlet_share_text",
      copyTextTemplate: "Critical incident summary: {{learnerInput}}",
      fallbackCopyText: "Padlet is unavailable right now. Copy your summary into your notes and post it later."
    },
    {
      id: "02.4",
      section: "SECTION 2: THEORY",
      type: "ai-chat",
      badge: "Slide 02.4",
      title: "Recalling a Critical Incident",
      body: [
        "Use guided prompts to move through the four phases of reflection."
      ],
      prompt: "Work through CE → RO → AC → AE using your incident from slide 02.2.",
      responseKey: "theory_phase_reflection",
      aiPrompts: [
        {
          id: "phase-ce",
          label: "Concrete Experience",
          sharedPhaseKey: "ce",
          promptTemplate: "Ask one concise question about Concrete Experience only (facts, actors, sequence) for this incident:\n\n{{learnerInput}}",
          fallbackText: "Concrete Experience fallback: What happened first, and what did you observe directly?"
        },
        {
          id: "phase-ro",
          label: "Reflective Observation",
          sharedPhaseKey: "ro",
          promptTemplate: "Ask one concise Reflective Observation question (feelings/reactions/patterns) for this incident:\n\n{{learnerInput}}",
          fallbackText: "Reflective Observation fallback: What surprised or concerned you in the moment?"
        },
        {
          id: "phase-ac",
          label: "Abstract Conceptualisation",
          sharedPhaseKey: "ac",
          promptTemplate: "Ask one concise Abstract Conceptualisation question (theory/patterns/principles) for this incident:\n\n{{learnerInput}}",
          fallbackText: "Abstract Conceptualisation fallback: Which idea or framework best explains why this happened?"
        },
        {
          id: "phase-ae",
          label: "Active Experimentation",
          sharedPhaseKey: "ae",
          promptTemplate: "Ask one concise Active Experimentation question (next-step action/testing) for this incident:\n\n{{learnerInput}}",
          fallbackText: "Active Experimentation fallback: What will you try differently in your next similar lesson?"
        }
      ]
    },
    {
      id: "02.5",
      section: "SECTION 2: THEORY",
      type: "quote-card",
      badge: "Slide 02.5",
      title: "Kolb on Experiential Learning",
      quote: "Learning is the process whereby knowledge is created through the transformation of experience.",
      quoteSource: "David A. Kolb (1984)",
      backgroundImage: "images/quote_card_Kolb.jpg",
      responseKey: "theory_quote_kolb_note",
      prompt: "Write one sentence about how this quote connects to your incident."
    },
    {
      id: "02.6",
      section: "SECTION 2: THEORY",
      type: "accordion",
      badge: "Slide 02.6",
      title: "Six Principles of Experiential Learning",
      body: [
        "Expand each principle to review what it means in practice."
      ],
      responseKey: "theory_principles_accordion",
      accordionViewedKey: "theory_accordion_viewed_items",
      sections: [
        {
          heading: "Learning is a process, not an outcome",
          bullets: [
            "Focus on growth over time, not one final score.",
            "Use reflection checkpoints across a sequence of lessons."
          ]
        },
        {
          heading: "All learning relearns",
          bullets: [
            "Learners connect new ideas to existing beliefs and habits.",
            "Invite learners to compare old and new understandings."
          ]
        },
        {
          heading: "Learning requires resolving tensions",
          bullets: [
            "Balance feeling and thinking, observing and acting.",
            "Design tasks that ask learners to switch modes intentionally."
          ]
        },
        {
          heading: "Learning is holistic",
          bullets: [
            "Cognition, emotion, and action are interconnected.",
            "Evaluate not just what learners know, but how they participate."
          ]
        },
        {
          heading: "Learning is transactional",
          bullets: [
            "People and environment shape each other continuously.",
            "Adapt activities to classroom context and constraints."
          ]
        },
        {
          heading: "Learning creates knowledge",
          bullets: [
            "Knowledge emerges through acting, reflecting, and revising.",
            "Capture evidence from practice to inform next decisions."
          ]
        }
      ]
    },
    {
      id: "02.7",
      section: "SECTION 2: THEORY",
      type: "quote-card",
      badge: "Slide 02.7",
      title: "Critical Reflection and Practice",
      quote: "Reflection is not an individual, internal process only. It is shaped by social, political and organisational contexts.",
      quoteSource: "Vince (1998)",
      responseKey: "theory_quote_vince_note",
      prompt: "What context in your setting most shapes how you reflect?"
    },
    {
      id: "02.8",
      section: "SECTION 2: THEORY",
      type: "interactive-diagram",
      badge: "Slide 02.8",
      title: "Dimensions of Learning Space",
      body: [
        "Select each dimension to reveal its sub-dimensions, then capture one insight."
      ],
      responseKey: "theory_learning_space_insight",
      diagramViewedKey: "theory_learning_space_viewed",
      dimensions: [
        {
          id: "psychological",
          label: "Psychological",
          details: ["Confidence", "Motivation", "Perceived safety"]
        },
        {
          id: "social",
          label: "Social",
          details: ["Peer relationships", "Group norms", "Participation patterns"]
        },
        {
          id: "institutional",
          label: "Institutional",
          details: ["Curriculum demands", "Assessment rules", "Time structures"]
        },
        {
          id: "cultural",
          label: "Cultural",
          details: ["Language expectations", "Community values", "Identity positioning"]
        },
        {
          id: "physical",
          label: "Physical",
          details: ["Room layout", "Resources", "Noise and movement"]
        }
      ],
      prompt: "Which dimension most influenced your incident, and why?"
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
      media: {
        type: "icon",
        src: "experiment",
        alt: "Classroom experimentation icon.",
        caption: "Active Experimentation is visible in planned classroom moves that are trialled and observed.",
      },
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
      id: "03.1",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "drag-drop",
      badge: "Slide 03.1",
      title: "Match Reflection Descriptors to Kolb Phases",
      body: [
        "Review your earlier critical incident and match each descriptor to the correct phase."
      ],
      instructions: "Drag each descriptor into the phase where it best belongs.",
      priorReflection: {
        title: "Your prior critical incident",
        sharedKey: "criticalIncidentText",
        fallback: "No critical incident has been captured yet. Return to slide 02.2 and add one before completing this activity."
      },
      items: [
        { id: "d1", label: "Retelling exactly what happened" },
        { id: "d2", label: "Noticing feelings and reactions" },
        { id: "d3", label: "Applying a concept or theory" },
        { id: "d4", label: "Planning a testable next step" }
      ],
      targets: [
        { id: "ce", label: "Concrete Experience (CE)" },
        { id: "ro", label: "Reflective Observation (RO)" },
        { id: "ac", label: "Abstract Conceptualisation (AC)" },
        { id: "ae", label: "Active Experimentation (AE)" }
      ],
      pairs: [
        { id: "d1", targetId: "ce" },
        { id: "d2", targetId: "ro" },
        { id: "d3", targetId: "ac" },
        { id: "d4", targetId: "ae" }
      ],
      responseKey: "phaseMatch_descriptors"
    },
    {
      id: "03.2",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "drag-drop",
      badge: "Slide 03.2",
      title: "Map Question Stems to the Right Phase",
      instructions: "Place each question stem into the most appropriate zone. The zones are intentionally unlabeled.",
      showTargetLabels: false,
      items: [
        { id: "q1", label: "What happened first, and who was involved?" },
        { id: "q2", label: "What did I directly observe during the incident?" },
        { id: "q3", label: "What emotions did I notice in myself?" },
        { id: "q4", label: "What pattern became visible after the lesson?" },
        { id: "q5", label: "Which concept helps explain this event?" },
        { id: "q6", label: "How does this connect with known pedagogy?" },
        { id: "q7", label: "What change will I try next time?" },
        { id: "q8", label: "How will I measure whether that change worked?" }
      ],
      targets: [
        { id: "ce" },
        { id: "ro" },
        { id: "ac" },
        { id: "ae" }
      ],
      pairs: [
        { id: "q1", targetId: "ce" },
        { id: "q2", targetId: "ce" },
        { id: "q3", targetId: "ro" },
        { id: "q4", targetId: "ro" },
        { id: "q5", targetId: "ac" },
        { id: "q6", targetId: "ac" },
        { id: "q7", targetId: "ae" },
        { id: "q8", targetId: "ae" }
      ],
      responseKey: "phaseMatch_questions"
    },
    {
      id: "03.3",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "linking",
      badge: "Slide 03.3",
      title: "Link Descriptors to Phases in Your Reflection",
      instructions: "Use the dropdowns to link each descriptor to the phase that best matches your own reflection.",
      reviewTitle: "Click to review phase definitions",
      phaseDefinitions: [
        { id: "ce", label: "Concrete Experience (CE)", text: "Describes the event itself: what happened, where, and with whom." },
        { id: "ro", label: "Reflective Observation (RO)", text: "Explores reactions, feelings, and observed patterns." },
        { id: "ac", label: "Abstract Conceptualisation (AC)", text: "Uses concepts, theory, or principles to explain what occurred." },
        { id: "ae", label: "Active Experimentation (AE)", text: "Identifies a concrete action to test in a future situation." }
      ],
      descriptors: [
        { id: "link1", label: "Narrates event details" },
        { id: "link2", label: "Interprets reactions and implications" },
        { id: "link3", label: "Connects with concept or framework" },
        { id: "link4", label: "Commits to a measurable next step" }
      ],
      priorReflection: {
        title: "Your prior critical incident",
        sharedKey: "criticalIncidentText",
        fallback: "No saved incident found yet. Go back to slide 02.2, add your incident, then return here."
      },
      expectedLinks: {
        link1: "ce",
        link2: "ro",
        link3: "ac",
        link4: "ae"
      },
      responseKey: "descriptorLinks"
    },
    {
      id: "03.4",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "matrix",
      badge: "Slide 03.4",
      title: "Grasping or Constructing?",
      question: "Classify each Kolb phase as primarily grasping knowledge or constructing knowledge.",
      columns: ["Grasping knowledge", "Constructing knowledge"],
      rows: [
        { id: "ce", label: "Concrete Experience (CE)" },
        { id: "ro", label: "Reflective Observation (RO)" },
        { id: "ac", label: "Abstract Conceptualisation (AC)" },
        { id: "ae", label: "Active Experimentation (AE)" }
      ],
      expectedAnswers: {
        ce: "Grasping knowledge",
        ac: "Grasping knowledge",
        ro: "Constructing knowledge",
        ae: "Constructing knowledge"
      },
      responseKey: "grasp_transform_classification"
    },
    {
      id: "03.5",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "short-answer",
      badge: "Slide 03.5",
      title: "Reflective Process Check 1",
      question: "When you reread your incident, which detail best anchors your Concrete Experience and why?",
      minWords: 10,
      responseKey: "phase_dialogue_q1"
    },
    {
      id: "03.6",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "short-answer",
      badge: "Slide 03.6",
      title: "Reflective Process Check 2",
      question: "What is one pattern you noticed after stepping back from the event?",
      minWords: 10,
      responseKey: "phase_dialogue_q2"
    },
    {
      id: "03.7",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "short-answer",
      badge: "Slide 03.7",
      title: "Reflective Process Check 3",
      question: "Which idea or framework helps you explain the incident most clearly?",
      minWords: 10,
      responseKey: "phase_dialogue_q3"
    },
    {
      id: "03.8",
      section: "SECTION 3: IDENTIFY THE PHASE",
      type: "short-answer",
      badge: "Slide 03.8",
      title: "Reflective Process Check 4",
      question: "State one action you will test and describe how you will know whether it worked.",
      minWords: 12,
      responseKey: "phase_dialogue_q4"
    },
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
      id: "05.1",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.1",
      title: "Rubric Calibration: Exemplar A",
      lead: "Read the exemplar, assign a rubric grade, and explain your rationale.",
      responseKey: "rubric_grade_05_1",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Concrete Experience specificity",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar A — Concrete Experience",
        text:
          "Last Thursday during my mixed-ability Grade 9 science lab, I asked groups to design a filtration system with limited materials. One group finished quickly and became loud, while another group stopped participating after a disagreement about roles. I noticed two students quietly packing up before the timer ended. I paused the class with four minutes remaining, reset expectations, and assigned each team a spokesperson and a materials manager for the final share-out."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.2",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.2",
      title: "Rubric Calibration: Exemplar B",
      lead: "Focus on the learner's reflective observation and emotional awareness.",
      responseKey: "rubric_grade_05_2",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Reflective Observation depth",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar B — Reflective Observation",
        text:
          "I felt frustrated when students ignored the peer feedback routine, but I also realized my instructions were rushed because we were behind schedule. Several students looked uncertain, and two asked classmates what to do instead of asking me. Looking back, I think my tone became sharper as the activity progressed, which likely made hesitant students even less willing to participate."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.3",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.3",
      title: "Rubric Calibration: Exemplar C",
      lead: "Evaluate how well the writer explains why the incident happened.",
      responseKey: "rubric_grade_05_3",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Abstract Conceptualisation linkage",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar C — Abstract Conceptualisation",
        text:
          "This incident reflects a mismatch between cognitive load and task framing. I expected students to apply prior knowledge independently, but the prompt required simultaneous planning, vocabulary retrieval, and peer negotiation. Vygotsky's zone of proximal development helps explain why teams with a clear peer coach progressed faster. In future, I need to scaffold the launch with worked examples before asking for independent transfer."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.4",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.4",
      title: "Rubric Calibration: Exemplar D",
      lead: "Judge whether the action plan is specific, measurable, and time-bound.",
      responseKey: "rubric_grade_05_4",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Active Experimentation quality",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar D — Active Experimentation",
        text:
          "Next Monday I will test a two-step protocol in Period 2: (1) model one complete example with think-aloud language, and (2) provide a 4-item checklist each group must complete before independent work. I will collect exit tickets asking students to rate confidence from 1-5 and name one unclear instruction. If fewer than 80% report confidence of 4 or 5, I will revise the checklist language before Wednesday's lesson."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.5",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.5",
      title: "Rubric Calibration: Exemplar E",
      lead: "Assess integration across all four phases (CE, RO, AC, AE).",
      responseKey: "rubric_grade_05_5",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Kolb cycle coherence",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar E — Full-cycle Coherence",
        text:
          "In Tuesday's reading seminar, discussion stalled after I asked for textual evidence (CE). I felt the room's energy drop and noticed students avoided eye contact when called on (RO). I now think my question was too broad and increased performance pressure; retrieval prompts should have been sequenced from literal to inferential (AC). Tomorrow I will begin with paired annotation, then use sentence starters before whole-class discussion, and compare participation data to Tuesday's baseline (AE)."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.6",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.6",
      title: "Rubric Calibration: Exemplar F",
      lead: "Identify strengths and weaknesses in evidence quality.",
      responseKey: "rubric_grade_05_6",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Evidence and specificity",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar F — Evidence Quality",
        text:
          "The lesson felt messy and students were off task. I think it happened because they did not care about the activity. Next time I will explain things better and hopefully behavior improves."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.7",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.7",
      title: "Rubric Calibration: Exemplar G (Extended)",
      lead: "This extended exemplar is intentionally long to practice close reading.",
      responseKey: "rubric_grade_05_7",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Analytical depth and actionability",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar G — Extended Reflection",
        text:
          "During our interdisciplinary project launch, I introduced the driving question and expected groups to co-construct norms within ten minutes. Instead, several groups fixated on dividing tasks quickly, and two multilingual learners withdrew from discussion. I intervened by assigning rotating roles, but the adjustment came late and momentum was uneven across the class. I felt torn between preserving student autonomy and stepping in more assertively because I could see quieter students becoming peripheral. Reviewing my notes, I realized I had framed collaboration as a product expectation rather than a process skill. Research on collaborative learning suggests students need explicit rehearsal of discourse moves, especially when language demands are high and social hierarchy is present. I also noticed my feedback favored groups producing visible artifacts, which may have reinforced speed over shared reasoning. In the next cycle, I will open with a short modeled conversation that demonstrates clarification prompts, disagreement stems, and turn-taking signals. I will then run a seven-minute rehearsal in triads using a low-stakes prompt and track participation with a simple tally rubric. By the second project lesson, I expect each learner to contribute at least once during group planning, and I will compare this data to baseline participation from this launch."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
    },
    {
      id: "05.8",
      section: "SECTION 5: CHATBOT APP (Standalone Micro-Reflection Exercise)",
      type: "rubric-grade",
      badge: "Slide 05.8",
      title: "Rubric Calibration: Exemplar H (Extended)",
      lead: "Complete one final grade and compare your rationale across exemplars.",
      responseKey: "rubric_grade_05_8",
      rubricMeta: {
        rubricId: "kolb-micro-reflection-rubric-v1",
        criterion: "Overall rubric alignment",
        scoreLabels: [
          { value: "1", label: "1 — Emerging" },
          { value: "2", label: "2 — Developing" },
          { value: "3", label: "3 — Proficient" },
          { value: "4", label: "4 — Advanced" }
        ]
      },
      exemplarPayload: {
        title: "Exemplar H — Final Calibration Piece",
        text:
          "I recently facilitated a Socratic seminar on migration narratives where discussion quality varied sharply by group. In one group, students built on each other's points with textual evidence; in another, contributions were isolated and repetitive. I initially interpreted this as preparation differences, yet my observation log showed both groups completed the same pre-seminar organizer. The stronger group had clearer conversational norms because I had accidentally spent more setup time with them while troubleshooting a device issue. This made me reconsider my assumption that structure should be entirely student-generated from the beginning. If cognitive and social expectations are not transparent, reflective dialogue becomes performative rather than exploratory. The incident also highlighted equity concerns: students with less confidence in academic English were less likely to initiate turns unless they had a scripted entry point. In response, I will implement a two-part protocol next week: first, an explicit mini-lesson on accountable talk moves with multilingual sentence frames; second, a facilitator checklist that requires each seminar leader to invite three distinct voices before summarizing. I will audio-sample two groups and code turn distribution to evaluate whether participation widens and whether evidence-based responses increase."
      },
      aiFeedbackPromptTemplate:
        "You are calibrating rubric judgments for Kolb micro-reflections. Criterion: {{criterion}}. Grade selected: {{gradeLabel}}. Rationale: {{rationale}}. Exemplar: {{exemplar}}. Return concise feedback in 2-3 sentences with one affirming point and one actionable suggestion.",
      aiFallbackText:
        "AI feedback deferred. Save your draft rationale and retry when the API connection is available."
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
