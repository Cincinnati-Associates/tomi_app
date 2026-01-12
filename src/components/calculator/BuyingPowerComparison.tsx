"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { useIntroAnimation } from "./SmartCalculatorPage";

interface BuyingPowerComparisonProps {
  soloMax: number;
  groupMax: number;
}

export function BuyingPowerComparison({
  soloMax,
  groupMax,
}: BuyingPowerComparisonProps) {
  const { introComplete } = useIntroAnimation();

  // Calculate percentage for visual comparison
  const soloPercent = groupMax > 0 ? (soloMax / groupMax) * 100 : 0;
  const isIntroPlaying = !introComplete;

  return (
    <div className="space-y-4">
      {/* Solo buying power */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Buying alone</span>
          <span className="text-sm font-medium text-foreground">
            <AnimatedCounter value={soloMax} prefix="$" />
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "30%" }}
            animate={isIntroPlaying
              ? { width: ["30%", "60%", "25%", "50%", "40%", "0%"] }
              : { width: `${soloPercent}%` }
            }
            transition={isIntroPlaying
              ? { duration: 3, ease: "easeInOut" }
              : { duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }
            }
            className="h-full bg-muted-foreground/40 rounded-full"
          />
        </div>
      </div>

      {/* Group buying power */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary">Buying together</span>
          <span className="text-sm font-bold text-primary">
            <AnimatedCounter value={groupMax} prefix="$" />
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "50%" }}
            animate={isIntroPlaying
              ? { width: ["50%", "85%", "40%", "70%", "55%", "0%"] }
              : { width: groupMax > 0 ? "100%" : "0%" }
            }
            transition={isIntroPlaying
              ? { duration: 3, ease: "easeInOut" }
              : { duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.3 }
            }
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Percentage increase */}
      {soloMax > 0 && groupMax > soloMax && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground pt-2"
        >
          That&apos;s{" "}
          <span className="font-semibold text-accent">
            +{Math.round(((groupMax - soloMax) / soloMax) * 100)}%
          </span>{" "}
          more buying power
        </motion.p>
      )}
    </div>
  );
}
