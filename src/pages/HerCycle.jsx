import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, RotateCcw, Loader2, FileText, Info } from 'lucide-react'
import { Card, Button } from '../components/ui.jsx'
import CycleCalendar from '../components/cycle/CycleCalendar.jsx'
import CycleOverview from '../components/cycle/CycleOverview.jsx'
import SymptomMoodLogger from '../components/cycle/SymptomMoodLogger.jsx'
import CycleInsights from '../components/cycle/CycleInsights.jsx'
import {
  getPeriodDays,
  getPeriods,
  setPeriodDay,
  removePeriodDay,
  logPeriodRange,
  getSymptomLogs,
  saveSymptomLog,
  deleteSymptomLog,
  getCycleSettings,
  saveCycleSettings,
  loadCycleDemoData,
  clearCycleDemoData,
  isCycleDemoLoaded,
  hasAnyCycleData,
} from '../lib/cycleStorage.js'
import { DEMO_PERIOD_DAYS, DEMO_SYMPTOM_LOGS } from '../lib/cycleDemoData.js'
import { getPrediction } from '../lib/cyclePredictions.js'

export default function HerCycle() {
  // Brief, explicitly-local loading state on mount — there's no network
  // request here (everything reads from localStorage, which is instant),
  // but this mirrors the same short simulated-loading pattern already used
  // in Care Connect's "Find a Doctor" tab so the loading state is real UI,
  // not just theoretical.
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [periodDays, setPeriodDays] = useState([])
  const [periods, setPeriods] = useState([])
  const [symptomLogs, setSymptomLogs] = useState([])
  const [settings, setSettings] = useState({ lifeStage: null })
  const [demoLoaded, setDemoLoaded] = useState(false)

  function refresh() {
    setPeriodDays(getPeriodDays())
    setPeriods(getPeriods())
    setSymptomLogs(getSymptomLogs())
    setSettings(getCycleSettings())
    setDemoLoaded(isCycleDemoLoaded())
  }

  useEffect(() => {
    refresh()
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])

  const prediction = useMemo(() => getPrediction(periods, settings.lifeStage), [periods, settings.lifeStage])

  function withErrorHandling(fn) {
    try {
      fn()
      setErrorMsg('')
      refresh()
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong saving that. Please try again.')
    }
  }

  function handleSetDay(date, flow) {
    withErrorHandling(() => setPeriodDay(date, flow))
  }
  function handleRemoveDay(date) {
    withErrorHandling(() => removePeriodDay(date))
  }
  function handleLogRange(start, end, flow) {
    logPeriodRange(start, end, flow) // lets CycleCalendar's own try/catch show the range-form error
    refresh()
  }
  function handleSaveSymptomLog(entry) {
    withErrorHandling(() => saveSymptomLog(entry))
  }
  function handleDeleteSymptomLog(id) {
    withErrorHandling(() => deleteSymptomLog(id))
  }
  function handleChangeLifeStage(lifeStage) {
    withErrorHandling(() => saveCycleSettings({ lifeStage }))
  }
  function handleLoadDemo() {
    withErrorHandling(() => loadCycleDemoData({ periodDays: DEMO_PERIOD_DAYS, symptomLogs: DEMO_SYMPTOM_LOGS }))
  }
  function handleClearDemo() {
    withErrorHandling(() => clearCycleDemoData())
  }

  const nothingLoggedYet = !loading && periodDays.length === 0 && symptomLogs.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">HerCycle</h1>
          <p className="max-w-2xl text-ink-soft">
            Track period dates, flow, symptoms, and mood — and see simple patterns over time. Estimates here are based
            only on what you log; they're not a diagnosis.
          </p>
        </div>
        {demoLoaded ? (
          <Button variant="outline" onClick={handleClearDemo}>
            <RotateCcw size={16} /> Clear demo data
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLoadDemo}>
            <Sparkles size={16} /> Load demo data
          </Button>
        )}
      </div>

      {errorMsg && <p className="rounded-xl bg-blush/40 p-3 text-sm text-blush-deep">{errorMsg}</p>}

      {nothingLoggedYet && (
        <Card className="p-6 text-center">
          <p className="text-ink-soft">
            Nothing logged yet. Use the calendar below to log a period, or{' '}
            <button type="button" onClick={handleLoadDemo} className="font-medium text-lavender-deep hover:underline">
              load demo data
            </button>{' '}
            to explore HerCycle first.
          </p>
        </Card>
      )}

      <Card className="flex flex-wrap items-start gap-2 bg-lavender/20 p-3.5 text-xs text-ink-soft">
        <Info size={14} className="mt-0.5 shrink-0 text-lavender-deep" />
        <span>
          This tracker is inclusive of menstruation, perimenopause, and menopause — set your preference in Cycle
          overview below, or skip it entirely. Your cycle summary can also be included in{' '}
          <Link to="/health-story" className="font-medium underline">
            Health Story
          </Link>{' '}
          and, if you choose, shared as context with{' '}
          <Link to="/hera" className="font-medium underline">
            Hera
          </Link>{' '}
          — Hera still won't diagnose anything.
        </span>
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center gap-2 p-16 text-ink-soft">
          <Loader2 size={20} className="animate-spin" /> Loading your cycle data…
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <CycleCalendar
              periodDays={periodDays}
              prediction={prediction}
              onSetDay={handleSetDay}
              onRemoveDay={handleRemoveDay}
              onLogRange={handleLogRange}
            />
            <CycleOverview
              periods={periods}
              prediction={prediction}
              lifeStage={settings.lifeStage}
              onChangeLifeStage={handleChangeLifeStage}
            />
          </div>
          <div className="space-y-6">
            <SymptomMoodLogger logs={symptomLogs} onSave={handleSaveSymptomLog} onDelete={handleDeleteSymptomLog} />
            <CycleInsights periods={periods} symptomLogs={symptomLogs} />
          </div>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-ink-soft">
          <FileText size={14} /> Bring this into your doctor-ready report
        </span>
        <Link to="/health-story">
          <Button variant="lavender">Go to Health Story</Button>
        </Link>
      </Card>
    </div>
  )
}
