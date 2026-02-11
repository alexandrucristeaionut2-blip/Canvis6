"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Minus, Pencil, Copy } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useCartStore } from "@/store/cart-store";
import { COUNTRIES, shippingForCountry } from "@/lib/shipping";
import {
  FRAME_COLORS,
  FRAME_MODELS,
  SIZE_OPTIONS,
  formatFrameColor,
  formatFrameModel,
  formatSize,
  getBasePriceRonBani,
  type FrameColorValue,
  type FrameModelValue,
  type SizeValue,
} from "@/lib/product";
import { formatMoneyRonBani } from "@/lib/currency";

function CartItemThumbnail({
  themeMockupUrl,
  userImageUrl,
  themeName,
  priority,
}: {
  themeMockupUrl: string;
  userImageUrl: string | null;
  themeName: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-[120px] w-[180px] shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white outline outline-2 outline-red-500">
      <span className="pointer-events-none absolute bottom-1 right-1 z-50 rounded bg-black/70 px-1 py-[1px] text-[10px] text-white">
        v2
      </span>

      <Image
        src={themeMockupUrl}
        alt={`Room mockup — ${themeName}`}
        fill
        priority={priority}
        sizes="180px"
        className="object-cover"
      />

      {userImageUrl ? (
        <div className="absolute left-[22%] top-[18%] right-[22%] bottom-[22%] z-20 overflow-hidden rounded-[6px] bg-white shadow-sm">
          <Image
            src={userImageUrl}
            alt={`User photo — ${themeName}`}
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

function firstNonEmptyString(values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function getUserImageUrl(item: unknown): string | null {
  const i = item as {
    uploads?: Array<{ secureUrl?: string; url?: string; filePath?: string }>;
    assets?: Array<{ secureUrl?: string }>;
    imageUrl?: string;
    previewUrl?: string;
  };

  const upload = i.uploads?.[0];
  const fromUpload = firstNonEmptyString([upload?.secureUrl, upload?.url]);
  if (fromUpload) return fromUpload;

  const filePath = firstNonEmptyString([upload?.filePath]);
  if (filePath) return `/api/files/${filePath}`;

  const fromAssets = firstNonEmptyString([i.assets?.[0]?.secureUrl]);
  if (fromAssets) return fromAssets;

  return firstNonEmptyString([i.previewUrl, i.imageUrl]);
}

export function CartPageClient() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const countryCode = useCartStore((s) => s.countryCode);
  const setCountryCode = useCartStore((s) => s.setCountryCode);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const duplicateItem = useCartStore((s) => s.duplicateItem);

  const [submitting, setSubmitting] = React.useState(false);

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, i) => sum + i.basePriceRonBani * i.quantity, 0);
  }, [items]);

  const shipping = React.useMemo(() => shippingForCountry(countryCode), [countryCode]);
  const total = subtotal + shipping.costRonBani;

  async function startCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          countryCode,
          items: items.map((i) => ({
            themeSlug: i.themeSlug,
            size: i.size,
            frameColor: i.frameColor,
            frameModel: i.frameModel,
            quantity: i.quantity,
            notes: i.notes ?? null,
            draftPublicId: i.draftPublicId,
            draftItemPublicId: i.draftItemPublicId,
            uploads: i.uploads,
          })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to create checkout order");
      const publicId = json?.publicId as string | undefined;
      if (!publicId) throw new Error("Missing order id");
      router.push(`/checkout?order=${encodeURIComponent(publicId)}&fromCart=1`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted p-6 text-sm text-muted-foreground">
        Your cart is empty. Browse Themes to add your first framed print.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        {items.map((i, idx) => {
          const unit = getBasePriceRonBani(i.size);
          const line = unit * i.quantity;
          const userImageUrl = getUserImageUrl(i);
          const baseMockup = i.mockupImage || "/placeholders/gallery.svg";
          return (
            <div key={i.id} className="rounded-2xl border bg-card p-5">
              <div className="grid gap-4 md:grid-cols-[144px_1fr]">
                <div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={i.uploads?.[0]?.filePath ? `/api/files/${i.uploads[0].filePath}` : (i.mockupImage || "/placeholders/gallery.svg")}
                    alt={i.themeName}
                    fill
                    className="object-cover"
                    sizes="144px"
                    priority={idx === 0}
                  />
                </div>

                <div className="min-w-0 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-display text-lg tracking-tight">{i.themeName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatSize(i.size)} • {formatFrameColor(i.frameColor)} • {formatFrameModel(i.frameModel)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        removeItem(i.id);
                        toast.message("Removed from cart");
                      }}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Size</div>
                      <Select
                        value={i.size}
                        onValueChange={(v) => updateItem(i.id, { size: v as SizeValue })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label} — {o.dimensionsCm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Frame color</div>
                      <Select
                        value={i.frameColor}
                        onValueChange={(v) => updateItem(i.id, { frameColor: v as FrameColorValue })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAME_COLORS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Frame model</div>
                      <Select
                        value={i.frameModel}
                        onValueChange={(v) => updateItem(i.id, { frameModel: v as FrameModelValue })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAME_MODELS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-9 p-0"
                        onClick={() => setQuantity(i.id, i.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-10 text-center text-sm font-medium">{i.quantity}</div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-9 p-0"
                        onClick={() => setQuantity(i.id, i.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Line total</div>
                      <div className="text-sm font-medium">{formatMoneyRonBani(line)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/create?editCartItem=${encodeURIComponent(i.id)}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit in wizard
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        duplicateItem(i.id);
                        toast.success("Duplicated");
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="font-display text-xl tracking-tight">Summary</div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatMoneyRonBani(subtotal)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{formatMoneyRonBani(shipping.costRonBani)}</span>
            </div>
            <Select value={countryCode ?? ""} onValueChange={(v) => setCountryCode(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">ETA: {shipping.eta}</div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl">{formatMoneyRonBani(total)}</span>
          </div>

          <Button className="mt-2 w-full" disabled={submitting} onClick={startCheckout} data-testid="cart-checkout">
            {submitting ? "Preparing checkout…" : "Continue to checkout"}
          </Button>
          <div className="text-xs text-muted-foreground">Local-only mock checkout. No real payment.</div>
        </div>
      </div>
    </div>
  );
}
