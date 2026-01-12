"use client";

import { motion } from "framer-motion";
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
      {/* Outer ring pulses */}
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-primary/40"
        animate={{
          scale: [1, 1.4, 1.4],
          opacity: [0.6, 0, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{
          scale: [1, 1.6, 1.6],
          opacity: [0.4, 0, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.4,
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.8, 1.8],
          opacity: [0.3, 0, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.8,
        }}
      />

      {/* Glow backdrop - intensified */}
      <motion.div
        className="absolute inset-[-12px] rounded-full bg-primary/40 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-[-6px] rounded-full bg-primary/50 blur-lg"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Main orb body */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden shadow-lg"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Base gradient - brighter */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 bg-white/10" />

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-accent/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Shimmer effect - brighter */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />

        {/* Top highlight for 3D effect - brighter */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1/3 bg-gradient-to-b from-white/50 to-transparent rounded-full blur-sm" />

        {/* Floating light orbs inside */}
        <motion.div
          className="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/50 blur-[2px]"
          animate={{
            x: [0, 12, 6, 14, 0],
            y: [0, 8, 14, 6, 0],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-accent/60 blur-[1px]"
          animate={{
            x: [0, -8, -4, -10, 0],
            y: [0, -6, -10, -4, 0],
            scale: [1, 0.8, 1.2, 0.9, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Center bright spot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-white/60 blur-[3px]" />
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/60"
          style={{
            top: "50%",
            left: "50%",
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 2) * 40, 0],
            y: [0, Math.sin((i * Math.PI) / 2) * 40, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.button>
  );
}
