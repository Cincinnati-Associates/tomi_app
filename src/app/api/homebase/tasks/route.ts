import { NextRequest } from 'next/server'
import { db, homeTasks, homeTaskLabels, homeLabels, homeTaskActivity, homeProjects } from '@/db'
import { eq, and, desc, asc, sql, isNull, inArray } from 'drizzle-orm'
import { requirePartyMember, getNextTaskNumber } from '@/lib/homebase/auth'
import { homeTaskComments } from '@/db/schema/homebase'

/**
 * GET /api/homebase/tasks?partyId=...&status=...&assignedTo=...&projectId=...&label=...&parentTaskId=...&sort=...
 * List tasks for a party. By default returns only top-level tasks (no subtasks).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')
  const status = searchParams.get('status')
  const assignedTo = searchParams.get('assignedTo')
  const projectId = searchParams.get('projectId')
  const parentTaskId = searchParams.get('parentTaskId')
  const labelFilter = searchParams.get('label')
  const sort = searchParams.get('sort') || 'created_at'

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const conditions = [eq(homeTasks.partyId, partyId!)]

  if (status && status !== 'all') {
    conditions.push(eq(homeTasks.status, status as typeof homeTasks.status.enumValues[number]))
  }
  if (assignedTo && assignedTo !== 'all') {
    conditions.push(eq(homeTasks.assignedTo, assignedTo))
  }
  if (projectId) {
    conditions.push(eq(homeTasks.projectId, projectId))
  }

  // By default, only show top-level tasks (not subtasks)
  // Pass parentTaskId=<id> to get subtasks of a specific task
  if (parentTaskId) {
    conditions.push(eq(homeTasks.parentTaskId, parentTaskId))
  } else {
    conditions.push(isNull(homeTasks.parentTaskId))
  }

  // Label filter: tasks that have this label name
  if (labelFilter) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${homeTaskLabels} tl
        JOIN ${homeLabels} l ON l.id = tl.label_id
        WHERE tl.task_id = ${homeTasks.id}
        AND lower(l.name) = lower(${labelFilter})
      )`
    )
  }

  const orderBy =
    sort === 'due_date'
      ? asc(homeTasks.dueDate)
      : sort === 'priority'
        ? desc(homeTasks.priority)
        : desc(homeTasks.createdAt)

  const tasks = await db
    .select({
      id: homeTasks.id,
      taskNumber: homeTasks.taskNumber,
      partyId: homeTasks.partyId,
      projectId: homeTasks.projectId,
      parentTaskId: homeTasks.parentTaskId,
      createdBy: homeTasks.createdBy,
      assignedTo: homeTasks.assignedTo,
      title: homeTasks.title,
      description: homeTasks.description,
      status: homeTasks.status,
      priority: homeTasks.priority,
      dueDate: homeTasks.dueDate,
      startDate: homeTasks.startDate,
      estimatedMinutes: homeTasks.estimatedMinutes,
      sortOrder: homeTasks.sortOrder,
      completedAt: homeTasks.completedAt,
      completedBy: homeTasks.completedBy,
      createdAt: homeTasks.createdAt,
      updatedAt: homeTasks.updatedAt,
      projectName: homeProjects.name,
      projectColor: homeProjects.color,
      projectCode: homeProjects.code,
      commentCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${homeTaskComments}
        WHERE ${homeTaskComments.taskId} = ${homeTasks.id}
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
    .leftJoin(homeProjects, eq(homeTasks.projectId, homeProjects.id))
    .where(and(...conditions))
    .orderBy(orderBy)

  // Fetch labels for each task
  const taskIds = tasks.map((t) => t.id)
  const allLabels = taskIds.length > 0
    ? await db
        .select({
          taskId: homeTaskLabels.taskId,
          labelId: homeLabels.id,
          labelName: homeLabels.name,
          labelColor: homeLabels.color,
        })
        .from(homeTaskLabels)
        .innerJoin(homeLabels, eq(homeTaskLabels.labelId, homeLabels.id))
        .where(inArray(homeTaskLabels.taskId, taskIds))
    : []

  // Group labels by task
  const labelsByTask = new Map<string, Array<{ id: string; name: string; color: string }>>()
  for (const row of allLabels) {
    const existing = labelsByTask.get(row.taskId) || []
    existing.push({ id: row.labelId, name: row.labelName, color: row.labelColor })
    labelsByTask.set(row.taskId, existing)
  }

  const result = tasks.map((t) => ({
    ...t,
    labels: labelsByTask.get(t.id) || [],
  }))

  return Response.json(result)
}

/**
 * POST /api/homebase/tasks
 * Create a new task.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    partyId, title, description, assignedTo, priority, dueDate, startDate,
    estimatedMinutes, projectId: bodyProjectId, parentTaskId, labelIds,
  } = body as {
    partyId: string
    title: string
    description?: string
    assignedTo?: string
    priority?: string
    dueDate?: string
    startDate?: string
    estimatedMinutes?: number
    projectId?: string
    parentTaskId?: string
    labelIds?: string[]
  }

  if (!title) {
    return Response.json({ error: 'Title is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const taskNumber = await getNextTaskNumber(partyId)

  const [task] = await db
    .insert(homeTasks)
    .values({
      partyId,
      taskNumber,
      projectId: bodyProjectId || null,
      parentTaskId: parentTaskId || null,
      createdBy: auth.userId,
      assignedTo: assignedTo || null,
      title,
      description,
      priority: (priority || 'medium') as typeof homeTasks.priority.enumValues[number],
      dueDate: dueDate || null,
      startDate: startDate || null,
      estimatedMinutes: estimatedMinutes || null,
    })
    .returning()

  // Attach labels if provided
  if (labelIds && labelIds.length > 0) {
    await db.insert(homeTaskLabels).values(
      labelIds.map((labelId) => ({ taskId: task.id, labelId }))
    )
  }

  // Record activity
  await db.insert(homeTaskActivity).values({
    taskId: task.id,
    actorId: auth.userId,
    actorType: 'user',
    action: 'created',
  })

  return Response.json(task, { status: 201 })
}
