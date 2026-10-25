import { useState } from 'react'
import { Sparkles, Loader2, X, ArrowRight } from 'lucide-react'
import { Field, TextInput, TextArea, Select, Button, Badge } from './ui.jsx'
import VoiceInputButton from './VoiceInputButton.jsx'
import { BODY_AREAS, DURATION_OPTIONS } from '../lib/tags.js'
import { requestDescribeHelp } from '../lib/aiClient.js'
import { todayISO } from '../lib/format.js'

export default function AIHelper({ onUseSuggestions, onSkip }) {
  const [rawText, setRawText] = useState('')
  const [date, setDate] = useState(todayISO())
  const [bodyArea, setBodyArea] = useState('')
  const [severity, setSeverity] = useState('')
  const [duration, setDuration] = useState('')
  const [dailyImpact, setDailyImpact] = useState('')
  const [showOptional, setShowOptional] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(null) // { clearerDescription, suggestedTags, followUpQuestions, source }
  const [editedDescription, setEditedDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  async function handleGetSuggestions() {
    if (!rawText.trim()) {
      setErrorMsg('Type a quick description first — even a rough one is fine.')
      return
    }
    setErrorMsg('')
    setLoading(true)
    try {
      const data = await requestDescribeHelp({
        rawText: rawText.trim(),
        date,
        bodyArea,
        severity: severity ? Number(severity) : undefined,
        duration,
        dailyImpact: dailyImpact.trim(),
      })
      setResult(data)
      setEditedDescription(data.clearerDescription || rawText.trim())
      setSelectedTags(data.suggestedTags || [])
    } catch {
      setErrorMsg('Could not reach the AI helper right now. You can still write your description directly below.')
    } finally {
      setLoading(false)
    }
  }

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleUse() {
    onUseSuggestions({
      date,
      description: editedDescription || rawText.trim(),
      tags: selectedTags,
      bodyArea,
      severity: severity ? Number(severity) : undefined,
      duration,
      dailyImpact,
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender text-lavender-deep">
          <Sparkles size={18} />
        </span>
        <div>
          <h3 className="font-serif text-lg text-ink">Help me describe it</h3>
          <p className="text-sm text-ink-soft">
            Write what you're noticing in plain language. The AI helper will suggest clearer wording and tags — you
            stay in control of what's kept.
          </p>
        </div>
      </div>

      <Field label="What are you noticing?">
        <TextArea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="e.g. my stomach has been hurting on and off since yesterday and I feel really tired"
          rows={3}
        />
        <VoiceInputButton className="mt-2" onAppend={(text) => setRawText((prev) => (prev ? `${prev} ${text}` : text))} />
      </Field>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="text-sm font-medium text-lavender-deep hover:underline"
      >
        {showOptional ? 'Hide optional details' : 'Add optional details (date, area, severity, duration, impact)'}
      </button>

      {showOptional && (
        <div className="grid gap-4 sm:grid-cols-2 animate-in">
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
          </Field>
          <Field label="Body area">
            <Select value={bodyArea} onChange={(e) => setBodyArea(e.target.value)}>
              <option value="">Not sure / skip</option>
              {BODY_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Severity (1–10)">
            <TextInput
              type="number"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              placeholder="e.g. 6"
            />
          </Field>
          <Field label="Duration">
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="">Not sure / skip</option>
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Daily impact" className="sm:col-span-2">
            <TextInput
              value={dailyImpact}
              onChange={(e) => setDailyImpact(e.target.value)}
              placeholder="e.g. had to leave work early"
            />
          </Field>
        </div>
      )}

      {errorMsg && <p className="text-sm text-blush-deep">{errorMsg}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleGetSuggestions} disabled={loading} variant="lavender">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Thinking…' : 'Get suggestions'}
        </Button>
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip and write it myself
          </Button>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border border-lavender-dark bg-lavender/30 p-5 space-y-4 animate-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Suggestions</p>
            <Badge tone={result.source === 'live' ? 'sage' : 'neutral'}>
              {result.source === 'live' ? 'Powered by Groq' : 'Simulated AI (demo)'}
            </Badge>
          </div>

          {result.liveError && (
            <p className="text-xs text-ink-faint">
              The live Groq request failed, so these are simulated suggestions instead — your description below is unchanged and safe to edit or save.
            </p>
          )}

          <Field label="Clearer description" hint="Feel free to edit — this will be used as your entry text.">
            <TextArea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={3} />
          </Field>

          {result.suggestedTags?.length > 0 && (
            <Field label="Suggested tags" hint="Tap to keep or remove.">
              <div className="flex flex-wrap gap-2">
                {result.suggestedTags.map((tag) => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium border inline-flex items-center gap-1 transition-colors ${
                        active
                          ? 'bg-lavender-dark border-lavender-deep text-ink'
                          : 'bg-white/70 border-ink-faint/30 text-ink-faint line-through'
                      }`}
                    >
                      {tag}
                      {active && <X size={12} />}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          {result.followUpQuestions?.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">A few optional follow-up questions</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {result.followUpQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          <Button type="button" onClick={handleUse}>
            Use this <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
