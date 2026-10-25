import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Droplet, CalendarPlus, X } from 'lucide-react'
import { Card, Button, Field, TextInput, Select } from '../ui.jsx'
import { FLOW_LEVELS } from '../../lib/tags.js'
import { formatDateIN, todayISO, dateToISO } from '../../lib/format.js'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const FLOW_DOT_CLASS = {
  light: 'bg-blush',
  medium: 'bg-blush-dark',
  heavy: 'bg-blush-deep',
}

function buildMonthGrid(year, month) {
  // month: 0-11
  const first = new Date(year, month, 1)
  const startOffset = first.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(dateToISO(new Date(year, month, d)))
  return cells
}

/**
 * Desktop-oriented month calendar for logging period days. Click a day to
 * mark/unmark it as a period day and set flow intensity. A quick date-range
 * form above the grid covers "log start/end date" in one step; the grid
 * itself lets each day's flow be edited individually afterwards.
 */
export default function CycleCalendar({ periodDays, prediction, onSetDay, onRemoveDay, onLogRange }) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [rangeStart, setRangeStart] = useState(today)
  const [rangeEnd, setRangeEnd] = useState(today)
  const [rangeFlow, setRangeFlow] = useState('medium')
  const [rangeError, setRangeError] = useState('')

  const flowByDate = useMemo(() => {
    const map = {}
    for (const d of periodDays) map[d.date] = d.flow
    return map
  }, [periodDays])

  const predictedWindow = useMemo(() => {
    if (prediction?.status !== 'ok') return null
    return { start: prediction.windowStart, end: prediction.windowEnd }
  }, [prediction])

  function isInPredictedWindow(iso) {
    if (!predictedWindow) return false
    return iso >= predictedWindow.start && iso <= predictedWindow.end
  }

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  function goMonth(delta) {
    setSelectedDate(null)
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function handleRangeSubmit(e) {
    e.preventDefault()
    try {
      onLogRange(rangeStart, rangeEnd, rangeFlow)
      setRangeError('')
      setRangeOpen(false)
    } catch (err) {
      setRangeError(err.message || 'Could not save this period.')
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => goMonth(-1)}
            className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dark"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="min-w-[10rem] text-center font-serif text-lg text-ink">{monthLabel}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => goMonth(1)}
            className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dark"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <Button variant="outline" onClick={() => setRangeOpen((v) => !v)}>
          <CalendarPlus size={16} /> Log period
        </Button>
      </div>

      {rangeOpen && (
        <form onSubmit={handleRangeSubmit} className="mb-4 grid gap-3 rounded-xl bg-lavender/20 p-4 sm:grid-cols-4 animate-in">
          <Field label="Start date">
            <TextInput type="date" value={rangeStart} max={today} onChange={(e) => setRangeStart(e.target.value)} />
          </Field>
          <Field label="End date">
            <TextInput type="date" value={rangeEnd} max={today} onChange={(e) => setRangeEnd(e.target.value)} />
          </Field>
          <Field label="Flow">
            <Select value={rangeFlow} onChange={(e) => setRangeFlow(e.target.value)}>
              {FLOW_LEVELS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setRangeOpen(false)}>
              Cancel
            </Button>
          </div>
          {rangeError && <p className="text-sm text-blush-deep sm:col-span-4">{rangeError}</p>}
        </form>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-faint">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`blank_${i}`} />
          const flow = flowByDate[iso]
          const isToday = iso === today
          const predicted = isInPredictedWindow(iso)
          const dayNum = Number(iso.slice(8, 10))
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelectedDate(iso === selectedDate ? null : iso)}
              className={`relative flex h-11 flex-col items-center justify-center rounded-lg border text-sm transition-colors ${
                flow
                  ? `${FLOW_DOT_CLASS[flow]} border-transparent text-ink`
                  : predicted
                    ? 'border-dashed border-lavender-deep text-ink-soft'
                    : 'border-transparent text-ink hover:bg-cream-dark'
              } ${isToday ? 'ring-2 ring-lavender-deep' : ''} ${selectedDate === iso ? 'outline outline-2 outline-ink' : ''}`}
              title={predicted && !flow ? 'In your estimated next-period window' : undefined}
            >
              {dayNum}
              {flow && <Droplet size={9} className="absolute bottom-1 opacity-70" />}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
        <LegendDot className="bg-blush" label="Light" />
        <LegendDot className="bg-blush-dark" label="Medium" />
        <LegendDot className="bg-blush-deep" label="Heavy" />
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-dashed border-lavender-deep" /> Estimated next period
        </span>
      </div>

      {selectedDate && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-cream-dark bg-white/70 p-3 animate-in">
          <p className="mr-1 text-sm font-medium text-ink">{formatDateIN(selectedDate)}</p>
          {FLOW_LEVELS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onSetDay(selectedDate, f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                flowByDate[selectedDate] === f.value
                  ? 'bg-lavender-dark border-lavender-deep text-ink'
                  : 'bg-white border-ink-faint/30 text-ink-soft hover:border-lavender-deep'
              }`}
            >
              {f.label}
            </button>
          ))}
          {flowByDate[selectedDate] && (
            <button
              type="button"
              onClick={() => {
                onRemoveDay(selectedDate)
              }}
              className="inline-flex items-center gap-1 rounded-full border border-ink-faint/30 px-3 py-1 text-xs font-medium text-blush-deep hover:bg-blush/40"
            >
              <X size={12} /> Unmark
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="ml-auto text-xs text-ink-faint hover:text-ink"
          >
            Close
          </button>
        </div>
      )}
    </Card>
  )
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${className}`} /> {label}
    </span>
  )
}
