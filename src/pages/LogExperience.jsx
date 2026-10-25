import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Card, Button } from '../components/ui.jsx'
import AIHelper from '../components/AIHelper.jsx'
import ExperienceForm from '../components/ExperienceForm.jsx'
import { getEntry, saveEntry } from '../lib/storage.js'

export default function LogExperience() {
  const { editId } = useParams()
  const navigate = useNavigate()

  // Derived directly from the route param during render instead of in an
  // effect: getEntry() is a synchronous, local (localStorage) read, so
  // there's nothing async to wait for and nothing here needs to live in
  // its own state. A present-but-unmatched editId (a stale/invalid link)
  // is handled below.
  const existingEntry = editId ? getEntry(editId) : null
  const editNotFound = Boolean(editId) && !existingEntry

  const [step, setStep] = useState(editId ? 'form' : 'helper')
  const [manualPrefill, setManualPrefill] = useState(null) // from "Help me describe it" suggestions
  const [saved, setSaved] = useState(false)

  // The only genuine side effect in this component is navigation — redirect
  // away from a stale/invalid edit link. Nothing else needs to be set from
  // an effect, so this never calls a React state setter.
  useEffect(() => {
    if (editNotFound) {
      navigate('/timeline', { replace: true })
    }
  }, [editNotFound, navigate])

  const initialData = editId ? existingEntry : manualPrefill
  // editId always forces the review/save form, regardless of `step` — so
  // the AI helper step can never show while editing, even in edge cases
  // where `step`'s state hasn't been touched since mount.
  const showHelper = !editId && step === 'helper'

  function handleUseSuggestions(data) {
    setManualPrefill(data)
    setStep('form')
  }

  function handleSave(entry) {
    saveEntry(entry)
    setSaved(true)
  }

  if (editNotFound) {
    // Nothing to show while the effect above redirects to /timeline.
    return null
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 size={40} className="text-sage-dark" />
          <h2 className="font-serif text-2xl text-ink">Experience saved</h2>
          <p className="text-ink-soft">It's now part of your personal timeline.</p>
          <div className="mt-2 flex gap-3">
            <Button onClick={() => navigate('/timeline')}>View timeline</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSaved(false)
                setManualPrefill(null)
                setStep('helper')
                navigate('/log')
              }}
            >
              Log another
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">{editId ? 'Edit experience' : 'Log an Experience'}</h1>
        <p className="mt-1 text-ink-soft">
          {editId
            ? 'Update the details below.'
            : 'Start however feels easiest — describe it loosely and get help, or fill in the form directly.'}
        </p>
      </div>

      {!editId && (
        <div className="flex items-center gap-2 text-sm">
          <StepDot active={step === 'helper'} label="Describe" />
          <span className="text-ink-faint">—</span>
          <StepDot active={step === 'form'} label="Review & save" />
        </div>
      )}

      <Card className="p-6 sm:p-8">
        {showHelper ? (
          <AIHelper onUseSuggestions={handleUseSuggestions} onSkip={() => setStep('form')} />
        ) : (
          <ExperienceForm
            initial={initialData}
            onSave={handleSave}
            onCancel={editId ? () => navigate('/timeline') : () => setStep('helper')}
            saveLabel={editId ? 'Save changes' : 'Save experience'}
          />
        )}
      </Card>
    </div>
  )
}

function StepDot({ active, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${active ? 'text-ink font-medium' : 'text-ink-faint'}`}>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-lavender-deep' : 'bg-ink-faint/40'}`} />
      {label}
    </span>
  )
}
