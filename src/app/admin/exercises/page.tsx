"use client";

import { useEffect, useState } from "react";

interface ExerciseStats {
  id: string;
  slug: string;
  name: string;
  category: string;
  is_active: boolean;
  total_responses: number;
  completed_count: number;
  in_progress_count: number;
  completion_rate: number;
}

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await fetch("/api/admin/exercises/stats");
        if (res.ok) {
          const data = await res.json();
          setExercises(data.exercises);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercises();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Exercise Templates
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {exercises.length} templates
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Exercise
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Active
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Completed
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {exercises.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No exercise templates found. Seed them first.
                  </td>
                </tr>
              ) : (
                exercises.map((ex) => (
                  <tr
                    key={ex.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {ex.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {ex.slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {ex.category}
                    </td>
                    <td className="px-4 py-3">
                      {ex.is_active ? (
                        <span className="text-green-600 dark:text-green-400">
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ex.total_responses}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ex.completed_count}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ex.completion_rate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
