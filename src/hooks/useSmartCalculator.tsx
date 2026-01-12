"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  SmartCalculatorState,
  CalculatorAction,
  SmartCalculatorContextValue,
  CoBuyer,
  OwnershipSplit,
  SmartCalculatorResults,
} from "@/types/calculator";
import { COBUYER_COLORS } from "@/types/calculator";

// Default primary buyer
const createDefaultBuyer = (
  id: string,
  name: string,
  colorIndex: number,
  defaults?: { downPaymentContribution?: number; monthlyBudget?: number }
): CoBuyer => ({
  id,
  name,
  annualIncome: 0,
  savings: 0,
  downPaymentContribution: defaults?.downPaymentContribution ?? 0,
  monthlyBudget: defaults?.monthlyBudget ?? 0,
  monthlyDebts: 0,
  color: COBUYER_COLORS[colorIndex % COBUYER_COLORS.length],
});

// Initial state - start with no co-buyers, they get created when user selects count
const initialState: SmartCalculatorState = {
  primaryBuyer: createDefaultBuyer("primary", "You", 0),
  coBuyerMode: "similar",
  coBuyers: [],
  targetCity: "austin",
  selectedExitYear: 5,
  hasCalculated: false,
  results: null,
};

// Calculate ownership splits based on down payment contributions
function calculateOwnershipSplits(
  primaryBuyer: CoBuyer,
  coBuyers: CoBuyer[],
  mode: "similar" | "detailed"
): OwnershipSplit[] {
  const allBuyers =
    mode === "similar"
      ? [
          primaryBuyer,
          ...coBuyers.map((cb) => ({
            ...cb,
            annualIncome: primaryBuyer.annualIncome,
            downPaymentContribution: primaryBuyer.downPaymentContribution,
            monthlyBudget: primaryBuyer.monthlyBudget,
            monthlyDebts: primaryBuyer.monthlyDebts,
          })),
        ]
      : [primaryBuyer, ...coBuyers];

  // Use downPaymentContribution for ownership splits (falls back to savings for legacy)
  const totalContribution = allBuyers.reduce(
    (sum, b) => sum + (b.downPaymentContribution || b.savings || 0),
    0
  );

  if (totalContribution === 0) {
    // Equal split if no contribution data
    const equalShare = 100 / allBuyers.length;
    return allBuyers.map((buyer) => ({
      buyerId: buyer.id,
      buyerName: buyer.name,
      percentage: equalShare,
      equityValue: 0,
      color: buyer.color,
    }));
  }

  return allBuyers.map((buyer) => {
    const contribution = buyer.downPaymentContribution || buyer.savings || 0;
    return {
      buyerId: buyer.id,
      buyerName: buyer.name,
      percentage: (contribution / totalContribution) * 100,
      equityValue: contribution,
      color: buyer.color,
    };
  });
}

// Calculate max home price based on down payment and monthly budget
function calculateMaxHomePrice(
  totalDownPayment: number,
  totalMonthlyBudget: number
): number {
  // Mortgage parameters
  const interestRate = 0.07; // 7% annual
  const monthlyRate = interestRate / 12;
  const numberOfPayments = 360; // 30 years
  const downPaymentPercent = 0.20; // 20% down

  // Include property taxes (~1.2%) and insurance (~0.5%) in monthly payment
  const annualTaxAndInsuranceRate = 0.017; // 1.7% of home value annually
  const monthlyTaxAndInsuranceRate = annualTaxAndInsuranceRate / 12;

  // Max home price based on down payment (if putting 20% down)
  const maxFromDownPayment = totalDownPayment / downPaymentPercent;

  // Max home price based on monthly budget
  // Monthly payment = mortgage P&I + taxes + insurance
  // We need to solve for home price where:
  // totalMonthlyBudget = mortgagePayment + (homePrice * monthlyTaxAndInsuranceRate)
  //
  // mortgagePayment = loanAmount * [r(1+r)^n] / [(1+r)^n - 1]
  // loanAmount = homePrice * (1 - downPaymentPercent)
  //
  // Let's solve iteratively or algebraically:
  // Let HP = home price, DP = down payment percent, r = monthly rate, n = payments
  // Loan = HP * (1 - DP)
  // Mortgage factor = r(1+r)^n / [(1+r)^n - 1]
  // Monthly mortgage = Loan * factor = HP * (1-DP) * factor
  // Monthly tax+ins = HP * monthlyTaxInsRate
  // Total = HP * (1-DP) * factor + HP * monthlyTaxInsRate
  // Total = HP * [(1-DP) * factor + monthlyTaxInsRate]
  // HP = Total / [(1-DP) * factor + monthlyTaxInsRate]

  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const mortgageFactor = (monthlyRate * factor) / (factor - 1);
  const combinedFactor =
    (1 - downPaymentPercent) * mortgageFactor + monthlyTaxAndInsuranceRate;

  const maxFromMonthlyBudget = totalMonthlyBudget / combinedFactor;

  // Return the minimum constraint (you're limited by whichever is lower)
  return Math.min(maxFromDownPayment, maxFromMonthlyBudget);
}

