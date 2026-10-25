// localStorage-backed data layer for HerCycle (period & cycle tracking).
//
// Separate storage from the Timeline's storage.js — this is its own data
// domain (period days, symptom/mood logs, tracking preferences) but
// follows the exact same pattern (readRaw/writeRaw, makeId, isDemo
// flagging, loadDemoData/clearDemoData) already used by storage.js and
// careConnectStorage.js elsewhere in this app, so it behaves consistently.
//
// Privacy: everything here stays in this browser's localStorage only.
// Nothing in this file makes a network request. Dates are stored as plain
// 'YYYY-MM-DD' strings and never appear in any URL or console log.

import { dateToISO } from './format.js'

const PERIOD_DAYS_KEY = 'herhealth_cycle_period_days_v1'
const SYMPTOM_LOGS_KEY = 'herhealth_cycle_symptom_logs_v1'
const SETTINGS_KEY = 'herhealth_cycle_settings_v1'
const DEMO_FLAG_KEY = 'herhealth_cycle_demo_loaded_v1'

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------------------------------------------------------------------------
// Period days — one record per calendar day marked as a period day, with a
// flow level. Consecutive days are grouped into "periods" by getPeriods().
// ---------------------------------------------------------------------------

export function getPeriodDays() {
  return readJSON(PERIOD_DAYS_KEY, []).sort((a, b) => (a.date < b.date ? -1 : 1))
}

/** Mark/update a single day as a period day with the given flow level. */
export function setPeriodDay(date, flow, isDemo = false) {
  const days = readJSON(PERIOD_DAYS_KEY, [])
  const idx = days.findIndex((d) => d.date === date)
  if (idx !== -1) {
    days[idx] = { ...days[idx], flow }
  } else {
    days.push({ date, flow, isDemo })
  }
  writeJSON(PERIOD_DAYS_KEY, days)
}

/** Unmark a day (remove it from period tracking entirely). */
export function removePeriodDay(date) {
  const days = readJSON(PERIOD_DAYS_KEY, []).filter((d) => d.date !== date)
  writeJSON(PERIOD_DAYS_KEY, days)
}

/** Bulk-log a period as a start/end date range with one flow level. */
export function logPeriodRange(startDate, endDate, flow) {
  const days = readJSON(PERIOD_DAYS_KEY, [])
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new Error('End date must be on or after the start date.')
  }
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = dateToISO(cursor)
    const idx = days.findIndex((d) => d.date === iso)
    if (idx !== -1) days[idx] = { ...days[idx], flow }
    else days.push({ date: iso, flow, isDemo: false })
    cursor.setDate(cursor.getDate() + 1)
  }
  const ok = writeJSON(PERIOD_DAYS_KEY, days)
  if (!ok) {
    throw new Error('Could not save this period on this device. Storage may be full or disabled (e.g. private browsing).')
  }
}

/**
 * Group period days into contiguous periods (a gap of >1 day starts a new
 * period). Each period reports its date range and the flow recorded on
 * each day within it.
 */
export function getPeriods() {
  const days = getPeriodDays()
  if (days.length === 0) return []

  const periods = []
  let current = null

  for (const day of days) {
    if (!current) {
      current = { startDate: day.date, endDate: day.date, days: [day] }
    } else {
      const prevDate = new Date(`${current.endDate}T00:00:00`)
      const thisDate = new Date(`${day.date}T00:00:00`)
      const diffDays = Math.round((thisDate - prevDate) / 86400000)
      if (diffDays <= 1) {
        current.endDate = day.date
        current.days.push(day)
      } else {
        periods.push(current)
        current = { startDate: day.date, endDate: day.date, days: [day] }
      }
    }
  }
  if (current) periods.push(current)

  return periods.map((p, i) => ({
    id: `period_${p.startDate}`,
    startDate: p.startDate,
    endDate: p.endDate,
    lengthDays: p.days.length,
    flows: p.days.map((d) => d.flow),
    isDemo: p.days.some((d) => d.isDemo),
    index: i,
  }))
}

