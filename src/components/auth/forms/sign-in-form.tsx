"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function SignInForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      callbackUrl: next,
      // kept for UX parity; NextAuth handles session persistence.
      remember: remember ? "1" : "0",
    });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.assign(res?.url ?? next);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-muted-foreground underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <PasswordField id="password" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        Remember me
      </label>

      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</div> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">Create account</Link>
      </div>
    </form>
  );
}
