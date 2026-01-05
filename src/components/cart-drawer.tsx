"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Plus, Minus, Copy, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MockupImage } from "@/components/mockup-image";

import { useCartStore } from "@/store/cart-store";
import { formatMoneyRonBani } from "@/lib/currency";
import { COUNTRIES, shippingForCountry } from "@/lib/shipping";
import { formatFrameColor, formatFrameModel, formatSize } from "@/lib/product";

function CartDrawerMounted() {
  const router = useRouter();

  const open = useCartStore((s) => s.drawerOpen);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) openDrawer();
      else closeDrawer();
    },
    [openDrawer, closeDrawer]
  );

  const items = useCartStore((s) => s.items);
  const count = useCartStore((s) => s.count());
  const removeItem = useCartStore((s) => s.removeItem);
  const duplicateItem = useCartStore((s) => s.duplicateItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const countryCode = useCartStore((s) => s.countryCode);
  const setCountryCode = useCartStore((s) => s.setCountryCode);

  const subtotal = React.useMemo(() => items.reduce((sum, i) => sum + i.basePriceRonBani * i.quantity, 0), [items]);
  const shipping = React.useMemo(() => shippingForCountry(countryCode), [countryCode]);
  const total = subtotal + shipping.costRonBani;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative" aria-label="Open cart">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 ? (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
              {count}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="fixed right-0 top-0 left-auto h-dvh w-[calc(100%-1rem)] max-w-md translate-x-0 translate-y-0 rounded-none border-l bg-card p-0 sm:w-full sm:rounded-l-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Your cart</DialogTitle>
              <DialogDescription>{count > 0 ? `${count} item${count === 1 ? "" : "s"}` : "Add a framed print to continue."}</DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-auto px-6 pb-6">
            {items.length === 0 ? (
              <div className="rounded-2xl border bg-muted p-5 text-sm text-muted-foreground">
                Your cart is empty.
                <div className="mt-3">
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href="/themes">Browse themes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-4 rounded-2xl border bg-card p-4">
                    <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl border bg-muted">
                      <MockupImage
                        src={i.mockupImage}
                        fallbackSrc="/placeholders/gallery.svg"
                        alt={`Mockup — ${i.themeName}`}
                        sizes="112px"
                        className="object-cover"
                      />
                      <div className="pointer-events-none absolute left-2 top-2">
                        <Badge variant="muted">Preview</Badge>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{i.themeName}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatSize(i.size)} • {formatFrameColor(i.frameColor)} • {formatFrameModel(i.frameModel)} • Glossy
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-2"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/create?editCartItem=${encodeURIComponent(i.id)}`);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            onClick={() => {
                              duplicateItem(i.id);
                              toast.success("Duplicated");
                            }}
                            aria-label="Duplicate item"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
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
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setQuantity(i.id, i.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-8 text-center text-sm font-medium">{i.quantity}</div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setQuantity(i.id, i.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium">
                          {formatMoneyRonBani(i.basePriceRonBani * i.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-background/60 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoneyRonBani(subtotal)}</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{formatMoneyRonBani(shipping.costRonBani)}</span>
              </div>
              <Select value={countryCode ?? ""} onValueChange={(v) => setCountryCode(v)}>
                <SelectTrigger aria-label="Select country">
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

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatMoneyRonBani(total)}</span>
            </div>

            <div className="mt-4 flex gap-3">
              <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/cart">View cart</Link>
              </Button>
              <Button asChild className="w-full" disabled={items.length === 0} onClick={() => setOpen(false)}>
                <Link href="/cart">Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CartDrawer() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" className="relative" aria-label="Open cart" disabled>
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Cart</span>
      </Button>
    );
  }

  return <CartDrawerMounted />;
}
