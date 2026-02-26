"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HybridInput } from "./HybridInput";
import type { AssessmentQuestion as QuestionType, AnswerOption, AnswerData } from "@/hooks/useAssessment";

interface AssessmentQuestionProps {
  question: QuestionType;
  questionIndex: number;
  selectedAnswer: AnswerData | null;
  onSelectAnswer: (optionIndex: number, exactValue?: number | string) => void;
  onAnimationComplete: () => void;
}

/**
 * Typewriter hook — types out text character by character.
 * Returns the visible portion and whether typing is done.
 */
function useQuestionTypewriter(text: string, speed = 25, startDelay = 150) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);

    // Respect reduced motion
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

// Option card component for standard choice questions
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
        {/* Selection indicator */}
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

        {/* Option text */}
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

export function AssessmentQuestion({
  question,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  onAnimationComplete,
}: AssessmentQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Typewriter for the question text
  const { displayed: typedQuestion, isDone: questionTyped } = useQuestionTypewriter(
    question.question,
    25,
    150
  );

  // Reset selected index when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setIsAnimatingOut(false);
  }, [questionIndex]);

  // Restore selected index from answer data (if returning to a question)
  useEffect(() => {
    if (selectedAnswer !== null) {
      setSelectedIndex(selectedAnswer.optionIndex);
    }
  }, [selectedAnswer]);

  const handleSelectOption = (index: number, exactValue?: number | string) => {
    if (isAnimatingOut) return;

    setSelectedIndex(index);
    onSelectAnswer(index, exactValue);

    // Start exit animation quickly after showing selection
    setTimeout(() => {
      setIsAnimatingOut(true);
    }, 150);

    // Call animation complete after brief exit animation
    setTimeout(() => {
      onAnimationComplete();
    }, 350);
  };

  const isHybrid = question.inputType === "hybrid";

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
        {/* Question text — typed out character by character */}
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

        {/* Options — appear after question finishes typing */}
        <AnimatePresence>
          {questionTyped && (
            <>
              {isHybrid && question.hybridConfig ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="mt-4"
                >
                  <HybridInput
                    options={question.options}
                    hybridConfig={question.hybridConfig}
                    selectedIndex={selectedIndex}
                    onSelect={handleSelectOption}
                    disabled={isAnimatingOut}
                  />
                </motion.div>
              ) : (
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
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
