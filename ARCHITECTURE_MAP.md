# Runtime Architecture Map

Canonical runtime path is anchored on `index.html` and uses a single active deck runtime.

## Active entrypoints
- `index.html` — browser shell and script loading order.
- `deck-data.js` — structured slide/content data exposed to the deck runtime.
- `deck.js` — bootstraps the deck app runtime.
- `server.js` — local HTTP server and Gemini proxy API routes.
- `chatbot.js` — standalone chatbot client runtime used by `chatbot.html`.

## Legacy status
- `app.js` is deprecated and archived at `archive/legacy/app.js`.
- Legacy files must remain under `archive/legacy/` and must not be referenced by `index.html`.
