import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Star } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { HomeHeroPreview } from "@/components/home-hero-preview";
import { ThemeGrid } from "@/components/theme-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/theme";
import { SIZE_OPTIONS } from "@/lib/product";
import { formatMoneyRonBani } from "@/lib/currency";

export default async function Home() {
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
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge variant="premium">Preview plătit, 1 rundă de ajustare inclusă.</Badge>
              <h1 className="text-balance font-display text-4xl tracking-tight md:text-5xl">
                Fotografiile tale, transformate în tablouri de colecție.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                Print foto glossy, înrămat. Alegi tematica și rama, plătești, apoi aprobi preview-ul înainte de print.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/create">
                    Creează tabloul tău <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/gallery">Vezi exemple</Link>
                </Button>
              </div>

              <div className="grid gap-3 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4" /> Cinematic themes</div>
                  <div className="mt-1 text-sm text-muted-foreground">Predefined styles, consistent output.</div>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4" /> Trusted workflow</div>
                  <div className="mt-1 text-sm text-muted-foreground">Pay → Preview → Approve before print.</div>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4" /> International</div>
                  <div className="mt-1 text-sm text-muted-foreground">Zones + ETA estimate (mock).</div>
                </div>
              </div>
            </div>

            <div>
              {/* Hero preview uses a few themes only; tags parsed below */}
              <HomeHeroPreview
                themes={mappedThemes.map((t) => ({ slug: t.slug, name: t.name, tags: t.tags }))}
              />
            </div>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 grid gap-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="font-display text-3xl tracking-tight">How it works</div>
                <p className="mt-2 text-sm text-muted-foreground">Simplu, clar, fără surprize.</p>
              </div>
              <Badge variant="muted">Hârtie foto glossy (standard Canvist).</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>1. Upload photos</CardTitle>
                  <CardDescription>Minim 2 poze recomandate.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Cu cât sunt mai clare, cu atât rezultatul e mai spectaculos.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Theme + frame</CardTitle>
                  <CardDescription>Rama este inclusă și obligatorie.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Alegi tematica, dimensiunea și rama — primești un tablou gata de perete.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Pay & approve preview</CardTitle>
                  <CardDescription>Preview plătit înainte de producție.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Aprobi preview-ul. Ai 1 rundă de ajustare inclusă.
                </CardContent>
              </Card>
            </div>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14" id="themes">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="font-display text-3xl tracking-tight">Themes</div>
                <p className="mt-2 text-sm text-muted-foreground">Alege o tematică. Noi păstrăm identitatea fotografiilor tale.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/themes">Toate temele</Link>
              </Button>
            </div>

            <div className="mt-6">
              <ThemeGrid themes={mappedThemes} />
            </div>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 grid gap-6">
            <div>
              <div className="font-display text-3xl tracking-tight">Pricing</div>
              <p className="mt-2 text-sm text-muted-foreground">Rama inclusă. Print foto glossy. Gata de pus pe perete.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {SIZE_OPTIONS.map((s) => (
                <Card key={s.value} className={s.badge ? "border-primary/30" : undefined}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{s.value}</CardTitle>
                      {s.badge ? <Badge variant="premium">{s.badge}</Badge> : null}
                    </div>
                    <CardDescription>{s.dimensionsCm}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-3xl">{formatMoneyRonBani(s.priceRonBani)}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Rama inclusă. Print foto glossy. Gata de pus pe perete.
                    </div>
                    <div className="mt-5">
                      <Button asChild>
                        <Link href={`/create?size=${s.value}`}>Creează cu {s.value}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality, by default</CardTitle>
                <CardDescription>Glossy photo paper • solid frames • protective packaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• Hârtie foto glossy (standard Canvist).</div>
                <div>• Ramă rigidă, finisaje curate, colțuri precise.</div>
                <div>• Ambalare protectoare pentru shipping internațional.</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What customers say</CardTitle>
                <CardDescription>Seeded testimonials (local)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Arată ca un print de studio. Flow-ul e clar și premium.", "Preview-ul înainte de print mi-a dat încredere.", "Rama și printul glossy arată impecabil."]
                  .map((q, idx) => (
                    <div key={idx} className="rounded-2xl border bg-background p-4">
                      <div className="flex items-center gap-1 text-primary" aria-label="5 star rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">“{q}”</div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 rounded-2xl border bg-card p-8 shadow-card">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="font-display text-3xl tracking-tight">FAQ</div>
                <p className="mt-2 text-sm text-muted-foreground">Răspunsuri despre preview, revizie și shipping.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/faq">Vezi FAQ</Link>
              </Button>
            </div>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
