"use client"

import { useAuthContext } from '@/providers/AuthProvider'
import Link from 'next/link'
import { User, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { AppNavbar } from '@/components/layout/AppNavbar'

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', icon: User },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuthContext()
  const pathname = usePathname()

  // Auth redirect is handled by middleware
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen pt-14 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <nav className="w-full md:w-48 flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
              <ul className="space-y-1">
                {settingsNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
