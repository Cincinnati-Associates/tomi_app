"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface ImpactStatementProps {
  header?: string;
  subheader?: string;
}

export function ImpactStatement({
  header = "Every year, millions of Americans buy homes with friends and family.",
  subheader = "We're about to make that number much larger.",
}: ImpactStatementProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="py-12 md:py-16 bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {header}
          </h2>
          {subheader && (
            <p className="mt-3 text-primary-foreground/90 text-base md:text-lg font-medium">
              {subheader}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
