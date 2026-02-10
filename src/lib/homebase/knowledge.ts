import { db, homeDocuments, homeTasks, homeTaskComments, partyMembers, buyingParties } from '@/db'
import { eq, and, ne, desc } from 'drizzle-orm'

interface PartyInfo {
  id: string
  name: string
  members: Array<{ id: string; name: string; role: string }>
}

interface DocumentSummary {
  id: string
  title: string
  category: string
  status: string
  createdAt: Date
}

interface TaskSummary {
  id: string
  title: string
  status: string
  priority: string
  assignedTo: string | null
  assignedToName: string | null
  dueDate: string | null
  commentCount: number
}

interface RecentActivity {
  type: 'comment' | 'task_created' | 'task_completed'
  description: string
  authorName: string | null
  createdAt: Date
}

export interface HomebaseContext {
  party: PartyInfo
  documents: DocumentSummary[]
  tasks: TaskSummary[]
  recentActivity: RecentActivity[]
}

/**
 * Assemble all context needed for HomeBase chat.
 */
export async function assembleHomebaseContext(
  partyId: string
): Promise<HomebaseContext> {
  // Run queries in parallel
  const [partyResult, membersResult, docs, tasks, recentComments] =
    await Promise.all([
      // Party info
      db.query.buyingParties.findFirst({
        where: eq(buyingParties.id, partyId),
      }),

      // Party members with profiles
      db.query.partyMembers.findMany({
        where: and(
          eq(partyMembers.partyId, partyId),
          eq(partyMembers.inviteStatus, 'accepted')
        ),
        with: {
          user: true,
        },
      }),

      // Document summaries
      db
        .select({
          id: homeDocuments.id,
          title: homeDocuments.title,
          category: homeDocuments.category,
          status: homeDocuments.status,
          createdAt: homeDocuments.createdAt,
        })
        .from(homeDocuments)
        .where(eq(homeDocuments.partyId, partyId))
        .orderBy(desc(homeDocuments.createdAt)),

      // Active tasks (non-done)
      db.query.homeTasks.findMany({
        where: and(
          eq(homeTasks.partyId, partyId),
          ne(homeTasks.status, 'done')
        ),
        with: {
          assignedToProfile: true,
          comments: true,
        },
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      }),

      // Recent comments (last 10)
      db
        .select({
          content: homeTaskComments.content,
          createdAt: homeTaskComments.createdAt,
          authorId: homeTaskComments.authorId,
          taskId: homeTaskComments.taskId,
        })
        .from(homeTaskComments)
        .innerJoin(homeTasks, eq(homeTaskComments.taskId, homeTasks.id))
        .where(eq(homeTasks.partyId, partyId))
        .orderBy(desc(homeTaskComments.createdAt))
        .limit(10),
    ])

  // Build member map for name lookups
  const memberMap = new Map<string, string>()
  for (const m of membersResult) {
    if (m.user) {
      memberMap.set(m.userId, m.user.fullName || m.user.email || 'Unknown')
    }
  }

  const party: PartyInfo = {
    id: partyResult?.id || partyId,
    name: partyResult?.name || 'Home',
    members: membersResult.map((m) => ({
      id: m.userId,
      name: m.user?.fullName || m.user?.email || 'Unknown',
      role: m.role,
    })),
  }

  const taskSummaries: TaskSummary[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedTo,
    assignedToName: t.assignedTo ? memberMap.get(t.assignedTo) || null : null,
    dueDate: t.dueDate,
    commentCount: t.comments?.length || 0,
  }))

  const recentActivity: RecentActivity[] = recentComments.map((c) => ({
    type: 'comment' as const,
    description: c.content.slice(0, 100),
    authorName: c.authorId ? memberMap.get(c.authorId) || null : null,
    createdAt: c.createdAt,
  }))

  return { party, documents: docs, tasks: taskSummaries, recentActivity }
}

/**
 * Format HomeBase context into a prompt section for Homi.
 */
export function formatHomebaseContextForPrompt(ctx: HomebaseContext): string {
  const lines: string[] = []

  lines.push('## HomeBase Context')
  lines.push(`- **Property**: ${ctx.party.name}`)
  lines.push(
    `- **Co-owners**: ${ctx.party.members.map((m) => m.name).join(', ')}`
  )

  // Documents
  if (ctx.documents.length > 0) {
    const readyDocs = ctx.documents.filter((d) => d.status === 'ready')
    lines.push(
      `- **Documents on file** (${readyDocs.length}): ${readyDocs.map((d) => d.title).join(', ')}`
    )
  } else {
    lines.push('- **Documents on file**: None yet')
  }

  // Tasks
  const openTasks = ctx.tasks.filter((t) => t.status !== 'done')
  if (openTasks.length > 0) {
    const highPriority = openTasks.filter((t) => t.priority === 'high')
    let taskLine = `- **Open tasks**: ${openTasks.length}`
    if (highPriority.length > 0) {
      taskLine += ` (${highPriority.length} high priority: "${highPriority[0].title}")`
    }
    lines.push(taskLine)
  } else {
    lines.push('- **Open tasks**: None')
  }

  // Recent activity
  if (ctx.recentActivity.length > 0) {
    const latest = ctx.recentActivity[0]
    lines.push(
      `- **Recent activity**: ${latest.authorName || 'Someone'} commented: "${latest.description}"`
    )
  }

  return lines.join('\n')
}
