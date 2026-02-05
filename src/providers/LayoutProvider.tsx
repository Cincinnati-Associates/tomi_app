"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "./AuthProvider";

// Routes that are part of the authenticated app experience
const APP_ROUTES = ["/dashboard", "/settings", "/parties"];

// Routes that are marketing/public pages
const MARKETING_ROUTES = [
  "/",
  "/how-it-works",
  "/co-ownership-history",
  "/assessment",
  "/calc",
  "/calculator",
  "/homepage",
  "/homepage2",
  "/homepage3",
  "/homepage4",
];

type LayoutMode = "marketing" | "app";

interface LayoutContextType {
  /** Current layout mode based on route */
  mode: LayoutMode;
  /** Whether the current route is an app (authenticated) route */
  isAppRoute: boolean;
  /** Whether the current route is a marketing/public route */
  isMarketingRoute: boolean;
  /** Whether the user is authenticated (regardless of route) */
  isAuthenticated: boolean;
  /** Whether an authenticated user is browsing marketing pages */
  isAuthenticatedOnMarketing: boolean;
  /** Current pathname */
  pathname: string;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();

  const value = useMemo(() => {
    const isAppRoute = APP_ROUTES.some(route => pathname.startsWith(route));
    const isMarketingRoute = !isAppRoute;
    const mode: LayoutMode = isAppRoute ? "app" : "marketing";
    const isAuthenticatedOnMarketing = isAuthenticated && isMarketingRoute;

    return {
      mode,
      isAppRoute,
      isMarketingRoute,
      isAuthenticated,
      isAuthenticatedOnMarketing,
      pathname,
    };
  }, [pathname, isAuthenticated]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
