"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomiWelcomeProps {
  displayName: string | null
  entryPath: "assessment" | "calculator" | "invite" | "cold"
  inviterName?: string
  onComplete: () => void
}

const WELCOME_MESSAGES: Record<
  string,
  (name: string | null, inviterName?: string) => string[]
> = {
  assessment: (name) => [
    `Welcome back${name ? `, ${name}` : ""}! I saved your readiness results.`,
    "Now let's turn that momentum into a plan.",
    "I've set up your personal journey — it starts with understanding what you really want out of co-ownership.",
  ],
  calculator: (name) => [
    `Great news${name ? `, ${name}` : ""} — your co-buying numbers are saved.`,
    "Let's figure out your goals and find the right people to do this with.",
    "Your journey starts with a quick reflection — it'll make everything else more personal.",
  ],
  invite: (name, inviterName) => [
    `Welcome${name ? `, ${name}` : ""}! ${inviterName || "Someone"} thinks you'd be a great co-buyer.`,
    "Before we jump in, let's make sure this is a good fit for you too.",
    "We'll start with a quick exercise about your goals — takes about 5 minutes.",
  ],
  cold: (name) => [
    `Welcome to Tomi${name ? `, ${name}` : ""}! I'm Homi, your co-ownership guide.`,
    "I'm here to help you figure out if co-buying is right for you, and if so, make it happen.",
    "Let's start by understanding what you want — your goals, expectations, and motivations.",
  ],
}

export function HomiWelcome({
  displayName,
  entryPath,
  inviterName,
  onComplete,
}: HomiWelcomeProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [messagesShown, setMessagesShown] = useState<string[]>([])

  const messages =
    WELCOME_MESSAGES[entryPath]?.(displayName, inviterName) ??
    WELCOME_MESSAGES.cold(displayName)

  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      const timeout = setTimeout(() => {
        setMessagesShown((prev) => [...prev, messages[currentMessageIndex]])
        setCurrentMessageIndex((prev) => prev + 1)
      }, currentMessageIndex === 0 ? 500 : 1500)
      return () => clearTimeout(timeout)
    }
  }, [currentMessageIndex, messages])

  const allShown = messagesShown.length === messages.length

  const handleSkip = useCallback(() => {
    onComplete()
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      {/* Homi avatar */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-8"
      >
        <Sparkles className="h-8 w-8 text-primary" />
      </motion.div>

      {/* Messages */}
      <div className="max-w-md w-full space-y-3">
        <AnimatePresence>
          {messagesShown.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl rounded-tl-sm border border-border p-4 shadow-sm"
            >
              <p className="text-sm text-foreground leading-relaxed">{msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {!allShown && messagesShown.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 px-4 py-3"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-muted-foreground/40"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <AnimatePresence>
        {allShown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Button onClick={onComplete} size="lg" className="gap-2">
              Let&apos;s get started
            </Button>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
