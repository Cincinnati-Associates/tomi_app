import { NextRequest } from 'next/server'
import { db, homeProjects, homeTasks } from '@/db'
import { eq, desc, sql } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/projects?partyId=...
 * List projects for a party with task counts.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const projects = await db
    .select({
      id: homeProjects.id,
      partyId: homeProjects.partyId,
      createdBy: homeProjects.createdBy,
      name: homeProjects.name,
      description: homeProjects.description,
      color: homeProjects.color,
      icon: homeProjects.icon,
      status: homeProjects.status,
      sortOrder: homeProjects.sortOrder,
      createdAt: homeProjects.createdAt,
      updatedAt: homeProjects.updatedAt,
      openTaskCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${homeTasks}
        WHERE ${homeTasks.projectId} = ${homeProjects.id}
        AND ${homeTasks.status} != 'done'
      )`,
      totalTaskCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${homeTasks}
        WHERE ${homeTasks.projectId} = ${homeProjects.id}
      )`,
    })
    .from(homeProjects)
    .where(eq(homeProjects.partyId, partyId!))
    .orderBy(homeProjects.sortOrder, desc(homeProjects.createdAt))

  return Response.json(projects)
}

/**
 * POST /api/homebase/projects
 * Create a new project.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { partyId, name, description, color, icon } = body as {
    partyId: string
    name: string
    description?: string
    color?: string
    icon?: string
  }

  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const [project] = await db
    .insert(homeProjects)
    .values({
      partyId,
      createdBy: auth.userId,
      name,
      description,
      color: color || '#6B7280',
      icon: icon || 'folder',
    })
    .returning()

  return Response.json(project, { status: 201 })
}
