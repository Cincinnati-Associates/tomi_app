/**
 * @module Calculator Types
 * @description TypeScript interfaces for the co-ownership calculator
 */

export interface Person {
  id: string;
  name: string;
  downPaymentContribution: number;
  estimatedMonthlyContribution: number;
}

export interface MortgageDetails {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  bedrooms: number;
}

export interface ProFormaScenario {
  id: string;
  months: number;
  estimatedHomeValue: number;
  annualAppreciation: number;
}

export enum TaxConsideration {
  None = 'None',
  Section121 = 'Section 121 Exclusion',
  TenThirtyOneExchange = '1031 Exchange',
}

export interface ProformaPerson extends Person {
  percentageAtScenario: number;
  equityAtScenario: number;
  totalContributedAtScenario: number;
  taxConsideration: TaxConsideration;
}

export interface PropertyData {
  address: string;
  city: string;
  province: string;
  mostRecentPriceAmount: string;
  numBedroom: string;
  numBathroom: string;
  floorSizeValue: string;
  lotSizeValue: string;
  lotSizeUnit: string;
  imageURLs: string[];
}

export type CalcMode = 'top-down' | 'bottoms-up';
