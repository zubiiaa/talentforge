"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startTopLoader } from "@/components/top-loader";
import { cn } from "@/lib/utils";

const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    sp.delete("page");
    startTopLoader();
    router.push(`/jobs?${sp.toString()}`);
  }

  const activeType = params.get("type");
  const remote = params.get("remote") === "true";

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search job title, company, or location"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={!activeType} onClick={() => apply({ type: null })}>
          All types
        </FilterChip>
        {TYPES.map((type) => (
          <FilterChip
            key={type}
            active={activeType === type}
            onClick={() => apply({ type })}
          >
            {type}
          </FilterChip>
        ))}
        <FilterChip active={remote} onClick={() => apply({ remote: remote ? null : "true" })}>
          Remote only
        </FilterChip>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand-50 text-brand-700"
          : "border-input bg-white text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
