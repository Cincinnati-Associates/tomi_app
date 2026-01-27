"use client";

import { useState, useEffect } from "react";
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

// Option card component for standard choice questions - compact for mobile
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, delay: index * 0.02 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left py-3 px-3.5 rounded-xl border-2 transition-all duration-200",
        "hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
        "active:scale-[0.98]",
        "min-h-[48px]", // Slightly smaller but still touch-friendly
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card",
        disabled && !isSelected && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* Selection indicator - smaller */}
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
        {/* Question text - compact */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="font-heading text-base sm:text-lg md:text-xl font-bold text-foreground text-center mb-2"
        >
          {question.question}
        </motion.h2>

        {/* Subtext for financial questions */}
        {question.subtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.05 }}
            className="text-xs sm:text-sm text-muted-foreground text-center mb-4"
          >
            {question.subtext}
          </motion.p>
        )}

        {/* Hybrid input for financial questions */}
        {isHybrid && question.hybridConfig ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
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
          /* Standard choice options - tighter spacing */
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
      </motion.div>
    </AnimatePresence>
  );
}
