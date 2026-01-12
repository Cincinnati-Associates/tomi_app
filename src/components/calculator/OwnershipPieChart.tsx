"use client";

import { motion } from "framer-motion";
import type { OwnershipSplit } from "@/types/calculator";

interface OwnershipPieChartProps {
  splits: OwnershipSplit[];
  size?: number;
}

export function OwnershipPieChart({
  splits,
  size = 200,
}: OwnershipPieChartProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate stroke dash arrays for each segment
  let cumulativePercentage = 0;
  const segments = splits.map((split, index) => {
    const startAngle = cumulativePercentage * 3.6 - 90; // Convert percentage to degrees, start at top
    const dashArray = (split.percentage / 100) * circumference;
    const dashOffset = circumference - (cumulativePercentage / 100) * circumference;
    cumulativePercentage += split.percentage;

    return {
      ...split,
      dashArray,
      dashOffset,
      startAngle,
      index,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Pie Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f1f1"
            strokeWidth="20"
          />

          {/* Segments */}
          {segments.map((segment, i) => {
            // Calculate cumulative offset
            let offset = 0;
            for (let j = 0; j < i; j++) {
              offset += (segments[j].percentage / 100) * circumference;
            }

            return (
              <motion.circle
                key={segment.buyerId}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(segment.percentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={-offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{
                  strokeDasharray: `${(segment.percentage / 100) * circumference} ${circumference}`,
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {splits.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {splits.length === 1 ? "Owner" : "Owners"}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {splits.map((split) => (
          <motion.div
            key={split.buyerId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: split.color }}
            />
            <span className="text-sm">
              <span className="font-medium text-foreground">
                {split.buyerName}
              </span>
              <span className="text-muted-foreground ml-1">
                {split.percentage.toFixed(0)}%
              </span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
