"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AdminItem = {
  publicItemId: string;
  themeName: string;
  status: string;
  revisionUsed: boolean;
  previewCount: number;
};

type AdminOrder = {
  publicId: string;
  status: string;
  createdAt: string;
  items: AdminItem[];
};

export function AdminOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const [busyKey, setBusyKey] = React.useState<string | null>(null);

  async function uploadPreview(orderPublicId: string, itemPublicId: string, files: FileList) {
    const key = `${orderPublicId}:${itemPublicId}`;
    setBusyKey(key);
    try {
      const form = new FormData();
      for (const f of Array.from(files)) form.append("files", f);

      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/uploads/preview`,
        { method: "POST", body: form }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");
      toast.success("Preview uploaded");
      // Simple refresh: reload the page to reflect updated statuses.
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyKey(null);
    }
  }

  if (orders.length === 0) {
    return <div className="rounded-2xl border bg-muted p-6 text-sm text-muted-foreground">No orders yet.</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.publicId} className="rounded-2xl border bg-card p-5" data-testid={`admin-order-${o.publicId}`}> 
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-medium">Order {o.publicId}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted">{o.status}</Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={`/order/${encodeURIComponent(o.publicId)}`}>Open customer view</Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {o.items.map((it) => {
              const key = `${o.publicId}:${it.publicItemId}`;
              const busy = busyKey === key;
              return (
                <div key={it.publicItemId} className="rounded-2xl border bg-background p-4" data-testid={`admin-item-${it.publicItemId}`}> 
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{it.themeName}</div>
                      <div className="text-xs text-muted-foreground">Item {it.publicItemId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">{it.status}</Badge>
                      <Badge variant={it.previewCount > 0 ? "premium" : "muted"}>{it.previewCount} preview</Badge>
                      {it.revisionUsed ? <Badge variant="muted">revision used</Badge> : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="text-sm"
                      disabled={busy}
                      onChange={(e) => {
                        const files = e.currentTarget.files;
                        if (!files || files.length === 0) return;
                        void uploadPreview(o.publicId, it.publicItemId, files);
                        e.currentTarget.value = "";
                      }}
                      data-testid={`admin-upload-${it.publicItemId}`}
                    />
                    <div className="text-xs text-muted-foreground">Uploading a preview sets the item to PREVIEW_READY.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
