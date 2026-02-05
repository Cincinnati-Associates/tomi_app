"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Frame7YourTurnProps {
  onOpenChat: () => void;
  onRestart: () => void;
  onAssessmentClick: () => void;
}

function DoorIllustration() {
  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto">
      <svg
        viewBox="0 0 300 400"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient glow behind door */}
        <defs>
          <radialGradient id="doorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lightBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx="150" cy="200" rx="140" ry="180" fill="url(#doorGlow)" />

        {/* Door frame */}
        <motion.rect
          x="60"
          y="40"
          width="180"
          height="320"
          rx="8"
          className="fill-card stroke-border"
          strokeWidth="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Door - opening animation */}
        <motion.g
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -30 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "60px 200px", transformStyle: "preserve-3d" }}
        >
          <rect
            x="60"
            y="40"
            width="180"
            height="320"
            rx="4"
            className="fill-primary/90 stroke-primary-dark"
            strokeWidth="2"
          />

          {/* Door panels */}
          <rect
            x="80"
            y="60"
            width="140"
            height="120"
            rx="2"
            className="fill-primary-dark/30"
          />
          <rect
            x="80"
            y="200"
            width="140"
            height="140"
            rx="2"
            className="fill-primary-dark/30"
          />

          {/* Door handle */}
          <circle cx="200" cy="200" r="8" className="fill-accent" />
        </motion.g>

        {/* Light coming through door */}
        <motion.path
          d="M60 360 L150 250 L240 360"
          fill="url(#lightBeam)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />

        {/* Light rays */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.4, 0.6, 0] }}
          transition={{ delay: 1.5, duration: 3, repeat: Infinity }}
        >
          <line
            x1="100"
            y1="100"
            x2="50"
            y2="50"
            className="stroke-primary/30"
            strokeWidth="2"
          />
          <line
            x1="150"
            y1="80"
            x2="150"
            y2="20"
            className="stroke-primary/30"
            strokeWidth="2"
          />
          <line
            x1="200"
            y1="100"
            x2="250"
            y2="50"
            className="stroke-primary/30"
            strokeWidth="2"
          />
        </motion.g>

        {/* Path/welcome mat */}
        <motion.ellipse
          cx="150"
          cy="380"
          rx="80"
          ry="15"
          className="fill-muted"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

export function Frame7YourTurn({
  onOpenChat,
  onRestart,
  onAssessmentClick,
}: Frame7YourTurnProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12">
      <div className="max-w-2xl w-full text-center">
        {/* Door illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <DoorIllustration />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your Turn
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Ready to see if co-ownership is right for you?
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Primary CTA */}
          <Button
            variant="glow"
            size="lg"
            className="rounded-full text-base md:text-lg px-8 w-full sm:w-auto"
            asChild
            onClick={onAssessmentClick}
          >
            <Link href="/calc">
              Take the Readiness Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Secondary CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {/* Talk to a Homi */}
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-full sm:w-auto"
            onClick={onOpenChat}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Talk to a Homi
          </Button>

          {/* Restart */}
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full w-full sm:w-auto text-muted-foreground"
            onClick={onRestart}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </motion.div>

        {/* Closing message */}
        <motion.p
          className="text-sm text-muted-foreground mt-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Join thousands who are already building their path to homeownership together.
        </motion.p>
      </div>
    </div>
  );
}
