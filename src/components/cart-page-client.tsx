"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Minus, Pencil, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MockupImage } from "@/components/mockup-image";

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
          return (
            <div key={i.id} className="rounded-2xl border bg-card p-5">
              <div className="flex gap-4">
                <div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-2xl border bg-muted">
                  <MockupImage
                    src={i.mockupImage}
                    fallbackSrc="/placeholders/gallery.svg"
                    alt={`Mockup — ${i.themeName}`}
                    priority={idx === 0}
                    sizes="144px"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute left-3 top-3">
                    <Badge variant="muted">Preview mockup</Badge>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Size</div>
                      <Select
                        value={i.size}
                        onValueChange={(v) => updateItem(i.id, { size: v as SizeValue })}
                      >
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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

                  <div className="mt-4 flex items-center justify-between">
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
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
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
