# Manual QA Checklist

## 12) Final storyboard compliance check (2026-04-02)

- [x] **Slide order matches storyboard sequence.** Verified `window.DECK_DATA.slides` runs from 1.1 through 7.2 in the storyboard order, including transition slide `T.1` between sections 4 and 5.
- [x] **Prompts/options/CTAs match storyboard wording.** Spot-checked all interactive prompts (knowledge checks, yes/no matrices, free responses) and CTA text (`Start Micro-Reflection Chatbot`, deck export CTA).
- [x] **Section 3 has the full 16-slide pattern.** Confirmed eight alternating excerpt/identification pairs from 3.2→3.17 (8 excerpt slides + 8 identification slides), with 3.1 instructions preceding them.
- [x] **Both PDF exports exist and are distinct.** Deck export downloads `deck-reflections-export.pdf`; chatbot export downloads `chatbot-ce-ro-ac-ae-summary.pdf`.
- [x] **Transition and return flow works between deck and chatbot.** Transition slide links to `chatbot.html`; chatbot summary includes a return link back to `index.html`.

### Notes

- This check was performed by reviewing `Storyboard.md`, `deck-data.js`, `deck.js`, and `chatbot.js` against the storyboard compliance criteria.
