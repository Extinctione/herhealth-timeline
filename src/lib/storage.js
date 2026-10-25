// localStorage-backed data layer for HerHealth Timeline.
// Simple, dependency-free CRUD for the demo.

const STORAGE_KEY = 'herhealth_entries_v1'
const DEMO_FLAG_KEY = 'herhealth_demo_loaded_v1'

function readRaw() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRaw(entries) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getEntries() {
  return readRaw().sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getEntry(id) {
  return readRaw().find((e) => e.id === id) || null
}

function makeId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function saveEntry(entry) {
  const entries = readRaw()
  const now = new Date().toISOString()

  if (entry.id) {
    const idx = entries.findIndex((e) => e.id === entry.id)
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], ...entry, updatedAt: now }
      writeRaw(entries)
      return entries[idx]
    }
  }

  const newEntry = {
    id: makeId(),
    date: entry.date || now.slice(0, 10),
    description: entry.description || '',
    tags: entry.tags || [],
    bodyArea: entry.bodyArea || '',
    severity: entry.severity ?? null,
    duration: entry.duration || '',
    dailyImpact: entry.dailyImpact || '',
    notes: entry.notes || '',
    isDemo: Boolean(entry.isDemo),
    createdAt: now,
    updatedAt: now,
  }
  entries.push(newEntry)
  writeRaw(entries)
  return newEntry
}

export function deleteEntry(id) {
  const entries = readRaw().filter((e) => e.id !== id)
  writeRaw(entries)
}

export function clearAllEntries() {
  writeRaw([])
  window.localStorage.removeItem(DEMO_FLAG_KEY)
}

export function hasAnyEntries() {
  return readRaw().length > 0
}

export function loadDemoData(demoEntries) {
  const existing = readRaw().filter((e) => !e.isDemo)
  const now = new Date().toISOString()
  const seeded = demoEntries.map((e, i) => ({
    ...e,
    id: `demo_${i}_${Date.now()}`,
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  }))
  writeRaw([...existing, ...seeded])
  window.localStorage.setItem(DEMO_FLAG_KEY, 'true')
}

export function clearDemoData() {
  const entries = readRaw().filter((e) => !e.isDemo)
  writeRaw(entries)
  window.localStorage.removeItem(DEMO_FLAG_KEY)
}

export function isDemoLoaded() {
  return window.localStorage.getItem(DEMO_FLAG_KEY) === 'true'
}
