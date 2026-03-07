"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, MessageSquare, ArrowRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { NumberScale } from "./NumberScale"
import type { ExerciseQuestionDef } from "@/hooks/useExerciseFlow"

// ─── Typewriter hook ────────────────────────────────────────────────────────

function useQuestionTypewriter(text: string, speed = 18, startDelay = 150) {
  const [displayed, setDisplayed] = useState("")
  const [isDone, setIsDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setDisplayed("")
    setIsDone(false)

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayed(text)
      setIsDone(true)
      return
    }

    let i = 0
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setIsDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, speed, startDelay])

  return { displayed, isDone }
}

// ─── Option card (chips) ────────────────────────────────────────────────────

function OptionCard({
  label,
  index,
  isSelected,
  onClick,
  disabled,
}: {
  label: string
  index: number
  isSelected: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.08 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left py-3 px-3.5 rounded-xl border-2 transition-all duration-200",
        "hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
        "active:scale-[0.98]",
        "min-h-[48px]",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card",
        disabled && !isSelected && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
        </div>
        <span
          className={cn(
            "text-sm leading-snug transition-colors duration-200",
            isSelected ? "text-foreground font-medium" : "text-foreground/80"
          )}
        >
          {label}
        </span>
      </div>
    </motion.button>
  )
}

// ─── Custom text input card ─────────────────────────────────────────────────

function CustomInputCard({
  placeholder,
  index,
  isSelected,
  savedText,
  onSubmit,
  disabled,
}: {
  placeholder: string
  index: number
  isSelected: boolean
  savedText?: string
  onSubmit: (text: string) => void
  disabled: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(savedText || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsEditing(false)
    setInputValue(savedText || "")
  }, [placeholder, savedText])

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const handleClick = () => {
    if (disabled && !isSelected) return
    if (!isEditing) setIsEditing(true)
  }

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setInputValue(savedText || "")
    }
  }

  if (isSelected && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.08 }}
        className="relative w-full text-left py-3 px-3.5 rounded-xl border-2 border-primary bg-primary/10 min-h-[48px]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm leading-snug text-foreground font-medium">
            {savedText}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.08 }}
      onClick={handleClick}
      className={cn(
        "relative w-full text-left py-3 px-3.5 rounded-xl border-2 transition-all duration-200 min-h-[48px]",
        isEditing
          ? "border-primary/40 bg-card/90 ring-2 ring-primary/20"
          : "border-dashed border-border bg-card/50 hover:border-primary/30 hover:bg-card/80 cursor-text",
        disabled && !isSelected && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
          <MessageSquare className="w-2.5 h-2.5 text-muted-foreground/40" />
        </div>
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            {inputValue.trim() && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubmit()
                }}
                className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
              >
                <ArrowRight className="h-3 w-3" />
              </motion.button>
            )}
          </div>
        ) : (
          <span className="text-sm leading-snug text-muted-foreground/50 italic">
            {placeholder}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Text-only input (for "text" and "text_with_skip" types) ────────────────

function TextInputCard({
  placeholder,
  savedText,
  onSubmit,
  onSkip,
  skipLabel,
  disabled,
}: {
  placeholder?: string
  savedText?: string
  onSubmit: (text: string) => void
  onSkip?: () => void
  skipLabel?: string
  disabled: boolean
}) {
  const [inputValue, setInputValue] = useState(savedText || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(savedText || "")
  }, [savedText])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <div
        className={cn(
          "w-full py-3 px-3.5 rounded-xl border-2 transition-all duration-200 min-h-[48px]",
          "border-primary/40 bg-card/90 ring-2 ring-primary/20"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
            <MessageSquare className="w-2.5 h-2.5 text-muted-foreground/40" />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Type your answer..."}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              style={{ fontSize: "16px" }}
              disabled={disabled}
            />
            {inputValue.trim() && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={handleSubmit}
                className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
              >
                <ArrowRight className="h-3 w-3" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          {skipLabel || "Skip this question"}
        </button>
      )}
    </motion.div>
  )
}

// ─── Confirm card (carry-forward from assessment) ───────────────────────────

