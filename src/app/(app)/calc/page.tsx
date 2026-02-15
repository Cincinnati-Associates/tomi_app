import { Metadata } from "next";
import { CalculatorPage } from "@/components/calc";

export const metadata: Metadata = {
  title: "Co-Ownership Calculator",
  description: "Calculate ownership splits, payment schedules, and returns for co-owned properties.",
  openGraph: {
    title: "Co-Ownership Calculator | Tomi",
    description: "Calculate ownership splits, payment schedules, and returns for co-owned properties.",
  },
};

// Force dynamic rendering since we use auth state
export const dynamic = 'force-dynamic';

export default function CalcPage() {
  return <CalculatorPage />;
}
