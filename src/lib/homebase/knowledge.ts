import { db, homeDocuments, homeTasks, homeTaskComments, homeProjects, partyMembers, buyingParties } from '@/db'
import { eq, and, ne, desc, sql } from 'drizzle-orm'

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
  projectId: string | null
  projectName: string | null
  commentCount: number
}

interface ProjectSummary {
  id: string
  name: string
  color: string
  status: string
  openTaskCount: number
  totalTaskCount: number
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
  projects: ProjectSummary[]
  recentActivity: RecentActivity[]
}

/**
 * Assemble all context needed for HomeBase chat.
 */
export async function assembleHomebaseContext(
  partyId: string
): Promise<HomebaseContext> {
  // Run queries in parallel
  const [partyResult, membersResult, docs, tasks, recentComments, projects] =
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
          project: true,
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

      // Projects with task counts
      db.query.homeProjects.findMany({
        where: and(
          eq(homeProjects.partyId, partyId),
          ne(homeProjects.status, 'archived')
        ),
        orderBy: (projects, { asc }) => [asc(projects.sortOrder)],
      }),
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
    projectId: t.projectId,
    projectName: (t as unknown as { project?: { name: string } }).project?.name || null,
    commentCount: t.comments?.length || 0,
  }))

  // Get task counts per project
  const projectSummaries: ProjectSummary[] = await Promise.all(
    projects.map(async (p) => {
      const taskCounts = await db
        .select({
          total: sql<number>`count(*)::int`,
          open: sql<number>`count(*) filter (where ${homeTasks.status} != 'done')::int`,
        })
        .from(homeTasks)
        .where(eq(homeTasks.projectId, p.id))

      return {
        id: p.id,
        name: p.name,
        color: p.color,
        status: p.status,
        openTaskCount: taskCounts[0]?.open || 0,
        totalTaskCount: taskCounts[0]?.total || 0,
      }
    })
  )

  const recentActivity: RecentActivity[] = recentComments.map((c) => ({
    type: 'comment' as const,
    description: c.content.slice(0, 100),
    authorName: c.authorId ? memberMap.get(c.authorId) || null : null,
    createdAt: c.createdAt,
  }))

  return { party, documents: docs, tasks: taskSummaries, projects: projectSummaries, recentActivity }
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

  // Projects
  if (ctx.projects.length > 0) {
    lines.push(`\n### Active Projects (${ctx.projects.length})`)
    for (const p of ctx.projects) {
      const status = p.openTaskCount > 0
        ? `${p.openTaskCount} open of ${p.totalTaskCount} tasks`
        : p.totalTaskCount > 0 ? 'all tasks done' : 'no tasks yet'
      lines.push(`- **${p.name}** (ID: ${p.id}) — ${status}`)
    }
  }

  // Documents
  if (ctx.documents.length > 0) {
    const readyDocs = ctx.documents.filter((d) => d.status === 'ready')
    lines.push(
      `\n- **Documents on file** (${readyDocs.length}): ${readyDocs.map((d) => d.title).join(', ')}`
    )
  } else {
    lines.push('\n- **Documents on file**: None yet')
  }

  // Tasks
  const openTasks = ctx.tasks.filter((t) => t.status !== 'done')
  if (openTasks.length > 0) {
    lines.push(`\n### Open Tasks (${openTasks.length})`)

    // Highlight overdue tasks
    const today = new Date().toISOString().split('T')[0]
    const overdue = openTasks.filter((t) => t.dueDate && t.dueDate < today)
    if (overdue.length > 0) {
      lines.push(`**OVERDUE (${overdue.length}):**`)
      for (const t of overdue) {
        lines.push(`- "${t.title}" (ID: ${t.id}) — due ${t.dueDate}, ${t.priority} priority${t.projectName ? `, project: ${t.projectName}` : ''}`)
      }
    }

    // High priority tasks
    const highPriority = openTasks.filter((t) => t.priority === 'high' && !overdue.includes(t))
    if (highPriority.length > 0) {
      lines.push(`**High Priority (${highPriority.length}):**`)
      for (const t of highPriority) {
        lines.push(`- "${t.title}" (ID: ${t.id})${t.dueDate ? ` — due ${t.dueDate}` : ''}${t.projectName ? `, project: ${t.projectName}` : ''}`)
      }
    }

    // Summary of remaining
    const remaining = openTasks.filter((t) => !overdue.includes(t) && t.priority !== 'high')
    if (remaining.length > 0) {
      lines.push(`**Other open tasks**: ${remaining.length} (${remaining.filter(t => t.priority === 'medium').length} medium, ${remaining.filter(t => t.priority === 'low').length} low priority)`)
    }
  } else {
    lines.push('\n- **Open tasks**: None — all caught up!')
  }

  // Recent activity
  if (ctx.recentActivity.length > 0) {
    const latest = ctx.recentActivity[0]
    lines.push(
      `\n- **Recent activity**: ${latest.authorName || 'Someone'} commented: "${latest.description}"`
    )
  }

  return lines.join('\n')
}
