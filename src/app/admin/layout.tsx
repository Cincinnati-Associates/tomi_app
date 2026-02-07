"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAuthContext } from "@/providers/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, isAdmin } = useAuthContext();
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
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [timedOut, isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen pt-14">{children}</div>
    </>
  );
}