function ConfirmCard({
  priorLabel,
  question,
  isSelected,
  onConfirm,
  onSubmitText,
  disabled,
}: {
  priorLabel: string
  question: ExerciseQuestionDef
  isSelected: boolean
  onConfirm: () => void
  onSubmitText: (text: string) => void
  disabled: boolean
}) {
  const [showFallback, setShowFallback] = useState(false)

  if (showFallback) {
    const fallbackType = question.confirmFallbackType ?? "chips"
    return (
      <div className="space-y-2">
        {fallbackType === "chips" && question.options && (
          <>
            {question.options.map((option, index) => (
              <OptionCard
                key={`${question.key}-${option.value}`}
                label={option.label}
                index={index}
                isSelected={false}
                onClick={() => onSubmitText(option.value)}
                disabled={disabled}
              />
            ))}
            <CustomInputCard
              placeholder="Type your own..."
              index={question.options.length}
              isSelected={false}
              onSubmit={onSubmitText}
              disabled={disabled}
            />
          </>
        )}
        {fallbackType === "text_with_skip" && (
          <TextInputCard
            placeholder="Type your answer..."
            onSubmit={onSubmitText}
            skipLabel={question.skipLabel}
            disabled={disabled}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Prior answer confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "w-full text-left py-3 px-3.5 rounded-xl border-2 transition-all duration-200 min-h-[48px]",
          isSelected
            ? "border-primary bg-primary/10"
            : "border-primary/30 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              isSelected
                ? "border-primary bg-primary"
                : "border-primary/30"
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </div>
          <span className="text-sm leading-snug text-foreground font-medium">
            {priorLabel}
          </span>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={() => {
            if (disabled) return
            onConfirm()
          }}
          disabled={disabled}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          That&apos;s still right
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          onClick={() => {
            if (disabled) return
            setShowFallback(true)
          }}
          disabled={disabled}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200",
            "border border-border bg-card text-foreground hover:bg-muted",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          I&apos;d change this
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

interface ExerciseQuestionProps {
  question: ExerciseQuestionDef
  questionIndex: number
  selectedAnswer: unknown
  onSelectAnswer: (value: string | number) => void
  onSubmitText: (text: string) => void
  onSkip?: () => void
  onPrevious?: () => void
  showPrevious?: boolean
  carryForwardData?: { label: string; value: string } | null
}

export function ExerciseQuestion({
  question,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  onSubmitText,
  onSkip,
  onPrevious,
  showPrevious,
  carryForwardData,
}: ExerciseQuestionProps) {
  const [selectedValue, setSelectedValue] = useState<string | number | null>(null)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  const { displayed: typedQuestion, isDone: questionTyped } = useQuestionTypewriter(
    question.prompt,
    18,
    150
  )

  // Reset when question changes
  useEffect(() => {
    setSelectedValue(null)
    setIsAnimatingOut(false)
  }, [questionIndex, question.key])

  // Restore selection when returning to a question
  useEffect(() => {
    if (selectedAnswer !== undefined && selectedAnswer !== null) {
      setSelectedValue(selectedAnswer as string | number)
    }
  }, [selectedAnswer])

  const handleSelectChip = (value: string) => {
    if (isAnimatingOut) return
    setSelectedValue(value)
    setTimeout(() => setIsAnimatingOut(true), 150)
    setTimeout(() => onSelectAnswer(value), 350)
  }

  const handleSelectNumber = (value: number) => {
    if (isAnimatingOut) return
    setSelectedValue(value)
    setTimeout(() => setIsAnimatingOut(true), 150)
    setTimeout(() => onSelectAnswer(value), 350)
  }

  const handleTextSubmit = (text: string) => {
    if (isAnimatingOut) return
    setIsAnimatingOut(true)
    setTimeout(() => onSubmitText(text), 200)
  }

  const handleCustomChipSubmit = (text: string) => {
    if (isAnimatingOut) return
    setSelectedValue("__custom__")
    setTimeout(() => setIsAnimatingOut(true), 150)
    setTimeout(() => onSubmitText(text), 350)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${questionIndex}-${question.key}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto"
      >
        {/* Question text */}
        <h2 className="font-heading text-base sm:text-lg md:text-xl font-bold text-foreground text-center mb-2 min-h-[2em]">
          {typedQuestion}
          {!questionTyped && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block ml-0.5 w-[2px] h-[0.9em] bg-foreground/60 align-middle"
            />
          )}
        </h2>

        {/* Options — different rendering per question type */}
        <AnimatePresence>
          {questionTyped && (
            <div className="space-y-2 mt-4">
              {/* ── Chips (single select) ── */}
              {question.type === "chips" && question.options && (
                <>
                  {question.options.map((option, index) => (
                    <OptionCard
                      key={`${question.key}-${option.value}`}
                      label={option.label}
                      index={index}
                      isSelected={selectedValue === option.value}
                      onClick={() => handleSelectChip(option.value)}
                      disabled={isAnimatingOut}
                    />
                  ))}
                  {/* "Type your own" custom input as last card */}
                  <CustomInputCard
                    placeholder="Type your own..."
                    index={question.options.length}
                    isSelected={selectedValue === "__custom__"}
                    savedText={
                      typeof selectedAnswer === "string" &&
                      !question.options.some((o) => o.value === selectedAnswer)
                        ? (selectedAnswer as string)
                        : undefined
                    }
                    onSubmit={handleCustomChipSubmit}
                    disabled={isAnimatingOut}
                  />
                </>
              )}

              {/* ── Number scale ── */}
              {question.type === "number_scale" && (
                <div className="flex justify-center pt-2">
                  <NumberScale
                    min={question.min}
                    max={question.max}
                    selected={typeof selectedValue === "number" ? selectedValue : null}
                    onSelect={handleSelectNumber}
                    disabled={isAnimatingOut}
                  />
                </div>
              )}

              {/* ── Text input ── */}
              {(question.type === "text" || question.type === "text_with_skip") && (
                <TextInputCard
                  placeholder="Type your answer..."
                  savedText={
                    typeof selectedAnswer === "string" && selectedAnswer !== "(skipped)"
                      ? (selectedAnswer as string)
                      : undefined
                  }
                  onSubmit={handleTextSubmit}
                  onSkip={question.type === "text_with_skip" ? onSkip : undefined}
                  skipLabel={question.skipLabel}
                  disabled={isAnimatingOut}
                />
              )}

              {/* ── Confirm (carry-forward) ── */}
              {question.type === "confirm" && carryForwardData && (
                <ConfirmCard
                  priorLabel={carryForwardData.label}
                  question={question}
                  isSelected={selectedValue === carryForwardData.value}
                  onConfirm={() => handleSelectChip(carryForwardData.value)}
                  onSubmitText={(text) => handleSelectChip(text)}
                  disabled={isAnimatingOut}
                />
              )}

              {/* ── Previous button ── */}
              {showPrevious && onPrevious && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={onPrevious}
                    className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1 px-3"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
