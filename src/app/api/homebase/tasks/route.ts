import { NextRequest } from 'next/server'
import { db, homeTasks } from '@/db'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'
import { homeTaskComments } from '@/db/schema/homebase'

/**
 * GET /api/homebase/tasks?partyId=...&status=...&assignedTo=...&sort=...
 * List tasks for a party.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')
  const status = searchParams.get('status')
  const assignedTo = searchParams.get('assignedTo')
  const projectId = searchParams.get('projectId')
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

  const orderBy =
    sort === 'due_date'
      ? asc(homeTasks.dueDate)
      : sort === 'priority'
        ? desc(homeTasks.priority)
        : desc(homeTasks.createdAt)

  const tasks = await db
    .select({
      id: homeTasks.id,
      partyId: homeTasks.partyId,
      projectId: homeTasks.projectId,
      createdBy: homeTasks.createdBy,
      assignedTo: homeTasks.assignedTo,
      title: homeTasks.title,
      description: homeTasks.description,
      status: homeTasks.status,
      priority: homeTasks.priority,
      dueDate: homeTasks.dueDate,
      completedAt: homeTasks.completedAt,
      completedBy: homeTasks.completedBy,
      metadata: homeTasks.metadata,
      createdAt: homeTasks.createdAt,
      updatedAt: homeTasks.updatedAt,
      commentCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${homeTaskComments}
        WHERE ${homeTaskComments.taskId} = ${homeTasks.id}
      )`,
    })
    .from(homeTasks)
    .where(and(...conditions))
    .orderBy(orderBy)

  return Response.json(tasks)
}

/**
 * POST /api/homebase/tasks
 * Create a new task.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { partyId, title, description, assignedTo, priority, dueDate, projectId: bodyProjectId } = body as {
    partyId: string
    title: string
    description?: string
    assignedTo?: string
    priority?: string
    dueDate?: string
    projectId?: string
  }

  if (!title) {
    return Response.json({ error: 'Title is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const [task] = await db
    .insert(homeTasks)
    .values({
      partyId,
      projectId: bodyProjectId || null,
      createdBy: auth.userId,
      assignedTo: assignedTo || null,
      title,
      description,
      priority: (priority || 'medium') as typeof homeTasks.priority.enumValues[number],
      dueDate: dueDate || null,
    })
    .returning()

  return Response.json(task, { status: 201 })
}
