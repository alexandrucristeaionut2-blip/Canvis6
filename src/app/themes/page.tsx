import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { ThemeGrid } from "@/components/theme-grid";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/theme";

export const metadata = {
  title: "Themes — Canvist",
};

export default async function ThemesPage() {
  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: "asc" },
    select: { slug: true, name: true, description: true, tags: true, heroImage: true, mockupImage: true },
  });

  const mapped = themes.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    heroImage: t.heroImage,
    mockupImage: t.mockupImage,
    tags: parseTags(t.tags),
  }));

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Themes</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Alege o tematică. Noi păstrăm identitatea fotografiilor tale.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10">
            <ThemeGrid themes={mapped} />
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
