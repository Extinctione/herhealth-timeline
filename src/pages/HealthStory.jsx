import { useEffect, useMemo, useState } from 'react'
import { FileText, Loader2, Printer, CheckSquare, Square } from 'lucide-react'
import { Card, Button, Badge, TextArea } from '../components/ui.jsx'
import { getEntries } from '../lib/storage.js'
import { requestHealthStory } from '../lib/aiClient.js'
import { formatDate, formatDateRange } from '../lib/format.js'

export default function HealthStory() {
  const [entries, setEntries] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [report, setReport] = useState(null) // { dateRange, entrySummaries, narrative, discussionQuestions, source }
  const [narrativeText, setNarrativeText] = useState('')
  const [questionsText, setQuestionsText] = useState('')

  useEffect(() => {
    const all = getEntries()
    setEntries(all)
    setSelectedIds(new Set(all.map((e) => e.id)))
  }, [])

  const selectedEntries = useMemo(() => entries.filter((e) => selectedIds.has(e.id)), [entries, selectedIds])

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleGenerate() {
    if (selectedEntries.length === 0) {
      setErrorMsg('Select at least one entry to include in your Health Story.')
      return
    }
    setErrorMsg('')
    setLoading(true)
    try {
      const data = await requestHealthStory(selectedEntries)
      setReport(data)
      setNarrativeText(data.narrative || '')
      setQuestionsText((data.discussionQuestions || []).join('\n'))
    } catch {
      setErrorMsg('Could not generate the story right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Health Story</h1>
        <p className="text-ink-soft">Select entries to summarize into a report you can bring to an appointment.</p>
      </div>

      <Card className="no-print space-y-3 p-5">
        <p className="text-sm font-medium text-ink">Select entries to include</p>
        {entries.length === 0 ? (
          <p className="text-sm text-ink-soft">No entries yet — log an experience or load demo data first.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {entries.map((e) => {
              const checked = selectedIds.has(e.id)
              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => toggle(e.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    checked ? 'border-lavender-deep bg-lavender/30' : 'border-cream-dark bg-white/50'
                  }`}
                >
                  {checked ? (
                    <CheckSquare size={18} className="mt-0.5 shrink-0 text-lavender-deep" />
                  ) : (
                    <Square size={18} className="mt-0.5 shrink-0 text-ink-faint" />
                  )}
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-ink-faint">
                      {formatDate(e.date)}
                    </span>
                    <span className="block text-sm text-ink line-clamp-1">{e.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {errorMsg && <p className="text-sm text-blush-deep">{errorMsg}</p>}
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {loading ? 'Generating…' : 'Generate Health Story'}
        </Button>
      </Card>

      {report && (
        <div className="space-y-4">
          <div className="no-print flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge tone={report.source === 'live' ? 'sage' : 'neutral'}>
                {report.source === 'live' ? 'Powered by Live AI' : 'Simulated AI (demo)'}
              </Badge>
              {report.liveError && (
                <span className="text-xs text-ink-faint">The live AI request failed — showing a simulated story.</span>
              )}
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} /> Print / Save as PDF
            </Button>
          </div>

          <div id="print-report">
            <Card className="space-y-6 p-6 sm:p-8">
              <div className="border-b border-cream-dark pb-4">
                <h2 className="font-serif text-2xl text-ink">Personal Health Story</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {formatDateRange(report.dateRange?.start, report.dateRange?.end)} · {report.entrySummaries?.length || 0}{' '}
                  experiences
                </p>
                <p className="mt-3 rounded-lg bg-blush/40 p-3 text-xs text-ink-soft">
                  This is a personal documentation summary generated from self-reported entries. It is not a diagnosis
                  and is not medical advice.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-serif text-lg text-ink">Summary</h3>
                <TextArea
                  value={narrativeText}
                  onChange={(e) => setNarrativeText(e.target.value)}
                  rows={8}
                  className="no-print"
                />
                <p className="hidden whitespace-pre-line text-sm leading-relaxed text-ink print:block">{narrativeText}</p>
              </div>

              <div>
                <h3 className="mb-2 font-serif text-lg text-ink">Experiences included</h3>
                <div className="space-y-3">
                  {report.entrySummaries?.map((e) => (
                    <div key={e.id} className="rounded-xl border border-cream-dark p-3 text-sm">
                      <p className="font-medium text-ink">{formatDate(e.date)}</p>
                      <p className="mt-1 text-ink-soft">{e.description}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {e.bodyArea ? `${e.bodyArea} · ` : ''}
                        Severity: {typeof e.severity === 'number' ? `${e.severity}/10` : '—'}
                        {e.duration ? ` · Duration: ${e.duration}` : ''}
                      </p>
                      {e.dailyImpact && <p className="mt-1 text-xs text-ink-soft">Impact: {e.dailyImpact}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-serif text-lg text-ink">Questions for a healthcare professional</h3>
                <TextArea
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                  rows={5}
                  className="no-print"
                />
                <ul className="hidden list-disc space-y-1 pl-5 text-sm text-ink print:block">
                  {questionsText
                    .split('\n')
                    .filter(Boolean)
                    .map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
