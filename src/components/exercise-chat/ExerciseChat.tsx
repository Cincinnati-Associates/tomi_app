"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUp } from "lucide-react"
import Link from "next/link"
import { StageProgress } from "./StageProgress"
import { ChatMessage, TypingIndicator } from "./ChatMessage"
import { QuickReplyChips, type ChipOption } from "./QuickReplyChips"
import { NumberScale } from "./NumberScale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ExerciseMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface ActiveQuestion {
  type: "chips" | "multi_chips" | "number_scale" | "text" | "text_with_skip"
  options?: ChipOption[]
  min?: number
  max?: number
  skipLabel?: string
}

interface ExerciseChatProps {
  title: string
  stages: string[]
  currentStageIndex: number
  messages: ExerciseMessage[]
  activeQuestion: ActiveQuestion | null
  selectedAnswer: string | string[] | number | null
  isStreaming: boolean
  isComplete: boolean
  onSelectChip: (value: string) => void
  onSelectNumber: (value: number) => void
  onSubmitText: (text: string) => void
  onSkip?: () => void
  backHref?: string
  children?: React.ReactNode // For report/results slot
}

export function ExerciseChat({
  title,
  stages,
  currentStageIndex,
  messages,
  activeQuestion,
  selectedAnswer,
  isStreaming,
  isComplete,
  onSelectChip,
  onSelectNumber,
  onSubmitText,
  onSkip,
  backHref = "/journey",
  children,
}: ExerciseChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCount = useRef(0)
  const [userHasScrolled, setUserHasScrolled] = useState(false)

  // Smart auto-scroll: only on NEW messages, not on initial render
  useEffect(() => {
    const count = messages.length
    if (count > prevMessageCount.current && !userHasScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    prevMessageCount.current = count
  }, [messages.length, userHasScrolled])

  // Also scroll when streaming starts (typing indicator appears)
  useEffect(() => {
    if (isStreaming && !userHasScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isStreaming, userHasScrolled])

  // Also scroll when activeQuestion appears (chips/input rendered inline)
  useEffect(() => {
    if (activeQuestion && !userHasScrolled) {
      // Small delay to let the chips render before scrolling
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeQuestion, userHasScrolled])

  // Reset scroll lock when user sends a message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
      setUserHasScrolled(false)
    }
  }, [messages])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setUserHasScrolled(!isAtBottom)
  }

  const handleTextSubmit = () => {
    const text = textInputRef.current?.value?.trim()
    if (text) {
      onSubmitText(text)
      if (textInputRef.current) textInputRef.current.value = ""
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  // Complete state — show results
  if (isComplete && children) {
    return (
      <div className="min-h-screen pb-safe">
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3 max-w-[640px] mx-auto">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)]">
      {/* Header with progress */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-2 max-w-[640px] mx-auto">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-semibold text-foreground truncate flex-1">
            {title}
          </h1>
        </div>
        <div className="max-w-[640px] mx-auto">
          <StageProgress stages={stages} currentStageIndex={currentStageIndex} />
        </div>
      </div>

      {/* Scrollable messages + inline inputs */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="max-w-[640px] mx-auto w-full px-4 py-4 min-h-full flex flex-col">
          {/* Spacer to push messages down when few */}
          <div className="flex-1" />

          {/* Messages */}
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant"}
              />
            ))}

            {/* Typing indicator */}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <TypingIndicator />
            )}

            {/* Inline active question (chips / number scale / text input) */}
            {activeQuestion && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="pl-9" // align with assistant bubble (offset for avatar)
              >
                {(activeQuestion.type === "chips" ||
                  activeQuestion.type === "multi_chips") &&
                  activeQuestion.options && (
                    <QuickReplyChips
                      options={activeQuestion.options}
                      selected={selectedAnswer as string | string[] | null}
                      onSelect={onSelectChip}
                      multiSelect={activeQuestion.type === "multi_chips"}
                    />
                  )}

                {activeQuestion.type === "number_scale" && (
                  <NumberScale
                    min={activeQuestion.min}
                    max={activeQuestion.max}
                    selected={selectedAnswer as number | null}
                    onSelect={onSelectNumber}
                  />
                )}

                {(activeQuestion.type === "text" ||
                  activeQuestion.type === "text_with_skip") && (
                  <div className="space-y-2">
                    <div className="flex items-end gap-2 bg-muted rounded-xl p-1.5 pl-3">
                      <textarea
                        ref={textInputRef}
                        placeholder="Type your thoughts..."
                        rows={1}
                        onKeyDown={handleKeyDown}
                        className={cn(
                          "flex-1 resize-none bg-transparent text-sm focus:outline-none",
                          "min-h-[36px] max-h-[80px] py-1.5",
                          "text-foreground placeholder:text-muted-foreground"
                        )}
                        style={{ fontSize: "16px" }}
                        onChange={(e) => {
                          e.target.style.height = "auto"
                          e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"
                        }}
                      />
                      <motion.button
                        type="button"
                        onClick={handleTextSubmit}
                        className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </motion.button>
                    </div>
                    {activeQuestion.type === "text_with_skip" && onSkip && (
                      <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {activeQuestion.skipLabel ?? "Skip this question"}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
