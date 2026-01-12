"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CoBuyer } from "@/types/calculator";
import { cn } from "@/lib/utils";

interface CoBuyerAvatarsProps {
  primaryBuyer: CoBuyer;
  coBuyers: CoBuyer[];
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
};

const avatarVariants = {
  initial: { scale: 0, opacity: 0 },
  enter: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 400,
      damping: 20,
    },
  }),
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.15 },
  },
};

export function CoBuyerAvatars({
  primaryBuyer,
  coBuyers,
  size = "lg",
}: CoBuyerAvatarsProps) {
  const allBuyers = [primaryBuyer, ...coBuyers];

  return (
    <div className="flex items-center justify-center -space-x-3">
      <AnimatePresence mode="popLayout">
        {allBuyers.map((buyer, index) => (
          <motion.div
            key={buyer.id}
            custom={index}
            variants={avatarVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            whileHover="hover"
            className={cn(
              "rounded-full flex items-center justify-center font-semibold text-white shadow-md border-2 border-white",
              sizeClasses[size]
            )}
            style={{ backgroundColor: buyer.color }}
            title={buyer.name}
          >
            {getInitials(buyer.name)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add more indicator */}
      {allBuyers.length < 4 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className={cn(
            "rounded-full flex items-center justify-center font-medium text-muted-foreground bg-muted border-2 border-dashed border-muted-foreground/30 cursor-pointer",
            sizeClasses[size]
          )}
          title="Add co-buyer"
        >
          +
        </motion.button>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  if (name === "You") return "Y";
  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
