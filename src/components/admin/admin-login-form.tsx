"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok) throw new Error(json?.error ?? "Login failed");
          toast.success("Admin session started");
          router.push("/admin");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Login failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="token">Admin token</Label>
        <Input
          id="token"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="dev-admin-token"
          autoComplete="off"
          data-testid="admin-token"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || token.trim().length < 4} data-testid="admin-login">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