// ---------------------------------------------------------------------------
// Symptom & mood logs — one entry per date (saving again for an existing
// date updates it rather than duplicating).
// ---------------------------------------------------------------------------

export function getSymptomLogs() {
  return readJSON(SYMPTOM_LOGS_KEY, []).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getSymptomLogByDate(date) {
  return readJSON(SYMPTOM_LOGS_KEY, []).find((l) => l.date === date) || null
}

export function saveSymptomLog(entry) {
  const logs = readJSON(SYMPTOM_LOGS_KEY, [])
  const now = new Date().toISOString()

  const existingIdx = entry.id
    ? logs.findIndex((l) => l.id === entry.id)
    : logs.findIndex((l) => l.date === entry.date)

  if (existingIdx !== -1) {
    logs[existingIdx] = { ...logs[existingIdx], ...entry, updatedAt: now }
    writeJSON(SYMPTOM_LOGS_KEY, logs)
    return logs[existingIdx]
  }

  const newLog = {
    id: makeId('cyclelog'),
    date: entry.date,
    symptoms: entry.symptoms || [],
    mood: entry.mood || '',
    notes: entry.notes || '',
    isDemo: Boolean(entry.isDemo),
    createdAt: now,
    updatedAt: now,
  }
  logs.push(newLog)
  const ok = writeJSON(SYMPTOM_LOGS_KEY, logs)
  if (!ok) {
    throw new Error('Could not save this log on this device. Storage may be full or disabled (e.g. private browsing).')
  }
  return newLog
}

export function deleteSymptomLog(id) {
  const logs = readJSON(SYMPTOM_LOGS_KEY, []).filter((l) => l.id !== id)
  writeJSON(SYMPTOM_LOGS_KEY, logs)
}

// ---------------------------------------------------------------------------
// Tracking preferences — keeps the feature inclusive of different life
// stages. null/unset is a valid, supported state (user hasn't said).
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS = { lifeStage: null }

export function getCycleSettings() {
  return { ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY, {}) }
}

export function saveCycleSettings(partial) {
  const next = { ...getCycleSettings(), ...partial }
  writeJSON(SETTINGS_KEY, next)
  return next
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

export function loadCycleDemoData({ periodDays, symptomLogs }) {
  const existingDays = readJSON(PERIOD_DAYS_KEY, []).filter((d) => !d.isDemo)
  const existingLogs = readJSON(SYMPTOM_LOGS_KEY, []).filter((l) => !l.isDemo)
  const now = new Date().toISOString()

  writeJSON(PERIOD_DAYS_KEY, [...existingDays, ...periodDays.map((d) => ({ ...d, isDemo: true }))])
  writeJSON(
    SYMPTOM_LOGS_KEY,
    [
      ...existingLogs,
      ...symptomLogs.map((l, i) => ({
        ...l,
        id: `demo_cyclelog_${i}_${Date.now()}`,
        isDemo: true,
        createdAt: now,
        updatedAt: now,
      })),
    ]
  )
  window.localStorage.setItem(DEMO_FLAG_KEY, 'true')
}

export function clearCycleDemoData() {
  writeJSON(PERIOD_DAYS_KEY, readJSON(PERIOD_DAYS_KEY, []).filter((d) => !d.isDemo))
  writeJSON(SYMPTOM_LOGS_KEY, readJSON(SYMPTOM_LOGS_KEY, []).filter((l) => !l.isDemo))
  window.localStorage.removeItem(DEMO_FLAG_KEY)
}

export function isCycleDemoLoaded() {
  return window.localStorage.getItem(DEMO_FLAG_KEY) === 'true'
}

export function hasAnyCycleData() {
  return getPeriodDays().length > 0 || getSymptomLogs().length > 0
}
