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

type AdminCustomerUpload = {
  id: string;
  originalName: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  url: string | null;
};

type AdminOrder = {
  publicId: string;
  status: string;
  createdAt: string;
  items: AdminItem[];
};

export function AdminOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [customerUploads, setCustomerUploads] = React.useState<Record<string, AdminCustomerUpload[]>>({});
  const [loadingUploadsKey, setLoadingUploadsKey] = React.useState<string | null>(null);

  async function loadCustomerUploads(orderPublicId: string, itemPublicId: string) {
    const key = `${orderPublicId}:${itemPublicId}`;
    setLoadingUploadsKey(key);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/uploads/customer`
      );
      const json = (await res.json().catch(() => null)) as { uploads?: AdminCustomerUpload[]; error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Failed to load uploads");
      setCustomerUploads((prev) => ({ ...prev, [key]: json?.uploads ?? [] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setLoadingUploadsKey(null);
    }
  }

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
              const uploads = customerUploads[key];
              const loadingUploads = loadingUploadsKey === key;
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
                      <Badge variant={uploads && uploads.length > 0 ? "premium" : "muted"}>
                        {uploads ? `${uploads.length} photos` : "photos"}
                      </Badge>
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

                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loadingUploads}
                        onClick={() => void loadCustomerUploads(o.publicId, it.publicItemId)}
                        data-testid={`admin-load-customer-${it.publicItemId}`}
                      >
                        {loadingUploads ? "Loading…" : "Load customer photos"}
                      </Button>
                      <div className="text-xs text-muted-foreground">Signed links expire in ~10 minutes.</div>
                    </div>

                    {uploads && uploads.length ? (
                      <div className="mt-3 grid gap-2">
                        {uploads.map((u) => (
                          <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{u.originalName}</div>
                              <div className="text-xs text-muted-foreground">
                                {u.size ? `${Math.round(u.size / 1024)} KB` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!u.url}
                                onClick={() => {
                                  if (!u.url) return;
                                  window.open(u.url, "_blank", "noopener,noreferrer");
                                }}
                              >
                                Download
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!u.url}
                                onClick={async () => {
                                  if (!u.url) return;
                                  try {
                                    await navigator.clipboard.writeText(u.url);
                                    toast.success("Secure link copied");
                                  } catch {
                                    toast.error("Failed to copy");
                                  }
                                }}
                              >
                                Copy secure link
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : uploads ? (
                      <div className="mt-3 text-sm text-muted-foreground">No customer photos yet.</div>
                    ) : null}
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
