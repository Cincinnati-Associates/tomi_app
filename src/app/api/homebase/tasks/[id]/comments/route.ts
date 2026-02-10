import { NextRequest } from 'next/server'
import { db, homeTasks, homeTaskComments } from '@/db'
import { eq, asc } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/tasks/[id]/comments?partyId=...
 * List comments for a task.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Verify task belongs to party
  const task = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
  })

  if (!task || task.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  const comments = await db
    .select()
    .from(homeTaskComments)
    .where(eq(homeTaskComments.taskId, params.id))
    .orderBy(asc(homeTaskComments.createdAt))

  return Response.json(comments)
}

/**
 * POST /api/homebase/tasks/[id]/comments
 * Add a comment to a task.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { partyId, content } = body as {
    partyId: string
    content: string
  }

  if (!content) {
    return Response.json({ error: 'Content is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Verify task belongs to party
  const task = await db.query.homeTasks.findFirst({
    where: eq(homeTasks.id, params.id),
  })

  if (!task || task.partyId !== partyId) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }

  const [comment] = await db
    .insert(homeTaskComments)
    .values({
      taskId: params.id,
      authorId: auth.userId,
      content,
    })
    .returning()

  return Response.json(comment, { status: 201 })
}
