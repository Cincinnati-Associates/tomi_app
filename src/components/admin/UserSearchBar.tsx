"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface UserSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function UserSearchBar({
  onSearch,
  placeholder = "Search by email, name, or user ID...",
}: UserSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") onSearch("");
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </form>
  );
}
