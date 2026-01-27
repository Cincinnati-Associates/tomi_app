"use client";

import { motion } from "framer-motion";
import { Home, DollarSign, MapPin, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface Barrier {
  id: string;
  label: string;
  icon: "down-payment" | "monthly" | "location" | "all";
}

interface BarrierIconsProps {
  props: {
    barriers: Barrier[];
    selectedId?: string;
  };
}

const ICON_MAP = {
  "down-payment": DollarSign,
  "monthly": Home,
  "location": MapPin,
  "all": Layers,
};

export function BarrierIcons({ props }: BarrierIconsProps) {
  const { barriers, selectedId } = props;

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="grid grid-cols-2 gap-4">
        {barriers.map((barrier, index) => {
          const Icon = ICON_MAP[barrier.icon];
          const isSelected = barrier.id === selectedId;

          return (
            <motion.div
              key={barrier.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-colors",
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/50 border-border hover:border-primary/50"
              )}
            >
              <motion.div
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Icon
                  className={cn(
                    "h-10 w-10 mb-3",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-sm font-medium text-center",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {barrier.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
