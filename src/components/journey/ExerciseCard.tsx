"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sparkles,
  Gem,
  Route,
  Home,
  UserCheck,
  PiggyBank,
  Search,
  ArrowRightLeft,
  DollarSign,
  Eye,
  Shield,
  Users,
  Clock,
  Check,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JourneyExercise, ExerciseProgress } from "@/lib/journey/types"

export interface ExerciseCardMemberAvatar {
  userId: string
  name: string
  avatarUrl: string | null
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Gem,
  Route,
  Home,
  UserCheck,
  PiggyBank,
  Search,
  ArrowRightLeft,
  DollarSign,
  Eye,
  Shield,
  Users,
}

interface ExerciseCardProps {
  exercise: JourneyExercise
  progress: ExerciseProgress
  locked?: boolean
  index: number
  memberAvatars?: ExerciseCardMemberAvatar[]
}

export function ExerciseCard({
  exercise,
  progress,
  locked,
  index,
  memberAvatars,
}: ExerciseCardProps) {
  const router = useRouter()
  const Icon = iconMap[exercise.icon] || Sparkles
  const isCompleted = progress.status === "completed"
  const isInProgress = progress.status === "in_progress"
  const isClickable = !locked

  const handleClick = () => {
    if (isClickable) {
      router.push(`/journey/exercises/${exercise.route}`)
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onClick={handleClick}
      disabled={!isClickable}
      className={cn(
        "relative flex flex-col items-center text-center rounded-xl border p-4 transition-all min-w-[140px] w-[140px] sm:w-auto sm:min-w-0 shrink-0",
        isCompleted &&
          "bg-primary/5 border-primary/30 dark:bg-primary/10",
        isInProgress &&
          "bg-card border-primary/40 ring-1 ring-primary/20",
        !isCompleted &&
          !isInProgress &&
          !locked &&
          "bg-card border-border hover:border-primary/30 hover:shadow-sm",
        locked && "bg-muted/30 border-border/50 opacity-50 cursor-not-allowed",
        isClickable && !locked && "cursor-pointer active:scale-[0.97]"
      )}
    >
      {/* Status badge */}
      {isCompleted && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center mb-2",
          isCompleted && "bg-primary/10 dark:bg-primary/20",
          isInProgress && "bg-primary/10",
          !isCompleted && !isInProgress && !locked && "bg-muted",
          locked && "bg-muted/50"
        )}
      >
        {locked ? (
          <Lock className="h-4 w-4 text-muted-foreground/50" />
        ) : (
          <Icon
            className={cn(
              "h-4 w-4",
              isCompleted && "text-primary",
              isInProgress && "text-primary",
              !isCompleted && !isInProgress && "text-muted-foreground"
            )}
          />
        )}
      </div>

      {/* Name */}
      <span
        className={cn(
          "text-xs font-medium leading-tight mb-1",
          isCompleted && "text-foreground",
          isInProgress && "text-foreground",
          !isCompleted && !isInProgress && !locked && "text-foreground",
          locked && "text-muted-foreground/60"
        )}
      >
        {exercise.name}
      </span>

      {/* Description */}
      <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mb-2">
        {exercise.description}
      </span>

      {/* Time estimate */}
      {!locked && (
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5 mt-auto">
          <Clock className="h-2.5 w-2.5" />
          {exercise.estimatedMinutes} min
        </span>
      )}

      {/* In-progress indicator */}
      {isInProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl bg-primary/30 overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-primary rounded-full"
            animate={{ x: ["0%", "200%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Member avatars */}
      {memberAvatars && memberAvatars.length > 0 && (
        <div className="flex -space-x-1 mt-1.5">
          {memberAvatars.slice(0, 3).map((member) => (
            <div
              key={member.userId}
              className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center overflow-hidden"
              title={member.name}
            >
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[6px] font-bold text-muted-foreground">
                  {member.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {memberAvatars.length > 3 && (
            <div className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
              <span className="text-[6px] font-bold text-muted-foreground">
                +{memberAvatars.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.button>
  )
}
