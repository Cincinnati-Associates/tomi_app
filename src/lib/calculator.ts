import type { CalculatorInputs, CalculatorResult } from "@/types";

// Common cities with median home prices (simplified for demo)
export const cities = [
  { value: "san-francisco", label: "San Francisco, CA", medianPrice: 1200000 },
  { value: "los-angeles", label: "Los Angeles, CA", medianPrice: 850000 },
  { value: "new-york", label: "New York, NY", medianPrice: 750000 },
  { value: "seattle", label: "Seattle, WA", medianPrice: 780000 },
  { value: "denver", label: "Denver, CO", medianPrice: 580000 },
  { value: "austin", label: "Austin, TX", medianPrice: 520000 },
  { value: "miami", label: "Miami, FL", medianPrice: 480000 },
  { value: "chicago", label: "Chicago, IL", medianPrice: 340000 },
  { value: "phoenix", label: "Phoenix, AZ", medianPrice: 420000 },
  { value: "other", label: "Other / National Average", medianPrice: 430000 },
];

export function calculateAffordability(inputs: CalculatorInputs): CalculatorResult {
  const { annualIncome, savings, monthlyDebts, numberOfCoBuyers } = inputs;

  // Calculate solo affordability
  const soloMax = calculateMaxHome(annualIncome, savings, monthlyDebts);

  // Calculate group affordability (assume equal contributions)
  const groupAnnualIncome = annualIncome * numberOfCoBuyers;
  const groupSavings = savings * numberOfCoBuyers;
  const groupMonthlyDebts = monthlyDebts * numberOfCoBuyers;
  const groupMax = calculateMaxHome(groupAnnualIncome, groupSavings, groupMonthlyDebts);

  return {
    soloMax: Math.round(soloMax / 1000) * 1000,
    groupMax: Math.round(groupMax / 1000) * 1000,
    unlockAmount: Math.round((groupMax - soloMax) / 1000) * 1000,
  };
}

function calculateMaxHome(
  annualIncome: number,
  savings: number,
  monthlyDebts: number
): number {
  const monthlyIncome = annualIncome / 12;

  // Use 43% DTI ratio limit (standard for qualified mortgages)
  const dti = 0.43;
  const maxMonthlyPayment = monthlyIncome * dti - monthlyDebts;

  // If max payment is negative or too low, return 0
  if (maxMonthlyPayment <= 0) {
    return 0;
  }

  // Assume 7% interest rate, 30-year mortgage, 20% down payment
  const interestRate = 0.07;
  const monthlyRate = interestRate / 12;
  const numberOfPayments = 360; // 30 years

  // Calculate maximum loan amount using mortgage payment formula
  // P = L * [r(1+r)^n] / [(1+r)^n - 1]
  // Solving for L: L = P * [(1+r)^n - 1] / [r(1+r)^n]
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const loanAmount = maxMonthlyPayment * ((factor - 1) / (monthlyRate * factor));

  // Convert loan to home price (assuming 20% down)
  const homeFromIncome = loanAmount / 0.8;

  // Also calculate based on down payment available (assuming 20% down needed)
  const homeFromSavings = savings / 0.2;

  // Return the minimum of both constraints
  return Math.min(homeFromIncome, homeFromSavings);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
