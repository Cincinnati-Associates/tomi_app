"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { HeroVariant } from "@/components/home/HeroVariant";
import { ImpactStatement } from "@/components/home/ImpactStatement";
import { UnlockSection } from "@/components/home/UnlockSection";
import { HowItWorks } from "@/components/home/HowItWorks";

// Below-fold sections: dynamically imported to reduce initial JS payload
const NoCostSection = dynamic(() => import("@/components/home/NoCostSection").then(mod => ({ default: mod.NoCostSection })), { ssr: true });
const AIConciergeSection = dynamic(() => import("@/components/home/AIConciergeSection").then(mod => ({ default: mod.AIConciergeSection })), { ssr: true });
const AgreementSection = dynamic(() => import("@/components/home/AgreementSection").then(mod => ({ default: mod.AgreementSection })), { ssr: true });
const StoryPreview = dynamic(() => import("@/components/home/StoryPreview").then(mod => ({ default: mod.StoryPreview })), { ssr: true });
const TomiDifference = dynamic(() => import("@/components/home/TomiDifference").then(mod => ({ default: mod.TomiDifference })), { ssr: true });
const FinalCta = dynamic(() => import("@/components/home/FinalCta").then(mod => ({ default: mod.FinalCta })), { ssr: true });

// Interactive modals: only load when triggered (no SSR needed)
const HomiChat = dynamic(() => import("@/components/shared/HomiChat").then(mod => ({ default: mod.HomiChat })), { ssr: false });
const HomiChatTrigger = dynamic(() => import("@/components/shared/HomiChatTrigger").then(mod => ({ default: mod.HomiChatTrigger })), { ssr: false });
const AuthModal = dynamic(() => import("@/components/auth/AuthModal").then(mod => ({ default: mod.AuthModal })), { ssr: false });

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenChat = (message?: string) => {
    setInitialChatMessage(message);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setInitialChatMessage(undefined);
  };

  return (
    <>
      <HeroVariant
        headline={
          <>
            How Do You Buy a Home
            <br />
            <span className="text-primary">You Can&apos;t Afford?</span>
          </>
        }
        subheadline={<>Introducing the easiest, most affordable, and rewarding way to<br className="hidden md:inline" /> own a home with someone you aren&apos;t married to.</>}
        ctaLabel="See if you qualify for a"
        primaryCta={{
          text: "Free Tomi TIC Agreement",
          href: "/assessment",
        }}
        onOpenChat={handleOpenChat}
        showTypewriter
      />
      <UnlockSection
        header={<>What if your barrier to homeownership wasn&apos;t cost<br />but instead coordination?</>}
        subheader=""
      />
      <ImpactStatement header="Every year, more than 1.7 million Americans buy a home with family or friends." />
      <HowItWorks header="works" subheader="Your shared home concierge, with you every step of the way." />
      <NoCostSection onOpenChat={handleOpenChat} />
      <AIConciergeSection onOpenChat={handleOpenChat} />
      <AgreementSection />
      <StoryPreview />
      <TomiDifference />
      <FinalCta onOpenChat={() => handleOpenChat()} />

      {/* Floating chat trigger */}
      <HomiChatTrigger onClick={() => handleOpenChat()} />

      {/* Chat modal */}
      <HomiChat
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        initialMessage={initialChatMessage}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
