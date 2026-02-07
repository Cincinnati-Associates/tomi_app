"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserSearchBar } from "@/components/admin/UserSearchBar";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
  journey: { stage: string; readiness_score: number | null } | null;
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (q: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "25" });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(query, page);
  }, [query, page, fetchUsers]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: "bg-red-500/15 text-red-600 dark:text-red-400",
      admin: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
      user: "bg-muted text-muted-foreground",
    };
    return (
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-xs font-medium",
          colors[role] || colors.user
        )}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data ? `${data.total} total users` : "Loading..."}
          </p>
        </div>
        <UserSearchBar onSearch={handleSearch} />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Stage
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Readiness
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {query ? "No users match your search" : "No users yet"}
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {user.full_name || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email || "—"}
                    </td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground capitalize">
                        {user.journey?.stage?.replace(/_/g, " ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.journey?.readiness_score != null
                        ? `${user.journey.readiness_score}/100`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
