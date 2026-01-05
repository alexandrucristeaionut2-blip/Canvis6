import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/forms/reset-password-form";

export const metadata = {
  title: "Verify — Canvist",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; token?: string }>;
}) {
  const { type, token } = await searchParams;

  if (type === "reset" && token) {
    return (
      <SiteShell>
        <AuthShell title="Set a new password" description="Choose a strong password for your account.">
          <ResetPasswordForm token={token} />
        </AuthShell>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <AuthShell title="Check your email" description="For local dev, the magic link is printed in the server console.">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Return to your sign-in tab and open the link shown in the terminal.</p>
          <p>
            Prefer password sign-in?{" "}
            <Link href="/signin" className="underline underline-offset-4">
              Use credentials
            </Link>
          </p>
        </div>
      </AuthShell>
    </SiteShell>
  );
}
