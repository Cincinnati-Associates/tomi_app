"use client";

import { useEffect, useState, useRef } from "react";

interface UseAnimatedValueOptions {
  /** Target value to animate to */
  value: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Delay before starting animation */
  delay?: number;
  /** Easing function */
  easing?: "linear" | "easeOut" | "easeInOut" | "spring";
}

// Easing functions
const easings = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export function useAnimatedValue({
  value,
  duration = 800,
  delay = 0,
  easing = "easeOut",
}: UseAnimatedValueOptions): number {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const easingFn = easings[easing];

    // Clear any existing animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp + delay;
      }

      const elapsed = timestamp - startTime.current;

      if (elapsed < 0) {
        // Still in delay period
        animationFrame.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const current = start + (end - start) * easedProgress;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
        startTime.current = undefined;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration, delay, easing]);

  return displayValue;
}

// Hook for formatting animated currency values
export function useAnimatedCurrency(
  value: number,
  options?: Omit<UseAnimatedValueOptions, "value">
): string {
  const animatedValue = useAnimatedValue({ value, ...options });

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(animatedValue);
}
