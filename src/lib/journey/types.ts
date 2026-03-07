/**
 * Journey Architecture Types
 *
 * Core types for the journey system — zones, phases, exercises, blueprint tiles,
 * and journey state management.
 */

// =============================================================================
// EXERCISE TYPES
// =============================================================================

export type ExerciseRenderMode = 'form' | 'conversational' | 'walkthrough' | 'configurator'
export type ExerciseScope = 'individual' | 'group'

export interface JourneyExercise {
  slug: string
  name: string
  description: string
  icon: string // lucide icon name
  estimatedMinutes: number
  renderMode: ExerciseRenderMode
  scope: ExerciseScope
  /** Route path relative to /journey/exercises/ */
  route: string
}

// =============================================================================
// ZONE TYPES
// =============================================================================

export interface JourneyZone {
  id: string
  name: string
  subtitle: string
  /** Phase IDs that belong to this zone */
  phaseIds: number[]
  /** Whether this zone requires an active buying party to access */
  requiresParty: boolean
}

// =============================================================================
// PHASE TYPES
// =============================================================================

export interface JourneyPhase {
  id: number
  name: string
  subtitle: string
  description: string
  icon: string // lucide icon name
  exercises: JourneyExercise[]
  /** Which TIC agreement section this phase feeds */
  ticSection: string | null
  /** Blueprint tile IDs this phase can populate */
  blueprintTiles: string[]
  /** Unlock condition — phase IDs that must have at least 1 completed exercise */
  unlockAfterPhases: number[]
}

// =============================================================================
// BLUEPRINT TILE TYPES
// =============================================================================

export interface BlueprintTileConfig {
  id: string
  label: string
  icon: string // lucide icon name
  emptyText: string
  /** Exercise slugs that can fill this tile */
  sourceExercises: string[]
  /** Phase ID this tile belongs to */
  phaseId: number
}

export interface BlueprintTileData {
  id: string
  filled: boolean
  content?: {
    headline: string
    detail?: string
    icon?: string
  }
}

// =============================================================================
// JOURNEY STATE
// =============================================================================

export interface ExerciseProgress {
  slug: string
  status: 'not_started' | 'in_progress' | 'completed'
  version: number
  completedAt: string | null
  responses?: Record<string, unknown>
  computedScores?: Record<string, unknown>
}

export interface PhaseProgress {
  phaseId: number
  unlocked: boolean
  exerciseProgress: ExerciseProgress[]
  completedCount: number
  totalCount: number
}

export interface JourneyState {
  /** User's current journey stage from DB */
  stage: string
  /** Readiness score 0-100 */
  readinessScore: number
  /** Progress per phase */
  phases: PhaseProgress[]
  /** Blueprint tile data */
  tiles: BlueprintTileData[]
  /** Overall journey completion percentage */
  completionPercentage: number
  /** Whether the user has seen the Homi welcome */
  welcomeCompleted: boolean
  /** How the user entered (assessment, calculator, invite, cold) */
  entryPath: 'assessment' | 'calculator' | 'invite' | 'cold'
  /** Recommended next exercise slug */
  recommendedExercise: string | null
  /** Current phase (first unlocked phase with incomplete exercises) */
  currentPhaseId: number
}

// =============================================================================
// PARTY PROGRESS TYPES
// =============================================================================

export interface PartyMemberProgress {
  userId: string
  name: string
  avatarUrl: string | null
  role: 'admin' | 'member'
  exerciseProgress: { slug: string; status: string }[]
  completedCount: number
  lastActive: string | null
}

export interface PartyData {
  party: {
    id: string
    name: string
    status: string
    targetCity: string | null
  } | null
  members: PartyMemberProgress[]
}
