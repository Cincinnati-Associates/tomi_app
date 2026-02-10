"use client"

import { FileText, Image, File, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DocumentCardData {
  id: string
  title: string
  category: string
  status: string
  fileType?: string | null
  fileSize?: number | null
  createdAt: string
}

interface DocumentCardProps {
  document: DocumentCardData
  onDelete?: (id: string) => void
}

function getDocIcon(fileType: string | null | undefined) {
  if (!fileType) return File
  if (fileType.startsWith('image/')) return Image
  if (fileType === 'application/pdf') return FileText
  return File
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const Icon = getDocIcon(document.fileType)
  const isProcessing = document.status === 'processing' || document.status === 'uploading'
  const isError = document.status === 'error'

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors',
      isError && 'border-red-200 dark:border-red-800'
    )}>
      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
        isProcessing ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-primary/10'
      )}>
        {isProcessing ? (
          <Loader2 className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-spin" />
        ) : isError ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Icon className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium truncate">{document.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {formatCategory(document.category)}
          </span>
          {document.fileSize ? (
            <span className="text-xs text-muted-foreground">
              {formatSize(document.fileSize)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(document.id)}
          className="flex-shrink-0 p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
          aria-label="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
