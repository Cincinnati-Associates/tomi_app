import { Metadata } from "next";
import { AssessmentPage } from "@/components/assessment";

export const metadata: Metadata = {
  title: "Co-Ownership Readiness Assessment | Tomi",
  description:
    "Take our quick assessment to find out if you're ready for co-ownership. Get personalized recommendations based on your financial situation, co-buyer readiness, and goals.",
  openGraph: {
    title: "Are You Ready for Co-Ownership? | Tomi",
    description:
      "Take our co-ownership readiness assessment and get a personalized score with next steps for your home buying journey.",
  },
};

export default function AssessmentRoute() {
  return <AssessmentPage />;
}