// Calculate full results
function calculateResults(
  state: SmartCalculatorState
): SmartCalculatorResults | null {
  const { primaryBuyer, coBuyers, coBuyerMode } = state;

  // Check if we have the required inputs (using new fields)
  const hasDownPayment = primaryBuyer.downPaymentContribution > 0;
  const hasMonthlyBudget = primaryBuyer.monthlyBudget > 0;

  if (!hasDownPayment && !hasMonthlyBudget) {
    return null;
  }

  // Get all buyers based on mode
  const allBuyers =
    coBuyerMode === "similar"
      ? [
          primaryBuyer,
          ...coBuyers.map((cb) => ({
            ...cb,
            downPaymentContribution: primaryBuyer.downPaymentContribution,
            monthlyBudget: primaryBuyer.monthlyBudget,
          })),
        ]
      : [primaryBuyer, ...coBuyers];

  // Calculate totals
  const totalDownPayment = allBuyers.reduce(
    (sum, b) => sum + (b.downPaymentContribution || 0),
    0
  );
  const totalMonthlyBudget = allBuyers.reduce(
    (sum, b) => sum + (b.monthlyBudget || 0),
    0
  );

  // Calculate solo max (just the primary buyer)
  const soloMax = calculateMaxHomePrice(
    primaryBuyer.downPaymentContribution || 0,
    primaryBuyer.monthlyBudget || 0
  );

  // Calculate group max (all buyers combined)
  const groupMax = calculateMaxHomePrice(totalDownPayment, totalMonthlyBudget);

  const unlockAmount = groupMax - soloMax;

  // Calculate ownership splits
  const ownershipAtClose = calculateOwnershipSplits(
    primaryBuyer,
    coBuyers,
    coBuyerMode
  );

  // Calculate monthly payment for the group max home
  const loanAmount = groupMax * 0.8; // 80% loan (20% down)
  const monthlyRate = 0.07 / 12;
  const numberOfPayments = 360;
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthlyMortgage =
    loanAmount * ((monthlyRate * factor) / (factor - 1)) || 0;
  // Add taxes and insurance
  const monthlyTaxAndInsurance = groupMax * (0.017 / 12);
  const monthlyPayment = monthlyMortgage + monthlyTaxAndInsurance;

  return {
    soloMax: Math.round(soloMax / 1000) * 1000,
    groupMax: Math.round(groupMax / 1000) * 1000,
    unlockAmount: Math.round(unlockAmount / 1000) * 1000,
    monthlyPayment: Math.round(monthlyPayment),
    ownershipAtClose,
  };
}

