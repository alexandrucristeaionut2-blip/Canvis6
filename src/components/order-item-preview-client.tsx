"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function statusChip(status: string) {
  switch (status) {
    case "PREVIEW_READY":
      return { text: "Preview ready", variant: "premium" as const };
    case "REVISION_REQUESTED":
      return { text: "Revision requested", variant: "muted" as const };
    case "APPROVED_IN_PRODUCTION":
      return { text: "Approved", variant: "premium" as const };
    case "PAID_AWAITING_PREVIEW":
      return { text: "Awaiting preview", variant: "muted" as const };
    default:
      return { text: status, variant: "muted" as const };
  }
}

export function OrderItemPreviewClient({
  orderPublicId,
  itemPublicId,
  itemStatus,
  revisionUsed,
}: {
  orderPublicId: string;
  itemPublicId: string;
  itemStatus: string;
  revisionUsed: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState<"approve" | "revision" | null>(null);

  const chip = statusChip(itemStatus);

  async function approve() {
    setSubmitting("approve");
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/approve`, {
        method: "POST",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Approve failed");
      toast.success("Approved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setSubmitting(null);
    }
  }

  async function requestRevision() {
    setSubmitting("revision");
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemPublicId)}/request-revision`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Revision request failed");
      toast.success("Revision requested");
      setNotes("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revision request failed");
    } finally {
      setSubmitting(null);
    }
  }

  const canAct = itemStatus === "PREVIEW_READY";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Approval</CardTitle>
          <Badge variant={chip.variant}>{chip.text}</Badge>
        </div>
        <CardDescription>Approve to start production, or request one revision.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Button type="button" className="w-full" disabled={!canAct || submitting !== null} onClick={approve}>
          {submitting === "approve" ? "Approving…" : "Approve preview"}
        </Button>

        <div className="rounded-2xl border bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground">Request a revision (1 included)</div>
          <div className="mt-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={revisionUsed ? "Revision already used for this item." : "Tell us what to adjust…"}
              disabled={revisionUsed || !canAct || submitting !== null}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            disabled={revisionUsed || !canAct || submitting !== null || notes.trim().length < 3}
            onClick={requestRevision}
          >
            {revisionUsed ? "Revision already used" : submitting === "revision" ? "Sending…" : "Request revision"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">Actions are available once the preview is ready.</div>
      </CardContent>
    </Card>
  );
}
