"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Settings, Home } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthContext } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/co-ownership-history", label: "Storytime" },
  { href: "/assessment", label: "Assessment" },
];

export function Navbar({ hideOnScroll = false }: { hideOnScroll?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { isAuthenticated, profile, isLoading, signOut } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-user-menu]')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  // Check for signin query param (set by middleware for protected routes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === 'true') {
      setIsAuthModalOpen(true);
      // Clean up URL but preserve redirect param for the auth flow
      const url = new URL(window.location.href);
      url.searchParams.delete('signin');
      const remaining = url.searchParams.toString();
      window.history.replaceState({}, '', remaining ? `${url.pathname}?${remaining}` : url.pathname);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/95 shadow-sm"
            : "bg-transparent",
          hideOnScroll && isScrolled && "-translate-y-full"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo - auto switches to yellow in dark mode */}
            <Link href="/" className="flex-shrink-0">
              <Logo variant="auto" className="h-7 md:h-8" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <ThemeToggle />

              {isLoading ? (
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="default" size="sm">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>

                  <div className="relative" data-user-menu>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1 rounded-full border border-border bg-card p-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
                        <div className="p-1">
                          <div className="px-3 py-2 border-b border-border mb-1">
                            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <Home className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
        isAuthenticated={isAuthenticated}
        profile={profile}
        onSignIn={() => {
          setIsMobileMenuOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
