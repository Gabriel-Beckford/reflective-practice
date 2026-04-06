# V3 Slide Manifest (Frozen Implementation Reference)

> **Status:** Frozen baseline for implementation.
> **Effective date:** 2026-04-06.
> **Rule:** This file is the single implementation reference for V3 slides in subsequent sessions unless explicitly superseded by a new approved manifest version.

## Scope and method
- Source of truth for slide inventory: `New_Build/plan.md` slide IDs (`00.x` through `06.x`).
- Cross-check source for wording parity: `Storyboard.md`.
- Where `Storyboard.md` has no direct V3 counterpart (ID drift and structural redesign), mismatch is marked as **"No direct counterpart"**.
- `AI dependency` meaning:
  - **Required**: core behavior of the slide is blocked/degraded without AI response.
  - **Optional**: AI enriches feedback/support, but learner can continue.

## Global pathway/visibility rules
1. **API gate mandatory**: `00.1` and successful connection required before normal navigation.
2. **Pathway chooser controls conditional sections**: pathway selection sets `selectedSections`; non-selected sections are skipped.
3. **Extension + Feedback are always visible**: `06.x` pathway-independent and must always render.
4. **Section title slides render when their section is visible**.

---

## Slide manifest

| Slide ID | Section | Interaction type | Required assets | Response key(s) | AI dependency | Pathway visibility rules | Storyboard wording cross-check | QA acceptance checklist |
|---|---|---|---|---|---|---|---|---|
| 00.1 | API Gate | API key form + connection test | API key input, Test button, status chip, `/api/chat` connectivity | `apiKeyPresent`, `connectionEstablished` (session) | Required | Always first; blocks forward nav until connected | **No direct counterpart** in `Storyboard.md` | **QA:** Enter invalid key -> status `Failed`; valid test -> `Connected`; Next unlocks. |
| 00.2 | API Gate | Confirmation/continue | Confirmation copy, Continue button | `connectionEstablished` confirm state | Optional | Visible only after successful 00.1 test | **No direct counterpart** | **QA:** Slide appears only after successful test; Continue proceeds to lead-in. |
| 01.1 | Lead-in | Section/title slide (`section-title`) | `images/title_background_image.jpg`, title text, glass panel | none | Optional | Visible to all users post-gate | **Mismatch:** Storyboard 1.1 heading is “Welcome to your asynchronous session on Kolb's Reflective Cycle”; plan text is “Introduction to Kolb's Reflective Learning Cycle”. | **QA:** Correct background + title visible; no broken image; section entry works from menu. |
| 01.2 | Lead-in | 3-2-1 grounding + AI response area | Material Icons, grounding prompt copy, send button, response container, `images/grounding_activity_background.jpg` | `grounding321_opening` | Optional | Visible to all users post-gate | **Partial mismatch:** Core 3-2-1 structure matches Storyboard 1.2; wording differs (Storyboard includes “close your eyes…” scripted lead-in). | **QA:** Learner can submit 3/2/1 response; response persists; AI reply or graceful fallback appears. |
| 01.3 | Lead-in | ILO stacked graphic + short answer | Bloom-style stacked visual, prompt text | `iloAppealResponse` | Optional | Visible to all users | **Mismatch:** Storyboard 1.1 includes explicit four learning goals; plan converts into separate ILO visual + question. | **QA:** Four ILO layers render; short answer saves and reloads correctly. |
| 01.4 | Lead-in | Personalization prompt (MBTI) + skip | MBTI options/input + Skip action | `mbtiType` (nullable), `mbtiSkipped` | Optional | Visible to all users | **No direct counterpart** | **QA:** User can select MBTI or skip; either path allows progression and persists state. |
| 01.5* | Lead-in | Pathway selector (`pathway-selector`) | 8 pathway cards with timing labels, route map logic | `selectedPathway`, `selectedSections` | Optional | Visible to all; determines visibility of conditional sections thereafter | **No direct counterpart** | **QA:** Selecting pathway writes localStorage and correctly skips non-selected sections. |
| 02.1 | Theory | Section title | Section title copy, background/glass styles | none | Optional | Visible only if Theory section included by pathway | **Partial mismatch:** Storyboard 2.1 is content slide (“Why Experiential Learning?”), while plan uses section-title wrapper. | **QA:** Theory section title displays; appears/disappears per selected pathway. |
| 02.2 | Theory | Short answer + AI reflection | Prompt text, text input, send, AI response panel | `criticalIncidentText` | Optional | Theory-visible pathways only | **Mismatch:** Storyboard 2.2 is MCQ knowledge check; plan 02.2 is critical-incident capture. | **QA:** User enters incident; save persists for downstream slides (03.x references). |
| 02.3 | Theory | Padlet embed | Padlet iframe, copy-to-clipboard control | `padletShareText` (or copy payload) | Optional | Theory-visible pathways only | **No direct counterpart** | **QA:** Embed loads; copy button copies expected text; fallback shown if embed blocked. |
| 02.4 | Theory | AI-guided phased reflection (multi-step) | Stage prompts (What happened/Analysis/Generalisations/Actions), thinking indicator, chat UI | `phaseResponses.ce`, `.ro`, `.ac`, `.ae` | Required | Theory-visible pathways only | **Partial mismatch:** Storyboard has four-phase progression in chatbot section, but not this exact slide placement/content. | **QA:** AI asks phased prompts sequentially; each phase response stored under correct key. |
| 02.5 | Theory | Quote card | `images/quote_card_Kolb.jpg`, quote text | none | Optional | Theory-visible pathways only | **No direct counterpart** | **QA:** Quote renders with background and readable contrast. |
| 02.6 | Theory | Two-tier accordion | Principle headers + sub-bullets data, accordion component | `accordionViewed` (optional telemetry) | Optional | Theory-visible pathways only | **No direct counterpart** | **QA:** Expand/collapse works at both levels; keyboard and pointer interactions function. |
| 02.7 | Theory | Quote card (Vince 1998) | Quote text/source styling | none | Optional | Theory-visible pathways only | **No direct counterpart** | **QA:** Vince quote renders correctly with attribution. |
| 02.8 | Theory | Interactive diagram + short answer | Learning space dimensions diagram (Psych/Social/Institutional/Cultural/Physical), reveal states, input field | `learningSpaceContext` | Optional | Theory-visible pathways only | **No direct counterpart** | **QA:** Tap/click reveals subdivisions; learner text saves. |
| 03.1 | Input Mapping | Drag-drop phase match + prior text display | `drag-drop.js`, reflection text panel | `phaseMatch_descriptors` | Optional | Visible only when Input Mapping section included by pathway | **No direct counterpart** | **QA:** Descriptors can be dragged and checked; score/state persists. |
| 03.2 | Input Mapping | Drag-drop question stems (unlabelled targets) | Drag-drop board with 8 question stems, unlabeled zones | `phaseMatch_questions` | Optional | Input Mapping-visible pathways only | **No direct counterpart** | **QA:** Unlabelled targets render; answer checking works; retries possible. |
| 03.3 | Input Mapping | Linking interaction (descriptor-to-text linking) | Reflection text, CE/RO/AC/AE definitions popover, `linking.js` | `descriptorLinks` | Optional | Input Mapping-visible pathways only | **No direct counterpart** | **QA:** User creates/removes links; mappings are retained on reload. |
| 03.4 | Input Mapping | Per-phase dropdown classification | Dropdowns for each phase (Grasping vs Constructing) | `grasp_transform_classification` | Optional | Input Mapping-visible pathways only | **Partial mismatch:** Storyboard 2.3 discusses grasping/transforming conceptually, but not as this classification activity. | **QA:** Each phase selection saves; validation prevents incomplete submit if required. |
| 03.5 | Input Mapping | AI-mediated short-answer dialogue (6 prompts) | Prompt sequence, input, AI feedback panel | `reflectiveProcessAnswers` | Required | Input Mapping-visible pathways only | **No direct counterpart** | **QA:** All 6 responses collected; AI follow-ups occur or explicit fallback shown. |
| 03.6 | Input Mapping | Interactive diagram + context input | Diagram component (same family as 02.8), input area | `learningSpaceClassroomContext` | Optional | Input Mapping-visible pathways only | **No direct counterpart** | **QA:** Diagram interactions function; context response persists. |
| 03.7 | Input Mapping | **TBD in plan** | Placeholder until defined | `tbd_03_7` | Optional | Input Mapping-visible pathways only | **No counterpart; undefined in plan details despite 03.1-03.8 range** | **QA:** Must not ship without explicit content spec sign-off. |
| 03.8 | Input Mapping | **TBD in plan** | Placeholder until defined | `tbd_03_8` | Optional | Input Mapping-visible pathways only | **No counterpart; undefined in plan details despite 03.1-03.8 range** | **QA:** Must not ship without explicit content spec sign-off. |
| 04.1 | Guided Reflection | Section title | Section heading + glass panel | none | Optional | Visible only when Guided Reflection section included by pathway | **No direct counterpart** | **QA:** Section title displays and routes correctly. |
| 04.2 | Guided Reflection | 3-2-1 grounding (second pass) | Prompt copy, response input, submit | `grounding321_closing` | Optional | Guided Reflection-visible pathways only | **Partial mismatch:** Storyboard 7.2 defines final closing 3-2-1 with specific “3 key takeaways / 2 ideas / 1 lingering question” wording; plan says same format as 01.2. | **QA:** Second grounding response is collectible and distinct from 01.2 key. |
| 04.3 | Guided Reflection | Pond game + transition CTA | `js/interactions/pond-game.js`, canvas, fish/ripple/lily assets, mentor link | `pondGamePlayed` (event), optional `transitionAcknowledged` | Optional | Guided Reflection-visible pathways only | **Partial mismatch:** Storyboard has transition slide T.1 text/CTA but no pond game mechanics. | **QA:** Pond renders, interactions work, reduced-motion respected, mentor link opens. |
| 04.4 | Guided Reflection | Branch choice (chatbot vs skip) | Choice buttons/cards, routing logic | `chatbotChoice` | Optional | Guided Reflection-visible pathways only; branch decides whether 04.5 appears | **Partial mismatch:** Storyboard transition has “Start Micro-Reflection Chatbot”; explicit skip branch is a V3 addition. | **QA:** Choosing chatbot opens 04.5; choosing skip jumps to Extension section. |
| 04.5 | Guided Reflection | Inline chatbot | Chat transcript UI, CE/RO/AC/AE phase chips, system prompt XML | `chatbotTranscript`, `chatbotPhaseProgress` | Required | Only visible when user chose chatbot on 04.4 | **Partial match:** Storyboard Section 5 chatbot flow aligns conceptually; V3 embeds inline rather than standalone app screen set. | **QA:** Chat sends/receives; phase chips update; transcript persists for export. |
| 05.1 | Evaluation | Section title | Title slide assets | none | Optional | Visible only when Evaluation section included by pathway | **Partial mismatch:** Storyboard 4.1 is evaluation instructions content slide; plan inserts title slide first. | **QA:** Evaluation title renders and section menu anchor works. |
| 05.2 | Evaluation | Instruction slide | Instruction copy/content block | none | Optional | Evaluation-visible pathways only | **Match (conceptual):** corresponds to Storyboard 4.1 instructions intent. | **QA:** Instructions readable and complete before rubric activities. |
| 05.3 | Evaluation | Rubric grading (CE) | CE rubric matrix, exemplar excerpt, grade dropdown, rationale textarea, submit, AI feedback area | `rubric.ce.grade`, `rubric.ce.rationale`, `rubric.ce.aiFeedback` | Optional | Evaluation-visible pathways only | **Mismatch:** Storyboard uses strong/weak holistic examples; plan uses phase-specific rubric/excerpt workflow. | **QA:** User can grade CE, enter rationale, submit, and receive feedback/fallback. |
| 05.4 | Evaluation | Rubric grading (RO) + phase dropdown | RO rubric, long excerpt, phase selector | `rubric.ro.grade`, `rubric.ro.rationale`, `rubric.ro.aiFeedback` | Optional | Evaluation-visible pathways only | **Mismatch:** same as above (rubric-phase design differs from Storyboard examples). | **QA:** Phase dropdown works; RO grade/rationale save correctly. |
| 05.5 | Evaluation | Rubric grading (AC) | AC rubric + excerpt + feedback controls | `rubric.ac.grade`, `rubric.ac.rationale`, `rubric.ac.aiFeedback` | Optional | Evaluation-visible pathways only | **Mismatch:** as above. | **QA:** AC workflow completes; expected feedback profile for grade-3 target path appears. |
| 05.6 | Evaluation | Rubric grading (AE) | AE rubric + excerpt + feedback controls | `rubric.ae.grade`, `rubric.ae.rationale`, `rubric.ae.aiFeedback` | Optional | Evaluation-visible pathways only | **Mismatch:** as above. | **QA:** AE workflow completes; expected feedback profile for grade-4 target path appears. |
| 05.7 | Evaluation | Integrity-of-cycle rubric | Full exemplar text + integrity rubric + feedback controls | `rubric.integrity.grade`, `rubric.integrity.rationale`, `rubric.integrity.aiFeedback` | Optional | Evaluation-visible pathways only | **No direct counterpart** | **QA:** Full text scrolls; integrity grading and rationale persist. |
| 05.8 | Evaluation | Resonance reflection short answer | Prompt + text area | `resonanceReflection` | Optional | Evaluation-visible pathways only | **Partial match:** similar to Storyboard 4.7 emotional connection prompt, wording differs. | **QA:** Response captures personal resonance and persists. |
| 06.1 | Extension | Section title | Title/glass assets | none | Optional | **Always visible** regardless of pathway | **Mismatch:** Storyboard 6.1 is export CTA content, not extension title. | **QA:** Extension title always appears after prior sections/branches. |
| 06.2 | Extension | External resource link (NotebookLM) | Link panel/button to NotebookLM | `notebooklmVisited` (optional) | Optional | **Always visible** | **No direct counterpart** | **QA:** Link opens correctly and is clearly labeled. |
| 06.3 | Feedback | Section title | Title/glass assets | none | Optional | **Always visible** | **Mismatch:** Storyboard 7.1 is quick feedback prompt, not title-only slide. | **QA:** Feedback title appears before feedback interaction. |
| 06.4 | Feedback | AI-guided microcycle feedback form + submit | 6-question scaffold, AI follow-up UI, submit action, Google Apps Script endpoint | `feedback.name`, `feedback.q1..q6`, `feedback.submittedAt`, `feedbackSubmitStatus` | Optional | **Always visible** | **Partial mismatch:** Storyboard uses external feedback form + closing grounding; V3 uses embedded 6-question guided form. | **QA:** Form validates, POST succeeds, success message shown, timestamp captured. |

\* `01.5` is not explicitly numbered in `plan.md` but is required by the stated “Add pathway selection slide after lead-in.” This manifest fixes the implementation ID as `01.5` for consistency.

---

## Identified structural conflicts to resolve before implementation lock
1. **Plan numbering inconsistency (Session 5 heading vs listed slide IDs):** heading says `05.1-05.6` but task list includes `05.1-05.8`.
2. **Input Mapping range inconsistency:** heading says `03.1-03.8` but only `03.1-03.6` are defined in tasks.
3. **Slide order by session differs from numeric order:** Session sequence introduces `05.x` before `04.x`; runtime navigation must use explicit order map, not lexical ID sort.
4. **Storyboard-to-plan redesign is substantial:** many V3 slides are new or repurposed; wording parity should be treated as intentional divergence unless flagged above as blocking.

## Release gate for this manifest
- Do not begin/continue feature implementation unless each shipped slide has:
  1) a non-TBD interaction definition,
  2) response key mapping,
  3) pathway rule,
  4) one-line QA acceptance check.

