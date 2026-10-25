// Thin client for the server-side AI routes (see vite.config.js +
// server/oxion.js). The browser never talks to the AI provider directly
// — only to our own same-origin /api/* endpoints.

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
