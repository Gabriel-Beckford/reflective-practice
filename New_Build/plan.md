# Kolb Slide Deck V3 - Session-by-Session Development Plan



## Context



The project is an interactive educational slide deck teaching Kolb's Experiential Learning Cycle. A working V2 exists (`index.html` + `deck-data.js` + `deck.js` + `styles.css` + interaction handlers). The V3 redesign (specified across two PDFs) substantially expands the deck with: AI avatar interactions, pathway routing, glassmorphism UI, new interaction types (linking, accordion, interactive diagrams, a pond game), rubric-based exemplar evaluation with AI feedback, Padlet embedding, and a feedback submission endpoint. All work targets `index.html` and its supporting JS/CSS files.



**Key decisions:**

- **API gate:** Required. Slide 00.1/00.2 blocks content until Gemini API key is entered and connection tested.

- **Timings:** Hidden. Stored as metadata in slide data only; never displayed to learners.



**Key files to modify:**

- `/home/user/reflective-practice/index.html` (primary target)

- `/home/user/reflective-practice/deck-data.js` (slide content data)

- `/home/user/reflective-practice/deck.js` (rendering engine)

- `/home/user/reflective-practice/styles.css` (styling)

- `/home/user/reflective-practice/js/interactions/` (interaction handlers)



**Key files to reference (read-only):**

- `/home/user/reflective-practice/system_prompts/chatbot_system_prompt.xml`

- `/home/user/reflective-practice/system_prompts/assessment_criteria`

- `/home/user/reflective-practice/server.js` (Gemini API proxy)



---



## Session 1: Foundation - HTML Shell, Navigation & Design System



**Goal:** Rebuild `index.html` with the V3 structural elements and update the CSS design system.



### Tasks:

1. **Update `index.html`** to add:

   - Hamburger menu (section-based navigation with section aims, not individual slides)

   - AI avatar element (positioned top-right, with state classes: idle/listening/thinking/responding)

   - "Thinking" indicator element (`thinking...`)

   - Contents/section menu overlay

   - Google Material Icons link (`<link>` to Material Symbols)

   - Larger content windows (80-90% viewport on desktop)

   - Progress bar updates for section-aware navigation

   - API gate modal/overlay that blocks navigation until Gemini connection succeeds



2. **Update `styles.css`** for:

   - Glassmorphism panel styles (backdrop-filter blur, semi-transparent background)

   - Avatar styles with state-based colour/shape/pulsation animations

   - Thinking indicator fade in/out animation

   - Content window sizing: 80-90% of browser window on desktop

   - Normalised slide card sizing across the whole deck

   - Section title slide styles (full-bleed background image + glassmorphism overlay)

   - Ensure every slide layout supports an image



3. **Update `deck.js`** for:

   - Section-based hamburger menu generation from slide data

   - Avatar state management (idle -> listening -> thinking -> responding -> idle)

   - Section skip logic (foundation for pathway routing in Session 2)

   - API gate logic: disable Next/Previous until connection established

   - Gemini API connection test (reuse existing `server.js` proxy at `/api/chat`)



### Verification:

- Open `index.html` in browser, confirm hamburger menu shows sections with aims

- Avatar visible on all slides, thinking indicator animates correctly

- Content windows fill 80-90% of viewport on desktop

- Glassmorphism panels render with blur effect



---



## Session 2: Pathway Selection & Lead-in Section (Slides 01.1-01.4)



**Goal:** Implement the pathway selection system and lead-in slides.



### Tasks:

1. **Update `deck-data.js`** - Replace/restructure Section 1 slides:

   - **Slide 01.1 (Title):** "Introduction to Kolb's Reflective Learning Cycle" with glassmorphism panel over `images/title_background_image.jpg`

   - **Slide 01.2 (Grounding):** 3-2-1 activity with Material Icons for each number (visibility/touch/hearing), sense verbs in accent colour, background image `images/grounding_activity_background.jpg`, send button + AI response area

   - **Slide 01.3 (ILOs):** Learning outcomes displayed as a Bloom's Taxonomy-style stacked graphic (not bullet list), with short-answer question "Which ILO appeals to you most?"

   - **Slide 01.4 (Personalisation):** MBTI personality type prompt with skip option



