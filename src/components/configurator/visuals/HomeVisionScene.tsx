"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { HomeVisionVisualState } from "@/lib/home-vision-exercise/visual-mappings"

interface HomeVisionSceneProps {
  visualState: HomeVisionVisualState
}

// =============================================================================
// COLOR PALETTES
// =============================================================================

const LOCATION_PALETTES = {
  city: { sky: "#94a3b8", ground: "#64748b", accent: "#475569" },
  suburbs: { sky: "#93c5fd", ground: "#86efac", accent: "#4ade80" },
  mountains: { sky: "#7dd3fc", ground: "#6ee7b7", accent: "#a3a3a3" },
  beach: { sky: "#67e8f9", ground: "#fde68a", accent: "#38bdf8" },
} as const

const HOME_COLORS = {
  house: "#8b5e3c",
  condo: "#6b7280",
  townhouse: "#b45309",
  vacation: "#0d9488",
} as const

const STYLE_MODIFIERS = {
  modern: { roofStyle: "flat" as const, trim: "#374151" },
  classic: { roofStyle: "peaked" as const, trim: "#92400e" },
  rustic: { roofStyle: "peaked" as const, trim: "#78350f" },
  undecided: { roofStyle: "peaked" as const, trim: "#6b7280" },
}

const DEFAULT_PALETTE = { sky: "#e2e8f0", ground: "#d1d5db", accent: "#94a3b8" }

// Avatar color families
const FRIEND_COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"]
const FAMILY_COLOR = "#6366f1" // All same shade for family
const PARTNER_COLORS = ["#ec4899", "#f472b6"] // Warm tones for partners

// =============================================================================
// HELPERS
// =============================================================================

