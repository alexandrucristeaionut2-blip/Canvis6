import { z } from "zod";

export const OrderStatusValues = [
  "DRAFT",
  "SUBMITTED",
  "PAID_AWAITING_PREVIEW",
  "PREVIEW_READY",
  "REVISION_REQUESTED",
  "APPROVED_IN_PRODUCTION",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof OrderStatusValues)[number];

export const OrderStatusSchema = z.enum(OrderStatusValues);