2. **Add pathway selection slide** after lead-in:

   - 8 pathway options with timing labels (as specified in PDF page 6)

   - Store selected pathway in localStorage

   - Section skip logic: based on pathway, set `selectedSections` array

   - Deck engine skips sections not in the selected pathway



3. **Update `deck.js`** for:

   - New slide type: `section-title` (full background image + glassmorphism title panel)

   - New slide type: `pathway-selector` (pathway cards with route logic)

   - AI interaction on grounding slide: send button, Gemini API call, response display area

   - ILO graphic renderer (stacked coloured bars like Bloom's taxonomy)



4. **Add API Gate slides** (00.1, 00.2):

   - Slide 00.1: "Connect your AI workspace" - API key input (password field), "Test Connection" button, status chip (Not connected / Testing / Connected / Failed). Navigation disabled until connected.

   - Slide 00.2: "Connection established" - Confirmation + "Continue" button

   - Store `apiKeyPresent` and `connectionEstablished` in sessionStorage

   - Avatar shows listening/thinking/responding states during connection test



### Verification:

- Title slide shows glassmorphism panel over background image

- Grounding activity has Material Icons, coloured sense verbs, send button works (or shows placeholder if no API key)

- Pathway selection stores choice and deck skips omitted sections

- ILOs display as stacked graphic



---



## Session 3: Theory Section - Kolb's Cycle (Slides 02.1-02.8)



**Goal:** Build the Kolb theory section with interactive diagrams, tabs, and accordion content.



### Tasks:

1. **Update `deck-data.js`** - Restructure Section 2:

   - **Slide 02.1 (Section title):** "Kolb's Experiential Learning Cycle" with glassmorphism

   - **Slide 02.2 (Using your experience):** Intro text + user input + AI response area for critical incident (5 min)

   - **Slide 02.3 (Padlet sharing):** Padlet iframe embed + "Copy text" button

   - **Slide 02.4 (Recalling critical incident):** AI-guided 4-phase reflection with stage prompts (What happened? / Analysis / Making generalisations / Planning future actions). Initially shows "thinking..." indicator, then AI asks questions one at a time

   - **Slide 02.5 (Quote card):** Kolb quote with `images/quote_card_Kolb.jpg` background

   - **Slide 02.6 (Six principles):** Two-tier accordion menu - top-level principles expand to show sub-bullets

   - **Slide 02.7 (Quote card):** Vince 1998 quote

   - **Slide 02.8 (Dimensions of learning space):** Interactive diagram (Psychological/Social/Institutional/Cultural/Physical) - tap to reveal subdivisions + short answer



2. **Add new interaction types** in `/js/interactions/`:

   - `accordion.js` - Two-tier expand/collapse menu

   - `quote-card.js` - Styled quote display with optional background image

   - `interactive-diagram.js` - Tap-to-reveal layered diagram (for learning space dimensions)

   - `padlet-embed.js` - Padlet iframe + copy-to-clipboard functionality

   - `ai-chat.js` - Inline AI chat component (user input, send button, AI response, thinking indicator)



3. **Update `deck.js`** to render these new interaction types



### Verification:

- Critical incident capture works with AI prompts (or graceful fallback without API)

- Padlet embeds and copy button works

- Accordion expands/collapses correctly

- Interactive diagram reveals subdivisions on tap

- All user responses saved to localStorage



---



## Session 4: Input Mapping Section - Drag-Drop & Linking Activities (Slides 03.1-03.8)



**Goal:** Build the practice activities where learners map their reflection to Kolb's framework.



### Tasks:

1. **Update `deck-data.js`** with:

   - **Slide 03.1 (Match descriptions - drag & drop):** Display user's captured reflection text, drag 4 descriptors to correct Kolb phase. Uses existing `drag-drop.js`

   - **Slide 03.2 (Map question stems - drag & drop):** 8 questions (2 per phase) dragged to correct phase. Don't label questions with phase titles

   - **Slide 03.3 (Link descriptors):** Display user reflection from critical incident capture. "Click to review" menu shows CE/RO/AC/AE definitions. Student links phase descriptors to correct phase of their reflection

   - **Slide 03.4 (Grasping or transforming):** Dropdown per phase to classify as "Grasping knowledge" or "Constructing knowledge"

   - **Slide 03.5 (Short answer dialogue):** 6 AI-mediated short-answer questions about reflective processes

   - **Slide 03.6 (Dimensions of learning space):** Interactive diagram + user input about classroom context



2. **Add new interaction type:**

   - `linking.js` - Text linking UI where user connects descriptors to sections of their own text



3. **Update existing `drag-drop.js`** to support:

   - Displaying user's prior reflection text alongside the drag activity

   - Unlabelled target zones (for question stem mapping)



4. **Implement data persistence:** Ensure `criticalIncidentText` and `phaseResponses` are retrievable across slides via localStorage



### Verification:

- Drag-drop activities function correctly with proper answer checking

- User's reflection text from earlier slides displays correctly

- Linking activity allows connecting descriptors to reflection text

- Dropdown classification works and saves responses



---



## Session 5: Evaluation Section - Rubric-Based Exemplar Assessment (Slides 05.1-05.6)



**Goal:** Build the exemplar evaluation section with rubric grading and AI feedback.



### Tasks:

1. **Update `deck-data.js`** with:

   - **Slide 05.1 (Section title):** "Evaluating Reflective Writing" with glassmorphism

   - **Slide 05.2 (Evaluation instructions):** Instructions for evaluating reflective writing samples

   - **Slide 05.3 (CE rubric + excerpt):** Left panel: CE rubric (4 Strong/3 Secure/2 Emerging/1 Limited with descriptions). Right panel: Exemplar excerpt text. Dropdown grade selector + rationale text box. AI provides feedback rationale for grade 4

   - **Slide 05.4 (RO rubric + excerpt):** Same format with RO rubric, longer excerpt with multiple paragraphs. Dropdown menu to select between phases. AI feedback for grade 4

   - **Slide 05.5 (AC rubric + excerpt):** Abstract conceptualisation excerpt and rubric. AI feedback for grade 3

   - **Slide 05.6 (AE rubric + excerpt):** Active experimentation excerpt and rubric. AI feedback for grade 4

   - **Slide 05.7 (Integrity rubric):** Full exemplar text + integrity-of-cycle rubric. AI feedback for grade 3

   - **Slide 05.8 (Resonance reflection):** "Where are the points of resonance with your critical incident?" - user input



2. **Add new interaction type:**

   - `rubric-grade.js` - Rubric display (expandable criteria) + grade dropdown + rationale textarea + AI feedback area + submit button



3. **Add exemplar text data** - Store the full exemplar reflective writing text (from PDF pages 22-26) in `deck-data.js`



4. **Update `deck.js`** to render rubric-grade interaction type



### Verification:

- Rubric criteria display clearly with grade levels

- Exemplar text is scrollable and readable

- Grade dropdown and rationale submission works

- AI feedback appears after submission (or graceful fallback)

- Phase dropdown menu works for navigation between rubric phases



---



## Session 6: Guided Reflection Section - Pond Game & Chatbot Integration (Slides 04.1-04.2)



**Goal:** Build the transition section with the pond breathing game and chatbot integration.



### Tasks:

1. **Update `deck-data.js`** with:

   - **Slide 04.1 (Reflective Writing section title):** Glassmorphism title

   - **Slide 04.2 (Second grounding activity):** Same 3-2-1 format as slide 01.2

   - **Slide 04.3 (Pond game + transition):** Relaxing pond game (canvas-based: goldfish swimming, click-to-ripple, lilies floating up) + text: "You're now ready to apply what you've learned..." + mentor booking link

   - **Slide 04.4 (Choice):** User chooses: chatbot guided reflection OR skip to Extension section

   - **Slide 04.5 (Chatbot):** Inline chat interface using `system_prompts/chatbot_system_prompt.xml`



2. **Create pond game:**

   - Canvas-based mini game in a new file `js/interactions/pond-game.js`

   - Goldfish swimming with simple AI movement

   - Click/tap creates water ripples that gently nudge fish

   - Lily pads float up periodically

   - Respects `prefers-reduced-motion`



3. **Integrate chatbot inline:**

   - Reuse patterns from existing `chatbot.js` but render inline within the slide deck

   - Use `system_prompts/chatbot_system_prompt.xml` for system prompt

   - Chat interface with transcript area, input box, send button

   - Phase chips (CE/RO/AC/AE) showing progress



### Verification:

- Pond game renders, fish swim, ripples work on click

- Chatbot choice navigates correctly (to chatbot or skip to Extension)

- Inline chatbot sends/receives messages via Gemini API

- Phase progression visible in chatbot UI



---



## Session 7: Closure Sections - Extension, Feedback & Export (Slides 06.1-06.3)



**Goal:** Build the Extension, Feedback, and Export sections.



### Tasks:

1. **Update `deck-data.js`** with:

   - **Slide 06.1 (Extension title):** Glassmorphism section title (pathway independent - always shown)

   - **Slide 06.2 (NotebookLM resource):** Link to NotebookLM with glassmorphism panel

   - **Slide 06.3 (Feedback title):** Glassmorphism section title (pathway independent - always shown)

   - **Slide 06.4 (Feedback form):** AI-guided Kolb microcycle reflection on the learning experience itself. 6 questions as scaffold with AI follow-ups. Submit responses to Google Apps Script endpoint



2. **Implement feedback submission:**

   - POST user responses to: `https://script.google.com/macros/s/AKfycbznNEX9NuWAtpbbWxZ_aExQL_d9fxG3WWYVQuq0U6_YQfr87olZUaRU7Tv4k6m8A-X7/exec`

   - Include timestamp, name, and responses to the 6 questions



3. **Update export functionality:**

   - Enhance `pdf-export.js` to include all V3 response data

   - Export: grounding responses, critical incident, rubric grades + rationales, chatbot transcript, feedback responses



4. **Ensure pathway-independent sections** (Extension, Feedback) always display regardless of selected pathway



### Verification:

- Extension and Feedback sections appear for all pathways

- NotebookLM link works

- Feedback submission POSTs to Google endpoint

- PDF export includes all user responses from the session



---



## Session 8: AI Integration & Polish



**Goal:** Wire up all AI interactions, polish UI, and ensure cross-slide data flow.



### Tasks:

1. **AI avatar system:**

   - Avatar changes state on every AI interaction (colour shift, pulsation)

   - Thinking indicator ("thinking...") fades in/out during API calls

   - Avatar positioned consistently on all slides



2. **AI content awareness:**

   - Give AI access to XML descriptions of each slide's content

   - AI can track current progress and answer questions about content

   - RAG: all user-chatbot communication saved and used to ground responses in user's experience



3. **Cross-slide data persistence:**

   - Verify all `responseKey` data flows correctly between slides

   - Critical incident text available on slides that reference it (matching, linking, evaluation)

   - Phase responses available for display on later slides



4. **Developer comments cleanup:**

   - Remove all `[square bracket]` developer instructions from visible content

   - Ensure no developer notes render to end users



5. **Responsive polish:**

   - Test on mobile and desktop

   - Ensure content windows are properly sized at all breakpoints

   - Verify all interactions work on touch devices



### Verification:

- Full end-to-end walkthrough of all pathways

- AI responds contextually on all interactive slides

- No developer comments visible to users

- Responsive on mobile and desktop

- All data persists correctly across slides



---



## Slide-to-Session Mapping Summary



| Session | PDF Pages | Slide IDs | Focus |

|---------|-----------|-----------|-------|

| 1 | 1 (Notes) | N/A | HTML shell, nav, design system |

| 2 | 2-6 | 01.1-01.4 + pathway | Title, grounding, ILOs, MBTI, pathways |

| 3 | 7-19 | 02.1-02.8 | Theory, critical incident, Padlet, accordions, diagrams |

| 4 | 11-14, 16 | 03.1-03.8 | Drag-drop, linking, grasping/transforming |

| 5 | 20-27 | 05.1-05.8 | Rubric evaluation, exemplar grading |

| 6 | 28-32 | 04.1-04.5 | Pond game, chatbot integration |

| 7 | 33-36 | 06.1-06.4 | Extension, feedback, export |

| 8 | All | All | AI integration, polish, testing |

