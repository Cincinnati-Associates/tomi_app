import { NextRequest } from 'next/server'
import { db, homeTasks, homeTaskComments } from '@/db'
import { eq } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/tasks/[id]?partyId=...
 * Get a single task with comments.
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
    },
  })

  if (!task || task.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  return Response.json(task)
}

/**
 * PATCH /api/homebase/tasks/[id]
 * Update a task.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { partyId, title, description, status, priority, dueDate, assignedTo } =
    body as {
      partyId: string
      title?: string
      description?: string
      status?: string
      priority?: string
      dueDate?: string | null
      assignedTo?: string | null
    }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Verify task belongs to party
  const existing = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (priority !== undefined) updates.priority = priority
  if (dueDate !== undefined) updates.dueDate = dueDate
  if (assignedTo !== undefined) updates.assignedTo = assignedTo

  // Handle status transitions
  if (status !== undefined) {
    updates.status = status
    if (status === 'done') {
      updates.completedAt = new Date()
      updates.completedBy = auth.userId
    } else if (existing.status === 'done') {
      // Reopening a completed task
      updates.completedAt = null
      updates.completedBy = null
    }
  }

  const [updated] = await db
    .update(homeTasks)
    .set(updates)
    .where(eq(homeTasks.id, params.id))
    .returning()

  return Response.json(updated)
}

/**
 * DELETE /api/homebase/tasks/[id]?partyId=...
 * Delete a task.
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

  await db.delete(homeTaskComments).where(eq(homeTaskComments.taskId, params.id))
  await db.delete(homeTasks).where(eq(homeTasks.id, params.id))

  return Response.json({ success: true })
}
