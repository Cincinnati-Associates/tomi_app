"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

interface BuyingPowerPreviewProps {
  props: {
    baseAmount: number;
    multipliers: { buyers: number; amount: number }[];
    animationDelay?: number;
  };
}

export function BuyingPowerPreview({ props }: BuyingPowerPreviewProps) {
  const { baseAmount, multipliers, animationDelay = 2000 } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(baseAmount);

  // Cycle through multipliers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (multipliers.length + 1));
    }, animationDelay);

    return () => clearInterval(timer);
  }, [multipliers.length, animationDelay]);

  // Animate the amount when index changes
  useEffect(() => {
    const targetAmount =
      currentIndex === 0 ? baseAmount : multipliers[currentIndex - 1].amount;

    const duration = 500;
    const steps = 30;
    const startAmount = currentIndex === 0 ? baseAmount :
      (currentIndex === 1 ? baseAmount : multipliers[currentIndex - 2]?.amount || baseAmount);
    const increment = (targetAmount - startAmount) / steps;
    let current = startAmount;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= targetAmount) ||
        (increment < 0 && current <= targetAmount)
      ) {
        setDisplayAmount(targetAmount);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, baseAmount, multipliers]);

  const currentBuyers = currentIndex === 0 ? 1 : multipliers[currentIndex - 1].buyers;

  return (
    <div className="w-full max-w-sm mx-auto px-4 text-center">
      {/* Amount display */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Glow background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Amount */}
        <div className="relative">
          <motion.div
            className="font-heading text-5xl md:text-6xl font-bold text-foreground tabular-nums"
            key={currentIndex}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            ${displayAmount.toLocaleString()}K
          </motion.div>
        </div>
      </motion.div>

      {/* Buyers indicator */}
      <motion.div
        className="mt-6 flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBuyers}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex -space-x-1">
              {Array.from({ length: currentBuyers }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Users className="w-3 h-3 text-primary" />
                </motion.div>
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">
              {currentBuyers === 1 ? "Alone" : `${currentBuyers} co-buyers`}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, ...multipliers.map((_, i) => i + 1)].map((idx) => (
          <motion.div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            animate={idx === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Multiplier message */}
      <motion.p
        className="mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {currentIndex === 0
          ? "Your buying power alone"
          : `${multipliers[currentIndex - 1].buyers}x your buying power`}
      </motion.p>
    </div>
  );
}
