"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const SOLO_AMOUNT = 340000;

// Affordability amounts by co-buyer count
const CO_BUYER_AMOUNTS: Record<number, number> = {
  2: 680000,   // 2x solo
  3: 1020000,  // 3x solo
  4: 1360000,  // 4x solo
  5: 1700000,  // 5x solo
};

// Config for each co-buyer count
const CO_BUYER_CONFIG: Record<number, {
  label: string;
  description: string;
  image: string;
}> = {
  2: {
    label: "Split the down payment 50/50",
    description: "3BR in the neighborhood you actually want",
    image: "/2 co-owners.webp",
  },
  3: {
    label: "3-way shared equity",
    description: "Spacious 4BR with yard and garage",
    image: "/3 co-owners 3.webp",
  },
  4: {
    label: "4 partners, 4x the power",
    description: "Modern 5BR multi-level townhouse",
    image: "/4 co-owners 2.webp",
  },
  5: {
    label: "Group investment property",
    description: "Luxury estate-level living",
    image: "/5 co-owners 2.webp",
  },
};

// Smooth counter that animates between values
function SmoothCounter({
  value,
  duration = 600,
}: {
  value: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      ${displayValue.toLocaleString()}
    </span>
  );
}

// Initial animated number (counts from 0)
function AnimatedNumber({ target, isInView }: { target: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span className="tabular-nums">
      ${count.toLocaleString()}
    </span>
  );
}

// Segmented button toggle for co-buyer count
function CoBuyerToggle({
  count,
  onChange,
}: {
  count: number;
  onChange: (count: number) => void;
}) {
  const options = [2, 3, 4, 5];

  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-full">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`
            relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200
            ${count === option
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {count === option && (
            <motion.div
              layoutId="activeToggle"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option}</span>
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-2">co-buyers</span>
    </div>
  );
}

interface UnlockSectionProps {
  header?: React.ReactNode;
  subheader?: string;
}

export function UnlockSection({
  header = "Who's Ready for Some Non-Trad Homeownership?",
  subheader = "Pooling resources with trusted people gives you access to nicer homes in better neighborhoods—without stretching your budget to the breaking point.",
}: UnlockSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coBuyerCount, setCoBuyerCount] = useState(2);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Scroll-based animation - starts when section enters viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "center 0.4"],  // Start when top hits 80% of viewport
  });

  // Solo card: starts offset right, moves to final position
  const soloX = useTransform(scrollYProgress, [0, 0.5], ["30%", "0%"]);
  const soloOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Co-buy card: slides in from right with delay
  const coX = useTransform(scrollYProgress, [0.15, 0.7], ["60%", "0%"]);
  const coOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  // Track when cards have animated in
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.5 && !hasAnimatedIn) {
        setHasAnimatedIn(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, hasAnimatedIn]);

  // Auto-rotate through co-buyer options
  useEffect(() => {
    if (!hasAnimatedIn || isPaused) return;

    const interval = setInterval(() => {
      setCoBuyerCount((prev) => (prev >= 5 ? 2 : prev + 1));
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [hasAnimatedIn, isPaused]);

  // Handle manual toggle - pause auto-rotation temporarily
  const handleManualToggle = (count: number) => {
    setCoBuyerCount(count);
    setIsPaused(true);
    // Resume auto-rotation after 10 seconds of no interaction
    setTimeout(() => setIsPaused(false), 10000);
  };

  const config = CO_BUYER_CONFIG[coBuyerCount];
  const amount = CO_BUYER_AMOUNTS[coBuyerCount];

  return (
    <section
      id="unlock-section"
      ref={containerRef}
      className="relative py-16 md:py-24 lg:py-32 bg-background overflow-hidden"
    >
      {/* Decorative glow (radial gradient instead of blur for performance) */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {header}
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {subheader}
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Buying alone card - scroll animated */}
          <motion.div
            style={{ x: soloX, opacity: soloOpacity }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            {/* Image */}
            <div className="aspect-[4/3] rounded-xl bg-muted mb-6 overflow-hidden relative">
              <Image
                src="/buying alone.webp"
                alt="Person looking at a modest apartment building"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Buying Solo
              </p>
              <p className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                <AnimatedNumber target={SOLO_AMOUNT} isInView={hasAnimatedIn} />
              </p>
              <p className="text-muted-foreground">
                Average first-time buyer budget
              </p>
            </div>
          </motion.div>

          {/* Buying together card - scroll animated with toggle */}
          <motion.div
            style={{ x: coX, opacity: coOpacity }}
            className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-6 md:p-8 shadow-lg"
          >
            {/* Dynamic badge */}
            <motion.div
              key={coBuyerCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-10 right-10 md:top-12 md:right-12 z-10 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              {coBuyerCount}x more home
            </motion.div>

            {/* Dynamic image with crossfade */}
            <div className="aspect-[4/3] rounded-xl bg-muted mb-4 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={coBuyerCount}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={config.image}
                    alt={`${coBuyerCount} co-owners looking at ${config.label.toLowerCase()}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-bottom"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Co-buyer toggle */}
            <div className="mb-4">
              <CoBuyerToggle count={coBuyerCount} onChange={handleManualToggle} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                Co-Buying with Partners
              </p>
              <p className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                <SmoothCounter value={amount} />
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={coBuyerCount}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground"
                >
                  {config.label}
                </motion.p>
              </AnimatePresence>
              <p className="text-sm text-muted-foreground/80">
                {config.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust element */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Join the millions of Americans who are exploring shared homeownership
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Button variant="glow" size="lg" className="rounded-full px-8" asChild>
            <Link href="/calc">Run the Numbers</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
