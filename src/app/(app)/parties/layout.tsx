"use client";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { useAuthContext } from "@/providers/AuthProvider";

export default function PartiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthContext();

  // Auth redirect is handled by middleware
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen pt-14">
        {children}
      </div>
    </>
  );
}
