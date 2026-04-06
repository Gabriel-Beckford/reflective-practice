# Setup

## Credential strategy (single source of truth)

This project uses **server-managed credentials only**.

- The backend reads `GEMINI_API_KEY` from environment variables in `server.js`.
- The browser never sends API keys to Google directly.
- The browser also does not use short-lived `sessionToken` credentials.
- API requests are proxied through:
  - `POST /api/gemini/test`
  - `POST /api/gemini/chat`

## Configure environment

Set these variables before starting the server:

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional, defaults to `gemini-1.5-flash`)
- `HOST` (optional, defaults to `0.0.0.0`)
- `PORT` (optional, defaults to `8787`)

Example:

```bash
export GEMINI_API_KEY="your-key"
export GEMINI_MODEL="gemini-1.5-flash"
node server.js
```

## Credential enforcement behavior

- If `GEMINI_API_KEY` is missing, Gemini API routes return a configuration error.
- If a request includes `sessionToken`, the server returns `400 unsupported_credential`.
- The UI connection flows only test server proxy reachability and server-held credentials.
