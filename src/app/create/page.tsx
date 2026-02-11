import * as React from "react";

import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/theme";
import { SiteShell } from "@/components/site-shell";
import { CreateWizard } from "@/components/create-wizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create — Canvist",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const theme = typeof sp.theme === "string" ? sp.theme : undefined;
  const size = typeof sp.size === "string" ? sp.size : undefined;
  const frameColor = typeof sp.frameColor === "string" ? sp.frameColor : undefined;
  const frameModel = typeof sp.frameModel === "string" ? sp.frameModel : undefined;

  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: "asc" },
    select: { slug: true, name: true, description: true, tags: true, heroImage: true, mockupImage: true },
  });

  const mappedThemes = themes.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    heroImage: t.heroImage,
    mockupImage: t.mockupImage,
    tags: parseTags(t.tags),
  }));

  return (
    <SiteShell>
      <React.Suspense fallback={<div className="container py-10 text-sm text-muted-foreground">Loading…</div>}>
        <CreateWizard themes={mappedThemes} preselect={{ theme, size, frameColor, frameModel }} />
      </React.Suspense>
    </SiteShell>
  );
}
