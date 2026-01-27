"use client";

import { motion } from "framer-motion";
import { Sparkles, Share2, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PreResultsGateProps {
  onContinue: () => void;
  onCreateAccount?: () => void;
}

const benefits = [
  {
    icon: Share2,
    text: "Share with potential co-buyers",
  },
  {
    icon: Users,
    text: "Compare scores with your group",
  },
  {
    icon: TrendingUp,
    text: "Track your readiness over time",
  },
];

export function PreResultsGate({ onContinue, onCreateAccount }: PreResultsGateProps) {
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
        Save your results and unlock:
      </motion.p>

      {/* Benefits list */}
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-8 text-left"
      >
        {benefits.map((benefit, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3 text-foreground/80"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <benefit.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm sm:text-base">{benefit.text}</span>
          </motion.li>
        ))}
      </motion.ul>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        {/* Primary CTA - Create Account */}
        <Link
          href="/auth/signup?redirect=/assessment&save=true"
          onClick={onCreateAccount}
          className={cn(
            "flex items-center justify-center w-full py-4 px-6 rounded-xl",
            "bg-primary text-primary-foreground font-semibold",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            "shadow-lg shadow-primary/20"
          )}
        >
          Create Account to Save Results
        </Link>

        {/* Secondary CTA - Continue without saving */}
        <button
          onClick={onContinue}
          className={cn(
            "flex items-center justify-center w-full py-4 px-6 rounded-xl",
            "bg-transparent border-2 border-border text-foreground font-medium",
            "hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          )}
        >
          View Results Without Saving
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
