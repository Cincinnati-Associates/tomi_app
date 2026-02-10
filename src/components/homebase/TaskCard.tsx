"use client"

import { CheckCircle, Circle, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TaskCardData {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  assignedTo?: string | null
  dueDate?: string | null
  commentCount?: number
}

interface TaskCardProps {
  task: TaskCardData
  onStatusChange?: (taskId: string, status: string) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const StatusIcon = task.status === 'done'
    ? CheckCircle
    : task.status === 'in_progress'
      ? Clock
      : Circle

  const statusColor = task.status === 'done'
    ? 'text-green-500'
    : task.status === 'in_progress'
      ? 'text-blue-500'
      : 'text-muted-foreground'

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
      {/* Status toggle */}
      <button
        onClick={() => {
          if (!onStatusChange) return
          const nextStatus = task.status === 'todo'
            ? 'in_progress'
            : task.status === 'in_progress'
              ? 'done'
              : 'todo'
          onStatusChange(task.id, nextStatus)
        }}
        className={cn('mt-0.5 flex-shrink-0', statusColor)}
        aria-label={`Mark task as ${task.status === 'done' ? 'not done' : 'done'}`}
      >
        <StatusIcon className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[15px] font-medium leading-snug',
          task.status === 'done' && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Priority */}
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            task.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
            task.priority === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
            task.priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
          )}>
            {task.priority}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {/* Comments */}
          {task.commentCount && task.commentCount > 0 ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.commentCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
