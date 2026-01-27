"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedStatProps {
  props: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    subLabel?: string;
  };
}

export function AnimatedStat({ props }: AnimatedStatProps) {
  const { value, prefix = "", suffix = "", label, subLabel } = props;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.div
        className="font-heading text-5xl md:text-7xl font-bold text-foreground tabular-nums"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </motion.div>

      <motion.p
        className="mt-4 text-lg md:text-xl text-muted-foreground font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {label}
      </motion.p>

      {subLabel && (
        <motion.p
          className="mt-1 text-sm text-muted-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {subLabel}
        </motion.p>
      )}
    </motion.div>
  );
}
