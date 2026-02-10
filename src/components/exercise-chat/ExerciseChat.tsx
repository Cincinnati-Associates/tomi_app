"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react"
import Link from "next/link"
import { StageProgress } from "./StageProgress"
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
  children?: React.ReactNode
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCount = useRef(0)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Scroll on new messages
  useEffect(() => {
    if (!userHasScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, userHasScrolled])

  // Track new messages for scroll behavior
  useEffect(() => {
    const count = messages.length
    if (count > prevMessageCount.current) {
      setUserHasScrolled(false)
    }
    prevMessageCount.current = count
  }, [messages.length])

  // Scroll when streaming
  useEffect(() => {
    if (isStreaming && !userHasScrolled) scrollToBottom()
  }, [isStreaming, userHasScrolled, scrollToBottom])

  // Scroll when activeQuestion changes
  useEffect(() => {
    if (activeQuestion && !userHasScrolled) {
      const timer = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timer)
    }
  }, [activeQuestion, userHasScrolled, scrollToBottom])

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setUserHasScrolled(!isAtBottom)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  const handleSubmit = () => {
    const text = inputValue.trim()
    if (text) {
      onSubmitText(text)
      setInputValue("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Show chips / number_scale as quick-reply options
  const hasChips =
    activeQuestion &&
    !isStreaming &&
    (activeQuestion.type === "chips" || activeQuestion.type === "multi_chips") &&
    activeQuestion.options

  const hasNumberScale =
    activeQuestion && !isStreaming && activeQuestion.type === "number_scale"

  const hasSkip =
    activeQuestion &&
    !isStreaming &&
    activeQuestion.type === "text_with_skip" &&
    onSkip

  // ── Complete state — show results ──────────────────────────────────
  if (isComplete && children) {
    return (
      <div className="min-h-screen pb-safe">
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl lg:max-w-3xl mx-auto">
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

  // ── Main chat layout ───────────────────────────────────────────────
  // Fixed position below AppNavbar (56px). No page scroll — only the
  // messages area inside scrolls.
  return (
    <div className="fixed inset-0 top-14 flex flex-col bg-background z-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base sm:text-lg text-foreground leading-tight">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">Homi</p>
          </div>
        </div>
        <StageProgress stages={stages} currentStageIndex={currentStageIndex} />
      </div>

      {/* ── Messages area ── */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain"
        onScroll={handleMessagesScroll}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "assistant" ? (
                <div className="flex gap-3 max-w-[90%]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">Homi</span>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed text-foreground">
                      {msg.content}
                      {isStreaming &&
                        msg === messages[messages.length - 1] && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block ml-0.5 w-1.5 h-4 bg-current align-middle"
                          />
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isStreaming &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-muted-foreground/50"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input area (always at bottom) ── */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-4 sm:pb-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Quick-reply chips above the text input */}
          <AnimatePresence mode="wait">
            {hasChips && (
              <motion.div
                key="chips"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="mb-3"
              >
                <QuickReplyChips
                  options={activeQuestion!.options!}
                  selected={selectedAnswer as string | string[] | null}
                  onSelect={onSelectChip}
                  multiSelect={activeQuestion!.type === "multi_chips"}
                />
              </motion.div>
            )}

            {hasNumberScale && (
              <motion.div
                key="number"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="mb-3"
              >
                <NumberScale
                  min={activeQuestion!.min}
                  max={activeQuestion!.max}
                  selected={selectedAnswer as number | null}
                  onSelect={onSelectNumber}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text input — always visible */}
          <div className="flex items-end gap-3 bg-muted rounded-2xl p-2 pl-4">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                activeQuestion
                  ? "Or type your own answer..."
                  : "Type your thoughts..."
              }
              className={cn(
                "flex-1 resize-none bg-transparent text-sm focus:outline-none",
                "min-h-[40px] max-h-[120px] py-2",
                "text-foreground placeholder:text-muted-foreground"
              )}
              style={{ fontSize: "16px" }}
              rows={1}
              disabled={isStreaming}
            />
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isStreaming}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Skip link */}
          {hasSkip && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 ml-1"
            >
              {activeQuestion!.skipLabel ?? "Skip this question"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
