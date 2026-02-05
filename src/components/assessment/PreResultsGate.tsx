"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Loader2, CheckCircle, AlertCircle, User, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Grade, AnswerData } from "@/hooks/useAssessment";

interface PreResultsGateProps {
  onContinue: () => void;
  projectedGrade: Grade;
  totalScore: number;
  answers: (AnswerData | null)[];
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

// Store assessment data in sessionStorage for retrieval after signup
function storeAssessmentForSignup(data: {
  grade: Grade;
  score: number;
  answers: (AnswerData | null)[];
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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "assessment",
          assessmentGrade: projectedGrade,
          assessmentScore: totalScore,
          assessmentAnswers: answers,
          utmSource: urlParams.get("utm_source") || undefined,
          utmMedium: urlParams.get("utm_medium") || undefined,
          utmCampaign: urlParams.get("utm_campaign") || undefined,
          referrer: document.referrer || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      setStatus("success");

      // Store for potential later signup
      storeAssessmentForSignup({ grade: projectedGrade, score: totalScore, answers });

      // Show success briefly then continue to results
      setTimeout(() => {
        onContinue();
      }, 1500);
    } catch (error) {
      console.error("Lead capture error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  const handleCreateAccount = () => {
    // Store assessment data for retrieval after signup
    storeAssessmentForSignup({ grade: projectedGrade, score: totalScore, answers });
  };

  const handleSkip = () => {
    // Still store in session for potential later use
    storeAssessmentForSignup({ grade: projectedGrade, score: totalScore, answers });
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

  // Build signup URL with assessment context
  const signupUrl = `/auth/signup?redirect=/assessment&save=true&grade=${projectedGrade}&score=${totalScore}`;

  return (
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
        Save your results to get personalized guidance from Homi, our AI co-ownership assistant.
      </motion.p>

      {/* Email form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Email input */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === "loading" || status === "success"}
            className={cn(
              "w-full pl-12 pr-4 py-4 rounded-xl border-2 text-base",
              "bg-card text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary transition-colors",
              status === "error" ? "border-red-500" : "border-border",
              (status === "loading" || status === "success") && "opacity-60 cursor-not-allowed"
            )}
          />
        </div>

        {/* Error message */}
        {status === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-500 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl",
            "font-semibold text-base transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            status === "success"
              ? "bg-green-500 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
            (status === "loading" || status === "success") && "cursor-not-allowed"
          )}
        >
          {status === "loading" && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-5 h-5" />
              Success! Loading results...
            </>
          )}
          {(status === "idle" || status === "error") && "See My Results"}
        </button>
      </motion.form>

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

      {/* Secondary options - two columns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Create Account option */}
        <Link
          href={signupUrl}
          onClick={handleCreateAccount}
          className={cn(
            "flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl",
            "font-medium text-sm transition-all",
            "bg-card border-2 border-border text-foreground",
            "hover:border-primary hover:bg-primary/5",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          )}
        >
          <User className="w-5 h-5 text-primary" />
          <span>Create Account</span>
        </Link>

        {/* Invite others option */}
        <button
          onClick={handleShare}
          className={cn(
            "flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl",
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
              <span>Invite Co-Buyers</span>
            </>
          )}
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground mt-3"
      >
        Save your results or invite potential co-buyers to take the assessment too
      </motion.p>

      {/* Skip option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <button
          onClick={handleSkip}
          disabled={status === "loading" || status === "success"}
          className={cn(
            "text-sm text-muted-foreground hover:text-foreground transition-colors",
            "underline-offset-4 hover:underline",
            (status === "loading" || status === "success") && "opacity-50 cursor-not-allowed"
          )}
        >
          Skip and view results
        </button>
      </motion.div>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-muted-foreground mt-6"
      >
        Your data is secure and never shared without your permission.
      </motion.p>
    </motion.div>
  );
}
