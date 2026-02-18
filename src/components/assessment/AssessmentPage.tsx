"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentResult } from "./AssessmentResult";
import { SectionedProgress } from "./SectionedProgress";
import { PreResultsGate } from "./PreResultsGate";
import { HomiMiniInput } from "./HomiMiniInput";
import { HomiChat } from "@/components/shared/HomiChat";
import { PageIntro } from "@/components/shared/PageIntro";

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
  } = useAssessment();

  const handleOpenResultsChat = useCallback(() => {
    setIsResultsChatOpen(true);
  }, []);

  const handleCloseResultsChat = useCallback(() => {
    setIsResultsChatOpen(false);
  }, []);

  // Build context-aware initial message for Homi — focused on current question only
  const buildInitialMessage = useCallback(() => {
    if (isComplete && result) {
      return `I just completed the co-ownership readiness assessment and got a grade of ${result.grade} (${result.title}). Can you help me understand what this means and what I should focus on next?`;
    }

    return `I'm taking the co-ownership readiness assessment (question ${currentQuestionIndex + 1} of 11, "${currentQuestion.category}" section). The current question is: "${currentQuestion.question}"`;
  }, [isComplete, result, currentQuestionIndex, currentQuestion]);

  return (
    <>
      <PageIntro
        pageId="assessment"
        title="Find Out If Co-Ownership Is Right For You."
        description="Co-ownership is how regular people are buying homes they actually want — with people they actually like. This quick assessment will tell you where you stand."
        bullets={[
          "11 questions, ~2 minutes",
          "No account needed",
          "Get your personalized readiness score + next steps",
        ]}
        ctaText="Let's Go!"
      />

      {/* Full viewport container for mobile */}
      <div className="min-h-screen bg-background navbar-offset flex flex-col">
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
                  <PreResultsGate
                    onContinue={completeAssessment}
                    projectedGrade={projectedGrade}
                    totalScore={totalScore}
                    answers={answers}
                  />
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

                  {/* Bottom section: Homi mini input + navigation */}
                  <div className="flex-1 flex flex-col justify-center items-center py-4 min-h-[120px] sm:min-h-[150px] mt-4 sm:mt-8">
                    <div className="space-y-3 w-full max-w-lg">
                      <HomiMiniInput
                        homiPrompt={currentQuestion.homiPrompt || "Ask Homi anything..."}
                        contextLabel={`Q${currentQuestionIndex + 1} of 11`}
                        questionIndex={currentQuestionIndex}
                        buildInitialMessage={buildInitialMessage}
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
                      onOpenChat={handleOpenResultsChat}
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
          <div className="absolute -top-40 -right-40 h-60 w-60 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 -left-40 h-60 w-60 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)" }} />
        </div>
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
