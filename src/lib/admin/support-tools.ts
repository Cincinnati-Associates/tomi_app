/**
 * Support Homi — Read-only Tool Definitions
 *
 * Factory function that creates tools scoped to an admin's permission set.
 * All tools are read-only — they query data but never modify it.
 * Follows the HomeBase tools pattern (src/lib/homebase/tools.ts).
 */

import { z } from 'zod'
import { tool } from 'ai'
import {
  db,
  profiles,
  userJourneys,
  userExerciseResponses,
  exerciseTemplates,
  partyMembers,
  buyingParties,
  partyInvites,
  chatConversations,
  visitorUserLinks,
} from '@/db'
import { eq, or, ilike, and, desc } from 'drizzle-orm'
import { isPermitted, type PermissionSet } from './support-permissions'
import {
  assembleAuthenticatedKnowledge,
  formatKnowledgeForPrompt,
} from '@/lib/user-knowledge'

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSupportTools(
  _adminUserId: string,
  permissions: PermissionSet
) {
  return {
    lookupUser: tool({
      description:
        'Look up a user by name, email, or UUID. Returns profile, journey, exercises, party memberships, and pre-signup context.',
      parameters: z.object({
        query: z
          .string()
          .describe('Name, email address, or user UUID to search for'),
      }),
      execute: async ({ query }) => {
        // Try UUID match first
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            query
          )

        let matchedProfiles
        if (isUUID) {
          matchedProfiles = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, query))
            .limit(5)
        } else {
          matchedProfiles = await db
            .select()
            .from(profiles)
            .where(
              or(
                ilike(profiles.fullName, `%${query}%`),
                ilike(profiles.email, `%${query}%`)
              )
            )
            .limit(10)
        }

        if (matchedProfiles.length === 0) {
          return { found: false, message: `No user found matching "${query}"` }
        }

        if (matchedProfiles.length > 1) {
          return {
            found: true,
            multiple: true,
            count: matchedProfiles.length,
            users: matchedProfiles.map((p) => ({
              id: p.id,
              name: p.fullName,
              email: isPermitted(permissions, 'profile_basic')
                ? p.email
                : undefined,
              createdAt: p.createdAt,
            })),
            message: `Found ${matchedProfiles.length} users matching "${query}". Ask the admin to clarify which one.`,
          }
        }

        // Single match — build full profile
        const user = matchedProfiles[0]
        const result: Record<string, unknown> = { found: true, multiple: false }

        // Profile basic
        if (isPermitted(permissions, 'profile_basic')) {
          result.profile = {
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        }

        // Journey
        if (isPermitted(permissions, 'journey_progress')) {
          const journey = await db.query.userJourneys.findFirst({
            where: eq(userJourneys.userId, user.id),
          })
          if (journey) {
            result.journey = {
              stage: journey.stage,
              readinessScore: journey.readinessScore,
              targetTimeline: journey.targetTimeline,
              targetMarkets: journey.targetMarkets,
              coBuyerStatus: journey.coBuyerStatus,
              budgetRangeLow: journey.budgetRangeLow,
              budgetRangeHigh: journey.budgetRangeHigh,
            }
          } else {
            result.journey = null
          }
        }

        // Exercises
        if (isPermitted(permissions, 'exercise_responses')) {
          const [responses, templates] = await Promise.all([
            db.query.userExerciseResponses.findMany({
              where: eq(userExerciseResponses.userId, user.id),
              orderBy: desc(userExerciseResponses.version),
            }),
            db.query.exerciseTemplates.findMany(),
          ])

          // Build template lookup
          const templateMap = new Map(
            templates.map((t) => [t.id, { slug: t.slug, name: t.name }])
          )

          // Deduplicate by exercise (latest version)
          const seen = new Set<string>()
          const deduped = responses.filter((r) => {
            if (seen.has(r.exerciseId)) return false
            seen.add(r.exerciseId)
            return true
          })

          result.exercises = deduped.map((r) => {
            const tmpl = templateMap.get(r.exerciseId)
            return {
              slug: tmpl?.slug,
              name: tmpl?.name,
              status: r.status,
              version: r.version,
              scores: r.computedScores,
              completedAt: r.completedAt,
            }
          })
        }

        // Party memberships
        if (isPermitted(permissions, 'party_membership')) {
          const memberships = await db.query.partyMembers.findMany({
            where: eq(partyMembers.userId, user.id),
            with: { party: true },
          })

          result.parties = memberships.map((m) => ({
            partyId: m.partyId,
            partyName: m.party?.name,
            partyStatus: m.party?.status,
            role: m.role,
            targetCity: m.party?.targetCity,
            targetBudget: m.party?.targetBudget,
          }))
        }

        // Pre-signup context
        if (isPermitted(permissions, 'pre_signup')) {
          const links = await db.query.visitorUserLinks.findMany({
            where: eq(visitorUserLinks.userId, user.id),
          })
          if (links.length > 0) {
            result.preSignup = {
              visitorIds: links.map((l) => l.visitorId),
              mergedContext: links[0]?.mergedContext,
            }
          }
        }

        return result
      },
    }),

    lookupParty: tool({
      description:
        'Look up a co-buying party by name, UUID, or target city. Returns party details, members, and invites.',
      parameters: z.object({
        query: z
          .string()
          .describe('Party name, UUID, or target city to search for'),
      }),
      execute: async ({ query }) => {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            query
          )

        let matchedParties
        if (isUUID) {
          matchedParties = await db
            .select()
            .from(buyingParties)
            .where(eq(buyingParties.id, query))
            .limit(5)
        } else {
          matchedParties = await db
            .select()
            .from(buyingParties)
            .where(
              or(
                ilike(buyingParties.name, `%${query}%`),
                ilike(buyingParties.targetCity, `%${query}%`)
              )
            )
            .limit(10)
        }

        if (matchedParties.length === 0) {
          return {
            found: false,
            message: `No party found matching "${query}"`,
          }
        }

        if (matchedParties.length > 1) {
          return {
            found: true,
            multiple: true,
            count: matchedParties.length,
            parties: matchedParties.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
              targetCity: p.targetCity,
              createdAt: p.createdAt,
            })),
            message: `Found ${matchedParties.length} parties matching "${query}". Ask the admin to clarify which one.`,
          }
        }

        // Single match — build full party view
        const party = matchedParties[0]
        const result: Record<string, unknown> = { found: true, multiple: false }

        if (isPermitted(permissions, 'party_membership')) {
          result.party = {
            id: party.id,
            name: party.name,
            status: party.status,
            targetCity: party.targetCity,
            targetBudget: party.targetBudget,
            notes: party.notes,
            createdAt: party.createdAt,
          }

          // Members
          const members = await db.query.partyMembers.findMany({
            where: eq(partyMembers.partyId, party.id),
            with: { user: true },
          })

          result.members = members.map((m) => ({
            userId: m.userId,
            name: isPermitted(permissions, 'profile_basic')
              ? m.user?.fullName
              : undefined,
            email: isPermitted(permissions, 'profile_basic')
              ? m.user?.email
              : undefined,
            role: m.role,
            inviteStatus: m.inviteStatus,
            ownershipPercentage: isPermitted(permissions, 'financial')
              ? m.ownershipPercentage
              : undefined,
            downPaymentContribution: isPermitted(permissions, 'financial')
              ? m.downPaymentContribution
              : undefined,
            monthlyContribution: isPermitted(permissions, 'financial')
              ? m.monthlyContribution
              : undefined,
          }))

          // Invites
          const invites = await db.query.partyInvites.findMany({
            where: eq(partyInvites.partyId, party.id),
          })

          result.invites = invites.map((inv) => ({
            inviteType: inv.inviteType,
            inviteValue: inv.inviteValue,
            role: inv.role,
            expiresAt: inv.expiresAt,
            acceptedAt: inv.acceptedAt,
          }))
        }

        return result
      },
    }),

    getUserChatHistory: tool({
      description:
        "Get a user's chat conversation history. Optionally include message content.",
      parameters: z.object({
        userId: z.string().describe('User UUID'),
        includeMessages: z
          .boolean()
          .optional()
          .default(false)
          .describe('Whether to include full message content'),
        limit: z
          .number()
          .optional()
          .default(10)
          .describe('Maximum number of conversations to return'),
      }),
      execute: async ({ userId, includeMessages, limit }) => {
        if (!isPermitted(permissions, 'chat_history')) {
          return {
            denied: true,
            message: 'Chat history access is not permitted for this user.',
          }
        }

        const conversations = await db.query.chatConversations.findMany({
          where: eq(chatConversations.userId, userId),
          orderBy: desc(chatConversations.lastMessageAt),
          limit,
          ...(includeMessages ? { with: { messages: true } } : {}),
        })

        return {
          count: conversations.length,
          conversations: conversations.map((c) => ({
            id: c.id,
            title: c.title,
            messageCount: c.messageCount,
            topicsDiscussed: c.topicsDiscussed,
            sentiment: c.sentiment,
            summary: c.summary,
            startedAt: c.startedAt,
            lastMessageAt: c.lastMessageAt,
            ...(includeMessages && 'messages' in c
              ? {
                  messages: (
                    c as typeof c & {
                      messages: { role: string; content: string; createdAt: Date }[]
                    }
                  ).messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    createdAt: m.createdAt,
                  })),
                }
              : {}),
          })),
        }
      },
    }),

    getExerciseDetails: tool({
      description:
        "Get details about a user's exercise responses. Optionally filter by exercise slug.",
      parameters: z.object({
        userId: z.string().describe('User UUID'),
        exerciseSlug: z
          .string()
          .optional()
          .describe(
            'Filter by exercise slug (e.g. "gems_discovery", "roadmap_walkthrough")'
          ),
      }),
      execute: async ({ userId, exerciseSlug }) => {
        if (!isPermitted(permissions, 'exercise_responses')) {
          return {
            denied: true,
            message: 'Exercise response access is not permitted for this user.',
          }
        }

        let exerciseFilter = eq(userExerciseResponses.userId, userId)

        if (exerciseSlug) {
          // Look up the template by slug first
          const template = await db.query.exerciseTemplates.findFirst({
            where: eq(exerciseTemplates.slug, exerciseSlug),
          })
          if (!template) {
            return {
              found: false,
              message: `No exercise template found with slug "${exerciseSlug}"`,
            }
          }
          exerciseFilter = and(
            eq(userExerciseResponses.userId, userId),
            eq(userExerciseResponses.exerciseId, template.id)
          )!
        }

        const [responses, templates] = await Promise.all([
          db.query.userExerciseResponses.findMany({
            where: exerciseFilter,
            orderBy: desc(userExerciseResponses.version),
          }),
          db.query.exerciseTemplates.findMany(),
        ])

        const templateMap = new Map(
          templates.map((t) => [t.id, { slug: t.slug, name: t.name, category: t.category }])
        )

        return {
          count: responses.length,
          exercises: responses.map((r) => {
            const tmpl = templateMap.get(r.exerciseId)
            return {
              slug: tmpl?.slug,
              name: tmpl?.name,
              category: tmpl?.category,
              status: r.status,
              version: r.version,
              responses: r.responses,
              scores: r.computedScores,
              startedAt: r.startedAt,
              completedAt: r.completedAt,
            }
          }),
        }
      },
    }),

    getFullUserBriefing: tool({
      description:
        "Get a comprehensive briefing about a user by assembling all available knowledge. This is the most thorough view — use it when the admin asks for 'the full picture' or 'everything we know'.",
      parameters: z.object({
        userId: z.string().describe('User UUID'),
      }),
      execute: async ({ userId }) => {
        try {
          const knowledge = await assembleAuthenticatedKnowledge(userId)
          const formatted = formatKnowledgeForPrompt(knowledge)

          // Build a summary of what's available vs denied
          const available: string[] = []
          const denied: string[] = []

          if (isPermitted(permissions, 'profile_basic'))
            available.push('profile')
          else denied.push('profile')
          if (isPermitted(permissions, 'journey_progress'))
            available.push('journey')
          else denied.push('journey')
          if (isPermitted(permissions, 'financial'))
            available.push('financial')
          else denied.push('financial')
          if (isPermitted(permissions, 'assessment'))
            available.push('assessment')
          else denied.push('assessment')
          if (isPermitted(permissions, 'exercise_responses'))
            available.push('exercises')
          else denied.push('exercises')
          if (isPermitted(permissions, 'chat_history'))
            available.push('chat history')
          else denied.push('chat history')
          if (isPermitted(permissions, 'behavior'))
            available.push('behavior')
          else denied.push('behavior')
          if (isPermitted(permissions, 'pre_signup'))
            available.push('pre-signup')
          else denied.push('pre-signup')
          if (isPermitted(permissions, 'party_membership'))
            available.push('parties')
          else denied.push('parties')

          return {
            briefing: formatted,
            dataSources: knowledge.dataSources,
            availableCategories: available,
            deniedCategories: denied.length > 0 ? denied : undefined,
          }
        } catch (error) {
          return {
            error: true,
            message: `Failed to assemble briefing: ${error instanceof Error ? error.message : String(error)}`,
          }
        }
      },
    }),
  }
}
