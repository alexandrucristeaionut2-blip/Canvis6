"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email() });

export function MagicLinkForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    // NextAuth will redirect to /verify (pages.verifyRequest).
    await signIn("email", { email: parsed.data.email, callbackUrl: next });
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailLink">Email</Label>
        <Input
          id="emailLink"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
        />
      </div>

      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</div> : null}

      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading ? "Sending link…" : "Continue with email link"}
      </Button>

      <div className="text-xs text-muted-foreground">
        Local dev: the magic link is printed in the server console.
      </div>
    </form>
  );
}
