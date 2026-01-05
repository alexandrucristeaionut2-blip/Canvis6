"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Login failed");

      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="admin-login-form">
      <div className="space-y-2">
        <Label htmlFor="token">Admin token</Label>
        <Input
          id="token"
          name="token"
          type="password"
          autoComplete="current-password"
          value={token}
          onChange={(e) => setToken(e.currentTarget.value)}
          placeholder="Enter ADMIN_TOKEN"
          data-testid="admin-login-token"
        />
      </div>

      {error ? (
        <div className="text-sm text-destructive" role="alert" data-testid="admin-login-error">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={submitting || token.trim().length === 0} data-testid="admin-login-submit">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
