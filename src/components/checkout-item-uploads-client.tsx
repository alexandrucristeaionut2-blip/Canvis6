"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckoutPayButton } from "@/components/checkout-pay-button";

type UploadRow = { id: string; type: string; filePath: string; originalName: string };

export function CheckoutItemUploadsClient({
  orderPublicId,
  items,
  fromCart,
}: {
  orderPublicId: string;
  items: Array<{ publicItemId: string; themeName: string }>;
  fromCart: boolean;
}) {
  const [uploadsByItem, setUploadsByItem] = React.useState<Record<string, UploadRow[]>>({});
  const [busyItem, setBusyItem] = React.useState<string | null>(null);

  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const refreshItem = React.useCallback(async (itemPublicId: string) => {
    const res = await fetch(
      `/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/uploads`,
      { cache: "no-store" }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error ?? "Failed to load uploads");
    const all = (json?.uploads ?? []) as UploadRow[];
    setUploadsByItem((prev) => ({ ...prev, [itemPublicId]: all.filter((u) => u.type === "CUSTOMER_PHOTO") }));
  }, [orderPublicId]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all(items.map((i) => refreshItem(i.publicItemId)));
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Failed to load uploads");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, refreshItem]);

  async function upload(itemPublicId: string, files: FileList) {
    setBusyItem(itemPublicId);
    try {
      const form = new FormData();
      for (const f of Array.from(files)) form.append("files", f);

      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/uploads/customer`,
        { method: "POST", body: form }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");

      await refreshItem(itemPublicId);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyItem(null);
    }
  }

  async function remove(itemPublicId: string, uploadId: string) {
    setBusyItem(itemPublicId);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/uploads/customer/${encodeURIComponent(uploadId)}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Remove failed");

      await refreshItem(itemPublicId);
      toast.message("Removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusyItem(null);
    }
  }

  const counts = items.map((i) => ({
    id: i.publicItemId,
    count: (uploadsByItem[i.publicItemId] ?? []).length,
  }));

  const allReady = counts.every((c) => c.count >= 2);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-muted p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium">Uploads per item</div>
          <Badge variant={allReady ? "premium" : "muted"}>{allReady ? "Ready" : "Needs photos"}</Badge>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Each item needs at least 2 customer photos before payment.</div>
      </div>

      <div className="space-y-4">
        {items.map((it) => {
          const itemUploads = uploadsByItem[it.publicItemId] ?? [];
          const count = itemUploads.length;

          return (
            <div key={it.publicItemId} className="rounded-2xl border bg-card p-4" data-testid={`checkout-item-${it.publicItemId}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{it.themeName}</div>
                <Badge variant={count >= 2 ? "premium" : "muted"}>{count}/2 photos</Badge>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {itemUploads.slice(0, 4).map((u) => (
                  <div key={u.id} className="overflow-hidden rounded-2xl border bg-muted">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/files/${u.filePath}`} alt={u.originalName} className="aspect-[4/3] w-full object-cover" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-2"
                        disabled={busyItem === it.publicItemId}
                        onClick={() => remove(it.publicItemId, u.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-3">
                <input
                  ref={(el) => {
                    inputRefs.current[it.publicItemId] = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    void upload(it.publicItemId, files);
                    e.currentTarget.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyItem === it.publicItemId}
                  onClick={() => inputRefs.current[it.publicItemId]?.click()}
                >
                  {busyItem === it.publicItemId ? "Uploading…" : "Add photos"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <CheckoutPayButton publicId={orderPublicId} disabled={!allReady} clearCartOnSuccess={fromCart} />
      {!allReady ? <div className="text-xs text-muted-foreground">Add photos for every item to continue.</div> : null}
    </div>
  );
}
