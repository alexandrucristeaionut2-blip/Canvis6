import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { computeOrderStatusFromItems } from "@/lib/order-aggregate";
import { ItemStatusSchema } from "@/lib/item-status";

export async function POST(_req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, OR: [{ publicItemId: itemPublicId }, { id: itemPublicId }] },
    select: { id: true, status: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  if (item.status !== "PREVIEW_READY") {
    return NextResponse.json({ error: "Item is not ready for approval." }, { status: 409 });
  }

  await prisma.orderItem.update({
    where: { id: item.id },
    data: { status: "APPROVED_IN_PRODUCTION", approvedAt: new Date() },
  });

  await prisma.eventLog.create({
    data: { orderId: order.id, type: "ITEM_APPROVED", message: `[item:${itemPublicId}] Approved` },
  });

  const statuses = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { status: true } });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: computeOrderStatusFromItems(statuses.map((s) => ItemStatusSchema.parse(s.status))) },
  });

  return NextResponse.json({ ok: true });
}
