/**
 * Risk & Exit Preferences — Labels for summary rendering
 */

export const RISK_EXIT_LABELS = {
  riskToleranceLabels: {
    conservative: "Conservative",
    moderate: "Moderate",
    flexible: "Flexible",
  } as Record<string, string>,

  worryLabels: {
    cant_pay: "Someone can't pay",
    loses_value: "Property loses value",
    major_repairs: "Unexpected repairs",
    legal_disputes: "Legal disputes",
    locked_in: "Being locked in",
  } as Record<string, string>,

  jobLossLabels: {
    grace_period: "Grace period (3-6 months)",
    immediate_restructure: "Immediate restructure",
    trigger_buyout: "Trigger buyout discussion",
  } as Record<string, string>,

  earlySellLabels: {
    right_of_first_refusal: "Right of first refusal",
    open_market: "Open market sale",
    mandatory_buyout: "Mandatory buyout",
  } as Record<string, string>,

  disputeLabels: {
    mediation: "Mediation first",
    arbitration: "Binding arbitration",
    legal: "Legal action",
  } as Record<string, string>,

  holdPeriodLabels: {
    no_minimum: "No minimum",
    "2_years": "2 years",
    "3_years": "3 years",
    "5_years": "5 years",
    unanimous: "Until all agree",
  } as Record<string, string>,

  buyoutLabels: {
    appraised: "Appraised value",
    formula: "Formula-based",
    negotiated: "Negotiated",
  } as Record<string, string>,

  dealBreakerLabels: {
    criminal_activity: "Criminal activity",
    non_payment: "Repeated non-payment",
    unauthorized_mods: "Unauthorized modifications",
    subletting: "Subletting without consent",
    bankruptcy: "Bankruptcy filing",
    none: "None",
  } as Record<string, string>,
}
