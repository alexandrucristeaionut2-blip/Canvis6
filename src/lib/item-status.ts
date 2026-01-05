import { z } from "zod";

export const ItemStatusValues = [
  "DRAFT",
  "PAID_AWAITING_PREVIEW",
  "PREVIEW_READY",
  "REVISION_REQUESTED",
  "APPROVED_IN_PRODUCTION",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
] as const;

export type ItemStatus = (typeof ItemStatusValues)[number];

export const ItemStatusSchema = z.enum(ItemStatusValues);
