# reflective-practice

Mobile-first single-page scaffold for a reflective practice experience.

## Local run

1. From the project root, start a local static server:
   - `python3 -m http.server 8000`
2. Open your browser to `http://localhost:8000`.

> You can use any static server. This scaffold is plain HTML/CSS/JS and has no build step.

## Project structure

- `index.html` — SPA shell, semantic regions, ARIA labels, and CDN dependencies (Material Web, Lottie Player, jsPDF).
- `styles.css` — mobile-first layout, Material-aligned spacing tokens, typography defaults, touch-target sizing, and reveal animations.
- `app.js` — initial application state, slide rendering, and navigation hooks.
