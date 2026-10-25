// localStorage-backed data layer for Care Connect's "My Appointments".
//
// These are DEMO bookings only: this app has no real scheduling
// integration with any provider, so nothing created here is sent
// anywhere or confirmed by a real clinician — it's purely a local
// reminder, saved only on this device. Mirrors the storage.js /
// communityStorage.js pattern already used elsewhere in this app, and
// is entirely separate storage from both of those.

const APPTS_KEY = 'herhealth_care_appointments_v1'

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

function makeId() {
  return `appt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function getAppointments() {
  return readJSON(APPTS_KEY, []).sort(
    (a, b) => new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`)
  )
}

export function bookAppointment({ doctorId, doctorName, focusArea, type, date, time }) {
  const appts = readJSON(APPTS_KEY, [])
  const appt = {
    id: makeId(),
    doctorId,
    doctorName,
    focusArea,
    type,
    date,
    time,
    createdAt: new Date().toISOString(),
  }
  appts.push(appt)
  const ok = writeJSON(APPTS_KEY, appts)
  if (!ok) {
    throw new Error(
      "Could not save this appointment on this device. Your browser storage may be full or disabled (e.g. private browsing)."
    )
  }
  return appt
}

export function cancelAppointment(id) {
  const appts = readJSON(APPTS_KEY, []).filter((a) => a.id !== id)
  writeJSON(APPTS_KEY, appts)
}