function FadeLayer({
  layerKey,
  children,
}: {
  layerKey: string
  children: React.ReactNode
}) {
  return (
    <motion.g
      key={layerKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.g>
  )
}

/**
 * Get avatar colors based on relationship type.
 * - family: all same color (unity)
 * - friends: all different colors (individuality)
 * - partners: warm matched tones
 * - mixed: first 2 share a color (family pair), rest are different
 */
function getAvatarColors(
  count: number,
  relationship: HomeVisionVisualState["relationshipType"]
): string[] {
  if (relationship === "family" || relationship === "partners") {
    const base = relationship === "partners" ? PARTNER_COLORS[0] : FAMILY_COLOR
    return Array.from({ length: count }, () => base)
  }
  if (relationship === "friends") {
    return Array.from({ length: count }, (_, i) => FRIEND_COLORS[i % FRIEND_COLORS.length])
  }
  if (relationship === "mixed") {
    // First pair shares a color (family), rest are different (friends)
    return Array.from({ length: count }, (_, i) =>
      i < 2 ? FAMILY_COLOR : FRIEND_COLORS[(i - 2 + 2) % FRIEND_COLORS.length]
    )
  }
  // Default / unsure
  return Array.from({ length: count }, (_, i) => FRIEND_COLORS[i % FRIEND_COLORS.length])
}

/** Budget tier drives home embellishments: more detail at higher tiers */
function getTierScale(tier: number) {
  return {
    sizeMultiplier: 1 + (tier - 1) * 0.08, // Slightly larger at higher tiers
    hasGarage: tier >= 3,
    hasChimney: tier >= 2,
    hasFence: tier >= 2,
    hasPool: tier >= 4,
    windowGlow: tier >= 3 ? "#fff7ed" : "#fef9c3",
    hasBalcony: tier >= 3,
  }
}

// =============================================================================
// LAYERS
// =============================================================================

function BackgroundLayer({
  location,
}: {
  location: HomeVisionVisualState["location"]
}) {
  const palette = location ? LOCATION_PALETTES[location] : DEFAULT_PALETTE

  return (
    <AnimatePresence mode="wait">
      <FadeLayer layerKey={`bg-${location ?? "default"}`}>
        <rect x="0" y="0" width="400" height="180" fill={palette.sky} />
        <rect x="0" y="180" width="400" height="120" fill={palette.ground} />

        {location === "mountains" && (
          <>
            <polygon points="50,180 120,80 190,180" fill="#9ca3af" opacity="0.6" />
            <polygon points="140,180 220,60 300,180" fill="#d1d5db" opacity="0.5" />
            <polygon points="280,180 340,100 400,180" fill="#9ca3af" opacity="0.4" />
          </>
        )}
        {location === "city" && (
          <>
            <rect x="30" y="100" width="30" height="80" fill="#475569" opacity="0.4" />
            <rect x="70" y="120" width="25" height="60" fill="#475569" opacity="0.3" />
            <rect x="310" y="90" width="35" height="90" fill="#475569" opacity="0.4" />
            <rect x="355" y="110" width="25" height="70" fill="#475569" opacity="0.3" />
          </>
        )}
        {location === "beach" && (
          <>
            <ellipse cx="200" cy="185" rx="220" ry="12" fill="#38bdf8" opacity="0.3" />
            <ellipse cx="200" cy="190" rx="220" ry="8" fill="#38bdf8" opacity="0.2" />
          </>
        )}
        {location === "suburbs" && (
          <>
            <circle cx="50" cy="160" r="18" fill="#22c55e" opacity="0.4" />
            <circle cx="90" cy="155" r="14" fill="#22c55e" opacity="0.3" />
            <circle cx="330" cy="158" r="16" fill="#22c55e" opacity="0.4" />
            <circle cx="370" cy="162" r="12" fill="#22c55e" opacity="0.3" />
          </>
        )}
      </FadeLayer>
    </AnimatePresence>
  )
}

function HomeLayer({
  homeType,
  homeStyle,
  budgetTier,
}: {
  homeType: HomeVisionVisualState["homeType"]
  homeStyle: HomeVisionVisualState["homeStyle"]
  budgetTier: number
}) {
  if (!homeType) {
    return (
      <AnimatePresence mode="wait">
        <FadeLayer layerKey="home-empty">
          <rect
            x="145" y="130" width="110" height="70"
            fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" rx="4"
          />
          <polygon
            points="135,135 200,95 265,135"
            fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4"
          />
        </FadeLayer>
      </AnimatePresence>
    )
  }

  const color = HOME_COLORS[homeType]
  const style = STYLE_MODIFIERS[homeStyle ?? "undecided"]
  const tier = getTierScale(budgetTier || 1)

  return (
    <AnimatePresence mode="wait">
      <FadeLayer layerKey={`home-${homeType}-${homeStyle}-${budgetTier}`}>
        {homeType === "house" && (
          <>
            {/* Fence for tier 2+ */}
            {tier.hasFence && (
              <>
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect key={`fl-${i}`} x={110 + i * 14} y="192" width="3" height="10" fill="#d4a574" rx="0.5" />
                ))}
                <rect x="108" y="195" width="62" height="2" fill="#d4a574" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect key={`fr-${i}`} x={240 + i * 14} y="192" width="3" height="10" fill="#d4a574" rx="0.5" />
                ))}
                <rect x="238" y="195" width="62" height="2" fill="#d4a574" />
              </>
            )}
            {/* Garage for tier 3+ */}
            {tier.hasGarage && (
              <>
                <rect x="260" y="148" width="45" height="52" fill={color} opacity="0.85" rx="2" />
                <rect x="265" y="165" width="35" height="35" fill={style.trim} rx="2" />
                {[0, 1, 2].map((i) => (
                  <rect key={`gd-${i}`} x="265" y={172 + i * 10} width="35" height="1.5" fill="#94a3b8" />
                ))}
              </>
            )}
            {/* Body */}
            <rect x="145" y="130" width="110" height="70" fill={color} rx="2" />
            {/* Roof */}
            {style.roofStyle === "flat" ? (
              <rect x="140" y="120" width="120" height="12" fill={style.trim} rx="2" />
            ) : (
              <polygon points="135,132 200,85 265,132" fill={style.trim} />
            )}
            {/* Chimney for tier 2+ */}
            {tier.hasChimney && (
              <rect x="235" y="90" width="14" height="30" fill={style.trim} rx="1" />
            )}
            {/* Door */}
            <rect x="185" y="165" width="30" height="35" fill={style.trim} rx="2" />
            <circle cx="210" cy="183" r="2" fill={tier.windowGlow} />
            {/* Windows */}
            <rect x="155" y="145" width="20" height="18" fill={tier.windowGlow} rx="1" />
            <rect x="225" y="145" width="20" height="18" fill={tier.windowGlow} rx="1" />
            {/* Pool for tier 4 */}
            {tier.hasPool && (
              <ellipse cx="120" cy="220" rx="25" ry="12" fill="#67e8f9" opacity="0.6" />
            )}
          </>
        )}

        {homeType === "condo" && (
          <>
            <rect x="155" y="80" width="90" height="120" fill={color} rx="3" />
            {/* Penthouse level for tier 3+ */}
            {tier.hasBalcony && (
              <rect x="150" y="75" width="100" height="10" fill={style.trim} rx="2" />
            )}
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2].map((col) => (
                <rect
                  key={`w-${row}-${col}`}
                  x={165 + col * 25} y={92 + row * 26}
                  width="16" height="14"
                  fill={tier.windowGlow} rx="1"
                />
              ))
            )}
            <rect x="183" y="170" width="34" height="30" fill={style.trim} rx="2" />
            {/* Awning for tier 2+ */}
            {tier.hasChimney && (
              <polygon points="178,170 200,162 222,170" fill={style.trim} opacity="0.5" />
            )}
          </>
        )}

        {homeType === "townhouse" && (
          <>
            {[0, 1, 2].map((i) => (
              <g key={`unit-${i}`}>
                <rect
                  x={130 + i * 50} y={120 + (i === 1 ? -8 : 0)}
                  width="46" height={80 + (i === 1 ? 8 : 0)}
                  fill={color} rx="2"
                />
                {style.roofStyle === "flat" ? (
                  <rect
                    x={128 + i * 50} y={112 + (i === 1 ? -8 : 0)}
                    width="50" height="10" fill={style.trim} rx="2"
                  />
                ) : (
                  <polygon
                    points={`${128 + i * 50},${122 + (i === 1 ? -8 : 0)} ${153 + i * 50},${95 + (i === 1 ? -8 : 0)} ${178 + i * 50},${122 + (i === 1 ? -8 : 0)}`}
                    fill={style.trim}
                  />
                )}
                <rect x={145 + i * 50} y={170} width="16" height="30" fill={style.trim} rx="1" />
                <rect x={145 + i * 50} y={135 + (i === 1 ? -8 : 0)} width="16" height="14" fill={tier.windowGlow} rx="1" />
                {/* Planter boxes for tier 2+ */}
                {tier.hasFence && (
                  <rect x={142 + i * 50} y={150 + (i === 1 ? -8 : 0)} width="22" height="4" fill="#22c55e" rx="2" opacity="0.5" />
                )}
              </g>
            ))}
          </>
        )}

        {homeType === "vacation" && (
          <>
            <polygon points="130,200 200,90 270,200" fill={color} />
            <polygon points="140,200 200,105 260,200" fill={style.trim} opacity="0.3" />
            <rect x="185" y="165" width="30" height="35" fill={style.trim} rx="2" />
            <polygon points="185,130 200,115 215,130" fill={tier.windowGlow} />
            {/* Deck — wider for higher tiers */}
            <rect x={tier.hasGarage ? 100 : 120} y="198" width={tier.hasGarage ? 200 : 160} height="6" fill={style.trim} rx="1" />
            {/* Hot tub for tier 4 */}
            {tier.hasPool && (
              <circle cx="120" cy="218" r="14" fill="#67e8f9" opacity="0.5" />
            )}
            {/* Deck railing for tier 3+ */}
            {tier.hasBalcony && (
              <>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <rect key={`dr-${i}`} x={110 + i * 32} y="195" width="2" height="6" fill={style.trim} opacity="0.6" />
                ))}
              </>
            )}
          </>
        )}
      </FadeLayer>
    </AnimatePresence>
  )
}

