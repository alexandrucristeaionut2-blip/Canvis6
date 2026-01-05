import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forms/forgot-password-form";

export const metadata = {
  title: "Forgot password — Canvist",
};

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <AuthShell title="Forgot password" description="We’ll send a reset link if the email exists.">
        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/signin" className="underline underline-offset-4">Back to sign in</Link>
        </div>
      </AuthShell>
    </SiteShell>
  );
}
