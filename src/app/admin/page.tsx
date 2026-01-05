import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export const metadata = { title: "Admin — Canvist" };

export default async function AdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      publicId: true,
      status: true,
      createdAt: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          publicItemId: true,
          status: true,
          revisionUsed: true,
          theme: { select: { name: true } },
          uploads: { select: { id: true, type: true }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Admin</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">Upload previews and move items through the workflow.</p>
          </div>
        </MotionSection>

        <MotionSection>
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Local-only tools for preview approvals.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminOrdersClient
                orders={orders.map((o) => ({
                  publicId: o.publicId,
                  status: o.status,
                  createdAt: o.createdAt.toISOString(),
                  items: o.items.map((it) => ({
                    publicItemId: it.publicItemId ?? it.id,
                    status: it.status,
                    revisionUsed: it.revisionUsed,
                    themeName: it.theme.name,
                    previewCount: it.uploads.filter((u) => u.type === "PREVIEW_IMAGE").length,
                  })),
                }))}
              />
            </CardContent>
          </Card>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