function PeopleLayer({
  count,
  usagePattern,
  relationshipType,
}: {
  count: number
  usagePattern: HomeVisionVisualState["usagePattern"]
  relationshipType: HomeVisionVisualState["relationshipType"]
}) {
  if (count === 0) return null

  const avatarColors = getAvatarColors(count, relationshipType)

  // Timeshare: only 1 person visible at home, others shown faded/distant
  const isTimeshare = usagePattern === "timeshare"
  // Co-habitation / primary home: all people clustered together at home
  const isTogether = usagePattern === "cohabitation" || usagePattern === "mixed"

  const getPositions = () => {
    if (isTimeshare) {
      // One person at home (center), others off to the side and faded
      return Array.from({ length: count }, (_, i) => ({
        x: i === 0 ? 200 : 320 + (i - 1) * 22,
        y: i === 0 ? 228 : 240,
        opacity: i === 0 ? 1 : 0.35,
        scale: i === 0 ? 1 : 0.7,
      }))
    }
    // Together: clustered near the front door
    const spacing = count <= 4 ? 28 : 22
    const startX = 200 - (count * spacing) / 2
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y: 228,
      opacity: 1,
      scale: 1,
    }))
  }

  const positions = getPositions()

  return (
    <AnimatePresence mode="wait">
      <FadeLayer layerKey={`people-${count}-${usagePattern}-${relationshipType}`}>
        {positions.map((pos, i) => (
          <g key={`person-${i}`} opacity={pos.opacity}>
            <circle cx={pos.x} cy={pos.y} r={10 * pos.scale} fill={avatarColors[i]} />
            <ellipse
              cx={pos.x} cy={pos.y + 18 * pos.scale}
              rx={8 * pos.scale} ry={10 * pos.scale}
              fill={avatarColors[i]} opacity="0.7"
            />
          </g>
        ))}

        {/* TACO indicator: calendar icon when timeshare */}
        {isTimeshare && count >= 2 && (
          <g>
            <rect x="282" y="228" width="26" height="22" fill="white" stroke="#94a3b8" strokeWidth="1.5" rx="3" />
            <rect x="282" y="228" width="26" height="7" fill="#ef4444" rx="3" />
            <text x="295" y="246" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
              TACO
            </text>
          </g>
        )}

        {/* SACO indicator: house icon when living together */}
        {isTogether && count >= 2 && (
          <g>
            <text x="200" y="260" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
              SACO
            </text>
          </g>
        )}
      </FadeLayer>
    </AnimatePresence>
  )
}

