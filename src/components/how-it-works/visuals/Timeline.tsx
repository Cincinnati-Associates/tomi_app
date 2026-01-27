"use client";

import { motion } from "framer-motion";

interface TimelinePoint {
  era: string;
  label: string;
  icon: string;
}

interface TimelineProps {
  props: {
    points: TimelinePoint[];
  };
}

export function Timeline({ props }: TimelineProps) {
  const { points } = props;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative">
        {/* Timeline line */}
        <motion.div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted-foreground/20 via-primary to-primary"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformOrigin: "top" }}
        />

        {/* Timeline points */}
        <div className="relative space-y-12">
          {points.map((point, index) => (
            <motion.div
              key={point.era}
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.4 + 0.5, duration: 0.5 }}
            >
              {/* Left side content (for even indices) */}
              {index % 2 === 0 ? (
                <>
                  <div className="flex-1 text-right">
                    <span className="text-2xl">{point.icon}</span>
                    <p className="font-heading font-semibold text-foreground mt-1">
                      {point.era}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {point.label}
                    </p>
                  </div>
                  <motion.div
                    className="relative z-10 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.4 + 0.7, type: "spring" }}
                  />
                  <div className="flex-1" />
                </>
              ) : (
                <>
                  <div className="flex-1" />
                  <motion.div
                    className="relative z-10 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.4 + 0.7, type: "spring" }}
                  />
                  <div className="flex-1 text-left">
                    <span className="text-2xl">{point.icon}</span>
                    <p className="font-heading font-semibold text-foreground mt-1">
                      {point.era}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {point.label}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow indicating progress */}
      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: points.length * 0.4 + 1 }}
      >
        <div className="flex flex-col items-center text-primary">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L12 20M12 20L6 14M12 20L18 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <span className="text-xs text-muted-foreground mt-1">
            Technology enables trust
          </span>
        </div>
      </motion.div>
    </div>
  );
}
