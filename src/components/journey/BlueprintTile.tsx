"use client"

import { motion } from "framer-motion"
import {
  Gem,
  Calendar,
  Home,
  Users,
  UserPlus,
  DollarSign,
  MapPin,
  FileText,
  PieChart,
  FileCheck,
  Lock,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BlueprintTileConfig, BlueprintTileData } from "@/lib/journey/types"

const iconMap: Record<string, React.ElementType> = {
  Gem,
  Calendar,
  Home,
  Users,
  UserPlus,
  DollarSign,
  MapPin,
  FileText,
  PieChart,
  FileCheck,
}

interface BlueprintTileProps {
  config: BlueprintTileConfig
  data: BlueprintTileData
  unlocked: boolean
  index: number
}

export function BlueprintTile({ config, data, unlocked, index }: BlueprintTileProps) {
  const Icon = iconMap[config.icon] || FileText
  const isFilled = data.filled
  const isLocked = !unlocked && !isFilled

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "relative rounded-lg p-2 flex flex-col items-center justify-center gap-1 min-h-[64px] transition-all",
        isFilled && "bg-primary/15 border border-primary/30",
        !isFilled && unlocked && "border-2 border-dashed border-border bg-muted/30",
        isLocked && "border border-border/30 bg-muted/10 opacity-40"
      )}
    >
      {isFilled && (
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
      {isLocked ? (
        <Lock className="h-4 w-4 text-muted-foreground/50" />
      ) : (
        <Icon className={cn("h-4 w-4", isFilled ? "text-primary" : "text-muted-foreground/60")} />
      )}
      <span className={cn(
        "text-[10px] leading-tight text-center font-medium",
        isFilled ? "text-foreground" : "text-muted-foreground/70",
        isLocked && "text-muted-foreground/40"
      )}>
        {isFilled && data.content?.headline ? data.content.headline : config.label}
      </span>
      {isFilled && data.content?.detail && (
        <span className="text-[8px] text-muted-foreground leading-tight text-center truncate w-full">
          {data.content.detail}
        </span>
      )}
    </motion.div>
  )
}
