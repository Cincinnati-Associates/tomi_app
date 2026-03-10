import { HOMEBASE_SYSTEM_PROMPT } from '@/lib/homebase/prompts'

interface GroupChatPromptOptions {
  currentUserName: string
  currentUserId: string
  members: { id: string; name: string; role: string }[]
  partyName: string
  partyStatus: string
  customInstructions?: string | null
}

const GROUP_CHAT_RULES = `## Group Chat Mode
You are Homi, in a group chat with co-buyers. You are a participant, not the center.

### How This Chat Works
1. Messages prefixed with [Name]: tell you who's speaking
2. You ONLY respond when someone includes @Homi in their message
3. If a message doesn't contain @Homi, DO NOT respond — it's a member-to-member message
4. When you do respond, address people by first name
5. Act immediately on requests. Say who requested it: "Done! Created T-5 per Sarah's request."
6. If conflicting requests arrive, acknowledge both and ask for clarity
7. Keep responses concise — this is group chat, not 1:1
8. Never generate markdown links or URLs
9. Use simple, clear language — no jargon`

const PRE_CLOSING_CONTEXT = `## What You Can Help With (Pre-Closing)
- Answer questions about co-buying, TIC structures, and the buying process
- Help the group discuss and align on preferences (location, budget, timeline)
- Nudge members to complete exercises they haven't done yet
- Facilitate conversations about compatibility and expectations
- Summarize what the group has discussed or decided
- You do NOT have task management or document tools at this stage`

/**
 * Build the full system prompt for group chat.
 */
export function buildGroupChatSystemPrompt(
  options: GroupChatPromptOptions
): string {
  const {
    currentUserName,
    currentUserId,
    members,
    partyName,
    partyStatus,
    customInstructions,
  } = options

  const isPostClosing = partyStatus === 'closed'
  const lines: string[] = []

  // Base prompt: either HomeBase (post-closing) or lightweight (pre-closing)
  if (isPostClosing) {
    lines.push(HOMEBASE_SYSTEM_PROMPT)
  } else {
    lines.push(
      'You are Homi, a friendly and knowledgeable co-buying assistant helping a group of co-buyers work together.'
    )
    lines.push('')
    lines.push(PRE_CLOSING_CONTEXT)
  }

  lines.push('')
  lines.push(GROUP_CHAT_RULES)

  // Who's here
  lines.push('')
  lines.push('### Who\'s Here')
  for (const m of members) {
    const isCurrent = m.id === currentUserId
    const label = isCurrent ? ' — current speaker' : ''
    lines.push(`- **${m.name}** (${m.role})${label}`)
  }

  // Current user context
  lines.push('')
  lines.push('## Current User')
  lines.push(`- Current user: ${currentUserName} (ID: ${currentUserId})`)
  const others = members.filter((m) => m.id !== currentUserId)
  if (others.length > 0) {
    lines.push(
      `- Co-buyers: ${others.map((m) => `${m.name} (ID: ${m.id})`).join(', ')}`
    )
  }

  // Party context
  lines.push('')
  lines.push(`## Party Context`)
  lines.push(`- Party: ${partyName}`)
  lines.push(`- Status: ${partyStatus}`)

  // Custom instructions
  if (customInstructions) {
    lines.push('')
    lines.push('## Custom Instructions')
    lines.push(customInstructions)
  }

  // Date context
  const today = new Date()
  lines.push('')
  lines.push('## Date Context')
  lines.push(
    `- Today is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
  )
  lines.push(`- Today's ISO date: ${today.toISOString().split('T')[0]}`)

  return lines.join('\n')
}
