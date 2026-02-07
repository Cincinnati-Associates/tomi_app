"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NumberScaleProps {
  min?: number
  max?: number
  selected: number | null
  onSelect: (value: number) => void
  disabled?: boolean
}

export function NumberScale({
  min = 1,
  max = 10,
  selected,
  onSelect,
  disabled = false,
}: NumberScaleProps) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {numbers.map((num, i) => (
        <motion.button
          key={num}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => !disabled && onSelect(num)}
          disabled={disabled}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
            "transition-all min-h-[44px] min-w-[44px]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            selected === num
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-muted text-foreground hover:bg-muted/80",
            disabled && selected !== num && "opacity-50 cursor-not-allowed"
          )}
        >
          {num}
        </motion.button>
      ))}
    </div>
  )
}
