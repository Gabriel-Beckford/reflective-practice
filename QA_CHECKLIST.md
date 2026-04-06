# Manual QA Checklist

## 12) Final storyboard compliance check (2026-04-02)

- [x] **Slide order matches storyboard sequence.** Verified `window.DECK_DATA.slides` runs from 1.1 through 7.2 in the storyboard order, including transition slide `T.1` between sections 4 and 5.
- [x] **Prompts/options/CTAs match storyboard wording.** Spot-checked all interactive prompts (knowledge checks, yes/no matrices, free responses) and CTA text (`Start Micro-Reflection Chatbot`, deck export CTA).
- [x] **Section 3 has the full 16-slide pattern.** Confirmed eight alternating excerpt/identification pairs from 3.2→3.17 (8 excerpt slides + 8 identification slides), with 3.1 instructions preceding them.
- [x] **Both PDF exports exist and are distinct.** Deck export downloads `deck-reflections-export.pdf`; chatbot export downloads `chatbot-ce-ro-ac-ae-summary.pdf`.
- [x] **Transition and return flow works between deck and chatbot.** Transition slide links to `chatbot.html`; chatbot summary includes a return link back to `index.html`.

### Notes

- This check was performed by reviewing `Storyboard.md`, `deck-data.js`, `deck.js`, and `chatbot.js` against the storyboard compliance criteria.

## 13) Regression + storyboard compliance sweep (2026-04-06)

- [x] **Removed bracketed developer/internal tags from learner-visible deck copy.** Cleaned learner-facing strings in `deck-data.js` (e.g., `[Understand]`, `[Correct]`, `Action:[Learner...]`, and bracketed AI feedback placeholders) while preserving interaction logic via `correctAnswers`/`expectedAnswers` fields.
- [x] **Validated pathway branch walkthrough coverage.** Programmatically traversed all 8 pathways from the pathway selector and verified each route reaches the extension/feedback end-state (`06.3` and `06.4`) without empty branches.
- [x] **Validated render prerequisites with/without media assets.** Confirmed all referenced media files exist and slide types remain render-resolvable to built-in renderers or registered interaction modules; this preserves graceful rendering when image fields are omitted.
- [x] **Validated API-connected vs API-unavailable learner states.** Confirmed deck/chatbot connection-state messaging and fallback handling remain in place (`not connected`, `testing`, `connected`, `failed` and non-blocking local-save fallback in AI chat).
- [x] **Checked exports + interaction-module regression surface.** Syntax-checked `deck.js`, `chatbot.js`, `pdf-export.js`, `server.js`, and every file in `js/interactions/`; executed `buildDeckExportLines()` smoke test successfully.
- [x] **Storyboard compliance rerun against `Storyboard.md`.** Slide and interaction content remain aligned overall; one known numbering divergence remains from prior builds: storyboard references `7.1/7.2`, while current deck uses `06.3/06.4` for feedback slides.

### Commands executed

- `rg -n "\\[[^\\]]+\\]" deck-data.js`
- `node --check deck-data.js && node --check deck.js && node --check chatbot.js && for f in js/interactions/*.js; do node --check "$f" || exit 1; done && node --check pdf-export.js && node --check server.js`
- `node <<'JS' ...` (pathway traversal + bracket-tag scan + media existence + renderer mapping checks)
- `node <<'JS' ...` (Storyboard slide-id cross-check)
- `node <<'JS' ...` (`pdfExport.buildDeckExportLines()` smoke test)
