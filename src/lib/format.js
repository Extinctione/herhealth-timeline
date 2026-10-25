export function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateRange(start, end) {
  if (!start || !end) return ''
  if (start === end) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function todayISO() {
  return dateToISO(new Date())
}

// ---------------------------------------------------------------------------
// Local-timezone-safe date <-> ISO helpers.
//
// `date.toISOString().slice(0, 10)` converts to UTC first, which silently
// shifts the calendar date by one day whenever the local and UTC dates
// differ — e.g. for India (UTC+5:30), any local time before 5:30am, or for
// any `addDays()`-style local-midnight calculation, regardless of time of
// day. That bug was previously duplicated (and present) in several places
// (HerCycle's calendar grid, cycle-length predictions, Care Connect's demo
// slot dates, period-range logging). dateToISO()/addDaysISO() below are the
// single, correct implementation — always read/write LOCAL date parts, never
// round-trip through UTC. All call sites should use these instead of
// re-deriving their own.
// ---------------------------------------------------------------------------

/** Converts a Date object to a 'YYYY-MM-DD' string using its LOCAL date
 * components, never toISOString()'s UTC conversion. */
export function dateToISO(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Adds `days` (may be negative) to an ISO 'YYYY-MM-DD' date string and
 * returns the result as an ISO string, using local date arithmetic
 * throughout so it's correct for any timezone. */
export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return dateToISO(d)
}

// ---------------------------------------------------------------------------
// India-localized date formatting (DD/MM/YYYY), used by HerCycle and the
// cycle section of Health Story. Kept separate from formatDate() above so
// the rest of the app (Timeline, Dashboard, Care Connect) is unaffected.
// ---------------------------------------------------------------------------

export function formatDateIN(isoDate) {
  if (!isoDate) return ''
  const d = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function formatDateRangeIN(start, end) {
  if (!start || !end) return ''
  if (start === end) return formatDateIN(start)
  return `${formatDateIN(start)} – ${formatDateIN(end)}`
}
