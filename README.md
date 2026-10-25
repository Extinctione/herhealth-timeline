# HerHealth Timeline

A personal health documentation app. Log what you're experiencing in your own words, build a searchable timeline, spot patterns, and generate a doctor-friendly **Health Story** report to bring to an appointment.

> **This is a documentation tool, not a diagnostic app.** It does not diagnose, does not give medical advice, and is not HIPAA-compliant or medically validated. It's a local journal that helps you organize your own observations to share with a healthcare professional.

## Features

- **Log experiences** — free-text description, tags, body area, severity (1–10), duration, and daily impact
- **"Help me describe it"** — optional AI assistant that turns a rough note into clearer wording, suggested tags, and gentle follow-up questions; you review and edit everything before saving
- **Timeline** — chronological view with full-text search and filters by body area / tag
- **Dashboard** — at-a-glance stats (total entries, entries this month, most-noted tag, average severity) plus one-click demo data for exploring the app
- **Edit & delete** any entry from a detail modal
- **Health Story report** — select any set of entries and generate a first-person narrative summary with suggested discussion questions for a doctor; narrative and questions are editable before printing
- **Print / Save as PDF** export of the Health Story
- **Local-first storage** — all entries live in the browser's `localStorage`; no accounts, no server database, nothing synced

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + React Router 6 |
| Build tool | Vite 8 (with a small custom dev-middleware plugin acting as the API layer) |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Lint | oxlint |
| AI | Groq's OpenAI-compatible Chat Completions API (server-side only) |
| Persistence | Browser `localStorage` (no backend database) |

## Setup

```bash
npm install
npm run dev
```

The app works fully out of the box with **no configuration** — AI features fall back to a clearly labeled local simulation if nothing is configured (see below).

### Enabling live AI suggestions (optional)

The app talks to any **OpenAI-compatible Chat Completions API** for two features: "Help me describe it" and the Health Story narrative. This is entirely optional.

1. Copy `.env.example` to `.env.local`.
2. Get an API key from [Groq](https://console.groq.com) (or another OpenAI-compatible provider).
3. Fill in `.env.local`:

   ```env
   AI_API_KEY=your_groq_api_key
   AI_API_URL=https://api.groq.com/openai/v1
   AI_MODEL=openai/gpt-oss-20b
   ```

`.env.local` is gitignored and is only ever read server-side (`vite.config.js` loads it and passes it to `server/groq.js`, which runs inside the Vite Node process) — the key is never sent to the browser or bundled into client JavaScript. The model/provider is fully configurable through the env vars; nothing is hardcoded.

If these are left blank, or a live request fails for any reason, the app automatically falls back to a local simulation. The UI always clearly labels which one produced a given result — **"Powered by Groq"** (live response) or **"Simulated AI (demo)"** (no live response) — so it's never ambiguous.

> GitHub Models' inference API was fully retired on 2026-07-30 and can no longer be used as a provider for this project.

## How the AI integration works

- The browser never calls Groq directly — it calls same-origin `/api/describe` and `/api/health-story` routes, implemented as Vite dev-server middleware (`vite.config.js` → `server/groq.js`).
- `server/groq.js` builds a task-specific system prompt, calls `{AI_API_URL}/chat/completions` with the configured model, and parses a strict JSON response (never free-form prose) into the UI's expected shape.
- Every AI call includes a disclaimer and is instructed to never suggest a diagnosis, cause, or treatment — only to help organize the user's own words.
- This project does not integrate with the Model Context Protocol (MCP); it calls a standard REST chat-completions endpoint.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

## Privacy

- Health data never leaves your device except when you explicitly trigger an AI feature ("Get suggestions" or "Generate Health Story"), and only the fields that feature needs are sent.
- The API key lives only in `.env.local` on your machine and in the Vite dev-server process — never in the browser, never logged, never committed to Git.
- There is no account system, no analytics, and no server-side data store. Clearing your browser storage clears all data.
