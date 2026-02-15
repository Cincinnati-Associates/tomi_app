"use client";

import { useEffect, useState } from "react";
import { Users, Building, ClipboardCheck, UserPlus } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

interface AdminStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  usersByStage: Record<string, number>;
  totalParties: number;
  partiesByStatus: Record<string, number>;
  totalExerciseResponses: number;
  exercisesByStatus: Record<string, number>;
  recentSignups30d: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedExercises = stats?.exercisesByStatus?.completed || 0;
  const totalExercises = stats?.totalExerciseResponses || 0;
  const completionRate =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">
          Platform health and key metrics
        </p>
      </div>

      {/* Top-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.recentSignups30d || 0} in last 30 days`}
          icon={Users}
        />
        <StatCard
          title="Buying Parties"
          value={stats?.totalParties || 0}
          subtitle={`${stats?.partiesByStatus?.active || 0} active`}
          icon={Building}
        />
        <StatCard
          title="Exercise Responses"
          value={totalExercises}
          subtitle={`${completionRate}% completion rate`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Recent Signups"
          value={stats?.recentSignups30d || 0}
          subtitle="Last 30 days"
          icon={UserPlus}
        />
      </div>

      {/* Breakdown sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users by Stage */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Users by Journey Stage
          </h3>
          {stats?.usersByStage &&
          Object.keys(stats.usersByStage).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.usersByStage).map(([stage, count]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground capitalize">
                    {stage.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No journey data yet
            </p>
          )}
        </div>

        {/* Parties by Status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Parties by Status
          </h3>
          {stats?.partiesByStatus &&
          Object.keys(stats.partiesByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.partiesByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No parties yet</p>
          )}
        </div>

        {/* Users by Role */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Users by Role
          </h3>
          {stats?.usersByRole && (
            <div className="space-y-3">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground capitalize">
                    {role}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Completion */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Exercise Status
          </h3>
          {stats?.exercisesByStatus &&
          Object.keys(stats.exercisesByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.exercisesByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No exercise data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
