import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { ItemStatusSchema } from "@/lib/item-status";
import { computeOrderStatusFromItems } from "@/lib/order-aggregate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: ItemStatusSchema,
  trackingNumber: z.string().max(80).optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId, itemPublicId } = await params;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  if (!publicId || !itemPublicId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date();
  const status = parsed.data.status;

  if (status === "PREVIEW_READY") {
    const count = await prisma.upload.count({ where: { orderItemId: item.id, type: "PREVIEW_IMAGE" } });
    if (count < 1) {
      return NextResponse.json(
        { error: "Cannot mark PREVIEW_READY without preview uploads." },
        { status: 409 }
      );
    }
  }

  await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      status,
      trackingNumber: parsed.data.trackingNumber ?? undefined,
      approvedAt: status === "APPROVED_IN_PRODUCTION" ? now : undefined,
      previewReadyAt: status === "PREVIEW_READY" ? now : undefined,
      productionStartedAt: status === "IN_PRODUCTION" ? now : undefined,
      shippedAt: status === "SHIPPED" ? now : undefined,
    },
  });

  const statuses = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { status: true } });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: computeOrderStatusFromItems(statuses.map((s) => ItemStatusSchema.parse(s.status))) },
  });

  return NextResponse.json({ ok: true });
}
