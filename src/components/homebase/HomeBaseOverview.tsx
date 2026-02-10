"use client"

import { TaskList } from './TaskList'
import { DocumentList } from './DocumentList'

export function HomeBaseOverview() {
  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-6">
      <TaskList limit={5} />
      <div className="border-t border-border pt-6">
        <DocumentList limit={5} />
      </div>
    </div>
  )
}
