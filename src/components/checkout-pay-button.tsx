"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type ItemUploads = { itemPublicId: string; uploads: Array<{ filePath: string; originalName: string }> };

export function CheckoutPayButton({
  publicId,
  disabled,
  clearCartOnSuccess,
  items,
}: {
  publicId: string;
  disabled?: boolean;
  clearCartOnSuccess?: boolean;
  items: ItemUploads[];
}) {
  const router = useRouter();
  const [paying, setPaying] = React.useState(false);
  const [progress, setProgress] = React.useState<string | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  async function uploadAllToCloudinary() {
    const flat: Array<{ itemPublicId: string; filePath: string; originalName: string }> = [];
    for (const it of items) {
      for (const u of it.uploads) flat.push({ itemPublicId: it.itemPublicId, filePath: u.filePath, originalName: u.originalName });
    }
    if (!flat.length) return;

    // Upload per item so we can persist to the existing POST /uploads route.
    for (const it of items) {
      const uploads = it.uploads;
      if (!uploads.length) continue;

      const assets: Array<{ public_id: string; secure_url: string; bytes?: number; width?: number; height?: number; format?: string; resource_type?: string }> = [];

      for (let idx = 0; idx < uploads.length; idx++) {
        const u = uploads[idx];
        setProgress(`Uploading ${idx + 1}/${uploads.length}…`);

        // 1) Get signed Cloudinary params
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderPublicId: publicId, itemId: it.itemPublicId }),
        });
        const signJson = await signRes.json().catch(() => null);
        if (!signRes.ok) throw new Error(signJson?.error ?? "Failed to sign upload");

        const cloudName = signJson.cloudName as string;
        const apiKey = signJson.apiKey as string;
        const timestamp = signJson.timestamp as number;
        const signature = signJson.signature as string;
        const folder = signJson.folder as string;
        const tags = signJson.tags as string;

        // 2) Fetch the already-uploaded file from our app and re-upload to Cloudinary
        const fileRes = await fetch(`/api/files/${u.filePath}`);
        if (!fileRes.ok) throw new Error(`Failed to read ${u.originalName}`);
        const blob = await fileRes.blob();
        const file = new File([blob], u.originalName, { type: blob.type || "application/octet-stream" });

        const form = new FormData();
        form.set("file", file);
        form.set("api_key", apiKey);
        form.set("timestamp", String(timestamp));
        form.set("signature", signature);
        form.set("folder", folder);
        form.set("tags", tags);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
          method: "POST",
          body: form,
        });
        const uploadJson = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok) {
          const msg = uploadJson?.error?.message ?? "Cloudinary upload failed";
          throw new Error(msg);
        }

        assets.push({
          public_id: uploadJson.public_id as string,
          secure_url: uploadJson.secure_url as string,
          bytes: uploadJson.bytes as number | undefined,
          width: uploadJson.width as number | undefined,
          height: uploadJson.height as number | undefined,
          format: uploadJson.format as string | undefined,
          resource_type: uploadJson.resource_type as string | undefined,
        });
      }

      setProgress("Saving…");
      const persistRes = await fetch(`/api/orders/${encodeURIComponent(publicId)}/items/${encodeURIComponent(it.itemPublicId)}/uploads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assets }),
      });
      const persistJson = await persistRes.json().catch(() => null);
      if (!persistRes.ok) throw new Error(persistJson?.error ?? "Failed to persist assets");
    }
  }

  return (
    <Button
      type="button"
      className="mt-3 w-full"
      data-testid="checkout-pay"
      disabled={!!disabled || paying}
      onClick={async () => {
        setPaying(true);
        setProgress(null);
        try {
          await uploadAllToCloudinary();

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
          setProgress(null);
        }
      }}
    >
      {paying ? (progress ?? "Paying…") : "Pay now"}
    </Button>
  );
}
