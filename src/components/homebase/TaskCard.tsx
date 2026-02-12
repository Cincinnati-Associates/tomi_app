"use client"

import { CheckCircle, ChevronRight, Circle, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TaskCardData {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  assignedTo?: string | null
  projectId?: string | null
  dueDate?: string | null
  commentCount?: number
  /** Project info for display */
  projectName?: string
  projectColor?: string
}

interface TaskCardProps {
  task: TaskCardData
  onStatusChange?: (taskId: string, status: string) => void
  onClick?: (taskId: string) => void
}

export function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
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

  const statusLabel = task.status === 'done'
    ? 'Done'
    : task.status === 'in_progress'
      ? 'Working'
      : 'To Do'

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date(new Date().toDateString())

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(task.id)
        }
      }}
      className={cn(
        'flex items-start gap-3 rounded-xl border-2 bg-card p-5 transition-all cursor-pointer',
        'hover:border-primary/30 hover:shadow-sm',
        isOverdue
          ? 'border-red-200 dark:border-red-900'
          : 'border-border'
      )}
    >
      {/* Status toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (!onStatusChange) return
          const nextStatus = task.status === 'todo'
            ? 'in_progress'
            : task.status === 'in_progress'
              ? 'done'
              : 'todo'
          onStatusChange(task.id, nextStatus)
        }}
        className={cn(
          'mt-0.5 flex-shrink-0 flex items-center justify-center',
          'h-12 w-12 rounded-xl transition-colors',
          'hover:bg-muted',
          statusColor
        )}
        aria-label={`Mark task as ${task.status === 'done' ? 'not done' : 'done'}`}
      >
        <StatusIcon className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[17px] font-medium leading-snug',
          task.status === 'done' && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Status label */}
          <span className={cn(
            'text-xs font-medium',
            statusColor
          )}>
            {statusLabel}
          </span>

          {/* Priority */}
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
            task.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
            task.priority === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
            task.priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
          )}>
            {task.priority}
          </span>

          {/* Project badge */}
          {task.projectName && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.projectColor || '#6B7280' }}
              />
              {task.projectName}
            </span>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span className={cn(
              'text-xs flex items-center gap-1',
              isOverdue
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-muted-foreground'
            )}>
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {isOverdue && ' (overdue)'}
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

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-1" />
    </div>
  )
}
