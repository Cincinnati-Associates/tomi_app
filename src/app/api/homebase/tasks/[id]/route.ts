import { NextRequest } from 'next/server'
import { db, homeTasks, homeTaskActivity, homeTaskLabels, homeLabels } from '@/db'
import { eq } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/tasks/[id]?partyId=...
 * Get a single task with comments, subtasks, labels, and recent activity.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const task = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
    with: {
      comments: {
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
      subtasks: {
        orderBy: (tasks, { asc }) => [asc(tasks.sortOrder), asc(tasks.createdAt)],
      },
      activity: {
        orderBy: (activity, { desc }) => [desc(activity.createdAt)],
        limit: 50,
      },
    },
  })

  if (!task || task.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  // Fetch labels
  const labels = await db
    .select({
      id: homeLabels.id,
      name: homeLabels.name,
      color: homeLabels.color,
    })
    .from(homeTaskLabels)
    .innerJoin(homeLabels, eq(homeTaskLabels.labelId, homeLabels.id))
    .where(eq(homeTaskLabels.taskId, params.id))

  return Response.json({ ...task, labels })
}

/**
 * PATCH /api/homebase/tasks/[id]
 * Update a task. Records activity for each field change.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const {
    partyId, title, description, status, priority, dueDate, startDate,
    estimatedMinutes, assignedTo, projectId, parentTaskId, sortOrder,
    actorType,
  } = body as {
    partyId: string
    title?: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string | null
    startDate?: string | null
    estimatedMinutes?: number | null
    assignedTo?: string | null
    projectId?: string | null
    parentTaskId?: string | null
    sortOrder?: number
    actorType?: 'user' | 'ai'
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const existing = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  const activityEntries: Array<{
    taskId: string
    actorId: string
    actorType: string
    action: string
    fieldName: string
    oldValue: string | null
    newValue: string | null
  }> = []

  const resolvedActorType = actorType || 'user'

  // Track each field change
  if (title !== undefined && title !== existing.title) {
    updates.title = title
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'field_changed', fieldName: 'title',
      oldValue: existing.title, newValue: title,
    })
  }
  if (description !== undefined && description !== existing.description) {
    updates.description = description
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'field_changed', fieldName: 'description',
      oldValue: existing.description, newValue: description,
    })
  }
  if (priority !== undefined && priority !== existing.priority) {
    updates.priority = priority
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'priority_changed', fieldName: 'priority',
      oldValue: existing.priority, newValue: priority,
    })
  }
  if (dueDate !== undefined && dueDate !== existing.dueDate) {
    updates.dueDate = dueDate
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'field_changed', fieldName: 'due_date',
      oldValue: existing.dueDate, newValue: dueDate,
    })
  }
  if (startDate !== undefined && startDate !== existing.startDate) {
    updates.startDate = startDate
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'field_changed', fieldName: 'start_date',
      oldValue: existing.startDate, newValue: startDate,
    })
  }
  if (estimatedMinutes !== undefined && estimatedMinutes !== existing.estimatedMinutes) {
    updates.estimatedMinutes = estimatedMinutes
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'field_changed', fieldName: 'estimated_minutes',
      oldValue: existing.estimatedMinutes?.toString() || null,
      newValue: estimatedMinutes?.toString() || null,
    })
  }
  if (assignedTo !== undefined && assignedTo !== existing.assignedTo) {
    updates.assignedTo = assignedTo
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'assigned', fieldName: 'assigned_to',
      oldValue: existing.assignedTo, newValue: assignedTo,
    })
  }
  if (projectId !== undefined && projectId !== existing.projectId) {
    updates.projectId = projectId
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'moved_to_project', fieldName: 'project_id',
      oldValue: existing.projectId, newValue: projectId,
    })
  }
  if (parentTaskId !== undefined && parentTaskId !== existing.parentTaskId) {
    updates.parentTaskId = parentTaskId
  }
  if (sortOrder !== undefined && sortOrder !== existing.sortOrder) {
    updates.sortOrder = sortOrder
  }

  // Handle status transitions
  if (status !== undefined && status !== existing.status) {
    updates.status = status
    if (status === 'done') {
      updates.completedAt = new Date()
      updates.completedBy = auth.userId
    } else if (existing.status === 'done') {
      updates.completedAt = null
      updates.completedBy = null
    }
    activityEntries.push({
      taskId: params.id, actorId: auth.userId, actorType: resolvedActorType,
      action: 'status_changed', fieldName: 'status',
      oldValue: existing.status, newValue: status,
    })
  }

  const [updated] = await db
    .update(homeTasks)
    .set(updates)
    .where(eq(homeTasks.id, params.id))
    .returning()

  // Record activity entries
  if (activityEntries.length > 0) {
    await db.insert(homeTaskActivity).values(activityEntries)
  }

  return Response.json(updated)
}

/**
 * DELETE /api/homebase/tasks/[id]?partyId=...
 * Delete a task and its subtasks (CASCADE).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const existing = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  // CASCADE will handle subtasks, comments, labels, and activity
  await db.delete(homeTasks).where(eq(homeTasks.id, params.id))

  return Response.json({ success: true })
}
