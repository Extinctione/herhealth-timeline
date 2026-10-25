// Thin client for the server-side AI routes (see vite.config.js +
// server/groq.js). The browser never talks to Groq directly — only to
// our own same-origin /api/* endpoints.
//
// NOTE: for women's health data specifically, these calls (describe,
// health-story, hera-chat) are the ONLY places in the app that send any
// user-typed content off-device, and only what the user typed into that
// feature. Timeline storage, HerCircle posts/comments, and everything
// else stay in localStorage — nothing else in this app talks to the
// network at all.

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`)
  }
  return res.json()
}

export async function requestDescribeHelp(input) {
  return postJSON('/api/describe', input)
}

export async function requestHealthStory(entries) {
  return postJSON('/api/health-story', { entries })
}

export async function requestHeraChat(messages) {
  return postJSON('/api/hera-chat', { messages })
}
