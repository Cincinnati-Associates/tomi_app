"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Grade, AnswerData, DimensionProfile, CustomAnswer } from "@/hooks/useAssessment";
import { computeDimensionProfile } from "@/hooks/useAssessment";
import { AuthModal } from "@/components/auth/AuthModal";

interface PreResultsGateProps {
  onContinue: () => void;
  projectedGrade: Grade;
  totalScore: number;
  answers: (AnswerData | null)[];
}

// Store assessment data in sessionStorage for retrieval after signup
function storeAssessmentForSignup(data: {
  grade: Grade;
  score: number;
  answers: (AnswerData | null)[];
  dimensionProfile: DimensionProfile;
  customAnswers: CustomAnswer[];
}) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("pendingAssessment", JSON.stringify(data));
  }
}

export function PreResultsGate({
  onContinue,
  projectedGrade,
  totalScore,
  answers,
}: PreResultsGateProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Compute dimension profile and custom answers for persistence
  const dimensionProfile = computeDimensionProfile(answers);
  const customAnswers: CustomAnswer[] = answers
    .map((a, idx) =>
      a?.isCustom && a.customText ? { questionId: idx + 1, text: a.customText } : null
    )
    .filter((c): c is CustomAnswer => c !== null);

  const handleCreateAccount = () => {
    // Store assessment data before opening auth modal
    storeAssessmentForSignup({ grade: projectedGrade, score: totalScore, answers, dimensionProfile, customAnswers });
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // After successful signup/login, go straight to journey
    // The useAssessmentLinker hook on /journey will link the data
    router.push("/journey");
  };

  const handleSkip = () => {
    // Still store in session for potential later use
    storeAssessmentForSignup({ grade: projectedGrade, score: totalScore, answers, dimensionProfile, customAnswers });
    onContinue();
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/assessment`
      : "https://livetomi.com/assessment";
    const shareText = "Are you ready for co-ownership? Take this quick assessment to find out!";

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Co-Ownership Readiness Assessment",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed - fall through to copy
      }
    }

    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto text-center px-4"
      >
        {/* Celebration icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative inline-flex">
            <motion.div
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.2)",
                  "0 0 40px hsl(var(--primary) / 0.3)",
                  "0 0 20px hsl(var(--primary) / 0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/60"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                }}
                animate={{
                  x: [0, (i - 1) * 30, (i - 1) * 40],
                  y: [0, -20 - i * 10, -40 - i * 5],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3"
        >
          Your results are ready!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          Keep your results, get personalized guidance, and continue your co-buying journey.
        </motion.p>

        {/* Primary CTA: Create Account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleCreateAccount}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl",
              "font-semibold text-base transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            )}
          >
            Create a free account
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 my-6"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Secondary: Share */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl",
              "font-medium text-sm transition-all",
              "bg-card border-2 border-border text-foreground",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            )}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-primary" />
                <span>Share with a co-buyer</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Skip option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            View results without saving
          </button>
        </motion.div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground mt-6"
        >
          Your data is secure and never shared without your permission.
        </motion.p>
      </motion.div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
