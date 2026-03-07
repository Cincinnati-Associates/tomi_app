/**
 * Journey Phase & Zone Definitions
 *
 * Exercises are organized into zones (Discover, Prepare, Align).
 * Discover and Prepare zones are always available — no forced ordering.
 * Align zone requires an active buying party (Wave 2).
 *
 * Phases are the underlying data layer that map to zones.
 * Phase 0 = Discover zone, Phases 2+3 = Prepare zone, Phases 4-6 = Align zone.
 */

import type { JourneyPhase, JourneyZone, BlueprintTileConfig } from './types'

// =============================================================================
// ZONE DEFINITIONS (UI layer)
// =============================================================================

export const JOURNEY_ZONES: JourneyZone[] = [
  {
    id: 'discover',
    name: 'Discover',
    subtitle: 'What do you want?',
    phaseIds: [0],
    requiresParty: false,
  },
  {
    id: 'prepare',
    name: 'Prepare',
    subtitle: 'What do you need?',
    phaseIds: [2, 3],
    requiresParty: false,
  },
  {
    id: 'align',
    name: 'Align',
    subtitle: 'Get on the same page',
    phaseIds: [4, 5, 6],
    requiresParty: true,
  },
]

// =============================================================================
// PHASE DEFINITIONS
// =============================================================================

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: 0,
    name: 'Foundation',
    subtitle: 'Who are you? What do you want?',
    description:
      'Start by understanding your goals, expectations, and motivations for co-ownership.',
    icon: 'Sparkles',
    exercises: [
      {
        slug: 'gems_discovery',
        name: 'My GEMs',
        description:
          'Find out what you actually want from homeownership',
        icon: 'Gem',
        estimatedMinutes: 5,
        renderMode: 'conversational',
        scope: 'individual',
        route: 'gems',
      },
      {
        slug: 'shared_home_vision',
        name: 'My Home Vision',
        description:
          'Build a picture of your dream shared home and watch it come to life',
        icon: 'Home',
        estimatedMinutes: 5,
        renderMode: 'configurator',
        scope: 'individual',
        route: 'home-vision',
      },
      {
        slug: 'roadmap_walkthrough',
        name: 'The Co-Buying Roadmap',
        description:
          "Walk the 7 steps of co-buying and mark what's clear vs. fuzzy",
        icon: 'Route',
        estimatedMinutes: 5,
        renderMode: 'walkthrough',
        scope: 'individual',
        route: 'roadmap',
      },
    ],
    ticSection: null,
    blueprintTiles: ['my_gems', 'timeline', 'home_vision', 'location', 'ownership_type'],
    unlockAfterPhases: [],
  },
  {
    id: 2,
    name: 'Your People',
    subtitle: 'Who are you doing this with?',
    description:
      'Explore compatibility with potential co-buyers.',
    icon: 'Users',
    exercises: [
      {
        slug: 'cobuyer_candidate_assessment',
        name: 'Co-Buyer Check-In',
        description:
          'Explore how well you and a potential co-buyer might work together',
        icon: 'UserCheck',
        estimatedMinutes: 8,
        renderMode: 'conversational',
        scope: 'individual',
        route: 'cobuyer-assessment',
      },
    ],
    ticSection: 'Parties & Ownership %',
    blueprintTiles: ['my_people'],
    unlockAfterPhases: [],
  },
  {
    id: 3,
    name: 'Money & Means',
    subtitle: 'How will you pay for this?',
    description:
      'See what co-ownership could look like financially.',
    icon: 'DollarSign',
    exercises: [
      {
        slug: 'money_picture',
        name: 'The Money Picture',
        description: 'See what co-ownership could save you vs. renting',
        icon: 'PiggyBank',
        estimatedMinutes: 6,
        renderMode: 'configurator',
        scope: 'individual',
        route: 'money-picture',
      },
    ],
    ticSection: 'Financial Terms',
    blueprintTiles: ['budget_snapshot', 'financial_split'],
    unlockAfterPhases: [],
  },
  {
    id: 4,
    name: 'Vision & Rules',
    subtitle: 'How will you live together?',
    description:
      'Define your lifestyle preferences, property criteria, and governance model.',
    icon: 'Eye',
    exercises: [
      {
        slug: 'housing_preferences',
        name: 'Housing Preferences',
        description: 'Define your ideal home — location, type, and features',
        icon: 'Home',
        estimatedMinutes: 8,
        renderMode: 'form',
        scope: 'individual',
        route: 'housing-preferences',
      },
    ],
    ticSection: 'Use & Occupancy, Governance',
    blueprintTiles: ['home_vision', 'location'],
    unlockAfterPhases: [],
  },
  {
    id: 5,
    name: 'The Plan B',
    subtitle: 'What if things change?',
    description:
      'Address risk, exit strategies, and dispute resolution upfront.',
    icon: 'Shield',
    exercises: [
      {
        slug: 'exit_preferences',
        name: 'Exit & Risk Preferences',
        description:
          'Define your comfort level with exit scenarios and dispute resolution',
        icon: 'ArrowRightLeft',
        estimatedMinutes: 8,
        renderMode: 'form',
        scope: 'individual',
        route: 'exit-preferences',
      },
    ],
    ticSection: 'Transfer & Exit, Dispute Resolution',
    blueprintTiles: [],
    unlockAfterPhases: [],
  },
  {
    id: 6,
    name: 'Your Home',
    subtitle: 'What are you buying?',
    description:
      'Build your property wishlist and search criteria as a group.',
    icon: 'Home',
    exercises: [
      {
        slug: 'property_criteria',
        name: 'Property Wishlist',
        description: 'Define what you want in your shared home',
        icon: 'Search',
        estimatedMinutes: 10,
        renderMode: 'form',
        scope: 'individual',
        route: 'property-criteria',
      },
    ],
    ticSection: 'Property Description',
    blueprintTiles: ['home_vision', 'location'],
    unlockAfterPhases: [],
  },
]

