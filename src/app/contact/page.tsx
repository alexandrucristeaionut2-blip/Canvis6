import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact — Canvist",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Contact</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Formularul salvează mesajele local (EventLog). Nu se trimit email-uri.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Send a message</CardTitle>
                <CardDescription>Saved to DB (local-only)</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other channels</CardTitle>
                <CardDescription>Placeholders for MVP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>WhatsApp: placeholder</div>
                <div>Email: placeholder</div>
                <div>Business hours: Mon–Fri 10:00–18:00 (placeholder)</div>
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
