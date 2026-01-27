"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CategoryInfo, QuestionCategory } from "@/hooks/useAssessment";

interface SectionedProgressProps {
  categories: CategoryInfo[];
  currentSection: QuestionCategory;
  sectionProgress: Record<QuestionCategory, { completed: number; total: number }>;
}

export function SectionedProgress({
  categories,
  currentSection,
  sectionProgress,
}: SectionedProgressProps) {
  // Calculate current section progress as percentage
  const currentSectionData = sectionProgress[currentSection];
  const sectionPercent = currentSectionData.total > 0
    ? (currentSectionData.completed / currentSectionData.total) * 100
    : 0;

  return (
    <div className="w-full px-4 py-2">
      {/* Category dots with labels - compact */}
      <div className="flex items-center justify-between mb-2.5">
        {categories.map((category, index) => {
          const progress = sectionProgress[category.id];
          const isComplete = progress.completed === progress.total;
          const isCurrent = category.id === currentSection;
          const isPast = categories.findIndex((c) => c.id === currentSection) > index;

          return (
            <div key={category.id} className="flex flex-col items-center gap-1">
              {/* Category label */}
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] font-medium transition-colors duration-300 leading-none",
                  isCurrent
                    ? "text-primary"
                    : isComplete || isPast
                    ? "text-foreground/70"
                    : "text-muted-foreground/50"
                )}
              >
                {category.label}
              </span>

              {/* Dot indicator */}
              <div className="relative">
                {/* Glow effect for current section */}
                {isCurrent && !isComplete && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/40"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Main dot */}
                <motion.div
                  className={cn(
                    "relative w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-colors duration-300",
                    isComplete
                      ? "bg-primary border-primary"
                      : isCurrent
                      ? "bg-primary/30 border-primary"
                      : isPast
                      ? "bg-primary/50 border-primary/50"
                      : "bg-transparent border-muted-foreground/30"
                  )}
                  animate={
                    isCurrent && !isComplete
                      ? {
                          boxShadow: [
                            "0 0 0 0 hsl(var(--primary) / 0.4)",
                            "0 0 10px 4px hsl(var(--primary) / 0.3)",
                            "0 0 0 0 hsl(var(--primary) / 0.4)",
                          ],
                        }
                      : isComplete
                      ? { boxShadow: "0 0 8px 2px hsl(var(--primary) / 0.3)" }
                      : { boxShadow: "none" }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent && !isComplete ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  {/* Check mark for completed sections */}
                  {isComplete && (
                    <motion.svg
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-full h-full text-primary-foreground p-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar - shows current section progress - thinner */}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          key={currentSection}
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${sectionPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Subtle shine effect on progress bar */}
        <motion.div
          className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ left: "-10%" }}
          animate={{ left: "110%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
      </div>

    </div>
  );
}
