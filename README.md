# HerHealth Timeline

**Turn scattered symptoms into a clear story your doctor can act on.**

Women's health experiences are often dismissed, overlooked, or forgotten between appointments. HerHealth Timeline is a local-first health journal that helps people document their experiences, recognize patterns over time, and prepare a clear, doctor-ready **Health Story** report.

Log symptoms in plain language, explore them on a searchable timeline, and generate a report in one click. No account is required, and your health data stays on your device unless you explicitly choose to use an AI feature.

> **Important:** HerHealth Timeline is a documentation tool, not a diagnostic app. It does not diagnose conditions or provide medical advice. It is not HIPAA-compliant or medically validated. It helps you organize your own observations to discuss with a healthcare professional.

---

## Features

- **Log experiences** — Record free-text descriptions, tags, body areas, severity (1–10), duration, and daily impact.
- **AI-powered description assistance** — Use “Help me describe it” to turn rough notes into clearer wording, receive suggested tags, and get gentle follow-up questions. Users review and edit all suggestions before saving.
- **Searchable timeline** — View experiences chronologically, search entries, and filter by body area or tag.
- **Dashboard** — See at-a-glance statistics, including total entries, entries this month, most-noted tag, and average severity. Load demo data to explore the application.
- **Edit and delete entries** — Manage existing experiences through the entry detail modal.
- **Health Story report** — Select entries and generate a first-person narrative with suggested questions to discuss with a doctor. The report is editable before printing.
- **Print or save as PDF** — Export your Health Story for an appointment.
- **Local-first storage** — Entries are stored in your browser's `localStorage`. There is no backend database or automatic data synchronization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Routing | React Router 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Linting | oxlint |
| AI integration | Groq Chat Completions API |
| API layer | Custom Vite development middleware |
| Persistence | Browser `localStorage` |

---

## Architecture

HerHealth Timeline uses a local-first architecture. The frontend communicates with the AI provider through same-origin API endpoints. The Groq API key is handled server-side and is never sent directly to the browser.

```text
Browser (React)
      │
      │ Same-origin fetch
      │ Never calls Groq directly
      ▼
/api/describe
/api/health-story
      │
      │ Vite dev middleware
      │ vite.config.js
      ▼
server/groq.js
      │
      ├──► Groq Chat Completions API
      │       Only when AI_API_KEY is configured
      │
      └──► Local deterministic simulation
              Used when configuration is missing
              or an AI request fails
```

AI responses are labeled in the interface as either:

- **Powered by Groq** — A real API response was received.
- **Simulated AI (demo)** — The local simulation was used.

The application does not present simulated responses as live AI output.

---

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository and navigate to the project directory:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

The application works without AI configuration. AI features use a clearly labeled local simulation when live AI is unavailable.

---

## Enabling Live AI Suggestions

Live AI functionality is optional.

### 1. Configure environment variables

Copy `.env.example` to `.env.local`.

### 2. Get an API key

Create an API key through the [Groq Console](https://console.groq.com).

### 3. Update `.env.local`

```env
AI_API_KEY=your_groq_api_key
AI_API_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-20b
```

The provider, model, and API URL are configurable through environment variables.

**Security note:** `.env.local` is gitignored and the API key is read server-side. Never commit API keys or expose them in client-side JavaScript.

---

## Project Structure

```text
.
├── server/
│   └── groq.js
├── src/
│   ├── lib/
│   │   ├── storage
│   │   ├── aiClient
│   │   ├── formatting
│   │   └── tags
│   ├── components/
│   │   ├── AIHelper
│   │   ├── ExperienceForm
│   │   ├── EntryCard
│   │   ├── EntryDetailModal
│   │   ├── Layout
│   │   └── ui/
│   └── pages/
│       ├── Dashboard
│       ├── LogExperience
│       ├── Timeline
│       └── HealthStory
├── vite.config.js
├── .env.example
├── package.json
└── README.md
```

*This is a high-level structure. Refer to the repository for the exact filenames and implementation.*

---

## Privacy & Safety

HerHealth Timeline is designed around user control and local-first storage.

- Health entries are stored in the browser's `localStorage`.
- Data is not automatically synchronized to a server.
- Health data leaves the device only when a user explicitly triggers an AI feature.
- AI requests include only the fields needed for the requested feature.
- AI prompts instruct the model not to suggest diagnoses, causes, or treatments.
- Users can review and edit AI-generated content before saving or sharing it.
- There is no account system or server-side health-data database.
- Clearing browser storage removes locally stored application data.

### Limitations

HerHealth Timeline is intended to support personal documentation and conversations with healthcare professionals. It is not a substitute for professional medical care.

The application is not medically validated or HIPAA-compliant. Browser `localStorage` is not a secure medical-record storage system. Users should avoid storing highly sensitive information on shared or public devices.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build locally |

---

## Future Scope

Potential areas for future development include:

- Secure account-based synchronization.
- Improved accessibility and multilingual support.
- More flexible report customization.
- Additional ways to prepare for healthcare appointments.
- Expanded support for different stages of women's health.

These are future possibilities and should not be considered implemented features unless available in the application.

---

## Disclaimer

HerHealth Timeline is an informational and personal documentation tool. It does not provide medical diagnosis, treatment recommendations, or emergency care.

Always consult a qualified healthcare professional regarding symptoms, health concerns, or medical decisions.

---

**HerHealth Timeline — Your experiences matter. Your story deserves to be heard.**
