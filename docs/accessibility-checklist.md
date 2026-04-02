# Accessibility QA Checklist (13 Criteria)

Use this checklist during manual QA before release. Mark each item Pass/Fail and capture notes.

| # | Criterion | What to verify | Status |
|---|---|---|---|
| 1 | Semantic landmarks | `<main>`, slide region, and navigation are announced with meaningful names. | ☐ |
| 2 | Interactive control names | Every button, input, radio, checkbox, and toggle has a visible label and/or ARIA label. | ☐ |
| 3 | Lottie element accessibility | Every `<lottie-player>` has `role="img"` and an `aria-label` (or `aria-hidden="true"` if decorative). | ☐ |
| 4 | Reading/focus order | Tabbing follows logical visual order: skip link → content → controls. | ☐ |
| 5 | Keyboard-only operation | All actions (slide nav, send, feedback, match/toggles) work without a mouse. | ☐ |
| 6 | Keyboard shortcuts | Arrow Left/Right move slides when focus is not inside a text field. | ☐ |
| 7 | Focus visibility | Focus indicator is clearly visible for buttons, inputs, checkboxes/radios, and programmatic focus targets. | ☐ |
| 8 | Focus management | On slide change, focus moves to the active slide region; on validation failure, focus moves to the error/status message. | ☐ |
| 9 | Status announcements | Live regions announce transcript updates, speech status, validation, and feedback submission status. | ☐ |
|10| Error identification | Invalid states include text + symbol (not color only), e.g., `⚠` plus instruction. | ☐ |
|11| Success/selection indication | Success/selected states include text or weight changes (not color only), e.g., `✓`, `Yes/No`, bold active states. | ☐ |
|12| Color contrast | Text and UI controls meet minimum contrast (WCAG AA): body text 4.5:1, large text/UI 3:1. | ☐ |
|13| Touch target minimums | Interactive controls are at least 48x48 CSS px on mobile. | ☐ |

## Evidence to capture

- Browser + OS + assistive tech used.
- Screenshots/video for failures.
- Exact slide id(s) where failure occurs.
- Reproduction steps and expected behavior.
