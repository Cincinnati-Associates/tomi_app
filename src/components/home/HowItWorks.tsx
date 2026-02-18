"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Compass, Users, FileCheck, Home, ChevronDown, Key } from "lucide-react";
import { howItWorksSteps } from "@/content/questions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";

const iconMap: Record<string, React.ElementType> = {
  Compass: Compass,
  Users: Users,
  FileCheck: FileCheck,
  Home: Home,
  Key: Key,
};

// Step indicator component
function StepIndicator({
  step,
  index,
  currentStep,
}: {
  step: typeof howItWorksSteps[0];
  index: number;
  currentStep: MotionValue<number>;
}) {
  const color = useTransform(
    currentStep,
    [index - 0.5, index, index + 0.5],
    ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--muted-foreground))"]
  );

  // Title appears when step is reached and stays visible
  const titleOpacity = useTransform(
    currentStep,
    [index - 0.3, index + 0.2],
    [0, 1]
  );

  return (
    <div className="flex flex-col items-center">
      <motion.span
        className="text-xs font-semibold"
        style={{ color }}
      >
        {step.number}
      </motion.span>
      <motion.span
        className="text-[10px] font-medium text-primary mt-0.5 whitespace-nowrap"
        style={{ opacity: titleOpacity }}
      >
        {step.title}
      </motion.span>
    </div>
  );
}

// Get initial transform values based on direction
function getDirectionTransform(direction: string) {
  switch (direction) {
    case "left":
      return { x: -60, y: 0 };
    case "right":
      return { x: 60, y: 0 };
    case "top":
      return { x: 0, y: -60 };
    case "bottom":
      return { x: 0, y: 60 };
    default:
      return { x: -60, y: 0 };
  }
}

// Individual step panel component
function StepPanel({
  step,
  index,
  totalSteps,
  scrollYProgress,
}: {
  step: typeof howItWorksSteps[0];
  index: number;
  totalSteps: number;
  scrollYProgress: MotionValue<number>;
}) {
  const Icon = iconMap[step.icon];
  const directionOffset = getDirectionTransform(step.imageDirection);

  // Calculate timing for this card
  // All cards animate within 0-85% of scroll, last 15% holds the final state
  const scrollRange = 0.85;
  // Add overlap - each card starts 25% before its "slot" ends
  const overlap = 0.25;
  const slotSize = scrollRange / totalSteps;
  const cardStart = Math.max(0, (index * slotSize) - (index > 0 ? slotSize * overlap : 0));
  const cardEnd = ((index + 1) * slotSize) + (index < totalSteps - 1 ? slotSize * overlap : 0);
  // cardMid is when the card is fully visible and centered
  // cardFadeStart is when fade-out begins (pushed to 75% of the card's range)
  const cardMid = cardStart + (cardEnd - cardStart) * 0.35;
  const cardFadeStart = cardStart + (cardEnd - cardStart) * 0.75;
  const isLast = index === totalSteps - 1;

  // Image animations - directional slide + fade
  // Fade in quickly, stay visible until cardFadeStart, then fade out
  const imageOpacity = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart, cardMid - 0.02, cardMid]
      : [cardStart, cardMid - 0.02, cardMid, cardFadeStart, cardEnd],
    isLast
      ? [0, 1, 1]
      : [0, 1, 1, 1, 0]
  );
  const imageX = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart, cardMid]
      : [cardStart, cardMid, cardEnd],
    isLast
      ? [directionOffset.x, 0]
      : [directionOffset.x, 0, directionOffset.x * -0.5]
  );
  const imageY = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart, cardMid]
      : [cardStart, cardMid, cardEnd],
    isLast
      ? [directionOffset.y, 0]
      : [directionOffset.y, 0, directionOffset.y * -0.5]
  );

  // Icon animation
  const iconScale = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart, cardMid]
      : [cardStart, cardMid, cardEnd],
    isLast
      ? [0.8, 1]
      : [0.8, 1, 0.8]
  );

  // Content animations - staggered timing
  const contentOpacity = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart + 0.01, cardMid - 0.02, cardMid]
      : [cardStart + 0.01, cardMid - 0.02, cardMid, cardFadeStart, cardEnd - 0.01],
    isLast
      ? [0, 1, 1]
      : [0, 1, 1, 1, 0]
  );
  const contentY = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart, cardMid]
      : [cardStart, cardMid, cardEnd],
    isLast
      ? [50, 0]
      : [50, 0, -50]
  );

  // CTA animation - slightly more staggered
  const ctaOpacity = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart + 0.02, cardMid - 0.01, cardMid]
      : [cardStart + 0.02, cardMid - 0.01, cardMid, cardFadeStart, cardEnd - 0.01],
    isLast
      ? [0, 1, 1]
      : [0, 1, 1, 1, 0]
  );
  const ctaY = useTransform(
    scrollYProgress,
    isLast
      ? [cardStart + 0.02, cardMid]
      : [cardStart + 0.02, cardMid, cardEnd - 0.02],
    isLast
      ? [30, 0]
      : [30, 0, -30]
  );

  return (
    <div className="flex-shrink-0 w-screen h-full flex items-center justify-center px-4 md:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Left side: Image block with overlapping icon badge */}
        <motion.div
          className={cn(
            "flex flex-col items-center md:items-end",
            index % 2 === 1 && "md:order-2 md:items-start"
          )}
          style={{
            opacity: imageOpacity,
            x: imageX,
            y: imageY,
            willChange: "transform, opacity",
          }}
        >
          <div className="relative">
            {/* Image */}
            <div className="w-[280px] md:w-[320px] aspect-[4/3] rounded-xl overflow-hidden border border-border">
              <Image
                src={step.image}
                alt={step.title}
                width={320}
                height={240}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Icon badge - overlapping bottom-right */}
            <motion.div
              className={cn(
                "absolute -bottom-4 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border-2 border-primary/30 shadow-lg",
                index % 2 === 0 ? "-right-4" : "-left-4"
              )}
              style={{ scale: iconScale }}
            >
              <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </motion.div>

            {/* Step number badge - opposite corner from icon */}
            <span className={cn(
              "absolute -top-3 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground text-lg md:text-xl font-bold shadow-md",
              index % 2 === 0 ? "-left-3" : "-right-3"
            )}>
              {step.number}
            </span>
          </div>
        </motion.div>

        {/* Right side: Content + CTA */}
        <div
          className={cn(
            "text-center md:text-left",
            index % 2 === 1 && "md:order-1 md:text-right"
          )}
        >
          <motion.div
            style={{
              opacity: contentOpacity,
              y: contentY,
              willChange: "transform, opacity",
            }}
          >
            <h3 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-4">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              {step.description}
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className={cn(
              "mt-6",
              index % 2 === 1 && "md:flex md:justify-end"
            )}
            style={{
              opacity: ctaOpacity,
              y: ctaY,
            }}
          >
            <Button variant="glow" className="rounded-full" asChild>
              <Link href={step.cta.href}>{step.cta.text}</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface HowItWorksProps {
  header?: string;
  subheader?: string;
}

