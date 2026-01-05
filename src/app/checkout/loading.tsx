import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-muted" />
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
