import { useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Card, Field, TextInput, TextArea, Select, Button, Badge } from '../ui.jsx'
import VoiceInputButton from '../VoiceInputButton.jsx'
import { CYCLE_SYMPTOMS, MOOD_OPTIONS } from '../../lib/tags.js'
import { formatDateIN, todayISO } from '../../lib/format.js'

const emptyDraft = () => ({ id: null, date: todayISO(), symptoms: [], mood: '', notes: '' })

export default function SymptomMoodLogger({ logs, onSave, onDelete }) {
  const [draft, setDraft] = useState(emptyDraft())
  const [customSymptom, setCustomSymptom] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [error, setError] = useState('')

  function toggleSymptom(symptom) {
    setDraft((d) => ({
      ...d,
      symptoms: d.symptoms.includes(symptom) ? d.symptoms.filter((s) => s !== symptom) : [...d.symptoms, symptom],
    }))
  }

  function addCustomSymptom() {
    const s = customSymptom.trim()
    if (s && !draft.symptoms.includes(s)) {
      setDraft((d) => ({ ...d, symptoms: [...d.symptoms, s] }))
    }
    setCustomSymptom('')
  }

  function startEdit(log) {
    setDraft({ id: log.id, date: log.date, symptoms: log.symptoms || [], mood: log.mood || '', notes: log.notes || '' })
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!draft.date) {
      setError('Choose a date.')
      return
    }
    if (draft.symptoms.length === 0 && !draft.mood && !draft.notes.trim()) {
      setError('Add at least a symptom, mood, or note before saving.')
      return
    }
    setError('')
    onSave({ ...draft, notes: draft.notes.trim() })
    setDraft(emptyDraft())
  }

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="font-serif text-lg text-ink">Symptoms & mood</h2>
        <p className="text-xs text-ink-soft">Log how you're feeling — separate from your period dates above.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Date" required>
          <TextInput
            type="date"
            value={draft.date}
            max={todayISO()}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          />
        </Field>

        <Field label="Symptoms">
          <div className="flex flex-wrap gap-2">
            {CYCLE_SYMPTOMS.map((s) => {
              const active = draft.symptoms.includes(s)
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-lavender-dark border-lavender-deep text-ink'
                      : 'bg-white border-ink-faint/30 text-ink-soft hover:border-lavender-deep'
                  }`}
                >
                  {s}
                </button>
              )
            })}
            {draft.symptoms
              .filter((s) => !CYCLE_SYMPTOMS.includes(s))
              .map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className="inline-flex items-center gap-1 rounded-full border border-blush-deep bg-blush-dark/70 px-3 py-1.5 text-xs font-medium text-ink"
                >
                  {s}
                  <X size={11} />
                </button>
              ))}
          </div>
          <div className="mt-2 flex gap-2">
            <TextInput
              placeholder="Add a custom symptom"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSymptom()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomSymptom}>
              <Plus size={15} /> Add
            </Button>
          </div>
        </Field>

        <Field label="Mood">
          <Select value={draft.mood} onChange={(e) => setDraft((d) => ({ ...d, mood: e.target.value }))}>
            <option value="">Not noted</option>
            {MOOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Notes">
          <TextArea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={2}
          />
          <VoiceInputButton
            className="mt-2"
            onAppend={(text) => setDraft((d) => ({ ...d, notes: d.notes ? `${d.notes} ${text}` : text }))}
          />
        </Field>

        {error && <p className="text-sm text-blush-deep">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit">{draft.id ? 'Save changes' : 'Log entry'}</Button>
          {draft.id && (
            <Button type="button" variant="ghost" onClick={() => setDraft(emptyDraft())}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div className="border-t border-cream-dark pt-4">
        <p className="mb-2 text-sm font-medium text-ink">Recent logs</p>
        {logs.length === 0 ? (
          <p className="py-2 text-sm text-ink-soft">No symptom or mood logs yet.</p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => (
              <li key={log.id} className="rounded-xl border border-cream-dark bg-white/60 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">
                      {formatDateIN(log.date)} {log.isDemo && <Badge tone="blush" className="ml-1 align-middle">Demo</Badge>}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {log.mood && <Badge tone="sage">{log.mood}</Badge>}
                      {(log.symptoms || []).map((s) => (
                        <Badge key={s} tone="lavender">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    {log.notes && <p className="mt-1.5 text-xs text-ink-soft">{log.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() => startEdit(log)}
                      className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dark"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => setConfirmDeleteId(confirmDeleteId === log.id ? null : log.id)}
                      className="rounded-full p-1.5 text-blush-deep hover:bg-blush/40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {confirmDeleteId === log.id && (
                  <div className="mt-2 flex items-center gap-2 border-t border-cream-dark pt-2 text-xs">
                    <span className="text-ink-soft">Delete this log?</span>
                    <Button
                      variant="danger"
                      className="px-3 py-1 text-xs"
                      onClick={() => {
                        onDelete(log.id)
                        setConfirmDeleteId(null)
                      }}
                    >
                      Yes, delete
                    </Button>
                    <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
