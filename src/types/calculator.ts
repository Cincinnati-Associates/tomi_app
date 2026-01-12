// Smart Calculator Types

export interface CoBuyer {
  id: string;
  name: string;
  annualIncome: number;
  savings: number; // Legacy - use downPaymentContribution
  downPaymentContribution: number;
  monthlyBudget: number;
  monthlyDebts: number;
  color: string; // For pie chart segments
}

export interface OwnershipSplit {
  buyerId: string;
  buyerName: string;
  percentage: number;
  equityValue: number;
  color: string;
}

export interface SmartCalculatorState {
  // Primary buyer
  primaryBuyer: CoBuyer;

  // Co-buyers configuration
  coBuyerMode: "similar" | "detailed";
  coBuyers: CoBuyer[]; // 1-3 additional co-buyers

  // Home details
  targetCity: string;

  // Visualization state
  selectedExitYear: number; // 1-30

  // Calculation state
  hasCalculated: boolean;

  // Results (computed)
  results: SmartCalculatorResults | null;
}

export interface SmartCalculatorResults {
  soloMax: number;
  groupMax: number;
  unlockAmount: number;
  monthlyPayment: number;
  ownershipAtClose: OwnershipSplit[];
}

export type CalculatorAction =
  | { type: "SET_PRIMARY_INCOME"; payload: number }
  | { type: "SET_PRIMARY_SAVINGS"; payload: number }
  | { type: "SET_PRIMARY_DOWN_PAYMENT"; payload: number }
  | { type: "SET_PRIMARY_MONTHLY_BUDGET"; payload: number }
  | { type: "SET_PRIMARY_DEBTS"; payload: number }
  | { type: "SET_PRIMARY_NAME"; payload: string }
  | { type: "SET_CITY"; payload: string }
  | { type: "SET_COBUYER_MODE"; payload: "similar" | "detailed" }
  | { type: "SET_COBUYER_COUNT"; payload: number }
  | { type: "UPDATE_COBUYER"; payload: { index: number; data: Partial<CoBuyer> } }
  | { type: "SET_EXIT_YEAR"; payload: number }
  | { type: "CALCULATE" }
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: Partial<SmartCalculatorState> };

export interface SmartCalculatorContextValue {
  state: SmartCalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  // Convenience methods
  setIncome: (income: number) => void;
  setSavings: (savings: number) => void;
  setDownPayment: (amount: number) => void;
  setMonthlyBudget: (amount: number) => void;
  setDebts: (debts: number) => void;
  setCity: (city: string) => void;
  setCoBuyerCount: (count: number) => void;
  setCoBuyerMode: (mode: "similar" | "detailed") => void;
  updateCoBuyer: (index: number, data: Partial<CoBuyer>) => void;
  setExitYear: (year: number) => void;
  calculate: () => void;
  reset: () => void;
}

// Co-buyer colors for pie chart
export const COBUYER_COLORS = [
  "#2D5A4A", // Primary (Tomi Green)
  "#C4A35A", // Gold/Accent
  "#4A7C6B", // Light Green
  "#8B7355", // Warm Brown
];

// URL State encoding types
export interface ShareableState {
  v: number; // version
  p: {
    n?: string; // name
    i: number; // income
    s: number; // savings
    d: number; // debts
  };
  m: "s" | "d"; // mode: similar or detailed
  c: Array<{
    n?: string;
    i: number;
    s: number;
    d: number;
  }>;
  y: string; // city
}
