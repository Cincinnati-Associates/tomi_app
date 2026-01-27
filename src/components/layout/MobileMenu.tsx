"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Home, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/user";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  isAuthenticated?: boolean;
  profile?: Profile | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  links,
  isAuthenticated,
  profile,
  onSignIn,
  onSignOut,
}: MobileMenuProps) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl md:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4">
                <Logo variant="auto" className="h-7" />
                <button
                  type="button"
                  className="rounded-md p-2 text-foreground"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Section (if authenticated) */}
              {isAuthenticated && profile && (
                <div className="border-b border-border px-4 pb-4">
                  <div className="flex items-center gap-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email || profile.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-1">
                  {isAuthenticated && (
                    <>
                      <motion.li
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
                          onClick={onClose}
                        >
                          <Home className="h-5 w-5" />
                          Dashboard
                        </Link>
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <Link
                          href="/settings/profile"
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
                          onClick={onClose}
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </motion.li>
                      <li className="py-2">
                        <hr className="border-border" />
                      </li>
                    </>
                  )}
                  {links.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (isAuthenticated ? index + 2 : index) * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className="block rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
                        onClick={onClose}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="border-t border-border px-4 py-6">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-500/10"
                    size="lg"
                    onClick={() => {
                      onSignOut?.();
                      onClose();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={onSignIn}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
