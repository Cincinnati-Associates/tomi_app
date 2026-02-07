"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isStreaming])

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

  if (isComplete && children) {
    return (
      <div className="min-h-screen pb-safe">
        {/* Header */}
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
    <div className="flex flex-col min-h-screen pb-safe">
      {/* Header with progress */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
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

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[640px] mx-auto w-full">
        <div className="space-y-3">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant"}
            />
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {activeQuestion && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background border-t border-border px-4 py-4 pb-safe"
        >
          <div className="max-w-[640px] mx-auto">
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
                <div className="flex gap-2">
                  <textarea
                    ref={textInputRef}
                    placeholder="Type your thoughts..."
                    rows={2}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3",
                      "text-[16px] text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  />
                  <Button
                    onClick={handleTextSubmit}
                    size="sm"
                    className="self-end h-10"
                  >
                    Send
                  </Button>
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
          </div>
        </motion.div>
      )}
    </div>
  )
}
