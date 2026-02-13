import { NextRequest } from 'next/server'
import { db, homeProjects } from '@/db'
import { eq } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/projects/[id]?partyId=...
 * Get a single project with its tasks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const project = await db.query.homeProjects.findFirst({
    where: eq(homeProjects.id, params.id),
    with: {
      tasks: {
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      },
    },
  })

  if (!project || project.partyId !== partyId) {
    return Response.json({ error: 'Project not found' }, { status: 404 })
  }

  // Compute task counts from the loaded tasks
  const totalTaskCount = project.tasks.length
  const openTaskCount = project.tasks.filter((t) => t.status !== 'done').length

  return Response.json({ ...project, openTaskCount, totalTaskCount })
}

/**
 * PATCH /api/homebase/projects/[id]
 * Update a project.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { partyId, name, description, color, icon, status, ownerId } = body as {
    partyId: string
    name?: string
    description?: string
    color?: string
    icon?: string
    status?: string
    ownerId?: string | null
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const existing = await db.query.homeProjects.findFirst({
    where: eq(homeProjects.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Project not found' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (name !== undefined) updates.name = name
  if (description !== undefined) updates.description = description
  if (color !== undefined) updates.color = color
  if (icon !== undefined) updates.icon = icon
  if (status !== undefined) updates.status = status
  if (ownerId !== undefined) updates.ownerId = ownerId

  const [updated] = await db
    .update(homeProjects)
    .set(updates)
    .where(eq(homeProjects.id, params.id))
    .returning()

  return Response.json(updated)
}

/**
 * DELETE /api/homebase/projects/[id]?partyId=...
 * Delete a project. Tasks become uncategorized (project_id = null).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const existing = await db.query.homeProjects.findFirst({
    where: eq(homeProjects.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Project not found' }, { status: 404 })
  }

  // Delete only this specific project by its primary key
  const deleted = await db
    .delete(homeProjects)
    .where(eq(homeProjects.id, existing.id))
    .returning({ id: homeProjects.id })

  return Response.json({ success: true, deletedId: deleted[0]?.id })
}
