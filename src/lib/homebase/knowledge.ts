import { db, homeDocuments, homeTasks, homeTaskComments, homeProjects, homeLabels, homeTaskLabels, partyMembers, buyingParties } from '@/db'
import { eq, and, ne, desc, sql, isNull, inArray } from 'drizzle-orm'

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
  taskNumber: number
  title: string
  status: string
  priority: string
  assignedTo: string | null
  assignedToName: string | null
  dueDate: string | null
  startDate: string | null
  projectId: string | null
  projectName: string | null
  projectCode: string | null
  commentCount: number
  subtaskCount: number
  subtaskDoneCount: number
  labels: Array<{ name: string; color: string }>
}

interface ProjectSummary {
  id: string
  name: string
  code: string | null
  color: string
  status: string
  openTaskCount: number
  totalTaskCount: number
}

interface LabelSummary {
  id: string
  name: string
  color: string
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
  labels: LabelSummary[]
  recentActivity: RecentActivity[]
}

/**
 * Assemble all context needed for HomeBase chat.
 */
export async function assembleHomebaseContext(
  partyId: string
): Promise<HomebaseContext> {
  // Run queries in parallel
  const [partyResult, membersResult, docs, tasks, recentComments, projects, labels] =
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

      // Active top-level tasks (non-done, no parent)
      db
        .select({
          id: homeTasks.id,
          taskNumber: homeTasks.taskNumber,
          title: homeTasks.title,
          status: homeTasks.status,
          priority: homeTasks.priority,
          assignedTo: homeTasks.assignedTo,
          dueDate: homeTasks.dueDate,
          startDate: homeTasks.startDate,
          projectId: homeTasks.projectId,
          createdAt: homeTasks.createdAt,
          commentCount: sql<number>`(
            SELECT COUNT(*)::int FROM home_task_comments
            WHERE home_task_comments.task_id = ${homeTasks.id}
          )`,
          subtaskCount: sql<number>`(
            SELECT COUNT(*)::int FROM home_tasks st
            WHERE st.parent_task_id = ${homeTasks.id}
          )`,
          subtaskDoneCount: sql<number>`(
            SELECT COUNT(*)::int FROM home_tasks st
            WHERE st.parent_task_id = ${homeTasks.id} AND st.status = 'done'
          )`,
        })
        .from(homeTasks)
        .where(
          and(
            eq(homeTasks.partyId, partyId),
            ne(homeTasks.status, 'done'),
            isNull(homeTasks.parentTaskId)
          )
        )
        .orderBy(desc(homeTasks.createdAt)),

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

      // All labels for the party
      db.query.homeLabels.findMany({
        where: eq(homeLabels.partyId, partyId),
        orderBy: (labels, { asc }) => [asc(labels.name)],
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

  // Fetch labels for all tasks in one query
  const taskIds = tasks.map((t) => t.id)
  const allTaskLabels = taskIds.length > 0
    ? await db
        .select({
          taskId: homeTaskLabels.taskId,
          labelName: homeLabels.name,
          labelColor: homeLabels.color,
        })
        .from(homeTaskLabels)
        .innerJoin(homeLabels, eq(homeTaskLabels.labelId, homeLabels.id))
        .where(inArray(homeTaskLabels.taskId, taskIds))
    : []

  const labelsByTask = new Map<string, Array<{ name: string; color: string }>>()
  for (const row of allTaskLabels) {
    const existing = labelsByTask.get(row.taskId) || []
    existing.push({ name: row.labelName, color: row.labelColor })
    labelsByTask.set(row.taskId, existing)
  }

  // Look up project names
  const projectMap = new Map<string, string>()
  for (const p of projects) {
    projectMap.set(p.id, p.name)
  }

  // Build project code map
  const projectCodeMap = new Map<string, string>()
  for (const p of projects) {
    if (p.code) projectCodeMap.set(p.id, p.code)
  }

  const taskSummaries: TaskSummary[] = tasks.map((t) => ({
    id: t.id,
    taskNumber: t.taskNumber,
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedTo,
    assignedToName: t.assignedTo ? memberMap.get(t.assignedTo) || null : null,
    dueDate: t.dueDate,
    startDate: t.startDate,
    projectId: t.projectId,
    projectName: t.projectId ? projectMap.get(t.projectId) || null : null,
    projectCode: t.projectId ? projectCodeMap.get(t.projectId) || null : null,
    commentCount: t.commentCount,
    subtaskCount: t.subtaskCount,
    subtaskDoneCount: t.subtaskDoneCount,
    labels: labelsByTask.get(t.id) || [],
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
        code: p.code,
        color: p.color,
        status: p.status,
        openTaskCount: taskCounts[0]?.open || 0,
        totalTaskCount: taskCounts[0]?.total || 0,
      }
    })
  )

  const labelSummaries: LabelSummary[] = labels.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }))

  const recentActivity: RecentActivity[] = recentComments.map((c) => ({
    type: 'comment' as const,
    description: c.content.slice(0, 100),
    authorName: c.authorId ? memberMap.get(c.authorId) || null : null,
    createdAt: c.createdAt,
  }))

  return { party, documents: docs, tasks: taskSummaries, projects: projectSummaries, labels: labelSummaries, recentActivity }
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
      const codeStr = p.code ? ` [${p.code}]` : ''
      lines.push(`- **${p.name}**${codeStr} (ID: ${p.id}) — ${status}`)
    }
  }

  // Labels
  if (ctx.labels.length > 0) {
    lines.push(`\n### Available Labels (${ctx.labels.length})`)
    lines.push(ctx.labels.map((l) => l.name).join(', '))
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
    // Helper to format task ID display (e.g. "ADU-3" or "T-3")
    const fmtId = (t: TaskSummary) => {
      const prefix = t.projectCode || 'T'
      return `${prefix}-${t.taskNumber}`
    }

    if (overdue.length > 0) {
      lines.push(`**OVERDUE (${overdue.length}):**`)
      for (const t of overdue) {
        const parts = [`[${fmtId(t)}] "${t.title}"`, `due ${t.dueDate}`, `${t.priority} priority`]
        if (t.projectName) parts.push(`project: ${t.projectName}`)
        if (t.assignedToName) parts.push(`assigned: ${t.assignedToName}`)
        if (t.labels.length > 0) parts.push(`labels: ${t.labels.map(l => l.name).join(', ')}`)
        if (t.subtaskCount > 0) parts.push(`subtasks: ${t.subtaskDoneCount}/${t.subtaskCount}`)
        lines.push(`- ${parts.join(' — ')}`)
      }
    }

    // High priority tasks
    const highPriority = openTasks.filter((t) => t.priority === 'high' && !overdue.includes(t))
    if (highPriority.length > 0) {
      lines.push(`**High Priority (${highPriority.length}):**`)
      for (const t of highPriority) {
        const parts = [`[${fmtId(t)}] "${t.title}"`]
        if (t.dueDate) parts.push(`due ${t.dueDate}`)
        if (t.projectName) parts.push(`project: ${t.projectName}`)
        if (t.assignedToName) parts.push(`assigned: ${t.assignedToName}`)
        if (t.labels.length > 0) parts.push(`labels: ${t.labels.map(l => l.name).join(', ')}`)
        if (t.subtaskCount > 0) parts.push(`subtasks: ${t.subtaskDoneCount}/${t.subtaskCount}`)
        lines.push(`- ${parts.join(' — ')}`)
      }
    }

    // Remaining tasks (not overdue, not high priority)
    const remaining = openTasks.filter((t) => !overdue.includes(t) && t.priority !== 'high')
    if (remaining.length > 0) {
      lines.push(`**Other Tasks (${remaining.length}):**`)
      for (const t of remaining) {
        const parts = [`[${fmtId(t)}] "${t.title}"`, `${t.priority} priority`]
        if (t.dueDate) parts.push(`due ${t.dueDate}`)
        if (t.projectName) parts.push(`project: ${t.projectName}`)
        if (t.assignedToName) parts.push(`assigned: ${t.assignedToName}`)
        if (t.labels.length > 0) parts.push(`labels: ${t.labels.map(l => l.name).join(', ')}`)
        if (t.subtaskCount > 0) parts.push(`subtasks: ${t.subtaskDoneCount}/${t.subtaskCount}`)
        lines.push(`- ${parts.join(' — ')}`)
      }
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
