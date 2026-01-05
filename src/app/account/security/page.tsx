import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { ChangePasswordForm } from "@/components/auth/forms/change-password-form";

export const metadata = { title: "Security — Canvist" };

export default async function SecurityPage() {
  const user = await requireUser("/account/security");

  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  const hasPassword = Boolean(row?.passwordHash);

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Security</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">Password and sign-in options.</p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 max-w-xl">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>Use a strong password for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm hasPassword={hasPassword} />
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
