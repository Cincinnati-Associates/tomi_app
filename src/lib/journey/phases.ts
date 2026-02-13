/**
 * Journey Phase Definitions
 *
 * Journey phases with their exercises, unlock conditions,
 * TIC section mappings, and blueprint tile configurations.
 *
 * Phase 0: Foundation — 3 starter exercises (GEMs, Shared Home Vision, Roadmap),
 *          all available from the start with no forced ordering.
 * Phases 2-4 are individual. Phases 5-6 have group components.
 */

import type { JourneyPhase, BlueprintTileConfig, TrailNodeData, TrailNodeStatus } from './types'

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
        name: 'GEMs Discovery',
        description:
          'Discover your Goals, Expectations & Motivations for co-ownership',
        icon: 'Gem',
        estimatedMinutes: 5,
        renderMode: 'conversational',
        scope: 'individual',
        route: 'gems',
      },
      {
        slug: 'shared_home_vision',
        name: 'Shared Home Vision',
        description:
          'Build an interactive vision of your ideal shared home',
        icon: 'Home',
        estimatedMinutes: 5,
        renderMode: 'configurator',
        scope: 'individual',
        route: 'home-vision',
      },
      {
        slug: 'roadmap_walkthrough',
        name: 'What to Expect',
        description:
          'A guided walkthrough of the co-buying journey from start to finish',
        icon: 'Route',
        estimatedMinutes: 8,
        renderMode: 'walkthrough',
        scope: 'individual',
        route: 'roadmap',
      },
    ],
    ticSection: null,
    blueprintTiles: ['my_gems', 'timeline', 'home_vision', 'location', 'ownership_type'],
    unlockAfterPhases: [], // Always unlocked
  },
  {
    id: 2,
    name: 'Your People',
    subtitle: 'Who are you doing this with?',
    description:
      'Assess potential co-buyers and understand your compatibility.',
    icon: 'Users',
    exercises: [
      {
        slug: 'cobuyer_candidate_assessment',
        name: 'Co-Buyer Assessment',
        description:
          'Privately evaluate a potential co-ownership partner across 7 dimensions',
        icon: 'UserCheck',
        estimatedMinutes: 10,
        renderMode: 'conversational',
        scope: 'individual',
        route: 'cobuyer-assessment',
      },
    ],
    ticSection: 'Parties & Ownership %',
    blueprintTiles: ['my_people'],
    unlockAfterPhases: [0],
  },
  {
    id: 3,
    name: 'Money & Means',
    subtitle: 'How will you pay for this?',
    description:
      'Deep-dive into finances — individually, then align with co-buyers.',
    icon: 'DollarSign',
    exercises: [
      {
        slug: 'financial_readiness',
        name: 'Financial Deep-Dive',
        description: 'Assess your financial readiness for co-ownership',
        icon: 'PiggyBank',
        estimatedMinutes: 10,
        renderMode: 'form',
        scope: 'individual',
        route: 'financial-readiness',
      },
    ],
    ticSection: 'Financial Terms',
    blueprintTiles: ['budget_snapshot', 'financial_split'],
    unlockAfterPhases: [0],
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
    unlockAfterPhases: [2],
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
    unlockAfterPhases: [3],
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
    unlockAfterPhases: [4],
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
    emptyText: 'Complete GEMs Discovery to unlock',
    sourceExercises: ['gems_discovery'],
    phaseId: 0,
  },
  {
    id: 'budget_snapshot',
    label: 'Budget Snapshot',
    icon: 'DollarSign',
    emptyText: 'Use the calculator or complete financial exercises',
    sourceExercises: ['financial_readiness'],
    phaseId: 3,
  },
  {
    id: 'my_people',
    label: 'My People',
    icon: 'Users',
    emptyText: 'Assess a co-buyer candidate to unlock',
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
    emptyText: 'Complete housing preferences to unlock',
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
    emptyText: 'Complete group financial alignment',
    sourceExercises: [],
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

/**
 * Determine which phases are unlocked based on completed exercises.
 * A phase unlocks when ALL of its unlockAfterPhases have at least 1 completed exercise.
 */
export function getUnlockedPhases(
  completedExerciseSlugs: Set<string>
): Set<number> {
  const unlocked = new Set<number>()

  for (const phase of JOURNEY_PHASES) {
    if (phase.unlockAfterPhases.length === 0) {
      // No prerequisites — always unlocked
      unlocked.add(phase.id)
      continue
    }

    const allPrereqsMet = phase.unlockAfterPhases.every((prereqPhaseId) => {
      const prereqPhase = getPhase(prereqPhaseId)
      if (!prereqPhase) return false
      return prereqPhase.exercises.some((e) => completedExerciseSlugs.has(e.slug))
    })

    if (allPrereqsMet) {
      unlocked.add(phase.id)
    }
  }

  return unlocked
}

/**
 * Recommend the next exercise for a user.
 * Priority: current phase first incomplete exercise, then GEMs if not done.
 */
export function getRecommendedExercise(
  completedSlugs: Set<string>,
  inProgressSlugs: Set<string>
): string | null {
  // If GEMs not done, always recommend it first
  if (!completedSlugs.has('gems_discovery') && !inProgressSlugs.has('gems_discovery')) {
    return 'gems_discovery'
  }

  // Find the first unlocked phase with incomplete exercises
  const unlockedPhases = getUnlockedPhases(completedSlugs)

  for (const phase of JOURNEY_PHASES) {
    if (!unlockedPhases.has(phase.id)) continue

    for (const exercise of phase.exercises) {
      if (!completedSlugs.has(exercise.slug) && !inProgressSlugs.has(exercise.slug)) {
        return exercise.slug
      }
    }
  }

  // Check in-progress exercises
  for (const phase of JOURNEY_PHASES) {
    if (!unlockedPhases.has(phase.id)) continue

    for (const exercise of phase.exercises) {
      if (inProgressSlugs.has(exercise.slug)) {
        return exercise.slug
      }
    }
  }

  return null
}

/**
 * Flatten all phases and their exercises into a linear trail node array.
 * Each phase becomes a "phase landmark" node followed by its exercise nodes.
 * Status is derived from JourneyState phase progress.
 */
export function flattenPhasesToTrailNodes(
  phases: JourneyPhase[],
  phaseProgress: Array<{
    phaseId: number
    unlocked: boolean
    exerciseProgress: Array<{ slug: string; status: string }>
    completedCount: number
    totalCount: number
  }>,
  currentPhaseId: number,
  recommendedExercise: string | null
): TrailNodeData[] {
  const nodes: TrailNodeData[] = []
  let foundCurrent = false

  for (const phase of phases) {
    const progress = phaseProgress.find((p) => p.phaseId === phase.id)
    const isUnlocked = progress?.unlocked ?? phase.id === 0
    const allComplete = progress
      ? progress.completedCount === progress.totalCount && progress.totalCount > 0
      : false

    // Determine phase node status
    let phaseStatus: TrailNodeStatus
    if (allComplete) {
      phaseStatus = 'completed'
    } else if (phase.id === currentPhaseId && isUnlocked) {
      phaseStatus = 'current'
    } else if (isUnlocked) {
      phaseStatus = 'unlocked'
    } else {
      phaseStatus = 'locked'
    }

    nodes.push({
      id: `phase-${phase.id}`,
      type: 'phase',
      status: phaseStatus,
      label: phase.name,
      subtitle: phase.subtitle,
      icon: phase.icon,
      phaseId: phase.id,
    })

    // Add exercise nodes for this phase
    for (const exercise of phase.exercises) {
      const exProgress = progress?.exerciseProgress.find(
        (ep) => ep.slug === exercise.slug
      )
      const exStatus = exProgress?.status ?? 'not_started'

      let nodeStatus: TrailNodeStatus
      if (exStatus === 'completed') {
        nodeStatus = 'completed'
      } else if (!isUnlocked) {
        nodeStatus = 'locked'
      } else if (
        !foundCurrent &&
        (exStatus === 'in_progress' || exStatus === 'not_started') &&
        (exercise.slug === recommendedExercise || !recommendedExercise)
      ) {
        nodeStatus = 'current'
        foundCurrent = true
      } else if (exStatus === 'in_progress') {
        nodeStatus = 'current'
        foundCurrent = true
      } else {
        nodeStatus = 'unlocked'
      }

      nodes.push({
        id: `exercise-${exercise.slug}`,
        type: 'exercise',
        status: nodeStatus,
        label: exercise.name,
        subtitle: exercise.description,
        icon: exercise.icon,
        phaseId: phase.id,
        exerciseSlug: exercise.slug,
        route: `/journey/exercises/${exercise.route}`,
        estimatedMinutes: exercise.estimatedMinutes,
      })
    }
  }

  return nodes
}

/**
 * Map journey stage transitions based on phase completions.
 * Phases 0-1 → educating, Phase 2 → preparing, Phases 3+ with group → in_group
 */
export function getJourneyStageForProgress(
  completedSlugs: Set<string>,
  hasGroup: boolean
): string {
  const phase2Complete = JOURNEY_PHASES[2]?.exercises.some((e) =>
    completedSlugs.has(e.slug)
  )
  const phase3Complete = JOURNEY_PHASES[3]?.exercises.some((e) =>
    completedSlugs.has(e.slug)
  )

  if (phase3Complete && hasGroup) return 'in_group'
  if (phase2Complete) return 'preparing'

  const phase0Complete = JOURNEY_PHASES[0]?.exercises.some((e) =>
    completedSlugs.has(e.slug)
  )

  if (phase0Complete) return 'educating'
  return 'exploring'
}
