import { Metadata } from "next";
import { HowItWorksPage } from "@/components/how-it-works/HowItWorksPage";

export const metadata: Metadata = {
  title: "How Co-Ownership Works | Tomi",
  description:
    "Learn how shared homeownership can multiply your buying power. Discover the history of co-buying across cultures and how Tomi makes it easier than ever.",
  keywords: [
    "co-ownership",
    "shared homeownership",
    "co-buying a home",
    "tenants in common",
    "TIC",
    "buy a home with friends",
    "shared equity",
    "home buying power",
  ],
  openGraph: {
    title: "How Co-Ownership Works | Tomi",
    description:
      "Discover how people around the world have built wealth through shared homeownership — and how you can too.",
  },
};

export default function HowItWorks() {
  return <HowItWorksPage />;
}
