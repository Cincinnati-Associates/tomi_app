import { z } from 'zod'
import { tool } from 'ai'
import {
  db, homeTasks, homeTaskComments, homeProjects, partyMembers,
  homeLabels, homeTaskLabels, homeTaskActivity,
} from '@/db'
import { eq, and, ne, sql, isNull } from 'drizzle-orm'
import { searchDocumentChunks } from './vector-search'
import { generateQueryEmbedding } from './embedding'
import { getNextTaskNumber } from './auth'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve 'self' | 'coowner' to an actual user ID. */
async function resolveAssignee(
  assignedTo: string | undefined,
  partyId: string,
  userId: string
): Promise<string | null> {
  if (!assignedTo || assignedTo === 'unassigned') return null
  if (assignedTo === 'self') return userId
  if (assignedTo === 'coowner') {
    const members = await db.query.partyMembers.findMany({
      where: and(
        eq(partyMembers.partyId, partyId),
        eq(partyMembers.inviteStatus, 'accepted'),
        ne(partyMembers.userId, userId)
      ),
    })
    return members[0]?.userId ?? null
  }
  return null
}

/** Case-insensitive project name → ID lookup. */
async function resolveProjectId(
  projectId: string | undefined,
  projectName: string | undefined,
  partyId: string
): Promise<string | null> {
  if (projectId) return projectId
  if (projectName) {
    const project = await db.query.homeProjects.findFirst({
      where: and(
        eq(homeProjects.partyId, partyId),
        sql`lower(${homeProjects.name}) = lower(${projectName})`
      ),
    })
    return project?.id ?? null
  }
  return null
}

/** Resolve a task by UUID, task number (e.g. "T-3" or "3"), or title. */
async function resolveTaskId(
  taskId: string | undefined,
  taskTitle: string | undefined,
  partyId: string,
  taskNumber?: number | string
): Promise<string | null> {
  if (taskId) return taskId

  // Resolve by task number (accepts "3", "T-3", "ADU-3", etc.)
  if (taskNumber !== undefined) {
    const num = typeof taskNumber === 'string'
      ? parseInt(taskNumber.replace(/^[A-Z]+-/i, ''), 10)
      : taskNumber
    if (!isNaN(num)) {
      const task = await db.query.homeTasks.findFirst({
        where: and(
          eq(homeTasks.partyId, partyId),
          eq(homeTasks.taskNumber, num)
        ),
      })
      if (task) return task.id
    }
  }

  if (taskTitle) {
    const task = await db.query.homeTasks.findFirst({
      where: and(
        eq(homeTasks.partyId, partyId),
        sql`lower(${homeTasks.title}) = lower(${taskTitle})`
      ),
    })
    return task?.id ?? null
  }
  return null
}

/** Record one or more activity entries for a task. */
async function recordActivity(
  entries: Array<{
    taskId: string
    actorId: string
    actorType: 'user' | 'ai'
    action: string
    fieldName?: string
    oldValue?: string | null
    newValue?: string | null
  }>
) {
  if (entries.length === 0) return
  await db.insert(homeTaskActivity).values(
    entries.map((e) => ({
      taskId: e.taskId,
      actorId: e.actorId,
      actorType: e.actorType,
      action: e.action,
      fieldName: e.fieldName ?? null,
      oldValue: e.oldValue ?? null,
      newValue: e.newValue ?? null,
    }))
  )
}

/** Resolve label names to IDs, auto-creating any that don't exist. */
async function resolveLabels(
  names: string[],
  partyId: string
): Promise<string[]> {
  const ids: string[] = []
  for (const name of names) {
    let label = await db.query.homeLabels.findFirst({
      where: and(
        eq(homeLabels.partyId, partyId),
        sql`lower(${homeLabels.name}) = lower(${name})`
      ),
    })
    if (!label) {
      const [created] = await db
        .insert(homeLabels)
        .values({ partyId, name, color: '#6B7280' })
        .returning()
      label = created
    }
    ids.push(label.id)
  }
  return ids
}

// ---------------------------------------------------------------------------
// Tool factory
// ---------------------------------------------------------------------------

/**
 * Create the HomeBase tool set for the AI agent.
 * Tools are scoped to a specific party and user.
 */
