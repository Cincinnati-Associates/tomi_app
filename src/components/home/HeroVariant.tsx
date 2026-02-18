"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TypewriterButton } from "./TypewriterButton";
import { heroQuestions } from "@/content/questions";
import Link from "next/link";

export interface HeroVariantProps {
  headline: React.ReactNode;
  subheadline: React.ReactNode;
  primaryCta: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  onOpenChat: (question: string) => void;
  showTypewriter?: boolean;
}

export function HeroVariant({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  onOpenChat,
  showTypewriter = false,
}: HeroVariantProps) {
  const handleQuestionClick = (question: string) => {
    onOpenChat(question);
  };

  const scrollToNextSection = () => {
    const unlockSection = document.getElementById("unlock-section");
    if (unlockSection) {
      unlockSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-[90vh] md:min-h-screen flex-col items-center justify-center px-4 pt-20 md:pt-0">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/30 via-background to-background" />

      {/* Decorative elements (radial gradients instead of blur for performance) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-3xl text-base sm:text-lg md:text-xl text-shimmer"
        >
          {subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-4 sm:mt-10"
        >
          {/* Primary CTA */}
          {primaryCta.onClick ? (
            <Button size="lg" className="rounded-full px-8 text-base" onClick={primaryCta.onClick}>
              {primaryCta.text}
            </Button>
          ) : (
            <Button size="lg" className="rounded-full px-8 text-base" asChild>
              <Link href={primaryCta.href!}>{primaryCta.text}</Link>
            </Button>
          )}

          {/* Secondary CTA */}
          {secondaryCta && (
            <Button variant="ghost" size="lg" className="text-base" asChild>
              <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
            </Button>
          )}

          {/* Typewriter CTA (optional) */}
          {showTypewriter && (
            <TypewriterButton
              questions={heroQuestions}
              onQuestionClick={handleQuestionClick}
            />
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground transition-colors hover:text-primary"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-8 w-8 animate-bounce-subtle" />
      </motion.button>
    </section>
  );
}