// Reducer
function smartCalculatorReducer(
  state: SmartCalculatorState,
  action: CalculatorAction
): SmartCalculatorState {
  switch (action.type) {
    case "SET_PRIMARY_INCOME":
      return {
        ...state,
        primaryBuyer: { ...state.primaryBuyer, annualIncome: action.payload },
        hasCalculated: false,
      };

    case "SET_PRIMARY_SAVINGS":
      return {
        ...state,
        primaryBuyer: { ...state.primaryBuyer, savings: action.payload },
        hasCalculated: false,
      };

    case "SET_PRIMARY_DOWN_PAYMENT":
      return {
        ...state,
        primaryBuyer: {
          ...state.primaryBuyer,
          downPaymentContribution: action.payload,
          savings: action.payload, // Keep in sync for backward compatibility
        },
        hasCalculated: false,
      };

    case "SET_PRIMARY_MONTHLY_BUDGET":
      return {
        ...state,
        primaryBuyer: { ...state.primaryBuyer, monthlyBudget: action.payload },
        hasCalculated: false,
      };

    case "SET_PRIMARY_DEBTS":
      return {
        ...state,
        primaryBuyer: { ...state.primaryBuyer, monthlyDebts: action.payload },
        hasCalculated: false,
      };

    case "SET_PRIMARY_NAME":
      return {
        ...state,
        primaryBuyer: { ...state.primaryBuyer, name: action.payload },
      };

    case "SET_CITY":
      return {
        ...state,
        targetCity: action.payload,
        hasCalculated: false,
      };

    case "SET_COBUYER_MODE":
      return {
        ...state,
        coBuyerMode: action.payload,
        hasCalculated: false,
      };

    case "SET_COBUYER_COUNT": {
      const newCount = Math.max(1, Math.min(3, action.payload)); // 1-3 co-buyers

      // Always recreate all co-buyers with primary's current values
      // This ensures they're pre-populated correctly even if some existed before
      const newCoBuyers: CoBuyer[] = [];
      for (let i = 0; i < newCount; i++) {
        newCoBuyers.push(
          createDefaultBuyer(`cobuyer-${i + 1}`, `Co-owner ${i + 1}`, i + 1, {
            downPaymentContribution: state.primaryBuyer.downPaymentContribution,
            monthlyBudget: state.primaryBuyer.monthlyBudget,
          })
        );
      }

      return {
        ...state,
        coBuyers: newCoBuyers,
        hasCalculated: false,
      };
    }

    case "UPDATE_COBUYER": {
      const { index, data } = action.payload;
      if (index < 0 || index >= state.coBuyers.length) return state;

      const newCoBuyers = [...state.coBuyers];
      newCoBuyers[index] = { ...newCoBuyers[index], ...data };

      return {
        ...state,
        coBuyers: newCoBuyers,
        hasCalculated: false,
      };
    }

    case "SET_EXIT_YEAR":
      return {
        ...state,
        selectedExitYear: action.payload,
      };

    case "CALCULATE": {
      const results = calculateResults(state);
      return {
        ...state,
        hasCalculated: true,
        results,
      };
    }

    case "RESET":
      return initialState;

    case "HYDRATE":
      return {
        ...state,
        ...action.payload,
        hasCalculated: false,
      };

    default:
      return state;
  }
}

// Context
const SmartCalculatorContext =
  createContext<SmartCalculatorContextValue | null>(null);

// Provider component
export function SmartCalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(smartCalculatorReducer, initialState);

  const setIncome = useCallback(
    (income: number) => dispatch({ type: "SET_PRIMARY_INCOME", payload: income }),
    []
  );

  const setSavings = useCallback(
    (savings: number) =>
      dispatch({ type: "SET_PRIMARY_SAVINGS", payload: savings }),
    []
  );

  const setDownPayment = useCallback(
    (amount: number) =>
      dispatch({ type: "SET_PRIMARY_DOWN_PAYMENT", payload: amount }),
    []
  );

  const setMonthlyBudget = useCallback(
    (amount: number) =>
      dispatch({ type: "SET_PRIMARY_MONTHLY_BUDGET", payload: amount }),
    []
  );

  const setDebts = useCallback(
    (debts: number) => dispatch({ type: "SET_PRIMARY_DEBTS", payload: debts }),
    []
  );

  const updateCoBuyer = useCallback(
    (index: number, data: Partial<CoBuyer>) =>
      dispatch({ type: "UPDATE_COBUYER", payload: { index, data } }),
    []
  );

  const setCity = useCallback(
    (city: string) => dispatch({ type: "SET_CITY", payload: city }),
    []
  );

  const setCoBuyerCount = useCallback(
    (count: number) => dispatch({ type: "SET_COBUYER_COUNT", payload: count }),
    []
  );

  const setCoBuyerMode = useCallback(
    (mode: "similar" | "detailed") =>
      dispatch({ type: "SET_COBUYER_MODE", payload: mode }),
    []
  );

  const setExitYear = useCallback(
    (year: number) => dispatch({ type: "SET_EXIT_YEAR", payload: year }),
    []
  );

  const calculate = useCallback(() => dispatch({ type: "CALCULATE" }), []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value: SmartCalculatorContextValue = {
    state,
    dispatch,
    setIncome,
    setSavings,
    setDownPayment,
    setMonthlyBudget,
    setDebts,
    setCity,
    setCoBuyerCount,
    setCoBuyerMode,
    updateCoBuyer,
    setExitYear,
    calculate,
    reset,
  };

  return (
    <SmartCalculatorContext.Provider value={value}>
      {children}
    </SmartCalculatorContext.Provider>
  );
}

// Hook to use calculator context
export function useSmartCalculator(): SmartCalculatorContextValue {
  const context = useContext(SmartCalculatorContext);
  if (!context) {
    throw new Error(
      "useSmartCalculator must be used within a SmartCalculatorProvider"
    );
  }
  return context;
}
