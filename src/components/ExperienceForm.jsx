import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Field, TextInput, TextArea, Select, Button } from './ui.jsx'
import VoiceInputButton from './VoiceInputButton.jsx'
import { SUGGESTED_TAGS, BODY_AREAS, DURATION_OPTIONS } from '../lib/tags.js'
import { todayISO } from '../lib/format.js'

export default function ExperienceForm({ initial, onSave, onCancel, saveLabel = 'Save experience' }) {
  const [date, setDate] = useState(initial?.date || todayISO())
  const [description, setDescription] = useState(initial?.description || '')
  const [tags, setTags] = useState(initial?.tags || [])
  const [customTag, setCustomTag] = useState('')
  const [bodyArea, setBodyArea] = useState(initial?.bodyArea || '')
  const [severity, setSeverity] = useState(initial?.severity ?? 5)
  const [duration, setDuration] = useState(initial?.duration || '')
  const [dailyImpact, setDailyImpact] = useState(initial?.dailyImpact || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [error, setError] = useState('')

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function addCustomTag() {
    const t = customTag.trim()
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
    }
    setCustomTag('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Please add a description in your own words before saving.')
      return
    }
    if (!date) {
      setError('Please choose a date.')
      return
    }
    setError('')
    onSave({
      id: initial?.id,
      date,
      description: description.trim(),
      tags,
      bodyArea,
      severity: Number(severity),
      duration,
      dailyImpact: dailyImpact.trim(),
      notes: notes.trim(),
      isDemo: initial?.isDemo || false,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" required>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} required />
        </Field>
        <Field label="Body area">
          <Select value={bodyArea} onChange={(e) => setBodyArea(e.target.value)}>
            <option value="">Select an area (optional)</option>
            {BODY_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" required hint="Describe it in your own words — there are no wrong answers here.">
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sharp cramping low in my abdomen that came and went through the afternoon..."
          rows={4}
          required
        />
        <VoiceInputButton
          className="mt-2"
          onAppend={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))}
        />
      </Field>

      <Field label="Descriptive tags" hint="Tap to add or remove. These help you spot patterns over time.">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => {
            const active = tags.includes(tag)
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-lavender-dark border-lavender-deep text-ink'
                    : 'bg-white border-ink-faint/30 text-ink-soft hover:border-lavender-deep'
                }`}
              >
                {tag}
              </button>
            )
          })}
          {tags
            .filter((t) => !SUGGESTED_TAGS.includes(t))
            .map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium border bg-blush-dark/70 border-blush-deep text-ink inline-flex items-center gap-1"
              >
                {tag}
                <X size={12} />
              </button>
            ))}
        </div>
        <div className="mt-2 flex gap-2">
          <TextInput
            placeholder="Add a custom tag"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomTag()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addCustomTag}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`Severity: ${severity} / 10`} hint="How intense did it feel, at its worst?">
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full accent-[var(--color-lavender-deep)]"
          />
        </Field>
        <Field label="Duration">
          <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Select duration (optional)</option>
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Daily impact" hint="How did this affect your day — work, sleep, plans, mood?">
        <TextArea value={dailyImpact} onChange={(e) => setDailyImpact(e.target.value)} rows={2} />
      </Field>

      <Field label="Additional notes">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>

      {error && <p className="text-sm text-blush-deep">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit">{saveLabel}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
