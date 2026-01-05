import type { ItemStatus } from "@/lib/item-status";

export function computeOrderStatusFromItems(statuses: ItemStatus[]): string {
  if (statuses.length === 0) return "DRAFT";

  const hasAwaiting = statuses.some((s) => s === "PAID_AWAITING_PREVIEW" || s === "DRAFT");
  if (hasAwaiting) return "PAID_AWAITING_PREVIEW";

  const allApprovedOrLater = statuses.every((s) =>
    ["APPROVED_IN_PRODUCTION", "IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(s)
  );
  if (allApprovedOrLater) {
    const allDelivered = statuses.every((s) => s === "DELIVERED");
    if (allDelivered) return "DELIVERED";

    const anyShipped = statuses.some((s) => s === "SHIPPED");
    if (anyShipped) return "SHIPPED";

    const anyInProd = statuses.some((s) => s === "IN_PRODUCTION");
    if (anyInProd) return "IN_PRODUCTION";

    return "APPROVED_IN_PRODUCTION";
  }

  const anyApproved = statuses.some((s) =>
    ["APPROVED_IN_PRODUCTION", "IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(s)
  );
  if (anyApproved) return "PARTIALLY_APPROVED";

  const anyPreviewReady = statuses.some((s) => s === "PREVIEW_READY");
  if (anyPreviewReady) return "PREVIEW_READY";

  const anyRevision = statuses.some((s) => s === "REVISION_REQUESTED");
  if (anyRevision) return "REVISION_REQUESTED";

  return statuses[0]!;
}