function BudgetBadge({
  budgetTier,
}: {
  budgetTier: number
}) {
  if (budgetTier === 0) return null

  const labels = { 1: "Up to $500k", 2: "$500k–$1M", 3: "$1M–$2M", 4: "$2M+" } as const
  const label = labels[budgetTier as keyof typeof labels]
  if (!label) return null

  const width = budgetTier >= 3 ? 70 : 66

  return (
    <AnimatePresence mode="wait">
      <FadeLayer layerKey={`budget-${budgetTier}`}>
        <g>
          <rect
            x={400 - width - 14} y="18"
            width={width} height="24"
            fill="white" stroke="#d1d5db" strokeWidth="1" rx="12"
          />
          <text
            x={400 - width / 2 - 14} y="35"
            textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16a34a"
          >
            {label}
          </text>
        </g>
      </FadeLayer>
    </AnimatePresence>
  )
}

// =============================================================================
// MAIN SCENE
// =============================================================================

export function HomeVisionScene({ visualState }: HomeVisionSceneProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <BackgroundLayer location={visualState.location} />
      <HomeLayer
        homeType={visualState.homeType}
        homeStyle={visualState.homeStyle}
        budgetTier={visualState.budgetTier}
      />
      <PeopleLayer
        count={visualState.coBuyerCount}
        usagePattern={visualState.usagePattern}
        relationshipType={visualState.relationshipType}
      />
      <BudgetBadge budgetTier={visualState.budgetTier} />
    </svg>
  )
}