// =============================================================================
// BLUEPRINT TILE DEFINITIONS
// =============================================================================

export const BLUEPRINT_TILES: BlueprintTileConfig[] = [
  {
    id: 'my_gems',
    label: 'My GEMs',
    icon: 'Gem',
    emptyText: 'Complete My GEMs to unlock',
    sourceExercises: ['gems_discovery'],
    phaseId: 0,
  },
  {
    id: 'budget_snapshot',
    label: 'Budget Snapshot',
    icon: 'DollarSign',
    emptyText: 'Complete The Money Picture to unlock',
    sourceExercises: ['money_picture'],
    phaseId: 3,
  },
  {
    id: 'my_people',
    label: 'My People',
    icon: 'Users',
    emptyText: 'Complete Co-Buyer Check-In to unlock',
    sourceExercises: ['cobuyer_candidate_assessment'],
    phaseId: 2,
  },
  {
    id: 'buying_party',
    label: 'Buying Party',
    icon: 'UserPlus',
    emptyText: 'Invite co-buyers to form a party',
    sourceExercises: [],
    phaseId: 2,
  },
  {
    id: 'home_vision',
    label: 'Our Home Vision',
    icon: 'Home',
    emptyText: 'Complete My Home Vision to unlock',
    sourceExercises: ['shared_home_vision', 'housing_preferences', 'property_criteria'],
    phaseId: 0,
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'MapPin',
    emptyText: 'Select a target location',
    sourceExercises: ['shared_home_vision', 'housing_preferences'],
    phaseId: 0,
  },
  {
    id: 'ownership_type',
    label: 'Ownership Type',
    icon: 'FileText',
    emptyText: 'Complete the roadmap to unlock',
    sourceExercises: ['roadmap_walkthrough'],
    phaseId: 0,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: 'Calendar',
    emptyText: 'Set your target timeline',
    sourceExercises: ['shared_home_vision', 'gems_discovery', 'roadmap_walkthrough'],
    phaseId: 0,
  },
  {
    id: 'financial_split',
    label: 'Financial Split',
    icon: 'PieChart',
    emptyText: 'Complete The Money Picture to unlock',
    sourceExercises: ['money_picture'],
    phaseId: 3,
  },
  {
    id: 'agreement_progress',
    label: 'Agreement Progress',
    icon: 'FileCheck',
    emptyText: 'Complete exercises to build your agreement',
    sourceExercises: [],
    phaseId: 5,
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get a phase by ID */
export function getPhase(phaseId: number): JourneyPhase | undefined {
  return JOURNEY_PHASES.find((p) => p.id === phaseId)
}

/** Get all exercises across all phases */
export function getAllExercises() {
  return JOURNEY_PHASES.flatMap((p) => p.exercises)
}

/** Get exercise by slug */
export function getExerciseBySlug(slug: string) {
  return getAllExercises().find((e) => e.slug === slug)
}

/** Get the phase that contains a given exercise */
export function getPhaseForExercise(slug: string): JourneyPhase | undefined {
  return JOURNEY_PHASES.find((p) => p.exercises.some((e) => e.slug === slug))
}

/** Get the zone that contains a given phase */
export function getZoneForPhase(phaseId: number): JourneyZone | undefined {
  return JOURNEY_ZONES.find((z) => z.phaseIds.includes(phaseId))
}

/** Get all exercises for a zone */
export function getExercisesForZone(zoneId: string) {
  const zone = JOURNEY_ZONES.find((z) => z.id === zoneId)
  if (!zone) return []
  return zone.phaseIds.flatMap((pid) => {
    const phase = getPhase(pid)
    return phase?.exercises ?? []
  })
}

/**
 * Determine which phases are unlocked.
 * In the zone model, Discover and Prepare phases are always unlocked.
 * Align phases require an active buying party (checked separately in UI).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getUnlockedPhases(completedExerciseSlugs: Set<string>): Set<number> {
  const unlocked = new Set<number>()
  for (const phase of JOURNEY_PHASES) {
    // All phases are unlocked in the zone model
    // Align zone gating is handled at the UI layer via requiresParty
    unlocked.add(phase.id)
  }
  return unlocked
}

/**
 * Recommend the next exercise for a user.
 * Returns the first incomplete exercise across all unlocked zones,
 * preferring in-progress exercises.
 */
export function getRecommendedExercise(
  completedSlugs: Set<string>,
  inProgressSlugs: Set<string>
): string | null {
  // Prefer in-progress exercises first
  for (const phase of JOURNEY_PHASES) {
    for (const exercise of phase.exercises) {
      if (inProgressSlugs.has(exercise.slug)) {
        return exercise.slug
      }
    }
  }

  // Then find first incomplete exercise
  for (const phase of JOURNEY_PHASES) {
    for (const exercise of phase.exercises) {
      if (!completedSlugs.has(exercise.slug)) {
        return exercise.slug
      }
    }
  }

  return null
}

/**
 * Map journey stage transitions based on exercise completions.
 */
export function getJourneyStageForProgress(
  completedSlugs: Set<string>,
  hasGroup: boolean
): string {
  const preparePhases = JOURNEY_PHASES.filter((p) => [2, 3].includes(p.id))
  const prepareComplete = preparePhases.some((p) =>
    p.exercises.some((e) => completedSlugs.has(e.slug))
  )

  if (prepareComplete && hasGroup) return 'in_group'
  if (prepareComplete) return 'preparing'

  const discoverPhase = JOURNEY_PHASES.find((p) => p.id === 0)
  const discoverComplete = discoverPhase?.exercises.some((e) =>
    completedSlugs.has(e.slug)
  )

  if (discoverComplete) return 'educating'
  return 'exploring'
}
