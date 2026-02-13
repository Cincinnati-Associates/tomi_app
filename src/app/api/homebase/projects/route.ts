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

  // Fetch projects
  const projectRows = await db
    .select()
    .from(homeProjects)
    .where(eq(homeProjects.partyId, partyId!))
    .orderBy(homeProjects.sortOrder, desc(homeProjects.createdAt))

  // Fetch task counts per project in a single query
  const projectIds = projectRows.map((p) => p.id)
  let taskCounts: Array<{ projectId: string; open: number; total: number }> = []
  if (projectIds.length > 0) {
    const countRows = await db
      .select({
        projectId: homeTasks.projectId,
        total: sql<number>`COUNT(*)::int`,
        open: sql<number>`COUNT(*) FILTER (WHERE ${homeTasks.status} != 'done')::int`,
      })
      .from(homeTasks)
      .where(
        sql`${homeTasks.projectId} IN (${sql.join(projectIds.map((id) => sql`${id}`), sql`, `)})`
      )
      .groupBy(homeTasks.projectId)

    taskCounts = countRows.map((r) => ({
      projectId: r.projectId!,
      open: r.open,
      total: r.total,
    }))
  }

  const countMap = new Map(taskCounts.map((c) => [c.projectId, c]))

  const projects = projectRows.map((p) => ({
    ...p,
    openTaskCount: countMap.get(p.id)?.open ?? 0,
    totalTaskCount: countMap.get(p.id)?.total ?? 0,
  }))

  return Response.json(projects)
}

/**
 * POST /api/homebase/projects
 * Create a new project.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { partyId, name, description, color, icon, code, ownerId } = body as {
    partyId: string
    name: string
    description?: string
    color?: string
    icon?: string
    code?: string
    ownerId?: string
  }

  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Auto-generate project code from name if not provided
  const projectCode = code || name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PRJ'

  const [project] = await db
    .insert(homeProjects)
    .values({
      partyId,
      createdBy: auth.userId,
      ownerId: ownerId || auth.userId,
      name,
      description,
      color: color || '#6B7280',
      icon: icon || 'folder',
      code: projectCode,
    })
    .returning()

  return Response.json(project, { status: 201 })
}
