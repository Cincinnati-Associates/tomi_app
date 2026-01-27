"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Bar {
  label: string;
  value: number;
  color: "primary" | "muted" | "destructive" | "accent";
}

interface ComparisonBarsProps {
  props: {
    bars: Bar[];
    timeframe?: string;
  };
}

const COLOR_MAP = {
  primary: "bg-primary",
  muted: "bg-muted-foreground/50",
  destructive: "bg-red-500",
  accent: "bg-accent",
};

export function ComparisonBars({ props }: ComparisonBarsProps) {
  const { bars, timeframe } = props;
  const maxValue = Math.max(...bars.map((b) => b.value));

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {timeframe && (
        <motion.p
          className="text-sm text-muted-foreground text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {timeframe}
        </motion.p>
      )}

      <div className="space-y-6">
        {bars.map((bar, index) => (
          <motion.div
            key={bar.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">{bar.label}</span>
              <span className="text-sm font-bold text-foreground">+{bar.value}%</span>
            </div>
            <div className="h-8 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", COLOR_MAP[bar.color])}
                initial={{ width: 0 }}
                animate={{ width: `${(bar.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gap indicator */}
      {bars.length === 2 && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full">
            <span className="text-2xl font-bold text-red-500">
              {Math.abs(bars[1].value - bars[0].value)}%
            </span>
            <span className="text-sm text-red-500/80">gap</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
