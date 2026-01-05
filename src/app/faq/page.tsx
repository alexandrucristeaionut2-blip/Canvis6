import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "FAQ — Canvist",
};

const FAQ = [
  {
    q: "Ce calitate trebuie să aibă fotografiile?",
    a: "Recomandăm fișiere originale (nu capturi de ecran). Cu cât sunt mai clare, cu atât rezultatul e mai spectaculos.",
  },
  {
    q: "Când primesc preview-ul?",
    a: "După plată (mock), comanda intră în PAID_AWAITING_PREVIEW. Când preview-ul e încărcat, statusul devine PREVIEW_READY.",
  },
  {
    q: "Cum funcționează aprobarea înainte de print?",
    a: "Acesta este preview-ul tău. Aprobă pentru a începe producția. Dacă ai nevoie, poți cere 1 rundă de ajustare inclusă.",
  },
  {
    q: "Câte revizii sunt incluse?",
    a: "Exact 1 rundă. După ce o folosești, butonul de revizie se dezactivează permanent.",
  },
  {
    q: "Rama este opțională?",
    a: "Nu. Rama este inclusă și obligatorie — ca să primești un tablou gata de perete.",
  },
  {
    q: "Ce finish are hârtia?",
    a: "Hârtie foto glossy (standard Canvist). Este fixă și mereu afișată.",
  },
  {
    q: "Faceți shipping internațional?",
    a: "Da (mock). Costul și ETA sunt calculate pe zone. Disclaimer: customs/taxes may apply depending on destination.",
  },
  {
    q: "Trimiteți email-uri?",
    a: "Nu. În acest MVP local-only, evenimentele de " +
      "email sunt doar logate în baza de date (EventLog).",
  },
  {
    q: "Datele mele sunt private?",
    a: "Da. Aplicația rulează local. Fișierele încărcate se salvează pe disc în /uploads.",
  },
];

export default function FaqPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <Badge variant="premium">Ai 1 rundă de ajustare inclusă.</Badge>
            <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">FAQ</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Întrebări frecvente despre calitate, timeline, preview și shipping.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {FAQ.map((item) => (
              <Card key={item.q}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
              </Card>
            ))}
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
