"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentResult } from "./AssessmentResult";
import { SectionedProgress } from "./SectionedProgress";
import { PreResultsGate } from "./PreResultsGate";
import { HomiMiniInput } from "./HomiMiniInput";
import { HomiChat } from "@/components/shared/HomiChat";
import { PageIntro } from "@/components/shared/PageIntro";
import { Logo } from "@/components/ui/logo";

export function AssessmentPage() {
  const [isResultsChatOpen, setIsResultsChatOpen] = useState(false);

  const {
    currentQuestionIndex,
    currentQuestion,
    answers,
    isComplete,
    showPreResultsGate,
    result,
    totalScore,
    projectedGrade,
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

  const handleOpenResultsChat = useCallback(() => {
    setIsResultsChatOpen(true);
  }, []);

  const handleCloseResultsChat = useCallback(() => {
    setIsResultsChatOpen(false);
  }, []);

  // Build context-aware initial message for Homi
  const buildInitialMessage = useCallback(() => {
    const context = getAssessmentContext();

    if (context.isComplete && result) {
      return `I just completed the co-ownership readiness assessment and got a grade of ${result.grade} (${result.title}). Can you help me understand what this means and what I should focus on next?`;
    }

    if (context.answeredQuestions.length > 0) {
      const recentAnswer =
        context.answeredQuestions[context.answeredQuestions.length - 1];
      return `I'm taking the co-ownership readiness assessment. I'm on question ${context.currentQuestion} of ${context.totalQuestions} in the "${context.currentCategory}" section. I just answered "${recentAnswer.question}" with "${recentAnswer.answer}". Can you help me understand what this means for my readiness?`;
    }

    return `I'm about to start the co-ownership readiness assessment. Can you tell me what to expect and how the assessment works?`;
  }, [getAssessmentContext, result]);

  return (
    <>
      <PageIntro
        pageId="assessment"
        title="Co-Ownership Readiness Assessment"
        description="Hey there! I'm Homi — a co-buying concierge whose goal is to help you ask and answer the most important questions about shared homeownership. This isn't a test — it's a conversation starter."
        bullets={[
          "12 questions, ~2 minutes",
          "No account needed",
          "Get your personalized readiness score + next steps",
        ]}
        ctaText="Let's Do This"
      />

      {/* Full viewport fixed overlay — forces dark mode, sits above Navbar (z-50) */}
      <div className="dark fixed inset-0 z-[60] flex flex-col h-[100dvh] overflow-hidden bg-[hsl(220,15%,10%)]">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[hsl(220,15%,12%)] via-[hsl(220,15%,10%)] to-[hsl(220,15%,8%)]" />

        {/* Own navbar with yellow logo */}
        <div className="flex-shrink-0 relative z-10 flex items-center justify-center h-14 md:h-16">
          <Link href="/">
            <Logo variant="yellow" className="h-6 md:h-7" />
          </Link>
        </div>

        {/* Compact header with progress */}
        {!isComplete && !showPreResultsGate && (
          <div className="flex-shrink-0 relative z-10 border-b border-white/8">
            <div className="px-4 pt-1 pb-0.5 sm:pt-2 sm:pb-1">
              <h1 className="font-heading text-xs sm:text-sm md:text-base font-bold text-white/90 text-center">
                Co-Ownership Readiness
              </h1>
            </div>
            <div className="max-w-2xl mx-auto">
              <SectionedProgress
                categories={categories}
                currentSection={currentSection}
                sectionProgress={sectionProgress}
              />
            </div>
          </div>
        )}

        {/* Main content — stable vertical positioning via grid */}
        <main className="flex-1 relative z-10 flex flex-col px-4 min-h-0">
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {showPreResultsGate ? (
                <motion.div
                  key="pre-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <PreResultsGate
                    onContinue={completeAssessment}
                    projectedGrade={projectedGrade}
                    totalScore={totalScore}
                    answers={answers}
                  />
                </motion.div>
              ) : !isComplete ? (
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Question + options — pinned toward top */}
                  <div className="flex flex-col items-center pt-[4vh] md:pt-[6vh]">
                    <AssessmentQuestion
                      question={currentQuestion}
                      questionIndex={currentQuestionIndex}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={selectAnswer}
                      onAnimationComplete={nextQuestion}
                    />
                  </div>

                  {/* Bottom slot: Homi mini input + Previous */}
                  <div className="mt-auto mb-8 flex justify-center">
                    <div className="w-full max-w-lg space-y-2">
                      <HomiMiniInput currentSection={currentSection} />

                      {currentQuestionIndex > 0 && (
                        <div className="flex justify-center">
                          <button
                            onClick={previousQuestion}
                            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-3"
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
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto flex items-start justify-center pt-8"
                >
                  {result && (
                    <AssessmentResult
                      result={result}
                      onCtaClick={trackCtaClick}
                      onShare={trackShare}
                      onOpenChat={handleOpenResultsChat}
                      onRestart={restart}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Full-screen Homi Chat — used only from results view */}
      <HomiChat
        isOpen={isResultsChatOpen}
        onClose={handleCloseResultsChat}
        initialMessage={buildInitialMessage()}
      />
    </>
  );
}
