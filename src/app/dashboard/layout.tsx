"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { useAuthContext } from "@/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout — if loading takes > 5s, redirect to home
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Redirect if not authenticated after loading resolves (or on timeout)
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
    <>
      <AppNavbar />
      <div className="min-h-screen pt-14">
        {children}
      </div>
    </>
  );
}
