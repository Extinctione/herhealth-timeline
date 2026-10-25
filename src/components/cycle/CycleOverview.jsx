import { Info, Sparkles } from 'lucide-react'
import { Card, Select, Field, Badge } from '../ui.jsx'
import { CYCLE_LIFE_STAGES } from '../../lib/tags.js'
import { formatDateIN, todayISO } from '../../lib/format.js'
import { getCurrentCycleDay } from '../../lib/cyclePredictions.js'

export default function CycleOverview({ periods, prediction, lifeStage, onChangeLifeStage }) {
  const currentDay = getCurrentCycleDay(periods, todayISO())
  const showPrediction = lifeStage !== 'prefer-not-to-say' && lifeStage !== 'postmenopause'

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-ink">Cycle overview</h2>
          <p className="text-xs text-ink-soft">Based only on what you've logged here.</p>
        </div>
        {currentDay && showPrediction && (
          <Badge tone="lavender">Cycle day {currentDay}</Badge>
        )}
      </div>

      <Field label="How would you like to use this tracker?" hint="You can change this anytime. Choosing 'Prefer not to say' hides predictions.">
        <Select value={lifeStage || ''} onChange={(e) => onChangeLifeStage(e.target.value || null)}>
          <option value="">Not set</option>
          {CYCLE_LIFE_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>

      {!showPrediction ? (
        <div className="flex items-start gap-2 rounded-xl bg-lavender/30 p-3 text-sm text-ink-soft">
          <Info size={16} className="mt-0.5 shrink-0 text-lavender-deep" />
          <p>
            Predictions are turned off for this setting. You can still log period days, symptoms, and mood below — nothing
            is required.
          </p>
        </div>
      ) : (
        <PredictionBlock prediction={prediction} periodsLogged={periods.length} />
      )}

      <p className="flex items-start gap-2 rounded-xl bg-cream-dark/60 p-3 text-xs text-ink-faint">
        <Info size={13} className="mt-0.5 shrink-0" />
        HerCycle is a personal tracking tool, not a diagnostic app. Estimates are based only on what you log and can be
        wrong — especially with irregular cycles or during perimenopause.
      </p>
    </Card>
  )
}

function PredictionBlock({ prediction, periodsLogged }) {
  if (!prediction || prediction.status === 'insufficient-data') {
    return (
      <div className="rounded-xl border border-dashed border-ink-faint/40 p-4 text-sm text-ink-soft">
        {prediction?.message || 'Log at least two periods to see a cycle-length estimate.'}
      </div>
    )
  }

  if (prediction.status === 'irregular') {
    return (
      <div className="space-y-2 rounded-xl bg-blush/30 p-4">
        <p className="text-sm font-medium text-ink">Cycles have varied recently</p>
        <p className="text-sm text-ink-soft">{prediction.message}</p>
        <p className="text-xs text-ink-faint">
          Logged cycle lengths: {prediction.cycleLengths.join(', ')} days (from {periodsLogged} periods)
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-xl bg-sage/40 p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-sage-dark" />
        <p className="text-sm font-medium text-ink">Estimated next period</p>
      </div>
      <p className="font-serif text-xl text-ink">
        {formatDateIN(prediction.windowStart)} – {formatDateIN(prediction.windowEnd)}
      </p>
      <div className="flex flex-wrap gap-4 text-xs text-ink-faint">
        <span>Avg. cycle length: {prediction.avgCycleLength} days</span>
        <span>Avg. period length: {prediction.avgPeriodLength} days</span>
      </div>
      <p className="text-xs text-ink-soft">{prediction.message}</p>
    </div>
  )
}
