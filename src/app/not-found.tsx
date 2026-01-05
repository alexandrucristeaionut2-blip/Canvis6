import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container py-20">
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center shadow-card">
          <div className="font-display text-4xl tracking-tight">404</div>
          <p className="mt-3 text-sm text-muted-foreground">Page not found.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/create">Creează tabloul tău</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
