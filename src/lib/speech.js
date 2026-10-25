// Minimal wrapper around the browser's native SpeechRecognition API for
// voice logging. No external dependency — this is built into Chrome,
// Edge, and Safari. Not supported in Firefox; callers must feature-detect
// via `supported` and show a clear fallback message (not just hide the
// control) when false — see VoiceInputButton.jsx.
//
// Note: like any browser speech-to-text, recognition may be processed by
// the browser vendor's own service (this is standard browser behavior,
// not something this app's server is involved in). Nothing captured here
// is sent to our AI backend or stored anywhere until the user reviews the
// resulting text and explicitly saves their entry.

import { useCallback, useEffect, useRef, useState } from 'react'

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * onTranscript(text, isFinal) is called as recognition progresses:
 * isFinal=false for live interim text, isFinal=true once a phrase is
 * confirmed. The caller decides what to do with it (e.g. append to a
 * draft textarea) — this hook never writes anywhere itself.
 */
export function useSpeechToText({ onTranscript, lang = 'en-US' } = {}) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser.')
      return
    }
    setError('')
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      if (finalText) onTranscriptRef.current?.(finalText, true)
      else if (interimText) onTranscriptRef.current?.(interimText, false)
    }
    recognition.onerror = (event) => {
      const code = event.error
      // Some browsers fire an 'aborted' error as a side effect of calling
      // stop() ourselves (i.e. the user intentionally pressed "Stop & use")
      // — that's not a real failure, so don't show an error for it. onend
      // (below) still fires right after and clears `listening` either way.
      if (code === 'aborted') return
      const messages = {
        'not-allowed': 'Microphone access was denied. Allow microphone access in your browser settings and try again.',
        'service-not-allowed': 'Microphone access was denied. Allow microphone access in your browser settings and try again.',
        'no-speech': 'No speech was detected. Press the button and try again.',
        'audio-capture': 'No microphone was found. Please check your device and try again.',
        'network':
          "Voice input couldn't reach your browser's speech service. Chrome/Edge send audio to their own cloud speech service (not this app's AI backend) to transcribe it, so this needs a working internet connection with nothing blocking it. Check your connection, and any VPN, firewall, or ad-blocking extension that might block Google's/Microsoft's speech service — or just type your description directly below.",
      }
      setError(messages[code] || 'Voice input ran into an error. Please try again.')
      setListening(false)
    }
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [lang])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, error, start, stop, supported: isSpeechRecognitionSupported() }
}
