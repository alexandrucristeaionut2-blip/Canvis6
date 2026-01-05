import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPublicId } from "@/lib/public-id";
import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutItemUploadsClient } from "@/components/checkout-item-uploads-client";
import { CheckoutShippingForm } from "@/components/checkout-shipping-form";
import { formatMoneyRonBani } from "@/lib/currency";
import { formatFrameColor, formatFrameModel, formatSize } from "@/lib/product";

export const metadata = {
  title: "Checkout — Canvist",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const orderParam = (typeof sp.order === "string" ? sp.order : undefined) ?? (typeof sp.publicId === "string" ? sp.publicId : undefined);
  const fromCart = (typeof sp.fromCart === "string" ? sp.fromCart : undefined) === "1";

  if (!orderParam) {
    return (
      <SiteShell>
        <div className="container py-10 md:py-14">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Checkout</CardTitle>
              <CardDescription>No order selected.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Open checkout from the Create wizard so we can attach your configuration.
              </div>
              <Button asChild className="w-full">
                <Link href="/create">Back to Create</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SiteShell>
    );
  }

  const order = await prisma.order.findUnique({
    where: { publicId: orderParam },
    include: {
      items: { include: { theme: true, uploads: { orderBy: { createdAt: "asc" } } } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!order) {
    return (
      <SiteShell>
        <div className="container py-10 md:py-14">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Checkout</CardTitle>
              <CardDescription>Order not found.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">The draft order may have been cleared or the link is invalid.</div>
              <Button asChild className="w-full">
                <Link href="/create">Back to Create</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SiteShell>
    );
  }

  const items = await Promise.all(
    order.items.map(async (it) => {
      if (it.publicItemId) return it;
      const publicItemId = createPublicId();
      await prisma.orderItem.update({ where: { id: it.id }, data: { publicItemId } });
      return { ...it, publicItemId };
    })
  );

  const notesEvent = order.events.find((e) => e.type === "CUSTOMER_NOTES") ?? null;

  const subtotal = items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
  const shipping = order.shipping;
  const total = subtotal + shipping;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const defaultAddress = userId
    ? await prisma.address.findFirst({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : null;

  const hasOrderAddress = Boolean(order.addressLine1 || order.city || order.postalCode || order.country);
  const prefilledFromDefault = Boolean(!hasOrderAddress && defaultAddress);

  const shippingDefaults = {
    fullName: order.name ?? defaultAddress?.fullName ?? "",
    phone: order.phone ?? defaultAddress?.phone ?? "",
    line1: order.addressLine1 ?? defaultAddress?.line1 ?? "",
    line2: order.addressLine2 ?? defaultAddress?.line2 ?? "",
    city: order.city ?? defaultAddress?.city ?? "",
    region: order.state ?? defaultAddress?.region ?? "",
    postalCode: order.postalCode ?? defaultAddress?.postalCode ?? "",
    country: order.country ?? defaultAddress?.country ?? "",
  };

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Badge variant="premium">Local checkout (mock)</Badge>
              <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">Checkout</h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">Review your configuration. Payment is simulated locally.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/create">Back</Link>
            </Button>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Preview inputs</CardTitle>
                <CardDescription>Photos + selected style (per item)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {items.map((it) => {
                    const photos = it.uploads.filter((u) => u.type === "CUSTOMER_PHOTO");
                    return (
                      <div key={it.id} className="rounded-2xl border bg-card p-4">
                        <div className="text-sm font-medium">{it.theme.name}</div>
                        {photos.length ? (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {photos.slice(0, 4).map((u) => (
                              <div key={u.id} className="overflow-hidden rounded-2xl border bg-muted">
                                {/* Using img because these are dynamic local files */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/api/files/${u.filePath}`} alt={u.originalName} className="aspect-[4/3] w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border bg-muted p-3 text-sm text-muted-foreground">No photos uploaded for this item yet.</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {notesEvent ? (
                  <div className="rounded-2xl border bg-card p-4">
                    <div className="text-xs font-medium text-muted-foreground">Notes</div>
                    <div className="mt-2 text-sm">{notesEvent.message}</div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>{items.length === 1 ? "One framed print" : `${items.length} items`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order</span>
                    <span className="font-medium">{order.publicId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{order.status}</span>
                  </div>

                  {items.length ? (
                    <div className="space-y-3">
                      {items.map((it) => (
                        <div key={it.id} className="rounded-2xl border bg-card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{it.theme.name}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {formatSize(it.size)} • {formatFrameColor(it.frameColor)} • {formatFrameModel(it.frameModel)} • {it.paperFinish}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Qty</div>
                              <div className="text-sm font-medium">{it.quantity}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Line total</span>
                            <span className="text-sm font-medium">{formatMoneyRonBani(it.basePrice * it.quantity)}</span>
                          </div>
                        </div>
                      ))}

                      <div className="rounded-2xl border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">{formatMoneyRonBani(subtotal)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium">{formatMoneyRonBani(shipping)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-display text-2xl">{formatMoneyRonBani(total)}</span>
                        </div>
                      </div>

                      <CheckoutItemUploadsClient
                        orderPublicId={order.publicId}
                        fromCart={fromCart}
                        items={items.map((it) => ({
                          publicItemId: it.publicItemId as string,
                          themeName: it.theme.name,
                        }))}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
                      This draft order has no configuration yet. Go back to Create and click “Proceed”.
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">This MVP checkout is local-only (no real payment).</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping details</CardTitle>
                  <CardDescription>Used for delivery and saved to the order.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckoutShippingForm
                    orderPublicId={order.publicId}
                    defaults={shippingDefaults}
                    canSaveToAccount={Boolean(userId)}
                    prefilledFromDefault={prefilledFromDefault}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