export function createHomebaseTools(partyId: string, userId: string) {
  return {
    // -----------------------------------------------------------------------
    // TASKS
    // -----------------------------------------------------------------------

    createTask: tool({
      description:
        'Create a new task for the home. Use this when someone mentions something that needs to be done.',
      parameters: z.object({
        title: z.string().describe('Short, clear title for the task'),
        description: z.string().optional().describe('More details about what needs to be done'),
        assignedTo: z.enum(['self', 'coowner']).optional().describe('Who should handle this task'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('How urgent is this'),
        dueDate: z.string().optional().describe('When it should be done (ISO date like 2025-03-15)'),
        startDate: z.string().optional().describe('When work should begin (ISO date)'),
        projectId: z.string().optional().describe('The project ID to assign this task to'),
        projectName: z.string().optional().describe('The project name to assign this task to (will be looked up)'),
        parentTaskId: z.string().optional().describe('Parent task ID to create this as a subtask'),
        parentTaskTitle: z.string().optional().describe('Parent task title to create this as a subtask (will be looked up)'),
        labels: z.array(z.string()).optional().describe('Label names to tag the task with (auto-created if new)'),
      }),
      execute: async ({
        title, description, assignedTo, priority, dueDate, startDate,
        projectId, projectName, parentTaskId, parentTaskTitle, labels,
      }) => {
        const assignedUserId = await resolveAssignee(assignedTo, partyId, userId)
        const resolvedProjectId = await resolveProjectId(projectId, projectName, partyId)
        const resolvedParentId = await resolveTaskId(parentTaskId, parentTaskTitle, partyId)
        const taskNumber = await getNextTaskNumber(partyId)

        const [task] = await db
          .insert(homeTasks)
          .values({
            partyId,
            taskNumber,
            createdBy: userId,
            assignedTo: assignedUserId,
            title,
            description,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            startDate: startDate || null,
            projectId: resolvedProjectId,
            parentTaskId: resolvedParentId,
          })
          .returning()

        // Attach labels
        if (labels && labels.length > 0) {
          const labelIds = await resolveLabels(labels, partyId)
          await db.insert(homeTaskLabels).values(
            labelIds.map((labelId) => ({ taskId: task.id, labelId }))
          )
        }

        // Record activity
        await recordActivity([{
          taskId: task.id,
          actorId: userId,
          actorType: 'ai',
          action: 'created',
        }])

        return {
          success: true,
          task: {
            id: task.id,
            taskNumber: task.taskNumber,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignedTo: assignedTo || 'unassigned',
            dueDate: task.dueDate,
            startDate: task.startDate,
            projectId: resolvedProjectId,
            parentTaskId: resolvedParentId,
            labels: labels || [],
          },
        }
      },
    }),

    createSubtask: tool({
      description:
        'Create a subtask under an existing task. Use this to break a task into smaller steps.',
      parameters: z.object({
        parentTaskId: z.string().optional().describe('Parent task ID'),
        parentTaskTitle: z.string().optional().describe('Parent task title (will be looked up)'),
        title: z.string().describe('Short title for the subtask'),
        description: z.string().optional().describe('Details about the subtask'),
        assignedTo: z.enum(['self', 'coowner']).optional().describe('Who should handle this'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('Priority level'),
        dueDate: z.string().optional().describe('Due date (ISO date)'),
        labels: z.array(z.string()).optional().describe('Label names'),
      }),
      execute: async ({
        parentTaskId, parentTaskTitle, title, description,
        assignedTo, priority, dueDate, labels,
      }) => {
        const resolvedParentId = await resolveTaskId(parentTaskId, parentTaskTitle, partyId)
        if (!resolvedParentId) {
          return { success: false, error: 'Parent task not found' }
        }

        // Look up parent to inherit projectId
        const parent = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, resolvedParentId),
        })
        if (!parent || parent.partyId !== partyId) {
          return { success: false, error: 'Parent task not found in this property' }
        }

        const assignedUserId = await resolveAssignee(assignedTo, partyId, userId)
        const taskNumber = await getNextTaskNumber(partyId)

        const [subtask] = await db
          .insert(homeTasks)
          .values({
            partyId,
            taskNumber,
            createdBy: userId,
            assignedTo: assignedUserId,
            title,
            description,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            projectId: parent.projectId,
            parentTaskId: resolvedParentId,
          })
          .returning()

        if (labels && labels.length > 0) {
          const labelIds = await resolveLabels(labels, partyId)
          await db.insert(homeTaskLabels).values(
            labelIds.map((labelId) => ({ taskId: subtask.id, labelId }))
          )
        }

        await recordActivity([{
          taskId: subtask.id,
          actorId: userId,
          actorType: 'ai',
          action: 'created',
        }])

        return {
          success: true,
          subtask: {
            id: subtask.id,
            taskNumber: subtask.taskNumber,
            title: subtask.title,
            parentTaskId: resolvedParentId,
            parentTaskTitle: parent.title,
            status: subtask.status,
            priority: subtask.priority,
            assignedTo: assignedTo || 'unassigned',
          },
        }
      },
    }),

    editTask: tool({
      description:
        'Edit an existing task. Change title, description, priority, dates, assignee, project, status, or labels. Reference tasks by their task number (e.g. T-3).',
      parameters: z.object({
        taskId: z.string().optional().describe('The UUID of the task to edit'),
        taskNumber: z.string().optional().describe('The task number (e.g. "3" or "T-3" or "ADU-3")'),
        taskTitle: z.string().optional().describe('The title of the task to edit (will be looked up)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority'),
        status: z.enum(['todo', 'in_progress', 'done']).optional().describe('New status'),
        dueDate: z.string().optional().describe('New due date (ISO date, or empty to clear)'),
        startDate: z.string().optional().describe('New start date (ISO date, or empty to clear)'),
        assignedTo: z.enum(['self', 'coowner', 'unassigned']).optional().describe('Reassign task'),
        projectId: z.string().optional().describe('Move to project (or empty to unassign)'),
        projectName: z.string().optional().describe('Move to project by name'),
        addLabels: z.array(z.string()).optional().describe('Label names to add'),
        removeLabels: z.array(z.string()).optional().describe('Label names to remove'),
      }),
      execute: async ({
        taskId, taskNumber, taskTitle, title, description, priority, status,
        dueDate, startDate, assignedTo,
        projectId, projectName, addLabels, removeLabels,
      }) => {
        const resolvedTaskId = await resolveTaskId(taskId, taskTitle, partyId, taskNumber)
        if (!resolvedTaskId) {
          return { success: false, error: 'Task not found' }
        }

        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, resolvedTaskId),
        })
        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Task not found' }
        }

        const updates: Record<string, unknown> = { updatedAt: new Date() }
        const changes: string[] = []
        const activityEntries: Array<{
          taskId: string; actorId: string; actorType: 'ai';
          action: string; fieldName: string; oldValue: string | null; newValue: string | null;
        }> = []

        const track = (action: string, field: string, oldVal: string | null, newVal: string | null) => {
          activityEntries.push({
            taskId: resolvedTaskId!, actorId: userId, actorType: 'ai',
            action, fieldName: field, oldValue: oldVal, newValue: newVal,
          })
        }

        if (title !== undefined && title !== existing.title) {
          updates.title = title
          changes.push(`title → "${title}"`)
          track('field_changed', 'title', existing.title, title)
        }
        if (description !== undefined && description !== existing.description) {
          updates.description = description || null
          changes.push('description updated')
          track('field_changed', 'description', existing.description, description || null)
        }
        if (priority !== undefined && priority !== existing.priority) {
          updates.priority = priority
          changes.push(`priority → ${priority}`)
          track('priority_changed', 'priority', existing.priority, priority)
        }
        if (dueDate !== undefined && dueDate !== existing.dueDate) {
          updates.dueDate = dueDate || null
          changes.push(dueDate ? `due date → ${dueDate}` : 'due date cleared')
          track('field_changed', 'due_date', existing.dueDate, dueDate || null)
        }
        if (startDate !== undefined && startDate !== existing.startDate) {
          updates.startDate = startDate || null
          changes.push(startDate ? `start date → ${startDate}` : 'start date cleared')
          track('field_changed', 'start_date', existing.startDate, startDate || null)
        }
        // Resolve assignee
        if (assignedTo !== undefined) {
          const newAssignee = await resolveAssignee(assignedTo, partyId, userId)
          if (newAssignee !== existing.assignedTo) {
            updates.assignedTo = newAssignee
            const label = assignedTo === 'self' ? 'you' : assignedTo === 'coowner' ? 'co-owner' : 'unassigned'
            changes.push(`assigned to ${label}`)
            track('assigned', 'assigned_to', existing.assignedTo, newAssignee)
          }
        }

        // Resolve project
        if (projectId !== undefined || projectName !== undefined) {
          const resolvedPId = await resolveProjectId(
            projectId === '' ? undefined : projectId,
            projectName,
            partyId
          )
          const newPId = projectId === '' ? null : resolvedPId
          if (newPId !== existing.projectId) {
            updates.projectId = newPId
            changes.push(newPId ? 'moved to project' : 'removed from project')
            track('moved_to_project', 'project_id', existing.projectId, newPId)
          }
        }

        // Status change
        if (status !== undefined && status !== existing.status) {
          updates.status = status
          if (status === 'done') {
            updates.completedAt = new Date()
            updates.completedBy = userId
          } else if (existing.status === 'done') {
            updates.completedAt = null
            updates.completedBy = null
          }
          changes.push(`status → ${status}`)
          track('status_changed', 'status', existing.status, status)
        }

        const [updated] = await db
          .update(homeTasks)
          .set(updates)
          .where(eq(homeTasks.id, resolvedTaskId))
          .returning()

        // Label changes
        if (addLabels && addLabels.length > 0) {
          const labelIds = await resolveLabels(addLabels, partyId)
          for (const labelId of labelIds) {
            // Skip if already attached
            const exists = await db.query.homeTaskLabels.findFirst({
              where: and(
                eq(homeTaskLabels.taskId, resolvedTaskId),
                eq(homeTaskLabels.labelId, labelId)
              ),
            })
            if (!exists) {
              await db.insert(homeTaskLabels).values({ taskId: resolvedTaskId, labelId })
            }
          }
          changes.push(`added labels: ${addLabels.join(', ')}`)
        }
        if (removeLabels && removeLabels.length > 0) {
          for (const name of removeLabels) {
            const label = await db.query.homeLabels.findFirst({
              where: and(
                eq(homeLabels.partyId, partyId),
                sql`lower(${homeLabels.name}) = lower(${name})`
              ),
            })
            if (label) {
              await db.delete(homeTaskLabels).where(
                and(
                  eq(homeTaskLabels.taskId, resolvedTaskId),
                  eq(homeTaskLabels.labelId, label.id)
                )
              )
            }
          }
          changes.push(`removed labels: ${removeLabels.join(', ')}`)
        }

        // Record activity
        if (activityEntries.length > 0) {
          await recordActivity(activityEntries)
        }

        return {
          success: true,
          task: {
            id: updated.id,
            taskNumber: updated.taskNumber,
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            dueDate: updated.dueDate,
            startDate: updated.startDate,
          },
          changes,
        }
      },
    }),

    updateTaskStatus: tool({
      description:
        'Update the status of an existing task. Use this to mark tasks complete or change their status. Reference tasks by their task number (e.g. T-3).',
      parameters: z.object({
        taskId: z.string().optional().describe('The UUID of the task to update'),
        taskNumber: z.string().optional().describe('The task number (e.g. "3" or "T-3" or "ADU-3")'),
        taskTitle: z.string().optional().describe('The title of the task (will be looked up)'),
        status: z.enum(['todo', 'in_progress', 'done']).describe('The new status'),
      }),
      execute: async ({ taskId, taskNumber, taskTitle, status }) => {
        const resolvedTaskId = await resolveTaskId(taskId, taskTitle, partyId, taskNumber)
        if (!resolvedTaskId) {
          return { success: false, error: 'Task not found' }
        }

        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, resolvedTaskId),
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
        } else if (existing.status === 'done') {
          updates.completedAt = null
          updates.completedBy = null
        }

        const [updated] = await db
          .update(homeTasks)
          .set(updates)
          .where(eq(homeTasks.id, resolvedTaskId))
          .returning()

        await recordActivity([{
          taskId: resolvedTaskId,
          actorId: userId,
          actorType: 'ai',
          action: 'status_changed',
          fieldName: 'status',
          oldValue: existing.status,
          newValue: status,
        }])

        return {
          success: true,
          task: {
            id: updated.id,
            taskNumber: updated.taskNumber,
            title: updated.title,
            status: updated.status,
          },
        }
      },
    }),

    listTasks: tool({
      description:
        'List tasks for the home. Use this when someone asks about their tasks or what needs to be done.',
      parameters: z.object({
        status: z.enum(['todo', 'in_progress', 'done', 'all']).optional()
          .describe('Filter by status. Default shows all non-done tasks.'),
        assignedTo: z.enum(['self', 'coowner', 'all']).optional()
          .describe('Filter by who the task is assigned to'),
        projectId: z.string().optional()
          .describe('Filter by project ID'),
        projectName: z.string().optional()
          .describe('Filter by project name (will be looked up)'),
        label: z.string().optional()
          .describe('Filter by label name'),
        parentTaskId: z.string().optional()
          .describe('Get subtasks of a specific task'),
      }),
      execute: async ({ status, assignedTo, projectId, projectName, label, parentTaskId }) => {
        const conditions = [eq(homeTasks.partyId, partyId)]

        if (status && status !== 'all') {
          conditions.push(eq(homeTasks.status, status))
        } else if (!status) {
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
        const resolvedProjectId = await resolveProjectId(projectId, projectName, partyId)
        if (resolvedProjectId) {
          conditions.push(eq(homeTasks.projectId, resolvedProjectId))
        }

        // Label filter
        if (label) {
          conditions.push(
            sql`EXISTS (
              SELECT 1 FROM home_task_labels tl
              JOIN home_labels l ON l.id = tl.label_id
              WHERE tl.task_id = ${homeTasks.id}
              AND lower(l.name) = lower(${label})
            )`
          )
        }

        // Subtask filter
        if (parentTaskId) {
          conditions.push(eq(homeTasks.parentTaskId, parentTaskId))
        } else {
          conditions.push(isNull(homeTasks.parentTaskId))
        }

        const tasks = await db.query.homeTasks.findMany({
          where: and(...conditions),
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        })

        return {
          count: tasks.length,
          tasks: tasks.map((t) => ({
            id: t.id,
            taskNumber: t.taskNumber,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            startDate: t.startDate,
            projectId: t.projectId,
            parentTaskId: t.parentTaskId,
          })),
        }
      },
    }),

    addTaskComment: tool({
      description:
        'Add a note or comment to an existing task. Use this to record updates, notes, or context about a task. Reference tasks by their task number (e.g. T-3).',
      parameters: z.object({
        taskId: z.string().optional().describe('The UUID of the task'),
        taskNumber: z.string().optional().describe('The task number (e.g. "3" or "T-3" or "ADU-3")'),
        taskTitle: z.string().optional().describe('The title of the task (will be looked up)'),
        content: z.string().describe('The comment or note to add'),
      }),
      execute: async ({ taskId, taskNumber, taskTitle, content }) => {
        const resolvedTaskId = await resolveTaskId(taskId, taskTitle, partyId, taskNumber)
        if (!resolvedTaskId) {
          return { success: false, error: 'Task not found' }
        }

        const existing = await db.query.homeTasks.findFirst({
          where: eq(homeTasks.id, resolvedTaskId),
        })
        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Task not found' }
        }

        const [comment] = await db
          .insert(homeTaskComments)
          .values({
            taskId: resolvedTaskId,
            authorId: userId,
            content,
          })
          .returning()

        await recordActivity([{
          taskId: resolvedTaskId,
          actorId: userId,
          actorType: 'ai',
          action: 'commented',
        }])

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

    // -----------------------------------------------------------------------
    // PROJECTS
    // -----------------------------------------------------------------------

    createProject: tool({
      description:
        'Create a new project to group related tasks. Use this when someone wants to organize tasks under a category like "ADU Build" or "Insurance Claim".',
      parameters: z.object({
        name: z.string().describe('Name for the project'),
        description: z.string().optional().describe('Brief description of the project'),
        color: z.string().optional().describe('Hex color for the project (e.g. #3B82F6)'),
        code: z.string().optional().describe('Short project code (3-5 chars, e.g. "ADU", "INS"). Auto-generated from name if not provided.'),
        owner: z.enum(['self', 'coowner']).optional().describe('Who owns/drives this project'),
      }),
      execute: async ({ name, description, color, code, owner }) => {
        const ownerId = await resolveAssignee(owner || 'self', partyId, userId)
        // Auto-generate code from name if not provided (first 3 uppercase letters)
        const projectCode = code || name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PRJ'

        const [project] = await db
          .insert(homeProjects)
          .values({
            partyId,
            createdBy: userId,
            ownerId: ownerId || userId,
            name,
            description: description || null,
            color: color || '#3B82F6',
            code: projectCode,
          })
          .returning()

        return {
          success: true,
          project: {
            id: project.id,
            name: project.name,
            code: project.code,
            color: project.color,
            owner: owner || 'self',
          },
        }
      },
    }),

    editProject: tool({
      description:
        'Edit an existing project. Change name, description, color, status, or owner.',
      parameters: z.object({
        projectId: z.string().optional().describe('The ID of the project'),
        projectName: z.string().optional().describe('The name of the project (will be looked up)'),
        name: z.string().optional().describe('New name'),
        description: z.string().optional().describe('New description'),
        color: z.string().optional().describe('New hex color'),
        status: z.enum(['active', 'archived']).optional().describe('Project status'),
        owner: z.enum(['self', 'coowner']).optional().describe('Reassign project ownership'),
      }),
      execute: async ({ projectId, projectName, name, description, color, status, owner }) => {
        const resolvedPId = await resolveProjectId(projectId, projectName, partyId)
        if (!resolvedPId) {
          return { success: false, error: 'Project not found' }
        }

        const existing = await db.query.homeProjects.findFirst({
          where: eq(homeProjects.id, resolvedPId),
        })
        if (!existing || existing.partyId !== partyId) {
          return { success: false, error: 'Project not found' }
        }

        const updates: Record<string, unknown> = { updatedAt: new Date() }
        const changes: string[] = []

        if (name !== undefined && name !== existing.name) {
          updates.name = name
          changes.push(`name → "${name}"`)
        }
        if (description !== undefined && description !== existing.description) {
          updates.description = description || null
          changes.push('description updated')
        }
        if (color !== undefined && color !== existing.color) {
          updates.color = color
          changes.push(`color → ${color}`)
        }
        if (status !== undefined && status !== existing.status) {
          updates.status = status
          changes.push(`status → ${status}`)
        }
        if (owner !== undefined) {
          const newOwnerId = await resolveAssignee(owner, partyId, userId)
          if (newOwnerId !== existing.ownerId) {
            updates.ownerId = newOwnerId
            changes.push(`owner → ${owner === 'self' ? 'you' : 'co-owner'}`)
          }
        }

        const [updated] = await db
          .update(homeProjects)
          .set(updates)
          .where(eq(homeProjects.id, resolvedPId))
          .returning()

        return {
          success: true,
          project: {
            id: updated.id,
            name: updated.name,
            color: updated.color,
            status: updated.status,
          },
          changes,
        }
      },
    }),

    listProjects: tool({
      description:
        'List all projects for the home. Use this when someone asks about their projects or wants to see how things are organized.',
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

    // -----------------------------------------------------------------------
    // LABELS
    // -----------------------------------------------------------------------

    addLabel: tool({
      description:
        'Create a new label/tag for organizing tasks. Use this when someone wants to tag tasks with categories like "plumbing", "electrical", "permits".',
      parameters: z.object({
        name: z.string().describe('Label name'),
        color: z.string().optional().describe('Hex color (e.g. #EF4444). Defaults to gray.'),
      }),
      execute: async ({ name, color }) => {
        // Check for existing (case-insensitive)
        const existing = await db.query.homeLabels.findFirst({
          where: and(
            eq(homeLabels.partyId, partyId),
            sql`lower(${homeLabels.name}) = lower(${name})`
          ),
        })
        if (existing) {
          return {
            success: true,
            label: { id: existing.id, name: existing.name, color: existing.color },
            alreadyExisted: true,
          }
        }

        const [label] = await db
          .insert(homeLabels)
          .values({ partyId, name, color: color || '#6B7280' })
          .returning()

        return {
          success: true,
          label: { id: label.id, name: label.name, color: label.color },
          alreadyExisted: false,
        }
      },
    }),

    listLabels: tool({
      description: 'List all labels/tags available for this property.',
      parameters: z.object({}),
      execute: async () => {
        const labels = await db.query.homeLabels.findMany({
          where: eq(homeLabels.partyId, partyId),
          orderBy: (labels, { asc }) => [asc(labels.name)],
        })

        return {
          count: labels.length,
          labels: labels.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color,
          })),
        }
      },
    }),

    // -----------------------------------------------------------------------
    // DOCUMENTS
    // -----------------------------------------------------------------------

    searchDocuments: tool({
      description:
        'Search through uploaded home documents to find relevant information. Use this when someone asks a question that might be answered by their documents.',
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
  }
}
