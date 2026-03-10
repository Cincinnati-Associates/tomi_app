"use client"

import { AnimatePresence, motion } from "framer-motion"
import { formatCurrency } from "@/lib/money-picture/visual-mappings"
import type { MoneyPictureVisualState } from "@/lib/money-picture/visual-mappings"

// =============================================================================
// COLORS
// =============================================================================

const STATUS_COLORS = {
  within_reach: { bg: "#e8f5e9", accent: "#2e7d32", label: "Within Reach" },
  stretch: { bg: "#fff8e1", accent: "#f9a825", label: "Stretch" },
  gap: { bg: "#fce4ec", accent: "#c62828", label: "Gap" },
  unknown: { bg: "#f5f5f5", accent: "#9e9e9e", label: "" },
}

const CREDIT_COLORS: Record<string, string> = {
  excellent: "#2e7d32",
  good: "#558b2f",
  fair: "#f9a825",
  unsure: "#9e9e9e",
}

// =============================================================================
// HELPER — animated bar width
// =============================================================================

function BarSegment({
  y,
  width,
  color,
  label,
  valueText,
  delay,
}: {
  y: number
  width: number
  color: string
  label: string
  valueText: string
  delay: number
}) {
  return (
    <g>
      {/* Bar */}
      <motion.rect
        x={60}
        y={y}
        height={28}
        rx={4}
        fill={color}
        initial={{ width: 0 }}
        animate={{ width: Math.max(width, 0) }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      />
      {/* Label left */}
      <text x={58} y={y + 18} textAnchor="end" fontSize={10} fill="#666" fontFamily="system-ui">
        {label}
      </text>
      {/* Value right of bar */}
      <AnimatePresence mode="wait">
        <motion.text
          key={valueText}
          x={Math.max(width, 0) + 66}
          y={y + 18}
          fontSize={11}
          fontWeight={600}
          fill="#333"
          fontFamily="system-ui"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
        >
          {valueText}
        </motion.text>
      </AnimatePresence>
    </g>
  )
}

// =============================================================================
// SCENE
// =============================================================================

interface MoneyPictureSceneProps {
  visualState: MoneyPictureVisualState
}

export function MoneyPictureScene({ visualState }: MoneyPictureSceneProps) {
  const {
    soloMax,
    groupMax,
    monthlyPayment,
    creditTier,
    marketMedian,
    marketCity,
    coBuyerCount,
    timeline,
    affordabilityStatus,
  } = visualState

  const status = STATUS_COLORS[affordabilityStatus]
  const hasData = soloMax > 0

  // Scale bars relative to the max of (groupMax, marketMedian) — cap bar width at 240px
  const maxValue = Math.max(groupMax, marketMedian, 1)
  const barScale = 240 / maxValue
  const soloBarWidth = soloMax * barScale
  const groupBarWidth = groupMax * barScale
  const marketLineX = marketMedian > 0 ? 60 + marketMedian * barScale : 0

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Background */}
      <rect width={400} height={300} fill={status.bg} rx={0} />

      {/* Title */}
      <text x={200} y={28} textAnchor="middle" fontSize={14} fontWeight={700} fill="#333" fontFamily="system-ui">
        Your Buying Power
      </text>

      {hasData ? (
        <>
          {/* ── Bar chart area ── */}
          <BarSegment
            y={50}
            width={soloBarWidth}
            color="#90a4ae"
            label="Solo"
            valueText={formatCurrency(soloMax)}
            delay={0}
          />
          <BarSegment
            y={88}
            width={groupBarWidth}
            color="#4caf50"
            label="Group"
            valueText={formatCurrency(groupMax)}
            delay={0.15}
          />

          {/* Market median line */}
          {marketMedian > 0 && marketLineX > 60 && marketLineX < 360 && (
            <g>
              <motion.line
                x1={marketLineX}
                y1={44}
                x2={marketLineX}
                y2={122}
                stroke="#c62828"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
              />
              <motion.text
                x={marketLineX}
                y={134}
                textAnchor="middle"
                fontSize={9}
                fill="#c62828"
                fontFamily="system-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Median {formatCurrency(marketMedian)}
              </motion.text>
            </g>
          )}

          {/* ── Metrics row ── */}
          <line x1={20} y1={150} x2={380} y2={150} stroke="#ddd" strokeWidth={0.5} />

          {/* Monthly payment */}
          <text x={60} y={174} textAnchor="middle" fontSize={9} fill="#888" fontFamily="system-ui">
            Monthly
          </text>
          <text x={60} y={190} textAnchor="middle" fontSize={13} fontWeight={600} fill="#333" fontFamily="system-ui">
            {monthlyPayment > 0 ? `~${formatCurrency(monthlyPayment)}` : "—"}
          </text>

          {/* Co-buyers */}
          <text x={155} y={174} textAnchor="middle" fontSize={9} fill="#888" fontFamily="system-ui">
            Co-Buyers
          </text>
          <text x={155} y={190} textAnchor="middle" fontSize={13} fontWeight={600} fill="#333" fontFamily="system-ui">
            {coBuyerCount > 0 ? `${coBuyerCount} people` : "—"}
          </text>

          {/* Credit */}
          <text x={250} y={174} textAnchor="middle" fontSize={9} fill="#888" fontFamily="system-ui">
            Credit
          </text>
          <text
            x={250}
            y={190}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill={creditTier ? CREDIT_COLORS[creditTier] ?? "#666" : "#999"}
            fontFamily="system-ui"
          >
            {creditTier
              ? creditTier.charAt(0).toUpperCase() + creditTier.slice(1)
              : "—"}
          </text>

          {/* Market */}
          <text x={340} y={174} textAnchor="middle" fontSize={9} fill="#888" fontFamily="system-ui">
            Market
          </text>
          <text x={340} y={190} textAnchor="middle" fontSize={11} fontWeight={600} fill="#333" fontFamily="system-ui">
            {marketCity ? marketCity.split(",")[0] : "—"}
          </text>

          {/* ── Unlock amount callout ── */}
          {groupMax > soloMax && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <rect x={80} y={210} width={240} height={40} rx={8} fill="#e8f5e9" stroke="#4caf50" strokeWidth={1} />
              <text x={200} y={228} textAnchor="middle" fontSize={10} fill="#666" fontFamily="system-ui">
                Co-buying unlocks
              </text>
              <text x={200} y={243} textAnchor="middle" fontSize={14} fontWeight={700} fill="#2e7d32" fontFamily="system-ui">
                +{formatCurrency(groupMax - soloMax)} in buying power
              </text>
            </motion.g>
          )}

          {/* Timeline + status badge */}
          <text x={200} y={275} textAnchor="middle" fontSize={10} fill="#888" fontFamily="system-ui">
            {[
              timeline ? `Timeline: ${timeline}` : null,
              status.label ? `Market: ${status.label}` : null,
            ]
              .filter(Boolean)
              .join("  •  ")}
          </text>
        </>
      ) : (
        /* ── Empty state ── */
        <g>
          <text x={200} y={120} textAnchor="middle" fontSize={12} fill="#999" fontFamily="system-ui">
            Answer the questions to see
          </text>
          <text x={200} y={140} textAnchor="middle" fontSize={12} fill="#999" fontFamily="system-ui">
            your financial picture come to life
          </text>

          {/* Placeholder bars */}
          <rect x={60} y={170} width={120} height={20} rx={4} fill="#e0e0e0" opacity={0.5} />
          <rect x={60} y={200} width={180} height={20} rx={4} fill="#e0e0e0" opacity={0.3} />
        </g>
      )}
    </svg>
  )
}
