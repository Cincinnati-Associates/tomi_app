export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface CalculatorInputs {
  annualIncome: number;
  savings: number;
  monthlyDebts: number;
  targetCity: string;
  numberOfCoBuyers: 1 | 2 | 3 | 4;
}

export interface CalculatorResult {
  soloMax: number;
  groupMax: number;
  unlockAmount: number;
}

export interface Story {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  buyers: string[];
  homePrice: string;
  location: string;
}

export interface Resource {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
}
