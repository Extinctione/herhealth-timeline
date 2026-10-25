import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, Loader2, Droplet } from 'lucide-react'
import { Card, Button, Badge, TextArea } from '../components/ui.jsx'
import { requestHeraChat } from '../lib/aiClient.js'
import { getPeriods, getSymptomLogs, getCycleSettings, hasAnyCycleData } from '../lib/cycleStorage.js'
import { getCycleContextSummary } from '../lib/cyclePredictions.js'
import { todayISO } from '../lib/format.js'

const INTRO_MESSAGE = {
  role: 'assistant',
  content:
    "Hi, I'm Hera — here to help you understand general women's health topics in plain language. I can't diagnose anything or give medical advice, and I never read your Timeline or HerCycle data unless you turn on cycle context below. What's on your mind?",
}

export default function Hera() {
  const [messages, setMessages] = useState([INTRO_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSource, setLastSource] = useState(null)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  // Opt-in HerCycle context: OFF by default. When on, a short, factual,
  // non-diagnostic summary of logged cycle data is prepended to the next
  // outgoing message only — never stored, and never sent automatically.
  const [cycleContextAvailable, setCycleContextAvailable] = useState(false)
  const [cycleContextOn, setCycleContextOn] = useState(false)
  const [cycleContextSummary, setCycleContextSummary] = useState(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const available = hasAnyCycleData()
    setCycleContextAvailable(available)
    if (available) {
      const settings = getCycleSettings()
      setCycleContextSummary(getCycleContextSummary(getPeriods(), getSymptomLogs(), settings.lifeStage, todayISO()))
    }
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    // The bubble shown in the chat is always just what the user typed.
    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)
    try {
      // Only the conversation the user is actively having is sent — never
      // the Timeline, HerCircle, or Care Connect data. HerCycle context is
      // the one deliberate exception, and only when the user has switched
      // it on for this chat; even then it's descriptive, not diagnostic.
      const history = nextMessages.filter((m) => m !== INTRO_MESSAGE)
      const outgoing =
        cycleContextOn && cycleContextSummary
          ? history.map((m, i) =>
              i === history.length - 1
                ? {
                    ...m,
                    content: `[Cycle tracking context the user chose to share — descriptive only, not a diagnosis: ${cycleContextSummary}]\n\n${m.content}`,
                  }
                : m
            )
          : history
      const data = await requestHeraChat(outgoing)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || "I'm not sure how to respond to that." }])
      setLastSource(data.source)
    } catch {
      setError('Hera is unavailable right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Hera</h1>
          <p className="text-ink-soft">Your women's health education companion — not a diagnosis, just support.</p>
        </div>
        {lastSource && (
          <Badge tone={lastSource === 'live' ? 'sage' : 'neutral'}>
            {lastSource === 'live' ? 'Powered by Groq' : 'Simulated AI (demo)'}
          </Badge>
        )}
      </div>

      {cycleContextAvailable && (
        <button
          type="button"
          onClick={() => setCycleContextOn((v) => !v)}
          className={`flex items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition-colors ${
            cycleContextOn ? 'border-lavender-deep bg-lavender/30' : 'border-cream-dark bg-white/50 text-ink-soft'
          }`}
        >
          <Droplet size={14} className={`mt-0.5 shrink-0 ${cycleContextOn ? 'text-lavender-deep' : 'text-ink-faint'}`} />
          <span>
            <span className="block font-medium text-ink">
              {cycleContextOn ? 'Cycle context is included in this chat' : 'Include my HerCycle context'}
            </span>
            <span className="block text-ink-faint">
              {cycleContextOn
                ? 'Your next message will include a short summary of logged cycle data. Hera still won\u2019t diagnose anything. Tap to turn off.'
                : "Off by default. When on, a short summary (cycle day, recent symptoms) is shared with Hera for this chat only."}
            </span>
          </span>
        </button>
      )}

      <Card className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-ink text-cream' : 'bg-lavender/50 text-ink'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-lavender/50 px-4 py-2.5 text-sm text-ink-soft">
              <Loader2 size={14} className="animate-spin" /> Hera is thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </Card>

      {error && <p className="text-sm text-blush-deep">{error}</p>}

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
          rows={2}
          placeholder="Ask about cycles, menopause, general wellness…"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </Button>
      </form>

      <p className="rounded-xl bg-lavender/40 p-3 text-xs text-ink-soft">
        <Sparkles size={12} className="mr-1 inline -mt-0.5" />
        Hera shares general educational information only. It does not diagnose conditions or replace a healthcare
        professional. If this is an emergency, contact emergency services immediately.
      </p>
    </div>
  )
}
