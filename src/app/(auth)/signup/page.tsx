import * as React from "react";

import { SiteShell } from "@/components/site-shell";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/forms/sign-up-form";

export const metadata = {
  title: "Create account — Canvist",
};

export default function SignUpPage() {
  return (
    <SiteShell>
      <AuthShell title="Create account" description="Save addresses, see order history, checkout faster.">
        <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <SignUpForm />
        </React.Suspense>
      </AuthShell>
    </SiteShell>
  );
}
