"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sparkles,
  Map,
  Users,
  DollarSign,
  Eye,
  Shield,
  Home,
  Gem,
  Route,
  UserCheck,
  PiggyBank,
  Search,
  ArrowRightLeft,
  Lock,
  Check,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrailNodeData } from "@/lib/journey/types"

export interface TrailNodeMemberAvatar {
  userId: string
  name: string
  avatarUrl: string | null
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Map, Users, DollarSign, Eye, Shield, Home, Gem, Route, UserCheck, PiggyBank, Search, ArrowRightLeft,
}

interface TrailNodeProps {
  node: TrailNodeData
  index: number
  memberAvatars?: TrailNodeMemberAvatar[]
}

export function TrailNode({ node, index, memberAvatars }: TrailNodeProps) {
  const router = useRouter()
  const Icon = iconMap[node.icon] || Sparkles
  const isPhase = node.type === "phase"
  const size = isPhase ? "h-[52px] w-[52px]" : "h-10 w-10"
  const iconSize = isPhase ? "h-6 w-6" : "h-4 w-4"
  const offset = index % 2 === 0 ? -30 : 30

  const isClickable =
    node.type === "exercise" &&
    node.route &&
    (node.status === "current" || node.status === "unlocked" || node.status === "completed")

  const handleClick = () => {
    if (isClickable && node.route) {
      router.push(node.route)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex flex-col items-center relative"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all",
          size,
          node.status === "completed" && "bg-primary",
          node.status === "current" && "bg-primary trail-node-current",
          node.status === "unlocked" && "bg-muted border-2 border-border",
          node.status === "locked" && "bg-muted/50 opacity-40",
          isClickable && "cursor-pointer hover:scale-105 active:scale-95"
        )}
      >
        {node.status === "current" && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-primary/50"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {node.status === "completed" ? (
          <div className="relative">
            <Icon className={cn(iconSize, "text-primary-foreground opacity-50")} />
            <Check className="absolute inset-0 m-auto h-4 w-4 text-primary-foreground" />
          </div>
        ) : node.status === "locked" ? (
          <Lock className={cn(iconSize, "text-muted-foreground")} />
        ) : (
          <Icon
            className={cn(
              iconSize,
              node.status === "current" && "text-primary-foreground",
              node.status === "unlocked" && "text-muted-foreground"
            )}
          />
        )}
      </button>

      {/* Party member avatar dots */}
      {memberAvatars && memberAvatars.length > 0 && node.type === "exercise" && (
        <div className="absolute left-full ml-2 top-1 flex -space-x-1">
          {memberAvatars.slice(0, 4).map((member) => (
            <div
              key={member.userId}
              className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center overflow-hidden"
              title={member.name}
            >
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[7px] font-bold text-muted-foreground">
                  {member.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {memberAvatars.length > 4 && (
            <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center">
              <span className="text-[7px] font-bold text-muted-foreground">+{memberAvatars.length - 4}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-1.5 text-center max-w-[120px]">
        {isPhase && (
          <span className="text-[10px] font-medium text-muted-foreground/70 block">Phase {node.phaseId}</span>
        )}
        <span
          className={cn(
            "text-xs leading-tight block",
            node.status === "completed" && "text-foreground",
            node.status === "current" && "text-foreground font-semibold",
            node.status === "unlocked" && "text-muted-foreground",
            node.status === "locked" && "text-muted-foreground/50"
          )}
        >
          {node.label}
        </span>
        {node.type === "exercise" && node.estimatedMinutes && node.status !== "locked" && (
          <span className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-0.5 mt-0.5">
            <Clock className="h-2.5 w-2.5" />
            {node.estimatedMinutes}m
          </span>
        )}
      </div>
    </motion.div>
  )
}
