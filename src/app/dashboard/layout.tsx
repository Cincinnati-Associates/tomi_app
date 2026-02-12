"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { useAuthContext } from "@/providers/AuthProvider";
import { HomiChatProvider, useHomiChatContext } from "@/providers/HomiChatProvider";
import { AppSwipeShell } from "@/components/shared/AppSwipeShell";
import { HomiChatTrigger } from "@/components/shared/HomiChatTrigger";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { openChat } = useHomiChatContext();

  return (
    <>
      <AppSwipeShell>{children}</AppSwipeShell>
      {/* Floating Homi button */}
      <HomiChatTrigger
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-16 md:w-16"
      />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (timedOut || (!isLoading && !isAuthenticated)) {
      router.replace("/?signin=true");
    }
  }, [timedOut, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <HomiChatProvider>
      <AppNavbar />
      <div className="min-h-screen pt-14">
        <DashboardContent>{children}</DashboardContent>
      </div>
    </HomiChatProvider>
  );
}
