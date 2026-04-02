# reflective-practice

Mobile-first single-page scaffold for a reflective practice experience.

## Local run

1. From the project root, start a local static server:
   - `python3 -m http.server 8000`
2. Open your browser to `http://localhost:8000`.

> You can use any static server. This scaffold is plain HTML/CSS/JS and has no build step.

## Runtime AI configuration (no committed secrets)

Inject runtime config before `app.js` loads:

```html
<script>
  window.REFLECTIVE_PRACTICE_CONFIG = {
    geminiApiKey: "YOUR_RUNTIME_KEY",
    geminiModel: "gemini-1.5-flash"
  };
</script>
```

You can also inject values through meta tags:

```html
<meta name="gemini-api-key" content="YOUR_RUNTIME_KEY" />
<meta name="gemini-model" content="gemini-1.5-flash" />
```

Do not hardcode API keys in source files or commit them to version control.

## Project structure

- `index.html` — SPA shell, semantic regions, ARIA labels, and CDN dependencies (Material Web, Lottie Player, jsPDF).
- `styles.css` — mobile-first layout, Material-aligned spacing tokens, typography defaults, touch-target sizing, and reveal animations.
- `app.js` — slide rendering, navigation, Section 1 warm-up chat flow, and Section 5 phased controller integration.
- `src/ai/gemini.js` — validated Gemini wrapper with safe user-facing error handling.
- `src/controllers/*` — structured conversation flow controllers.
