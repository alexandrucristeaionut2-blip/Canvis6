import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export const metadata = { title: "Account — Canvist" };

export default async function AccountPage() {
  const user = await requireUser("/account");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { publicId: true, status: true, total: true, createdAt: true },
  });

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Account</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">Orders, addresses, and security.</p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Name</span><span>{user.name ?? "—"}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Email</span><span>{user.email ?? "—"}</span></div>
                <div className="pt-4 flex gap-2">
                  <Link href="/account/addresses" className="text-sm underline underline-offset-4">Addresses</Link>
                  <span className="text-muted-foreground">•</span>
                  <Link href="/account/security" className="text-sm underline underline-offset-4">Security</Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none lg:col-span-2">
              <CardHeader>
                <CardTitle>Order history</CardTitle>
                <CardDescription>Only your orders are shown here.</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </div>
                ) : (
                  <div className="divide-y rounded-2xl border">
                    {orders.map((o) => (
                      <Link
                        key={o.publicId}
                        href={`/order/${encodeURIComponent(o.publicId)}`}
                        className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-muted/40"
                      >
                        <div>
                          <div className="font-medium">Order {o.publicId}</div>
                          <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{o.status}</div>
                          <div className="font-medium">{(o.total / 100).toFixed(2)} RON</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
