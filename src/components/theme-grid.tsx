"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ThemeCard, type ThemeListItem } from "@/components/theme-card";
import { cn } from "@/lib/utils";

const FILTERS = ["Cinematic", "Retro", "Elegant", "Dark", "Colorful"] as const;

export function ThemeGrid({ themes, className }: { themes: ThemeListItem[]; className?: string }) {
  const [active, setActive] = React.useState<(typeof FILTERS)[number] | "ALL">("ALL");

  const filtered = React.useMemo(() => {
    if (active === "ALL") return themes;
    return themes.filter((t) => t.tags.includes(active));
  }, [themes, active]);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive("ALL")}
          className="rounded-full"
          aria-pressed={active === "ALL"}
        >
          <Badge variant={active === "ALL" ? "premium" : "default"}>All</Badge>
        </button>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            className="rounded-full"
            aria-pressed={active === f}
          >
            <Badge variant={active === f ? "premium" : "default"}>{f}</Badge>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <ThemeCard key={t.slug} theme={t} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No themes match this filter yet.
        </div>
      ) : null}
    </div>
  );
}
