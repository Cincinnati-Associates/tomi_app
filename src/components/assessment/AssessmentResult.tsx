"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Lightbulb, Compass, RotateCcw, Share2, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssessmentResult as ResultType, Grade } from "@/hooks/useAssessment";

interface AssessmentResultProps {
  result: ResultType;
  onCtaClick: (ctaType: "invite_coowner" | "talk_to_homi" | "learn_more") => void;
  onShare: (method: "native" | "copy") => void;
  onOpenChat: () => void;
  onRestart: () => void;
}

// Grade colors and icons
const gradeConfig: Record<
  Grade,
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    glowClass: string;
    icon: typeof Trophy;
  }
> = {
  A: {
    bgClass: "bg-green-500/10",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-500/30",
    glowClass: "shadow-green-500/20",
    icon: Trophy,
  },
  B: {
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/30",
    glowClass: "shadow-blue-500/20",
    icon: Target,
  },
  C: {
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-amber-500/20",
    icon: Lightbulb,
  },
  D: {
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500/30",
    glowClass: "shadow-purple-500/20",
    icon: Compass,
  },
};

// Score bar component
function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Score</span>
        <span>
          {score} / {maxScore}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
}

// Share button component
function ShareButton({
  grade,
  score,
  maxScore,
  onShare,
}: {
  grade: Grade;
  score: number;
  maxScore: number;
  onShare: (method: "native" | "copy") => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/assessment?shared=${grade}`
    : "";

  const shareText = `I scored ${score}/${maxScore} on Tomi's Co-Ownership Readiness Assessment! See if you're ready to co-buy a home.`;

  const handleShare = useCallback(async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Co-Ownership Readiness Score",
          text: shareText,
          url: shareUrl,
        });
        onShare("native");
        return;
      } catch {
        // User cancelled or share failed - fall through to copy
      }
    }

    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      onShare("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [shareUrl, shareText, onShare]);

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-muted/50 text-foreground/80 text-sm font-medium",
        "hover:bg-muted transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          Link copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share your results
        </>
      )}
    </motion.button>
  );
}

export function AssessmentResult({
  result,
  onCtaClick,
  onShare,
  onOpenChat,
  onRestart,
}: AssessmentResultProps) {
  const config = gradeConfig[result.grade];
  const GradeIcon = config.icon;

  const handlePrimaryCtaClick = () => {
    onCtaClick(result.primaryCta.type);
    if (result.primaryCta.type === "talk_to_homi") {
      onOpenChat();
    }
  };

  const handleSecondaryCtaClick = () => {
    onCtaClick(result.secondaryCta.type);
    if (result.secondaryCta.action === "open_chat") {
      onOpenChat();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto text-center px-4"
    >
      {/* Grade badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className={cn(
          "relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 mb-6",
          config.bgClass,
          config.borderClass,
          `shadow-xl ${config.glowClass}`
        )}
      >
        {/* Animated ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4",
            config.borderClass
          )}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />

        {/* Grade letter */}
        <div className="flex flex-col items-center">
          <span className={cn("text-4xl sm:text-5xl md:text-6xl font-bold", config.textClass)}>
            {result.grade}
          </span>
          <GradeIcon className={cn("w-5 h-5 sm:w-6 sm:h-6 mt-1", config.textClass)} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4"
      >
        {result.title}
      </motion.h2>

      {/* Score bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mb-6"
      >
        <ScoreBar score={result.totalScore} maxScore={result.maxScore} />
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-6"
      >
        {result.message}
      </motion.p>

      {/* Share button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <ShareButton
          grade={result.grade}
          score={result.totalScore}
          maxScore={result.maxScore}
          onShare={onShare}
        />
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="flex flex-col gap-3"
      >
        {/* Primary CTA */}
        {result.primaryCta.type === "talk_to_homi" ? (
          <Button
            variant="glow"
            size="lg"
            className="rounded-full w-full"
            onClick={handlePrimaryCtaClick}
          >
            {result.primaryCta.text}
          </Button>
        ) : (
          <Button
            variant="glow"
            size="lg"
            className="rounded-full w-full"
            asChild
            onClick={handlePrimaryCtaClick}
          >
            <Link href={result.primaryCta.href}>{result.primaryCta.text}</Link>
          </Button>
        )}

        {/* Secondary CTA */}
        {result.secondaryCta.action === "open_chat" ? (
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-full"
            onClick={handleSecondaryCtaClick}
          >
            {result.secondaryCta.text}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-full"
            asChild
            onClick={handleSecondaryCtaClick}
          >
            <Link href={result.secondaryCta.href!}>
              {result.secondaryCta.text}
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Restart button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="mt-8"
      >
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-4"
        >
          <RotateCcw className="w-4 h-4" />
          Take the assessment again
        </button>
      </motion.div>
    </motion.div>
  );
}
