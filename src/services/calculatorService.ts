/**
 * @module calculatorService
 * @description Pure functions for Time Value of Money (TVM) calculations
 * Used for mortgage payment calculations, amortization, and affordability modeling
 */

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (as percentage, e.g., 6.5)
 * @param termYears - Loan term in years
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termYears: number
): number => {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  // Standard amortization formula: PMT = P * (r(1+r)^n) / ((1+r)^n - 1)
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return payment;
};

/**
 * Calculate remaining loan balance at a given point in time
 * @param principal - Original loan amount
 * @param annualRate - Annual interest rate (as percentage)
 * @param termYears - Loan term in years
 * @param monthsElapsed - Number of months that have passed
 * @returns Remaining balance
 */
export const calculateRemainingBalance = (
  principal: number,
  annualRate: number,
  termYears: number,
  monthsElapsed: number
): number => {
  if (principal <= 0) return 0;
  if (monthsElapsed <= 0) return principal;

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  if (numberOfPayments <= monthsElapsed) return 0;
  if (monthlyRate === 0)
    return Math.max(0, principal - (principal / numberOfPayments) * monthsElapsed);

  // Amortization formula for remaining balance
  const balance =
    principal *
    ((Math.pow(1 + monthlyRate, numberOfPayments) -
      Math.pow(1 + monthlyRate, monthsElapsed)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1));

  return Math.max(0, balance);
};

/**
 * Calculate maximum loan amount based on monthly budget (reverse calculation)
 * Used for "Bottoms-Up" affordability modeling
 * @param monthlyBudget - Total monthly payment budget
 * @param annualRate - Annual interest rate (as percentage)
 * @param termYears - Loan term in years
 * @returns Maximum loan amount
 */
export const calculateMaxLoanAmount = (
  monthlyBudget: number,
  annualRate: number,
  termYears: number
): number => {
  if (monthlyBudget <= 0 || termYears <= 0) return 0;
  if (annualRate <= 0) return monthlyBudget * termYears * 12;

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  // Present Value formula: PV = PMT * ( (1 - (1+r)^-n) / r )
  const maxLoan =
    monthlyBudget *
    ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);

  return Math.round(maxLoan);
};
