// ============================================
// USER & PROFILE TYPES
// ============================================

export interface Profile {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<Pick<Profile,
  'full_name' | 'avatar_url' | 'onboarding_completed'
>>

// ============================================
// BUYING PARTY TYPES
// ============================================

export type PartyStatus = 'forming' | 'active' | 'under_contract' | 'closed' | 'archived'
export type MemberRole = 'admin' | 'member'
export type InviteStatus = 'pending' | 'accepted' | 'declined'
export type InviteType = 'email' | 'sms' | 'link'

export interface BuyingParty {
  id: string
  name: string
  status: PartyStatus
  created_by: string | null
  calculator_state: Record<string, unknown> | null
  target_city: string | null
  target_budget: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BuyingPartyWithMembers extends BuyingParty {
  party_members: PartyMemberWithProfile[]
}

export interface PartyMember {
  id: string
  party_id: string
  user_id: string
  role: MemberRole
  invite_status: InviteStatus
  ownership_percentage: number | null
  down_payment_contribution: number | null
  monthly_contribution: number | null
  joined_at: string
}

export interface PartyMemberWithProfile extends PartyMember {
  profiles: Profile
}

export interface PartyInvite {
  id: string
  party_id: string
  invite_type: InviteType
  invite_value: string
  invited_by: string | null
  role: MemberRole
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

export interface PartyInviteWithParty extends PartyInvite {
  buying_parties: Pick<BuyingParty, 'id' | 'name' | 'target_city'>
}

// ============================================
// INPUT TYPES FOR CREATING/UPDATING
// ============================================

export interface CreatePartyInput {
  name: string
  target_city?: string
  target_budget?: number
}

export interface CreateInviteInput {
  party_id: string
  invite_type: InviteType
  invite_value?: string // required for email/sms, auto-generated for link
  role?: MemberRole
  expires_in_days?: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AuthState {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ============================================
// HOMI CHAT TYPES
// ============================================

export type VisitorStage = 'explorer' | 'evaluator' | 'ready' | 'calculated'
export type ChatRole = 'user' | 'assistant' | 'system'
export type ChatSentiment = 'positive' | 'neutral' | 'cautious' | 'skeptical'

/**
 * Volunteered info from anonymous visitors (bucketed, non-PII)
 */
export interface VolunteeredInfo {
  metroArea?: string
  incomeRange?: string
  coBuyerCount?: number
  timeline?: string
  hasSpecificCoBuyers?: boolean
}

/**
 * Behavioral metrics tracked for visitors
 */
export interface VisitorBehavior {
  pagesVisited: string[]
  calculatorStarted: boolean
  calculatorCompleted: boolean
  chatMessagesCount: number
  topicsDiscussed: string[]
  sessionCount: number
}

/**
 * Qualification signals extracted from conversations
 */
export interface QualificationSignals {
  hasCobuyers?: boolean
  budgetMentioned?: boolean
  timelineUrgent?: boolean
  locationMentioned?: boolean
  concernsAddressed?: string[]
}

/**
 * Anonymous visitor session (stored in Supabase)
 */
export interface VisitorSession {
  id: string
  visitor_id: string
  session_id: string
  first_name: string | null
  identity_confirmed: boolean
  stage: VisitorStage
  volunteered_info: VolunteeredInfo
  behavior: VisitorBehavior
  chat_summary: string | null
  chat_topics: string[] | null
  chat_sentiment: ChatSentiment | null
  qualification_signals: QualificationSignals
  first_seen: string
  last_seen: string
  linked_user_id: string | null
  linked_at: string | null
}

/**
 * Chat conversation (for authenticated users)
 */
export interface ChatConversation {
  id: string
  user_id: string
  party_id: string | null
  title: string | null
  started_at: string
  last_message_at: string
  message_count: number
  topics_discussed: string[] | null
  sentiment: ChatSentiment | null
  summary: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

/**
 * Chat message (full transcript for authenticated users)
 */
export interface ChatMessage {
  id: string
  conversation_id: string
  role: ChatRole
  content: string
  metadata: {
    model?: string
    tokens?: number
    latency_ms?: number
  }
  created_at: string
}

/**
 * Visitor-to-user link record
 */
export interface VisitorUserLink {
  id: string
  visitor_id: string
  user_id: string
  merged_context: {
    firstName?: string
    stage?: VisitorStage
    volunteeredInfo?: VolunteeredInfo
    behavior?: VisitorBehavior
    chatSummary?: string
    chatTopics?: string[]
  }
  linked_at: string
}

// ============================================
// INPUT TYPES FOR CHAT
// ============================================

export interface CreateConversationInput {
  party_id?: string
  title?: string
}

export interface CreateMessageInput {
  conversation_id: string
  role: ChatRole
  content: string
  metadata?: ChatMessage['metadata']
}

export interface UpdateVisitorSessionInput {
  visitor_id: string
  session_id: string
  first_name?: string
  identity_confirmed?: boolean
  stage?: VisitorStage
  volunteered_info?: Partial<VolunteeredInfo>
  behavior?: Partial<VisitorBehavior>
  chat_summary?: string
  chat_topics?: string[]
  chat_sentiment?: ChatSentiment
  qualification_signals?: Partial<QualificationSignals>
}
