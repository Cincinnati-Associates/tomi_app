"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HomiChatTriggerProps {
  onClick: () => void;
  className?: string;
}

export function HomiChatTrigger({ onClick, className }: HomiChatTriggerProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-8 z-40",
        "h-16 w-16 md:h-[72px] md:w-[72px]",
        "rounded-full",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label="Chat with Homi"
    >
      {/* Ring pulse 1 — expands outward */}
      <span className="absolute inset-0 rounded-full border-2 border-primary/40 homi-ring-pulse" />

      {/* Ring pulse 2 — staggered for depth */}
      <span
        className="absolute inset-0 rounded-full border border-primary/25 homi-ring-pulse"
        style={{ animationDelay: "0.8s" }}
      />

      {/* Breathing glow (CSS box-shadow, no blur filter) */}
      <span className="absolute inset-[-4px] rounded-full homi-glow" />

      {/* Orb image — light mode */}
      <Image
        src="/icons/homi-orb-light.webp"
        alt=""
        width={144}
        height={144}
        className="absolute inset-0 w-full h-full rounded-full object-cover dark:hidden"
        priority
        aria-hidden="true"
      />

      {/* Orb image — dark mode */}
      <Image
        src="/icons/homi-orb-dark.webp"
        alt=""
        width={144}
        height={144}
        className="absolute inset-0 w-full h-full rounded-full object-cover hidden dark:block"
        priority
        aria-hidden="true"
      />
    </motion.button>
  );
}
