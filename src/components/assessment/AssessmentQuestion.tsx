"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MessageSquare, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion as QuestionType, AnswerOption, AnswerData } from "@/hooks/useAssessment";

interface AssessmentQuestionProps {
  question: QuestionType;
  questionIndex: number;
  selectedAnswer: AnswerData | null;
  onSelectAnswer: (optionIndex: number, customText?: string) => void;
  onAnimationComplete: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
}

/**
 * Typewriter hook — types out text character by character.
 */
function useQuestionTypewriter(text: string, speed = 18, startDelay = 150) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    let i = 0;
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, startDelay]);

  return { displayed, isDone };
}

// Standard option card
function OptionCard({
  option,
  index,
  isSelected,
  onClick,
  disabled,
}: {
  option: AnswerOption;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
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
          {option.text}
        </span>
      </div>
    </motion.button>
  );
}

// Custom input card (5th option)
function CustomInputCard({
  placeholder,
  index,
  isSelected,
  savedText,
  onSubmit,
  disabled,
}: {
  placeholder: string;
  index: number;
  isSelected: boolean;
  savedText?: string;
  onSubmit: (text: string) => void;
  disabled: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(savedText || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset editing state when question changes
  useEffect(() => {
    setIsEditing(false);
    setInputValue(savedText || "");
  }, [placeholder, savedText]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (disabled && !isSelected) return;
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(savedText || "");
    }
  };

  // Show submitted state
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
    );
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
                  e.stopPropagation();
                  handleSubmit();
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
  );
}

export function AssessmentQuestion({
  question,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  onAnimationComplete,
  onPrevious,
  showPrevious,
}: AssessmentQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const { displayed: typedQuestion, isDone: questionTyped } = useQuestionTypewriter(
    question.question,
    18,
    150
  );

  // Reset when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setIsAnimatingOut(false);
  }, [questionIndex]);

  // Restore selection when returning to a question
  useEffect(() => {
    if (selectedAnswer !== null) {
      setSelectedIndex(selectedAnswer.optionIndex);
    }
  }, [selectedAnswer]);

  const handleSelectOption = (index: number) => {
    if (isAnimatingOut) return;

    setSelectedIndex(index);
    onSelectAnswer(index);

    setTimeout(() => setIsAnimatingOut(true), 150);
    setTimeout(() => onAnimationComplete(), 350);
  };

  const handleCustomSubmit = (text: string) => {
    if (isAnimatingOut) return;

    setSelectedIndex(4);
    onSelectAnswer(4, text);

    setTimeout(() => setIsAnimatingOut(true), 150);
    setTimeout(() => onAnimationComplete(), 350);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
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

        {/* Subtext */}
        {question.subtext && (
          <AnimatePresence>
            {questionTyped && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm text-muted-foreground text-center mb-4"
              >
                {question.subtext}
              </motion.p>
            )}
          </AnimatePresence>
        )}

        {/* Options — 4 fixed + 1 custom */}
        <AnimatePresence>
          {questionTyped && (
            <div className="space-y-2 mt-4">
              {question.options.map((option, index) => (
                <OptionCard
                  key={`${questionIndex}-${index}`}
                  option={option}
                  index={index}
                  isSelected={selectedIndex === index}
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnimatingOut}
                />
              ))}
              <CustomInputCard
                placeholder={question.customInputPlaceholder}
                index={4}
                isSelected={selectedIndex === 4}
                savedText={selectedAnswer?.isCustom ? selectedAnswer.customText : undefined}
                onSubmit={handleCustomSubmit}
                disabled={isAnimatingOut}
              />

              {showPrevious && onPrevious && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={onPrevious}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-3"
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
  );
}
