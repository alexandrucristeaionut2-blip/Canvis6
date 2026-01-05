import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoExampleCard } from "@/components/photo-example-card";

export const metadata = {
  title: "Quality — Canvist",
};

export default function QualityPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <Badge variant="premium">Hârtie foto glossy (standard Canvist).</Badge>
            <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">Quality you can feel</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Un tablou premium înseamnă print corect + ramă solidă + protecție la transport. Totul e inclus.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Glossy photo paper</CardTitle>
                <CardDescription>Finish fix • look consistent</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Glossy este standardul Canvist: culori vii, contrast, profunzime. Nu ai de ales — e inclus.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Frame build</CardTitle>
                <CardDescription>Mandatory, included</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Rama e inclusă și obligatorie — ca să primești un tablou gata de perete.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Protective packaging</CardTitle>
                <CardDescription>For international shipping</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Protecție la colțuri + ambalare rigidă. Pentru internațional, urmărește ETA-ul pe zone.
              </CardContent>
            </Card>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>What makes a good photo</CardTitle>
                <CardDescription>Examples (local)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>• Lumină bună (fără highlights arse).</div>
                <div>• Detalii clare pe subiect.</div>
                <div>• Evită capturi de ecran, preferă fișiere originale.</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <PhotoExampleCard
                    src="/examples/good-photo-1.png"
                    alt="Couple portrait in warm golden-hour light"
                    hint="Good light + sharp subject"
                    objectPosition="50% 35%"
                  />
                  <PhotoExampleCard
                    src="/examples/good-photo-2.png"
                    alt="Traveler giving thumbs up in a city street"
                    hint="Clear face + enough detail"
                    objectPosition="50% 25%"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview before print</CardTitle>
                <CardDescription>Acesta este preview-ul tău. Aprobă pentru a începe producția.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>• Primești un preview după plată.</div>
                <div>• Ai 1 rundă de ajustare inclusă.</div>
                <div>• După aprobare, trecem în producție.</div>
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
