import Link from "next/link";
import * as React from "react";

import { SiteShell } from "@/components/site-shell";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/forms/sign-in-form";
import { MagicLinkForm } from "@/components/auth/forms/magic-link-form";

export const metadata = {
  title: "Sign in — Canvist",
};

export default function SignInPage() {
  return (
    <SiteShell>
      <AuthShell title="Sign in" description="Access your orders, addresses, and faster checkout.">
        <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <SignInForm />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="text-xs text-muted-foreground">or</div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <MagicLinkForm />
        </React.Suspense>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Need help? <Link href="/contact" className="underline underline-offset-4">Contact us</Link>
        </div>
      </AuthShell>
    </SiteShell>
  );
}
