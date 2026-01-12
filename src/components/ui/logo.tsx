"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "yellow" | "primary" | "white" | "auto";
}

export function Logo({ className, variant = "yellow" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine actual variant based on theme for "auto" mode
  const actualVariant =
    variant === "auto"
      ? mounted && resolvedTheme === "dark"
        ? "yellow"
        : "primary"
      : variant;

  // Yellow variant uses the actual PNG logo (no filter)
  if (actualVariant === "yellow") {
    return (
      <Image
        src="/logo.png"
        alt="Tomi"
        width={100}
        height={32}
        className={cn("h-7 w-auto md:h-8", className)}
        priority
      />
    );
  }

  // For primary/white variants, use CSS filter to colorize the logo
  const filterStyle = {
    primary:
      "brightness(0) saturate(100%) invert(28%) sepia(15%) saturate(1200%) hue-rotate(111deg) brightness(95%) contrast(91%)",
    white: "brightness(0) invert(1)",
  }[actualVariant];

  return (
    <Image
      src="/logo.png"
      alt="Tomi"
      width={100}
      height={32}
      className={cn("h-7 w-auto md:h-8", className)}
      style={{ filter: filterStyle }}
      priority
    />
  );
}
