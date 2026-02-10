"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ChipOption {
  label: string
  value: string
}

interface QuickReplyChipsProps {
  options: ChipOption[]
  selected: string | string[] | null
  onSelect: (value: string) => void
  multiSelect?: boolean
  disabled?: boolean
}

export function QuickReplyChips({
  options,
  selected,
  onSelect,
  multiSelect = false,
  disabled = false,
}: QuickReplyChipsProps) {
  const selectedSet = new Set(
    Array.isArray(selected) ? selected : selected ? [selected] : []
  )

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, i) => {
        const isSelected = selectedSet.has(option.value)
        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2.5 text-[15px] font-medium",
              "transition-all min-h-[44px]",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-foreground hover:bg-muted/80 active:scale-[0.97]",
              disabled && !isSelected && "opacity-50 cursor-not-allowed",
              multiSelect && isSelected && "ring-2 ring-primary/30"
            )}
          >
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}
