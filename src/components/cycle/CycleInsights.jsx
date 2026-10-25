import { TrendingUp } from 'lucide-react'
import { Card, Badge } from '../ui.jsx'
import { getRecurringSymptoms, getMoodFrequency } from '../../lib/cyclePredictions.js'

export default function CycleInsights({ periods, symptomLogs }) {
  const recurring = getRecurringSymptoms(symptomLogs, periods)
  const moods = getMoodFrequency(symptomLogs)
  const hasEnoughForPatterns = periods.length >= 2 && symptomLogs.length >= 2

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-lavender-deep" />
        <h2 className="font-serif text-lg text-ink">Patterns & insights</h2>
      </div>

      {symptomLogs.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No symptom logs yet. Once you've logged a few, recurring symptoms across your cycles will show up here.
        </p>
      ) : (
        <>
          {!hasEnoughForPatterns && (
            <p className="rounded-lg bg-cream-dark/60 p-2.5 text-xs text-ink-faint">
              Patterns get more useful with more logged periods and symptoms — what you see below is based on{' '}
              {symptomLogs.length} log{symptomLogs.length === 1 ? '' : 's'} so far.
            </p>
          )}

          {recurring.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Most frequently logged symptoms</p>
              <ul className="space-y-1.5">
                {recurring.map((r) => (
                  <li key={r.symptom} className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{r.symptom}</span>
                    <Badge tone="lavender">
                      {r.cycleCount} cycle{r.cycleCount === 1 ? '' : 's'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {moods.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Mood, as logged</p>
              <div className="flex flex-wrap gap-1.5">
                {moods.map((m) => (
                  <Badge key={m.mood} tone="sage">
                    {m.mood} · {m.count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-ink-faint">
        These are simple counts of what you've logged — not a medical interpretation, and never a claim that any
        symptom is caused by a particular hormone or cycle phase.
      </p>
    </Card>
  )
}
