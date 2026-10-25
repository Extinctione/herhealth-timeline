import { useState } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'
import { useSpeechToText } from '../lib/speech.js'

/**
 * Reusable voice-input control for any text draft field (AIHelper's rough
 * note, ExperienceForm's description). Speech is converted to text and
 * handed to the caller via onAppend — nothing is saved anywhere here.
 * The caller's existing field stays the single editable draft, and the
 * existing form Save button remains the confirm step, so voice logging
 * reuses the normal review-before-save flow rather than adding a new one.
 */
export default function VoiceInputButton({ onAppend, className = '' }) {
  const [interim, setInterim] = useState('')

  const { listening, error, start, stop, supported } = useSpeechToText({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setInterim('')
        onAppend(text.trim())
      } else {
        setInterim(text)
      }
    },
  })

  if (!supported) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-ink-faint ${className}`}>
        <MicOff size={13} />
        Voice input isn't supported in this browser. Try Chrome, Edge, or Safari.
      </div>
    )
  }

  function handleToggle() {
    if (listening) {
      stop()
      if (interim.trim()) {
        onAppend(interim.trim())
        setInterim('')
      }
    } else {
      setInterim('')
      start()
    }
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={listening}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          listening
            ? 'border-blush-deep bg-blush text-ink animate-pulse'
            : 'border-ink-faint/30 bg-white text-ink-soft hover:border-lavender-deep'
        }`}
        title="Uses your browser's built-in speech recognition — requires an internet connection to your browser's own speech service"
      >
        {listening ? <Square size={13} /> : <Mic size={13} />}
        {listening ? 'Stop & use' : 'Voice input'}
      </button>
      {listening && interim && <span className="text-xs italic text-ink-faint">{interim}…</span>}
      {error && <span className="max-w-xs text-xs text-blush-deep">{error}</span>}
    </div>
  )
}
