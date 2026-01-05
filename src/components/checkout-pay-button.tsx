"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function CheckoutPayButton({ publicId, disabled, clearCartOnSuccess }: { publicId: string; disabled?: boolean; clearCartOnSuccess?: boolean }) {
  const router = useRouter();
  const [paying, setPaying] = React.useState(false);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <Button
      type="button"
      className="mt-3 w-full"
      data-testid="checkout-pay"
      disabled={!!disabled || paying}
      onClick={async () => {
        setPaying(true);
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(publicId)}/pay-mock`, { method: "POST" });
          const json = await res.json().catch(() => null);
          if (!res.ok) throw new Error(json?.error ?? "Payment failed");

          toast.success("Payment complete (mock)");
          if (clearCartOnSuccess) clearCart();
          router.push(`/order/${encodeURIComponent(publicId)}`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Payment failed");
        } finally {
          setPaying(false);
        }
      }}
    >
      {paying ? "Paying…" : "Pay now (mock)"}
    </Button>
  );
}
