"use client";

import { useLayout } from "@/providers/LayoutProvider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function ConditionalNavbar() {
  const { isAppRoute } = useLayout();

  if (isAppRoute) {
    return null;
  }

  return <Navbar />;
}

export function ConditionalFooter() {
  const { isAppRoute } = useLayout();

  if (isAppRoute) {
    return null;
  }

  return <Footer />;
}
