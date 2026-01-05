import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockupImage } from "@/components/mockup-image";
import { formatFrameColor, formatFrameModel, formatSize } from "@/lib/product";

export const metadata = {
  title: "Your order — Canvist",
};

function statusLabel(status: string) {
  switch (status) {
    case "PAID_AWAITING_PREVIEW":
      return { text: "Awaiting previews", variant: "muted" as const };
    case "PARTIALLY_APPROVED":
      return { text: "Partially approved", variant: "premium" as const };
    case "PREVIEW_READY":
      return { text: "Previews ready", variant: "premium" as const };
    case "REVISION_REQUESTED":
      return { text: "Revision requested", variant: "muted" as const };
    case "APPROVED_IN_PRODUCTION":
      return { text: "Approved", variant: "premium" as const };
    case "IN_PRODUCTION":
      return { text: "In production", variant: "premium" as const };
    case "SHIPPED":
      return { text: "Shipped", variant: "premium" as const };
    case "DELIVERED":
      return { text: "Delivered", variant: "premium" as const };
    default:
      return { text: status, variant: "muted" as const };
  }
}

function itemStatusLabel(status: string) {
  switch (status) {
    case "PAID_AWAITING_PREVIEW":
      return { text: "Waiting for preview", variant: "muted" as const };
    case "PREVIEW_READY":
      return { text: "Preview ready", variant: "premium" as const };
    case "REVISION_REQUESTED":
      return { text: "Revision requested", variant: "muted" as const };
    case "APPROVED_IN_PRODUCTION":
      return { text: "Approved", variant: "premium" as const };
    case "IN_PRODUCTION":
      return { text: "In production", variant: "premium" as const };
    case "SHIPPED":
      return { text: "Shipped", variant: "premium" as const };
    case "DELIVERED":
      return { text: "Delivered", variant: "premium" as const };
    default:
      return { text: status, variant: "muted" as const };
  }
}

export default async function OrderPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const gate = await prisma.order.findUnique({ where: { publicId }, select: { id: true, userId: true } });
  if (!gate) {
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

  if (gate.userId) {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    if (!viewerId) {
      redirect(`/signin?next=${encodeURIComponent(`/order/${publicId}`)}`);
    }
    if (viewerId !== gate.userId) {
      notFound();
    }
  }

  const order = await prisma.order.findUnique({
    where: { publicId },
    include: {
      items: {
        include: {
          theme: true,
          uploads: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const s = statusLabel(order.status);

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Badge variant={s.variant}>{s.text}</Badge>
              <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">Your order</h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">Order id: {order.publicId}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/themes">Browse themes</Link>
            </Button>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-4">
            {order.items.map((it) => {
              const itemPublicId = it.publicItemId ?? it.id;
              const preview = it.uploads.find((u) => u.type === "PREVIEW_IMAGE") ?? null;
              const thumb = preview ? `/api/files/${preview.filePath}` : it.theme.mockupImage;
              const label = itemStatusLabel(it.status);

              return (
                <Card key={it.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
                        {preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={it.theme.name} className="h-full w-full object-cover" />
                        ) : (
                          <MockupImage
                            src={thumb}
                            fallbackSrc="/placeholders/gallery.svg"
                            alt={`Mockup — ${it.theme.name}`}
                            sizes="180px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-display text-2xl tracking-tight">{it.theme.name}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {formatSize(it.size)} • {formatFrameColor(it.frameColor)} • {formatFrameModel(it.frameModel)} • Qty {it.quantity}
                            </div>
                          </div>
                          <Badge variant={label.variant}>{label.text}</Badge>
                        </div>

                        <div className="mt-4">
                          {it.status === "PREVIEW_READY" ? (
                            <Button asChild>
                              <Link href={`/order/${encodeURIComponent(order.publicId)}/items/${encodeURIComponent(itemPublicId)}/preview`}>View preview</Link>
                            </Button>
                          ) : it.status === "PAID_AWAITING_PREVIEW" ? (
                            <Button type="button" variant="outline" disabled>
                              Waiting for preview
                            </Button>
                          ) : it.status === "APPROVED_IN_PRODUCTION" || it.status === "IN_PRODUCTION" || it.status === "SHIPPED" || it.status === "DELIVERED" ? (
                            <Button asChild variant="outline">
                              <Link href={`/order/${encodeURIComponent(order.publicId)}/items/${encodeURIComponent(itemPublicId)}/preview`}>View item</Link>
                            </Button>
                          ) : (
                            <Button asChild variant="outline">
                              <Link href={`/order/${encodeURIComponent(order.publicId)}/items/${encodeURIComponent(itemPublicId)}/preview`}>Open</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
