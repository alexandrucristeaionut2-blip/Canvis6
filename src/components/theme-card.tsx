"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MockupImage } from "@/components/mockup-image";
import { cn } from "@/lib/utils";

export type ThemeListItem = {
  slug: string;
  name: string;
  description: string;
  heroImage: string | null;
  mockupImage: string;
  tags: string[];
};

export function ThemeCard({
  theme,
  className,
  href,
}: {
  theme: ThemeListItem;
  className?: string;
  href?: string;
}) {
  const target = href ?? `/create?theme=${encodeURIComponent(theme.slug)}`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn("group", className)}
    >
      <Link
        href={target}
        className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow group-hover:shadow-glow"
        aria-label={`View theme ${theme.name}`}
      >
        <div className="relative aspect-[1414/2000] overflow-hidden bg-muted">
          <MockupImage
            src={theme.mockupImage}
            fallbackSrc={theme.heroImage ?? "/placeholders/gallery.svg"}
            alt={`Canvist theme — ${theme.name}`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            expectedAspectRatio={1414 / 2000}
          />
          <div className="pointer-events-none absolute left-3 top-3">
            <Badge variant="muted">Preview mockup</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="min-h-[76px]">
            <div className="truncate font-display text-lg tracking-tight">{theme.name}</div>
            <div className="mt-1 max-h-[2.75rem] overflow-hidden text-sm text-muted-foreground">
              {theme.description}
            </div>
          </div>
          <div className="flex min-h-[28px] flex-wrap gap-2">
            {theme.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="muted">
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-auto text-sm font-medium text-primary">Creează cu tema asta →</div>
        </div>
      </Link>
    </motion.div>
  );
}
