import { z } from 'zod'
import { tool } from 'ai'
import { db, homeTasks, homeTaskComments, partyMembers } from '@/db'
import { eq, and, ne } from 'drizzle-orm'
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
      }),
      execute: async ({ title, description, assignedTo, priority, dueDate }) => {
        // Resolve assignedTo to actual user ID
        let assignedUserId: string | null = null
        if (assignedTo === 'self') {
          assignedUserId = userId
        } else if (assignedTo === 'coowner') {
          // Find the other party member
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
          },
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
      }),
      execute: async ({ status, assignedTo }) => {
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
          })),
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
