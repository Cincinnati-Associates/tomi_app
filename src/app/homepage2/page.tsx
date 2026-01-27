"use client";

import { useState } from "react";
import { HeroVariant } from "@/components/home/HeroVariant";
import { UnlockSection } from "@/components/home/UnlockSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ObjectionCards } from "@/components/home/ObjectionCards";
import { StoryPreview } from "@/components/home/StoryPreview";
import { TomiDifference } from "@/components/home/TomiDifference";
import { FinalCta } from "@/components/home/FinalCta";
import { HomiChat } from "@/components/shared/HomiChat";
import { HomiChatTrigger } from "@/components/shared/HomiChatTrigger";

/**
 * Homepage Variant 2: The Financial Play
 * Goal: Test if users are driven by utility and math
 * (i.e., solving the "priced out" problem).
 */
export default function Homepage2() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>();

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
            How do I buy a home
            <br />
            <span className="text-primary">with friends or family?</span>
          </>
        }
        subheadline={
          <>
            Co-buying lets you afford the home, the neighborhood, the life you want—with the people you want in it.
            <br className="hidden sm:block" />
            <span className="font-semibold text-foreground">
              Tomi makes it easy, legal, and lasting.
            </span>
          </>
        }
        primaryCta={{
          text: "See what you can afford",
          href: "/calc",
        }}
        onOpenChat={handleOpenChat}
        showTypewriter
      />
      <UnlockSection
        header="What can I afford if I co-buy?"
        subheader="See how co-ownership unlocks better homes in better neighborhoods"
      />
      <HowItWorks header="How do I buy a home with a co-owner?" />
      <ObjectionCards
        header="What are the risks of co-owning a home?"
        subheader="Every concern you have, we've thought through."
      />
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
    </>
  );
}
