import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderItemPreviewClient } from "@/components/order-item-preview-client";
import { formatFrameColor, formatFrameModel, formatSize } from "@/lib/product";

export const metadata = {
  title: "Item preview — Canvist",
};

export default async function ItemPreviewPage({
  params,
}: {
  params: Promise<{ publicId: string; itemPublicId: string }>;
}) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true, publicId: true, status: true, userId: true } });
  if (!order) {
    return (
      <SiteShell>
        <div className="container py-10 md:py-14">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Order not found</CardTitle>
              <CardDescription>The link may be invalid.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/create">Start again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SiteShell>
    );
  }

  if (order.userId) {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    if (!viewerId) {
      redirect(`/signin?next=${encodeURIComponent(`/order/${order.publicId}/items/${itemPublicId}/preview`)}`);
    }
    if (viewerId !== order.userId) {
      notFound();
    }
  }

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, OR: [{ publicItemId: itemPublicId }, { id: itemPublicId }] },
    include: {
      theme: true,
      uploads: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!item) {
    return (
      <SiteShell>
        <div className="container py-10 md:py-14">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Item not found</CardTitle>
              <CardDescription>This item may have been removed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/order/${encodeURIComponent(order.publicId)}`}>Back to order</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SiteShell>
    );
  }

  const previews = item.uploads.filter((u) => u.type === "PREVIEW_IMAGE");

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Badge variant="premium">Item preview</Badge>
              <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">{item.theme.name}</h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                {formatSize(item.size)} • {formatFrameColor(item.frameColor)} • {formatFrameModel(item.frameModel)}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/order/${encodeURIComponent(order.publicId)}`}>Back to order</Link>
            </Button>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>{previews.length ? "Review and approve before print." : "Waiting for admin preview upload."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previews.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {previews.map((p) => (
                      <div key={p.id} className="overflow-hidden rounded-2xl border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/files/${p.filePath}`} alt={p.originalName} className="aspect-[4/3] w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">No preview images yet.</div>
                )}
              </CardContent>
            </Card>

            <OrderItemPreviewClient
              orderPublicId={order.publicId}
              itemPublicId={item.publicItemId ?? item.id}
              itemStatus={item.status}
              revisionUsed={item.revisionUsed}
            />
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
