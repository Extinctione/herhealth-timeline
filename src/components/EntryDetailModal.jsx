import { useEffect, useState } from 'react'
import { X, Pencil, Trash2 } from 'lucide-react'
import { Badge, Button, SeverityDots } from './ui.jsx'
import ExperienceForm from './ExperienceForm.jsx'
import { formatDate } from '../lib/format.js'

export default function EntryDetailModal({ entry, onClose, onSave, onDelete }) {
  const [mode, setMode] = useState('view') // 'view' | 'edit' | 'confirm-delete'

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!entry) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl bg-cream p-6 shadow-xl animate-in sm:p-7">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{formatDate(entry.date)}</p>
            {entry.isDemo && (
              <Badge tone="blush" className="mt-1">
                Demo data
              </Badge>
            )}
          </div>
          <button aria-label="Close" onClick={onClose} className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dark">
            <X size={20} />
          </button>
        </div>

        {mode === 'edit' && (
          <ExperienceForm
            initial={entry}
            saveLabel="Save changes"
            onCancel={() => setMode('view')}
            onSave={(updated) => {
              onSave(updated)
              setMode('view')
            }}
          />
        )}

        {mode === 'view' && (
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed text-ink">{entry.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {entry.bodyArea && <Badge tone="sage">{entry.bodyArea}</Badge>}
              {entry.tags?.map((tag) => (
                <Badge key={tag} tone="lavender">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/60 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-ink-faint text-xs">Severity</p>
                <SeverityDots value={entry.severity} />
              </div>
              <div>
                <p className="text-ink-faint text-xs">Duration</p>
                <p className="text-ink">{entry.duration || '—'}</p>
              </div>
              <div>
                <p className="text-ink-faint text-xs">Daily impact</p>
                <p className="text-ink">{entry.dailyImpact || '—'}</p>
              </div>
            </div>

            {entry.notes && (
              <div>
                <p className="mb-1 text-xs text-ink-faint">Notes</p>
                <p className="text-sm text-ink-soft">{entry.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setMode('edit')}>
                <Pencil size={16} /> Edit
              </Button>
              <Button variant="danger" onClick={() => setMode('confirm-delete')}>
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          </div>
        )}

        {mode === 'confirm-delete' && (
          <div className="space-y-4">
            <p className="text-sm text-ink">
              Delete this entry from <strong>{formatDate(entry.date)}</strong>? This can't be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={() => onDelete(entry.id)}>
                Yes, delete it
              </Button>
              <Button variant="ghost" onClick={() => setMode('view')}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
