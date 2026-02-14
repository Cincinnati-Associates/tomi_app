import { Metadata } from "next";
import { SmartCalculatorPage } from "@/components/calculator";

export const metadata: Metadata = {
  title: "Smart Calculator",
  description:
    "Chat with Homi to discover how much more home you could afford by co-buying. See your buying power, ownership splits, and equity growth over time.",
  openGraph: {
    title: "Smart Co-Ownership Calculator | Tomi",
    description:
      "Discover how co-ownership can multiply your buying power. Chat with our AI to explore what you could afford together.",
  },
};

export default function CalculatorPage() {
  return <SmartCalculatorPage />;
}
