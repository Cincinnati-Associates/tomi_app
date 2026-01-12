"use client";

import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className,
  prefix = "",
  suffix = "",
  duration = 800,
}: AnimatedCounterProps) {
  const animatedValue = useAnimatedValue({
    value,
    duration,
    easing: "easeOut",
  });

  const formatted = new Intl.NumberFormat("en-US").format(animatedValue);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
