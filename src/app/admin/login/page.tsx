import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = { title: "Admin login — Canvist" };

export default function AdminLoginPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Admin login</CardTitle>
              <CardDescription>Local-only admin access for preview uploads.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLoginForm />
            </CardContent>
          </Card>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
