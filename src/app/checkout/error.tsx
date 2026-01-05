"use client";

import Link from "next/link";
import * as React from "react";

import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Checkout error:", error);
    }
  }, [error]);

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Checkout failed</CardTitle>
            <CardDescription>We couldn’t load your checkout data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Try again, or return to Create and proceed to checkout once more.</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={reset}>Retry</Button>
              <Button asChild variant="outline">
                <Link href="/create">Back to Create</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
