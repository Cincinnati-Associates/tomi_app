"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentResult } from "./AssessmentResult";
import { SectionedProgress } from "./SectionedProgress";
import { PreResultsGate } from "./PreResultsGate";
import { HomiChat } from "@/components/shared/HomiChat";
import { cn } from "@/lib/utils";

// Inline Homi prompt button - contextual based on question, yellow fill with glow
function InlineHomiPrompt({
  prompt,
  onClick
}: {
  prompt: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 mx-auto",
        "px-5 py-2.5 rounded-full",
        "bg-[hsl(52,65%,55%)] hover:bg-[hsl(52,65%,50%)]",
        "text-sm font-semibold text-black",
        "shadow-md shadow-[hsl(52,65%,55%)]/30",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(52,65%,55%)]/50 focus:ring-offset-2"
      )}
      whileTap={{ scale: 0.97 }}
    >
      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[hsl(52,65%,55%)]"
        animate={{
          boxShadow: [
            "0 0 0 0 hsla(52, 65%, 55%, 0.4)",
            "0 0 12px 4px hsla(52, 65%, 55%, 0.2)",
            "0 0 0 0 hsla(52, 65%, 55%, 0.4)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <MessageCircle className="w-4 h-4 relative z-10" />
      <span className="relative z-10">{prompt}</span>
    </motion.button>
  );
}

export function AssessmentPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    currentQuestionIndex,
    currentQuestion,
    answers,
    isComplete,
    showPreResultsGate,
    result,
    selectAnswer,
    completeAssessment,
    nextQuestion,
    previousQuestion,
    trackCtaClick,
    trackShare,
    restart,
    currentSection,
    sectionProgress,
    categories,
    getAssessmentContext,
  } = useAssessment();

  const handleOpenChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Build context-aware initial message for Homi
  const buildInitialMessage = useCallback(() => {
    const context = getAssessmentContext();

    if (context.isComplete && result) {
      return `I just completed the co-ownership readiness assessment and got a grade of ${result.grade} (${result.title}). Can you help me understand what this means and what I should focus on next?`;
    }

    if (context.answeredQuestions.length > 0) {
      const recentAnswer = context.answeredQuestions[context.answeredQuestions.length - 1];
      return `I'm taking the co-ownership readiness assessment. I'm on question ${context.currentQuestion} of ${context.totalQuestions} in the "${context.currentCategory}" section. I just answered "${recentAnswer.question}" with "${recentAnswer.answer}". Can you help me understand what this means for my readiness?`;
    }

    return `I'm about to start the co-ownership readiness assessment. Can you tell me what to expect and how the assessment works?`;
  }, [getAssessmentContext, result]);

  return (
    <>
      {/* Full viewport container for mobile */}
      <div className="min-h-screen bg-background pt-14 sm:pt-16 md:pt-20 flex flex-col">
        {/* Compact header with title + progress */}
        {!isComplete && !showPreResultsGate && (
          <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50">
            {/* Page title - more compact, hidden on small mobile */}
            <div className="px-4 pt-2 pb-1 sm:pt-3 sm:pb-2">
              <h1 className="font-heading text-sm sm:text-lg md:text-xl font-bold text-foreground text-center">
                Co-Ownership Readiness
              </h1>
            </div>
            {/* Sectioned progress */}
            <div className="max-w-2xl mx-auto">
              <SectionedProgress
                categories={categories}
                currentSection={currentSection}
                sectionProgress={sectionProgress}
              />
            </div>
          </div>
        )}

        {/* Main content - flex to fill remaining space */}
        <main className="flex-1 flex flex-col px-4 py-1 sm:py-6 overflow-auto">
          <div className="max-w-2xl mx-auto w-full flex flex-col">
            <AnimatePresence mode="wait">
              {showPreResultsGate ? (
                /* Pre-results gate - save/share CTA */
                <motion.div
                  key="pre-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-center"
                >
                  <PreResultsGate onContinue={completeAssessment} />
                </motion.div>
              ) : !isComplete ? (
                /* Questions */
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  {/* Question - stays at top */}
                  <div className="flex-shrink-0 pt-1 sm:pt-4">
                    <AssessmentQuestion
                      question={currentQuestion}
                      questionIndex={currentQuestionIndex}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={selectAnswer}
                      onAnimationComplete={nextQuestion}
                    />
                  </div>

                  {/* Bottom section: Homi prompt + navigation - centered in remaining space */}
                  <div className="flex-1 flex flex-col justify-center items-center py-4 min-h-[120px] sm:min-h-[150px] mt-4 sm:mt-8">
                    <div className="space-y-3">
                      {/* Inline Homi prompt */}
                      <InlineHomiPrompt
                        prompt={currentQuestion.homiPrompt || "Ask Homi"}
                        onClick={handleOpenChat}
                      />

                      {/* Previous question link */}
                      {currentQuestionIndex > 0 && (
                        <div className="flex justify-center">
                          <button
                            onClick={previousQuestion}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-3"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Previous
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Results */
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  {result && (
                    <AssessmentResult
                      result={result}
                      onCtaClick={trackCtaClick}
                      onShare={trackShare}
                      onOpenChat={handleOpenChat}
                      onRestart={restart}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Background decorations - more subtle */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-40 -right-40 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
        </div>
      </div>

      {/* Homi Chat Modal */}
      <HomiChat
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        initialMessage={buildInitialMessage()}
      />
    </>
  );
}
