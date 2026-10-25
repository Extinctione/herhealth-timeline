/**
 * server/oxion.js
 * -----------------------------------------------------------------------
 * Server-side only AI integration. This file runs inside the Vite Node
 * process (wired up as dev middleware in vite.config.js) and is NEVER
 * imported by any browser/client code, so the API key never reaches the
 * browser.
 *
 * Talks to any OpenAI-compatible Chat Completions API (model, messages
 * in -> choices[0].message.content out), configured via AI_API_KEY /
 * AI_API_URL / AI_MODEL in .env.local. Currently wired to Groq
 * (https://api.groq.com/openai/v1), which hosts OpenAI's open-weight
 * "openai/gpt-oss-20b" model — confirmed live on Groq's production
 * models list as of Oct 2026. (GitHub Models' inference API was fully
 * retired on 2026-07-30 and can no longer be used as a provider.)
 *
 * Endpoint:  POST {AI_API_URL}/chat/completions
 * Auth:      Authorization: Bearer <AI_API_KEY>
 * Body:      { model, messages: [{ role, content }, ...] }
 * Response:  { choices: [{ message: { content: "..." } }] }
 *
 * This module asks the model to return a single JSON object (describing
 * the exact shape in the system prompt) and parses it out of
 * choices[0].message.content. Any failure (network, non-2xx, missing/
 * malformed content) is logged with status/error text only — never the
 * API key — and falls back to the local simulation below. Callers get a
 * `liveError` field on fallback so the UI can show that a live request
 * failed, distinct from "not configured".
 * -----------------------------------------------------------------------
 */

const DISCLAIMER =
  'This is a personal documentation summary generated from your own entries. It is not a diagnosis and is not medical advice.';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function isConfigured(config) {
  return Boolean(config && config.apiKey && config.apiUrl);
}

const AI_SYSTEM_PROMPTS = {
  'describe-symptom':
    'You are a careful writing assistant inside a personal health journaling app. This app is not diagnostic. ' +
    'Given a JSON object describing a user’s rough note about a symptom/experience, respond with ONLY a JSON ' +
    'object (no prose, no markdown fences) of this exact shape: ' +
    '{"clearerDescription": string, "suggestedTags": string[] (max 6 short symptom tags), ' +
    '"followUpQuestions": string[] (max 3 gentle clarifying questions)}. ' +
    'Stay close to the user’s own words. Never suggest a diagnosis, cause, or treatment.',
  'health-story':
    'You are a careful writing assistant inside a personal health journaling app. This app is not diagnostic. ' +
    'Given a JSON object with a date range and a list of dated journal entries, respond with ONLY a JSON object ' +
    '(no prose, no markdown fences) of this exact shape: ' +
    '{"narrative": string (first-person, plain-language, chronological summary), ' +
    '"discussionQuestions": string[] (max 5 questions the user could bring to a doctor based on patterns you see)}. ' +
    'Never state or imply a diagnosis, cause, or treatment.',
};

function buildMessages(task, input) {
  const system = AI_SYSTEM_PROMPTS[task];
  if (!system) throw new Error(`Unknown AI task: ${task}`);
  return [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(input) },
  ];
}

/** Pull the first {...} JSON object out of a model response, tolerating
 * stray prose or ```json fences some models add despite instructions. */
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in AI response');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Call the configured OpenAI-compatible chat/completions endpoint and
 * return the parsed JSON object the model was instructed to produce.
 * Throws on any failure; callers always catch and fall back to
 * simulation.
 */
