import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShippingEstimator } from "@/components/shipping-estimator";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { formatMoneyRonBani } from "@/lib/currency";

export const metadata = {
  title: "Shipping — Canvist",
};

export default function ShippingPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Shipping</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              International shipping zones (mock), ETA estimate, and tracking when shipped.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Zones & ETA</CardTitle>
                <CardDescription>Fixed table (local-only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {Object.values(SHIPPING_ZONES).map((z) => (
                  <div key={z.label} className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{z.label}</span>
                      <span className="font-medium">{formatMoneyRonBani(z.costRonBani)}</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">ETA {z.eta} business days</div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">
                  Disclaimer: customs/taxes may apply depending on destination.
                </div>
              </CardContent>
            </Card>

            <ShippingEstimator />
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Tracking</CardTitle>
                <CardDescription>Added when shipped</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Când comanda e marcată SHIPPED, vei vedea tracking number în portalul comenzii.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Packaging</CardTitle>
                <CardDescription>Protective by design</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Protecție pentru ramă și print, gândită pentru transport internațional.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customs</CardTitle>
                <CardDescription>Depends on destination</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Pentru unele destinații pot exista taxe vamale / TVA local.
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
