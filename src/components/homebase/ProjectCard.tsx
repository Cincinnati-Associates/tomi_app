"use client"

import { cn } from '@/lib/utils'

export interface ProjectCardData {
  id: string
  name: string
  description?: string | null
  color: string
  icon?: string | null
  status: string
  openTaskCount: number
  totalTaskCount: number
}

interface ProjectCardProps {
  project: ProjectCardData
  onClick?: () => void
  isActive?: boolean
}

export function ProjectCard({ project, onClick, isActive }: ProjectCardProps) {
  const doneCount = project.totalTaskCount - project.openTaskCount
  const progressPercent =
    project.totalTaskCount > 0
      ? Math.round((doneCount / project.totalTaskCount) * 100)
      : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col w-[180px] flex-shrink-0 rounded-xl border-2 p-4 text-left transition-all',
        'hover:shadow-md',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      {/* Color dot + name */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <span className="text-sm font-semibold text-foreground truncate">
          {project.name}
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {project.openTaskCount > 0
            ? `${project.openTaskCount} open`
            : 'All done'}
        </span>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{project.totalTaskCount}
        </span>
      </div>

      {/* Progress bar */}
      {project.totalTaskCount > 0 && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </button>
  )
}

/** Mini "Add project" card for the horizontal scroll row */
export function AddProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[180px] flex-shrink-0 rounded-xl border-2 border-dashed border-border p-4 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
    >
      <span className="text-2xl font-light mr-2">+</span>
      <span className="text-sm font-medium">New Project</span>
    </button>
  )
}