async function callChatCompletionAPI(config, { task, input }) {
  const base = config.apiUrl.replace(/\/+$/, '');
  const endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || undefined,
        messages: buildMessages(task, input),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      // Diagnostic only: status + a short response snippet. Never logs
      // the Authorization header, the API key, or the full payload.
      console.warn(
        `[ai] HTTP ${response.status} ${response.statusText} from ${endpoint}` +
          (bodyText ? ` — ${bodyText.slice(0, 200)}` : '')
      );
      throw new Error(`AI provider responded with status ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('AI provider response had no message content');
    }
    return extractJSON(content);
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Local simulation — "Help me describe it"
// ---------------------------------------------------------------------------

const TAG_KEYWORDS = [
  { tag: 'Sharp pain', keywords: ['sharp pain', 'stabbing', 'sharp'] },
  { tag: 'Dull ache', keywords: ['dull ache', 'achy', 'ache', 'soreness', 'sore'] },
  { tag: 'Cramping', keywords: ['cramp', 'cramping', 'cramps'] },
  { tag: 'Fatigue', keywords: ['tired', 'fatigue', 'exhausted', 'exhaustion', 'no energy', 'drained'] },
  { tag: 'Headache', keywords: ['headache', 'migraine', 'head hurts'] },
  { tag: 'Nausea', keywords: ['nausea', 'nauseous', 'queasy', 'sick to my stomach'] },
  { tag: 'Dizziness', keywords: ['dizzy', 'dizziness', 'lightheaded', 'light-headed'] },
  { tag: 'Bloating', keywords: ['bloat', 'bloating', 'bloated', 'swollen belly'] },
  { tag: 'Mood changes', keywords: ['mood', 'irritable', 'anxious', 'anxiety', 'low mood', 'emotional'] },
  { tag: 'Sleep disruption', keywords: ['can’t sleep', 'cant sleep', 'insomnia', 'trouble sleeping', 'waking up'] },
  { tag: 'Hot flashes', keywords: ['hot flash', 'hot flush', 'sudden heat'] },
  { tag: 'Joint stiffness', keywords: ['stiff', 'stiffness', 'joint pain', 'joints ache'] },
  { tag: 'Skin changes', keywords: ['rash', 'skin', 'breakout', 'itchy skin'] },
  { tag: 'Appetite changes', keywords: ['appetite', 'not hungry', 'overeating', 'craving'] },
  { tag: 'Brain fog', keywords: ['brain fog', 'can’t focus', 'cant focus', 'foggy', 'hard to concentrate'] },
  { tag: 'Heavy bleeding', keywords: ['heavy bleeding', 'heavy flow', 'clots'] },
  { tag: 'Shortness of breath', keywords: ['short of breath', 'breathless', 'hard to breathe'] },
];

function cleanSentence(text) {
  let t = (text || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

function simulateDescribe(input) {
  const { rawText = '', date, bodyArea, severity, duration, dailyImpact } = input;
  const lower = rawText.toLowerCase();

  const suggestedTags = [];
  for (const entry of TAG_KEYWORDS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      suggestedTags.push(entry.tag);
    }
    if (suggestedTags.length >= 6) break;
  }

  const extras = [];
  if (bodyArea) extras.push(`in the ${bodyArea.toLowerCase()}`);
  if (severity) extras.push(`rated around ${severity}/10 in intensity`);
  if (duration) extras.push(`lasting ${duration.toLowerCase()}`);

  let clearerDescription = cleanSentence(rawText);
  if (extras.length) {
    clearerDescription += ` This was experienced ${extras.join(', ')}.`;
  }
  if (dailyImpact) {
    clearerDescription += ` ${cleanSentence(dailyImpact)}`;
  }

  const followUpQuestions = [];
  if (!duration) followUpQuestions.push('About how long did this last — minutes, hours, or days?');
  if (!dailyImpact) followUpQuestions.push('Did this get in the way of work, sleep, or daily activities?');
  if (!severity) followUpQuestions.push('On a scale of 1–10, how intense would you say this was?');
  followUpQuestions.push('Is there anything else about this experience worth noting down?');

  return {
    clearerDescription: clearerDescription.trim(),
    suggestedTags,
    followUpQuestions: followUpQuestions.slice(0, 3),
    date: date || null,
    source: 'simulated',
  };
}

// ---------------------------------------------------------------------------
// Local simulation — Health Story
// ---------------------------------------------------------------------------

/** Deterministic part of a Health Story: sorts entries and builds the
 * date range + per-entry summaries. Shared by the simulated and live
 * paths so the live model is only ever asked to write the narrative
 * prose and discussion questions, not invent entry data. */
function computeEntrySummaries(entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const dateRange =
    sorted.length > 0
      ? { start: sorted[0].date, end: sorted[sorted.length - 1].date }
      : { start: null, end: null };
  const entrySummaries = sorted.map((e) => ({
    id: e.id,
    date: e.date,
    description: e.description,
    tags: e.tags || [],
    bodyArea: e.bodyArea || null,
    severity: e.severity ?? null,
    duration: e.duration || null,
    dailyImpact: e.dailyImpact || null,
  }));
  return { dateRange, entrySummaries };
}

function simulateNarrativeAndQuestions(entrySummaries, dateRange) {
  const tagCounts = {};
  for (const e of entrySummaries) {
    for (const tag of e.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const recurringTags = Object.entries(tagCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const discussionQuestions = [];
  for (const { tag, count } of recurringTags.slice(0, 3)) {
    discussionQuestions.push(
      `I recorded "${tag}" on ${count} separate occasions between ${dateRange.start} and ${dateRange.end} — could we talk through what might be contributing to this pattern?`
    );
  }
  const severities = entrySummaries.map((e) => e.severity).filter((s) => typeof s === 'number');
  if (severities.length) {
    const avg = (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1);
    discussionQuestions.push(
      `My recorded severity has averaged about ${avg}/10 across these entries — what would you want to monitor going forward?`
    );
  }
  discussionQuestions.push('Are there any tests, next steps, or specialists you would recommend based on what I have documented?');
  discussionQuestions.push('Is there anything in this timeline that stands out to you as worth prioritizing?');

  const narrative = entrySummaries
    .map((e) => {
      const parts = [`On ${e.date}, I documented: "${e.description}"`];
      if (e.bodyArea) parts.push(`Area: ${e.bodyArea}.`);
      if (typeof e.severity === 'number') parts.push(`Recorded severity: ${e.severity}/10.`);
      if (e.duration) parts.push(`Duration: ${e.duration}.`);
      if (e.dailyImpact) parts.push(`Daily impact: ${e.dailyImpact}`);
      return parts.join(' ');
    })
    .join('\n\n');

  return { narrative, discussionQuestions: discussionQuestions.slice(0, 5) };
}

function simulateHealthStory(input) {
  const entries = Array.isArray(input.entries) ? input.entries : [];
  const { dateRange, entrySummaries } = computeEntrySummaries(entries);
  const { narrative, discussionQuestions } = simulateNarrativeAndQuestions(entrySummaries, dateRange);
  return { dateRange, entrySummaries, narrative, discussionQuestions, disclaimer: DISCLAIMER, source: 'simulated' };
}

// ---------------------------------------------------------------------------
// Public handlers used by the vite.config.js dev middleware
// ---------------------------------------------------------------------------

export async function handleDescribe(payload, config) {
  if (isConfigured(config)) {
    try {
      const result = await callChatCompletionAPI(config, { task: 'describe-symptom', input: payload });
      return {
        clearerDescription: result.clearerDescription || payload.rawText || '',
        suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags.slice(0, 6) : [],
        followUpQuestions: Array.isArray(result.followUpQuestions) ? result.followUpQuestions.slice(0, 3) : [],
        date: payload.date || null,
        source: 'live',
      };
    } catch (err) {
      // Fall through to simulation; never break the demo. liveError is
      // additive diagnostic data — safe to ignore, never the secret.
      console.warn('[ai] describe-symptom live call failed, falling back to simulation:', err.message);
      return { ...simulateDescribe(payload), liveError: err.message };
    }
  }
  return simulateDescribe(payload);
}

export async function handleHealthStory(payload, config) {
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const { dateRange, entrySummaries } = computeEntrySummaries(entries);

  if (isConfigured(config)) {
    try {
      const result = await callChatCompletionAPI(config, {
        task: 'health-story',
        input: { dateRange, entrySummaries },
      });
      return {
        dateRange,
        entrySummaries,
        narrative: result.narrative || '',
        discussionQuestions: Array.isArray(result.discussionQuestions) ? result.discussionQuestions.slice(0, 5) : [],
        disclaimer: DISCLAIMER,
        source: 'live',
      };
    } catch (err) {
      console.warn('[ai] health-story live call failed, falling back to simulation:', err.message);
      const { narrative, discussionQuestions } = simulateNarrativeAndQuestions(entrySummaries, dateRange);
      return {
        dateRange,
        entrySummaries,
        narrative,
        discussionQuestions,
        disclaimer: DISCLAIMER,
        source: 'simulated',
        liveError: err.message,
      };
    }
  }
  return simulateHealthStory(payload);
}
