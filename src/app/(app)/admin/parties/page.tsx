"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserSearchBar } from "@/components/admin/UserSearchBar";
import { cn } from "@/lib/utils";

const statusTabs = [
  { value: "", label: "All" },
  { value: "forming", label: "Forming" },
  { value: "active", label: "Active" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

interface PartyRow {
  id: string;
  name: string;
  status: string;
  target_city: string | null;
  target_budget: string | null;
  created_at: string;
  member_count: number;
}

interface PartiesResponse {
  parties: PartyRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPartiesPage() {
  const [data, setData] = useState<PartiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchParties = useCallback(
    async (q: string, status: string, p: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: "25" });
        if (q) params.set("q", q);
        if (status) params.set("status", status);
        const res = await fetch(`/api/admin/parties?${params}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch parties:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchParties(query, statusFilter, page);
  }, [query, statusFilter, page, fetchParties]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buying Parties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data ? `${data.total} total parties` : "Loading..."}
          </p>
        </div>
        <UserSearchBar
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
          placeholder="Search by name, city, or ID..."
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              statusFilter === tab.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
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
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Members
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  City
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Budget
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Created
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
              ) : data?.parties.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No parties found
                  </td>
                </tr>
              ) : (
                data?.parties.map((party) => (
                  <tr
                    key={party.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/parties/${party.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {party.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                        {party.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {party.member_count}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {party.target_city || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {party.target_budget
                        ? `$${Number(party.target_budget).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(party.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
