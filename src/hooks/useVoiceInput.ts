"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

/** How long to wait (ms) with no new speech before auto-stopping. */
const SILENCE_TIMEOUT_MS = 10_000

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stopListening = useCallback(() => {
    clearSilenceTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [clearSilenceTimer])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // Reset silence timer whenever new speech comes in
    const resetSilenceTimer = () => {
      clearSilenceTimer()
      silenceTimerRef.current = setTimeout(() => {
        stopListening()
      }, SILENCE_TIMEOUT_MS)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Combine all results into a single transcript
      let fullTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript
      }
      setTranscript(fullTranscript)
      resetSilenceTimer()
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' is expected when silence timeout is long — just keep listening
      if (event.error === 'no-speech') return
      clearSilenceTimer()
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      // In continuous mode, the browser may fire onend unexpectedly
      // (e.g. no-speech timeout). Restart if we're still supposed to be listening.
      if (recognitionRef.current === recognition) {
        try {
          recognition.start()
        } catch {
          // start() can throw if already started or aborted
          clearSilenceTimer()
          setIsListening(false)
          recognitionRef.current = null
        }
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setTranscript('')

    // Start the initial silence timer
    silenceTimerRef.current = setTimeout(() => {
      stopListening()
    }, SILENCE_TIMEOUT_MS)
  }, [isSupported, clearSilenceTimer, stopListening])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  }
}