export function HowItWorks({
  header = "works",
  subheader,
}: HowItWorksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSteps = howItWorksSteps.length;

  // Track scroll progress through the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Horizontal translation with initial right offset
  // Start at 33% (first step enters from right side of screen)
  // End at -400% (moves 5 panels left), stop at 85% scroll for last card display time
  const initialOffset = 33; // First step starts right-of-center
  const x = useTransform(
    scrollYProgress,
    [0, 0.85],
    [`${initialOffset}%`, `-${(totalSteps - 1) * 100}%`]
  );

  // Progress bar width - complete by 85%
  const progressWidth = useTransform(
    scrollYProgress,
    [0, 0.85],
    ["0%", "100%"]
  );

  // Current step indicator - spread across 85% of scroll
  // Dynamically generate breakpoints based on number of steps
  const stepBreakpoints = Array.from({ length: totalSteps }, (_, i) => (i / (totalSteps - 1)) * 0.85);
  const stepValues = Array.from({ length: totalSteps }, (_, i) => i);
  const currentStep = useTransform(
    scrollYProgress,
    stepBreakpoints,
    stepValues
  );

  // Scroll hint opacity
  const scrollHintOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [1, 0.5, 0.5, 0]
  );

  return (
    <>
      {/* Desktop: Tall scrollable container - 5x viewport height (extra for last step) */}
      <div
        ref={containerRef}
        className="relative bg-secondary/30 hidden md:block"
        style={{ height: `${totalSteps * 100 + 50}vh` }}
      >
        {/* Decorative glow (radial gradient instead of blur for performance) */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full z-0" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)" }} />

        {/* Sticky viewport that stays pinned */}
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-20 md:pt-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl flex items-center justify-center gap-2"
            >
              <span className="font-normal">how</span>
              <Logo variant="auto" className="h-8 inline-block" />
              {header}
            </motion.h2>
            {subheader && (
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base md:text-lg mt-2"
              >
                {subheader}
              </motion.h3>
            )}

            {/* Progress bar */}
            <div className="mt-6 mx-auto max-w-md px-8">
              <div className="relative h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  style={{
                    width: progressWidth,
                    boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
                  }}
                />
              </div>
              {/* Step indicators */}
              <div className="flex justify-between mt-2">
                {howItWorksSteps.map((step, index) => (
                  <StepIndicator
                    key={step.number}
                    step={step}
                    index={index}
                    currentStep={currentStep}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal sliding panels */}
          <motion.div
            className="flex h-full pt-32 md:pt-40"
            style={{ x, willChange: "transform" }}
          >
            {howItWorksSteps.map((step, index) => (
              <StepPanel
                key={step.number}
                step={step}
                index={index}
                totalSteps={totalSteps}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </motion.div>

          {/* Scroll hint at bottom */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
            style={{ opacity: scrollHintOpacity }}
          >
            <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </div>
      </div>

      {/* Mobile: horizontal scroll cards */}
      <div className="md:hidden py-16 bg-secondary/30">
        <div className="text-center mb-8 px-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2 flex-wrap">
            <span className="font-normal">how</span>
            <Logo variant="auto" className="h-6 inline-block" />
            {header}
          </h2>
          {subheader && (
            <h3 className="text-muted-foreground text-sm mt-2">
              {subheader}
            </h3>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory px-4">
          {howItWorksSteps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] h-[420px] snap-center"
              >
                <div className="bg-card rounded-2xl p-5 h-full border border-border flex flex-col">
                  {/* Image */}
                  <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border mb-4">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={280}
                      height={158}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Icon and number */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-base font-bold">
                      {step.number}
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm flex-1">
                    {step.description}
                  </p>

                  {/* CTA */}
                  <Button variant="outline" size="sm" className="rounded-full mt-4 w-full" asChild>
                    <Link href={step.cta.href}>{step.cta.text}</Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {howItWorksSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full bg-primary/30",
                index === 0 && "bg-primary"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
