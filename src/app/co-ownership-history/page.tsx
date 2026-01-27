import { Metadata } from "next";
import { CoOwnershipHistoryPage } from "@/components/co-ownership-history/CoOwnershipHistoryPage";

export const metadata: Metadata = {
  title: "The History of Co-Ownership | Tomi",
  description:
    "Explore 300,000 years of shared living — from early humans to modern co-ownership. Discover how cultures around the world have always built together, and why it's coming back.",
  keywords: [
    "co-ownership history",
    "shared homeownership",
    "tenants in common",
    "TIC",
    "communal living",
    "co-buying",
    "housing affordability",
    "collective ownership",
  ],
  openGraph: {
    title: "The History of Co-Ownership | Tomi",
    description:
      "For 300,000 years, humans lived together. Discover how cultures around the world have always built together — and why co-ownership is the future of housing.",
    images: [
      {
        url: "/og-co-ownership-history.png",
        width: 1200,
        height: 630,
        alt: "The History of Co-Ownership - Tomi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The History of Co-Ownership | Tomi",
    description:
      "For 300,000 years, humans lived together. Discover how cultures around the world have always built together — and why co-ownership is the future of housing.",
    images: ["/og-co-ownership-history.png"],
  },
};

export default function CoOwnershipHistory() {
  return <CoOwnershipHistoryPage />;
}
