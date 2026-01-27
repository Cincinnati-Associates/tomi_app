"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CultureCard {
  id: string;
  flag: string;
  country: string;
  name: string;
  description: string;
}

interface CultureCarouselProps {
  props: {
    cultures: CultureCard[];
  };
}

export function CultureCarousel({ props }: CultureCarouselProps) {
  const { cultures } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cultures.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cultures.length) % cultures.length);
  };

  const current = cultures[currentIndex];

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg"
          >
            {/* Flag and country */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{current.flag}</span>
              <div>
                <h3 className="font-heading font-semibold text-foreground">
                  {current.country}
                </h3>
                <p className="text-sm text-primary font-medium">
                  &ldquo;{current.name}&rdquo;
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
          aria-label="Previous culture"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
          aria-label="Next culture"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {cultures.map((culture, index) => (
          <button
            key={culture.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex
                ? "bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to ${culture.country}`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <motion.p
        className="text-center text-xs text-muted-foreground mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Swipe or click arrows to explore
      </motion.p>
    </div>
  );
}
