/**
 * Money Picture Visual Mappings
 *
 * Maps chip-based financial answers → numeric midpoints → calculateAffordability()
 * → visual state for the MoneyPictureScene component.
 */

import { calculateAffordability, formatCurrency, cities } from "@/lib/calculator"
import type { CalculatorInputs } from "@/types"

// =============================================================================
// TYPES
// =============================================================================

export interface MoneyPictureVisualState {
  /** Solo max home price */
  soloMax: number
  /** Group max home price (soloMax × co-buyers, adjusted) */
  groupMax: number
  /** Co-buying unlock amount (groupMax - soloMax) */
  unlockAmount: number
  /** Estimated monthly payment (solo) */
  monthlyPayment: number
  /** Comfortable monthly payment (from user input) */
  comfortableMonthly: number
  /** Credit tier label */
  creditTier: "excellent" | "good" | "fair" | "unsure" | null
  /** Target market median price */
  marketMedian: number
  /** Target market label */
  marketCity: string
  /** Number of co-buyers */
  coBuyerCount: number
  /** Timeline label */
  timeline: string | null
  /** How group buying power compares to market: within reach / stretch / gap */
  affordabilityStatus: "within_reach" | "stretch" | "gap" | "unknown"
  /** DTI ratio estimate (0-1) */
  dtiRatio: number
}

// =============================================================================
// RANGE MIDPOINTS — chip value → numeric midpoint
// =============================================================================

const INCOME_MIDPOINTS: Record<string, number> = {
  under_50k: 40000,
  "50k_75k": 62500,
  "75k_100k": 87500,
  "100k_150k": 125000,
  "150k_plus": 175000,
}

const SAVINGS_MIDPOINTS: Record<string, number> = {
  under_10k: 7500,
  "10k_25k": 17500,
  "25k_50k": 37500,
  "50k_100k": 75000,
  "100k_plus": 125000,
}

const DEBT_MIDPOINTS: Record<string, number> = {
  under_200: 100,
  "200_500": 350,
  "500_1000": 750,
  "1000_2000": 1500,
  "2000_plus": 2250,
}

const MONTHLY_COMFORT_MIDPOINTS: Record<string, number> = {
  under_1500: 1250,
  "1500_2500": 2000,
  "2500_3500": 3000,
  "3500_5000": 4250,
  "5000_plus": 5500,
}

const TIMELINE_LABELS: Record<string, string> = {
  ready_now: "Ready now",
  "6_months": "Within 6 months",
  "6_12_months": "6\u201312 months",
  "1_2_years": "1\u20132 years",
  exploring: "Exploring",
}

// =============================================================================
// MAPPING FUNCTION
// =============================================================================

export function mapAnswersToVisual(
  answers: Record<string, unknown>
): MoneyPictureVisualState {
  // Extract midpoints from chip values
  const annualIncome = INCOME_MIDPOINTS[answers.income_range as string] ?? 0
  const savings = SAVINGS_MIDPOINTS[answers.savings_range as string] ?? 0
  const monthlyDebts = DEBT_MIDPOINTS[answers.debt_range as string] ?? 0
  const comfortableMonthly =
    MONTHLY_COMFORT_MIDPOINTS[answers.monthly_comfort as string] ?? 0
  const coBuyerCount =
    typeof answers.cobuyer_count === "number" ? answers.cobuyer_count : 0
  const creditTier =
    (answers.credit_range as MoneyPictureVisualState["creditTier"]) ?? null

  // Look up market data
  const targetCityValue = (answers.target_city as string) ?? ""
  const cityData = cities.find((c) => c.value === targetCityValue)
  const marketMedian = cityData?.medianPrice ?? 0
  const marketCity = cityData?.label ?? ""

  const timeline = (answers.timeline as string) ?? null

  // Calculate buying power (only if we have income data)
  let soloMax = 0
  let groupMax = 0
  let unlockAmount = 0

  if (annualIncome > 0) {
    const inputs: CalculatorInputs = {
      annualIncome,
      savings,
      monthlyDebts,
      targetCity: targetCityValue,
      numberOfCoBuyers: Math.max(1, coBuyerCount) as 1 | 2 | 3 | 4,
    }

    const result = calculateAffordability(inputs)
    soloMax = result.soloMax
    groupMax = result.groupMax
    unlockAmount = result.unlockAmount
  }

  // Estimate monthly payment (solo: mortgage + taxes + insurance)
  const loanAmount = soloMax * 0.8 // 20% down
  const monthlyRate = 0.07 / 12
  const payments = 360
  const mortgagePayment =
    loanAmount > 0
      ? Math.round(
          loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
            (Math.pow(1 + monthlyRate, payments) - 1)
        )
      : 0
  // Add taxes (~1.1%) + insurance (~0.5%) monthly
  const monthlyTaxInsurance = Math.round((soloMax * 0.016) / 12)
  const totalMonthly = mortgagePayment + monthlyTaxInsurance

  // DTI ratio estimate
  const monthlyIncome = annualIncome / 12
  const dtiRatio =
    monthlyIncome > 0
      ? Math.min((monthlyDebts + totalMonthly) / monthlyIncome, 1)
      : 0

  // Affordability status
  let affordabilityStatus: MoneyPictureVisualState["affordabilityStatus"] =
    "unknown"
  if (groupMax > 0 && marketMedian > 0) {
    const ratio = groupMax / marketMedian
    if (ratio >= 1) affordabilityStatus = "within_reach"
    else if (ratio >= 0.75) affordabilityStatus = "stretch"
    else affordabilityStatus = "gap"
  }

  return {
    soloMax,
    groupMax,
    unlockAmount,
    monthlyPayment: totalMonthly,
    comfortableMonthly,
    creditTier,
    marketMedian,
    marketCity,
    coBuyerCount,
    timeline: timeline ? TIMELINE_LABELS[timeline] ?? timeline : null,
    affordabilityStatus,
    dtiRatio,
  }
}

export { formatCurrency }
