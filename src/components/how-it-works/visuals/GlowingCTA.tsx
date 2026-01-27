"use client";

import { motion } from "framer-motion";
import { Calculator, ArrowRight } from "lucide-react";

interface GlowingCTAProps {
  props: {
    title: string;
    subtitle?: string;
  };
}

export function GlowingCTA({ props }: GlowingCTAProps) {
  const { title, subtitle } = props;

  return (
    <div className="w-full max-w-sm mx-auto px-4 text-center">
      {/* Glowing card preview */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Animated glow background */}
        <motion.div
          className="absolute inset-0 blur-2xl rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.1))",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Card content */}
        <motion.div
          className="relative bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Icon */}
          <motion.div
            className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Calculator className="w-8 h-8 text-primary" />
          </motion.div>

          {/* Title */}
          <motion.h3
            className="font-heading text-xl font-semibold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {title}
          </motion.h3>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Animated arrow hint */}
          <motion.div
            className="flex items-center justify-center gap-2 text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-sm font-medium">Get started</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
