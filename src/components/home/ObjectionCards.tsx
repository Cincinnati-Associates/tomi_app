"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { objectionCards } from "@/content/questions";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ObjectionCardsProps {
  header?: string;
  subheader?: string;
}

export function ObjectionCards({
  header = '"But what about..."',
  subheader = "Every concern you have, we've thought through.",
}: ObjectionCardsProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {header}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {subheader}
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Take Our Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {objectionCards.map((card, index) => (
            <motion.div
              key={card.question}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleCard(index)}
                className={cn(
                  "w-full text-left rounded-xl border p-5 md:p-6 transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-md",
                  expandedIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {card.question}
                  </h3>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300",
                      expandedIndex === index && "rotate-180 text-primary"
                    )}
                  />
                </div>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                        {card.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
