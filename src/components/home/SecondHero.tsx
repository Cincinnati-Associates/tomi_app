"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface SecondHeroProps {
  header?: string;
  subheader?: React.ReactNode;
}

export function SecondHero({
  header = "How do you own a home with someone you aren't married to?",
  subheader = "The money part is easy. The coordination part is where most people get stuck.",
}: SecondHeroProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 lg:py-32 bg-secondary/30 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl leading-tight"
        >
          {header}
        </motion.h2>

        {/* Subheadline */}
        {subheader && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
          >
            {subheader}
          </motion.p>
        )}
      </div>
    </section>
  );
}
