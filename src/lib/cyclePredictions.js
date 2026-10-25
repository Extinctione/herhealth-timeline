// Cycle-length estimation, pattern insights, and context-summary helpers
// for HerCycle. All deterministic/local math — no AI call involved, and
// no diagnostic claims. Every function that produces a prediction returns
// an explicit `status` so the UI can show "not enough data" or "too
// irregular to estimate" instead of forcing a confident-looking date.

import { addDaysISO } from './format.js'

const MIN_CYCLES_FOR_ESTIMATE = 2
const IRREGULAR_RANGE_THRESHOLD_DAYS = 10 // max − min cycle length considered "irregular"

function daysBetween(isoA, isoB) {
  const a = new Date(`${isoA}T00:00:00`)
  const b = new Date(`${isoB}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

/** Cycle length = days between the start of one period and the start of the next. */
export function computeCycleLengths(periods) {
  const lengths = []
  for (let i = 1; i < periods.length; i++) {
    lengths.push(daysBetween(periods[i - 1].startDate, periods[i].startDate))
  }
  return lengths
}

export function getCurrentCycleDay(periods, todayISODate) {
  if (periods.length === 0) return null
  const last = periods[periods.length - 1]
  const day = daysBetween(last.startDate, todayISODate) + 1
  return day > 0 ? day : null
}

/**
 * Returns a prediction object with an explicit status:
 * - 'insufficient-data': fewer than 2 completed cycles logged
 * - 'irregular': enough data, but cycle lengths vary too much to give a
 *   single reliable estimate — a range is shown instead of a date
 * - 'ok': a next-period estimate window is given
 * In all cases this is explicitly labeled an estimate, never a certainty.
 */
export function getPrediction(periods, lifeStage) {
  if (periods.length < MIN_CYCLES_FOR_ESTIMATE) {
    return {
      status: 'insufficient-data',
      message:
        periods.length === 0
          ? 'Log your period to start building an estimate. We need at least two logged periods to estimate a cycle length.'
          : 'One period logged so far. Log your next period to start seeing a cycle-length estimate.',
    }
  }

  const lengths = computeCycleLengths(periods)
  const avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  const minLength = Math.min(...lengths)
  const maxLength = Math.max(...lengths)
  const range = maxLength - minLength

  const periodLengths = periods.map((p) => p.lengthDays)
  const avgPeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)

  const lastPeriod = periods[periods.length - 1]
  const estimatedNextStart = addDaysISO(lastPeriod.startDate, avgCycleLength)

  const irregular = range > IRREGULAR_RANGE_THRESHOLD_DAYS

  if (irregular) {
    return {
      status: 'irregular',
      avgCycleLength,
      avgPeriodLength,
      cycleLengths: lengths,
      minLength,
      maxLength,
      message:
        lifeStage === 'perimenopause'
          ? `Your logged cycles have ranged from ${minLength} to ${maxLength} days recently. Cycle changes like this are common during perimenopause, so we're not showing a single predicted date — the range above reflects what you've logged.`
          : `Your logged cycles have ranged from ${minLength} to ${maxLength} days, which is too much variation for a reliable single-date estimate. This can be normal — keep logging to refine it, or mention this pattern to a healthcare professional.`,
    }
  }

  return {
    status: 'ok',
    avgCycleLength,
    avgPeriodLength,
    cycleLengths: lengths,
    estimatedNextStart,
    windowStart: addDaysISO(estimatedNextStart, -2),
    windowEnd: addDaysISO(estimatedNextStart, 2),
    message:
      lifeStage === 'perimenopause'
        ? 'This estimate is based on your recent logged cycles. During perimenopause, cycles can change from month to month, so treat this as a rough guide rather than a firm date.'
        : 'This is an estimate based on your own logged history, not a guarantee.',
  }
}

/**
 * Recurring symptoms across logged cycles, for the Insights panel. Groups
 * symptom logs by which period-to-period window they fall in, then counts
 * how many distinct cycles each symptom appeared in (not just total
 * mentions), so a symptom logged 5 times in one cycle doesn't outrank one
 * logged once in each of 3 different cycles.
 */
export function getRecurringSymptoms(symptomLogs, periods) {
  if (symptomLogs.length === 0) return []

  const windows =
    periods.length > 0
      ? periods.map((p, i) => ({
          start: p.startDate,
          end: i + 1 < periods.length ? addDaysISO(periods[i + 1].startDate, -1) : null,
        }))
      : []

  function windowIndexFor(date) {
    if (windows.length === 0) return 'unassigned'
    for (let i = windows.length - 1; i >= 0; i--) {
      if (date >= windows[i].start && (windows[i].end === null || date <= windows[i].end)) return i
      if (date < windows[i].start && i === 0) return 'before-tracking'
    }
    return 'unassigned'
  }

  const symptomToWindows = {}
  for (const log of symptomLogs) {
    const w = windowIndexFor(log.date)
    for (const symptom of log.symptoms || []) {
      symptomToWindows[symptom] = symptomToWindows[symptom] || new Set()
      symptomToWindows[symptom].add(w)
    }
  }

  return Object.entries(symptomToWindows)
    .map(([symptom, windowSet]) => ({ symptom, cycleCount: windowSet.size }))
    .sort((a, b) => b.cycleCount - a.cycleCount)
    .filter((s) => s.cycleCount >= 1)
    .slice(0, 8)
}

export function getMoodFrequency(symptomLogs) {
  const counts = {}
  for (const log of symptomLogs) {
    if (!log.mood) continue
    counts[log.mood] = (counts[log.mood] || 0) + 1
  }
  return Object.entries(counts)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Short, neutral, non-diagnostic text summary for two consumers: the
 * Health Story report and (opt-in) Hera chat context. Deliberately
 * describes only what was logged — no causal or diagnostic language.
 */
export function getCycleContextSummary(periods, symptomLogs, lifeStage, todayISODate) {
  if (lifeStage === 'prefer-not-to-say') {
    return null
  }

  const parts = []

  if (periods.length === 0) {
    parts.push('No period data has been logged yet.')
  } else {
    const currentDay = getCurrentCycleDay(periods, todayISODate)
    const last = periods[periods.length - 1]
    parts.push(
      `Last logged period started ${last.startDate}${last.endDate !== last.startDate ? ` and ended ${last.endDate}` : ''}.`
    )
    if (currentDay) parts.push(`Today is approximately cycle day ${currentDay} since that start date.`)

    const prediction = getPrediction(periods, lifeStage)
    if (prediction.status === 'ok') {
      parts.push(
        `Average logged cycle length is about ${prediction.avgCycleLength} days (estimate only, based on ${periods.length} logged periods).`
      )
    } else if (prediction.status === 'irregular') {
      parts.push(`Logged cycle lengths have varied (${prediction.minLength}–${prediction.maxLength} days).`)
    }
  }

  const recurring = getRecurringSymptoms(symptomLogs, periods).slice(0, 4)
  if (recurring.length > 0) {
    parts.push(`Recently logged symptoms include: ${recurring.map((r) => r.symptom).join(', ')}.`)
  }

  if (lifeStage === 'perimenopause') parts.push('User has indicated they are tracking perimenopause-related changes.')
  if (lifeStage === 'postmenopause') parts.push('User has indicated they are not currently tracking periods (e.g. postmenopause).')

  return parts.join(' ')
}
