import { z } from 'zod'
import { tool } from 'ai'
import { db, homeTasks, homeTaskComments, homeProjects, partyMembers } from '@/db'
import { eq, and, ne, sql } from 'drizzle-orm'
import { searchDocumentChunks } from './vector-search'
import { generateQueryEmbedding } from './embedding'

/**
 * Create the HomeBase tool set for the AI agent.
 * Tools are scoped to a specific party and user.
 */
export function createHomebaseTools(partyId: string, userId: string) {
  return {
    createTask: tool({
      description: 'Create a new task for the home. Use this when someone mentions something that needs to be done.',
      parameters: z.object({
        title: z.string().describe('Short, clear title for the task'),
        description: z.string().optional().describe('More details about what needs to be done'),
        assignedTo: z.enum(['self', 'coowner']).optional().describe('Who should handle this task'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('How urgent is this'),
        dueDate: z.string().optional().describe('When it should be done (ISO date like 2025-03-15)'),
        projectId: z.string().optional().describe('The project ID to assign this task to'),
        projectName: z.string().optional().describe('The project name to assign this task to (will be looked up)'),
      }),
      execute: async ({ title, description, assignedTo, priority, dueDate, projectId, projectName }) => {
        // Resolve assignedTo to actual user ID
        let assignedUserId: string | null = null
        if (assignedTo === 'self') {
          assignedUserId = userId
        } else if (assignedTo === 'coowner') {
          const members = await db.query.partyMembers.findMany({
            where: and(
              eq(partyMembers.partyId, partyId),
              eq(partyMembers.inviteStatus, 'accepted'),
              ne(partyMembers.userId, userId)
            ),
          })
          if (members.length > 0) {
            assignedUserId = members[0].userId
          }
        }

        // Resolve projectName to projectId if needed
        let resolvedProjectId = projectId || null
        if (!resolvedProjectId && projectName) {
          const project = await db.query.homeProjects.findFirst({
            where: and(
              eq(homeProjects.partyId, partyId),
              sql`lower(${homeProjects.name}) = lower(${projectName})`
            ),
          })
          if (project) {
            resolvedProjectId = project.id
          }
        }

        const [task] = await db
          .insert(homeTasks)
          .values({
            partyId,
            createdBy: userId,
            assignedTo: assignedUserId,
            title,
            description,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            projectId: resolvedProjectId,
          })
          .returning()

        return {
          success: true,
          task: {
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignedTo: assignedTo || 'unassigned',
            dueDate: task.dueDate,
            projectId: resolvedProjectId,
          },
        }
      },
    }),

    editTask: tool({
      description: 'Edit an existing task. Use this to change title, description, priority, due date, owner, or project assignment.',
      parameters: z.object({
        taskId: z.string().describe('The ID of the task to edit'),
        title: z.string().optional().describe('New title for the task'),
        description: z.string().optional().describe('New description for the task'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
        dueDate: z.string().optional().describe('New due date (ISO date like 2025-03-15, or empty string to clear)'),
        assignedTo: z.enum(['self', 'coowner', 'unassigned']).optional().describe('Who should handle this task'),
        projectId: z.string().optional().describe('Project ID to move task to (or empty string to unassign)'),
        projectName: z.string().optional().describe('Project name to move task to (will be looked up)'),
      }),
      execute: async ({ taskId, title, description, priority, dueDate, assignedTo, projectId, projectName }) => {
        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, taskId),
        })

        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Task not found' }
        }

        const updates: Record<string, unknown> = { updatedAt: new Date() }
        const changes: string[] = []

        if (title !== undefined) {
          updates.title = title
          changes.push(`title → "${title}"`)
        }
        if (description !== undefined) {
          updates.description = description || null
          changes.push('description updated')
        }
        if (priority !== undefined) {
          updates.priority = priority
          changes.push(`priority → ${priority}`)
        }
        if (dueDate !== undefined) {
          updates.dueDate = dueDate || null
          changes.push(dueDate ? `due date → ${dueDate}` : 'due date cleared')
        }

        // Resolve assignedTo
        if (assignedTo !== undefined) {
          if (assignedTo === 'self') {
            updates.assignedTo = userId
            changes.push('assigned to you')
          } else if (assignedTo === 'coowner') {
            const members = await db.query.partyMembers.findMany({
              where: and(
                eq(partyMembers.partyId, partyId),
                eq(partyMembers.inviteStatus, 'accepted'),
                ne(partyMembers.userId, userId)
              ),
            })
            if (members.length > 0) {
              updates.assignedTo = members[0].userId
              changes.push('assigned to co-owner')
            }
          } else {
            updates.assignedTo = null
            changes.push('unassigned')
          }
        }

        // Resolve project
        if (projectId !== undefined) {
          updates.projectId = projectId || null
          changes.push(projectId ? 'moved to project' : 'removed from project')
        } else if (projectName !== undefined) {
          const project = await db.query.homeProjects.findFirst({
            where: and(
              eq(homeProjects.partyId, partyId),
              sql`lower(${homeProjects.name}) = lower(${projectName})`
            ),
          })
          if (project) {
            updates.projectId = project.id
            changes.push(`moved to "${project.name}"`)
          }
        }

        const [updated] = await db
          .update(homeTasks)
          .set(updates)
          .where(eq(homeTasks.id, taskId))
          .returning()

        return {
          success: true,
          task: {
            id: updated.id,
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            dueDate: updated.dueDate,
          },
          changes,
        }
      },
    }),

    updateTaskStatus: tool({
      description: 'Update the status of an existing task. Use this to mark tasks complete or change their status.',
      parameters: z.object({
        taskId: z.string().describe('The ID of the task to update'),
        status: z.enum(['todo', 'in_progress', 'done']).describe('The new status'),
      }),
      execute: async ({ taskId, status }) => {
        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, taskId),
        })

        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Task not found' }
        }

        const updates: Record<string, unknown> = {
          status,
          updatedAt: new Date(),
        }
        if (status === 'done') {
          updates.completedAt = new Date()
          updates.completedBy = userId
        }

        const [updated] = await db
          .update(homeTasks)
          .set(updates)
          .where(eq(homeTasks.id, taskId))
          .returning()

        return {
          success: true,
          task: {
            id: updated.id,
            title: updated.title,
            status: updated.status,
          },
        }
      },
    }),

    listTasks: tool({
      description: 'List tasks for the home. Use this when someone asks about their tasks or what needs to be done.',
      parameters: z.object({
        status: z.enum(['todo', 'in_progress', 'done', 'all']).optional()
          .describe('Filter by status. Default shows all non-done tasks.'),
        assignedTo: z.enum(['self', 'coowner', 'all']).optional()
          .describe('Filter by who the task is assigned to'),
        projectId: z.string().optional()
          .describe('Filter by project ID'),
        projectName: z.string().optional()
          .describe('Filter by project name (will be looked up)'),
      }),
      execute: async ({ status, assignedTo, projectId, projectName }) => {
        const conditions = [eq(homeTasks.partyId, partyId)]

        if (status && status !== 'all') {
          conditions.push(eq(homeTasks.status, status))
        } else if (!status) {
          // Default: show non-done tasks
          conditions.push(ne(homeTasks.status, 'done'))
        }

        if (assignedTo === 'self') {
          conditions.push(eq(homeTasks.assignedTo, userId))
        } else if (assignedTo === 'coowner') {
          const members = await db.query.partyMembers.findMany({
            where: and(
              eq(partyMembers.partyId, partyId),
              eq(partyMembers.inviteStatus, 'accepted'),
              ne(partyMembers.userId, userId)
            ),
          })
          if (members.length > 0) {
            conditions.push(eq(homeTasks.assignedTo, members[0].userId))
          }
        }

        // Resolve project filter
        let resolvedProjectId = projectId
        if (!resolvedProjectId && projectName) {
          const project = await db.query.homeProjects.findFirst({
            where: and(
              eq(homeProjects.partyId, partyId),
              sql`lower(${homeProjects.name}) = lower(${projectName})`
            ),
          })
          if (project) {
            resolvedProjectId = project.id
          }
        }
        if (resolvedProjectId) {
          conditions.push(eq(homeTasks.projectId, resolvedProjectId))
        }

        const tasks = await db.query.homeTasks.findMany({
          where: and(...conditions),
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        })

        return {
          count: tasks.length,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            projectId: t.projectId,
          })),
        }
      },
    }),

    createProject: tool({
      description: 'Create a new project to group related tasks. Use this when someone wants to organize tasks under a category like "ADU Build" or "Insurance Claim".',
      parameters: z.object({
        name: z.string().describe('Name for the project'),
        description: z.string().optional().describe('Brief description of the project'),
        color: z.string().optional().describe('Hex color for the project (e.g. #3B82F6)'),
      }),
      execute: async ({ name, description, color }) => {
        const [project] = await db
          .insert(homeProjects)
          .values({
            partyId,
            createdBy: userId,
            name,
            description: description || null,
            color: color || '#3B82F6',
          })
          .returning()

        return {
          success: true,
          project: {
            id: project.id,
            name: project.name,
            color: project.color,
          },
        }
      },
    }),

    listProjects: tool({
      description: 'List all projects for the home. Use this when someone asks about their projects or wants to see how things are organized.',
      parameters: z.object({
        includeArchived: z.boolean().optional().describe('Whether to include archived projects'),
      }),
      execute: async ({ includeArchived }) => {
        const conditions = [eq(homeProjects.partyId, partyId)]
        if (!includeArchived) {
          conditions.push(ne(homeProjects.status, 'archived'))
        }

        const projects = await db.query.homeProjects.findMany({
          where: and(...conditions),
          orderBy: (projects, { asc }) => [asc(projects.sortOrder)],
        })

        // Get task counts per project
        const projectsWithCounts = await Promise.all(
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
              description: p.description,
              openTaskCount: taskCounts[0]?.open || 0,
              totalTaskCount: taskCounts[0]?.total || 0,
            }
          })
        )

        return {
          count: projectsWithCounts.length,
          projects: projectsWithCounts,
        }
      },
    }),

    searchDocuments: tool({
      description: 'Search through uploaded home documents to find relevant information. Use this when someone asks a question that might be answered by their documents.',
      parameters: z.object({
        query: z.string().describe('What to search for in the documents'),
      }),
      execute: async ({ query }) => {
        const queryEmbedding = await generateQueryEmbedding(query)
        const chunks = await searchDocumentChunks(partyId, queryEmbedding, 5)

        if (chunks.length === 0) {
          return {
            found: false,
            message: 'No relevant information found in the uploaded documents.',
          }
        }

        return {
          found: true,
          results: chunks.map((c) => ({
            documentTitle: c.documentTitle,
            documentCategory: c.documentCategory,
            content: c.content,
          })),
        }
      },
    }),

    addTaskComment: tool({
      description: 'Add a note or comment to an existing task. Use this to record updates, notes, or context about a task.',
      parameters: z.object({
        taskId: z.string().describe('The ID of the task'),
        content: z.string().describe('The comment or note to add'),
      }),
      execute: async ({ taskId, content }) => {
        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, taskId),
        })

        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Task not found' }
        }

        const [comment] = await db
          .insert(homeTaskComments)
          .values({
            taskId,
            authorId: userId,
            content,
          })
          .returning()

        return {
          success: true,
          comment: {
            id: comment.id,
            taskTitle: existing.title,
            content: comment.content,
          },
        }
      },
    }),
  }
}
