import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { computeOrderStatusFromItems } from "@/lib/order-aggregate";
import { ItemStatusSchema } from "@/lib/item-status";

const bodySchema = z.object({
  notes: z.string().min(3).max(2000),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, OR: [{ publicItemId: itemPublicId }, { id: itemPublicId }] },
    select: { id: true, status: true, revisionUsed: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  if (item.status !== "PREVIEW_READY") {
    return NextResponse.json({ error: "Item is not ready for revision requests." }, { status: 409 });
  }
  if (item.revisionUsed) {
    return NextResponse.json({ error: "Revision already used for this item." }, { status: 409 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const notes = parsed.data.notes.trim();

  await prisma.orderItem.update({
    where: { id: item.id },
    data: { status: "REVISION_REQUESTED", revisionUsed: true, revisionNotes: notes },
  });

  await prisma.eventLog.create({
    data: { orderId: order.id, type: "ITEM_REVISION_REQUESTED", message: `[item:${itemPublicId}] ${notes}` },
  });

  const statuses = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { status: true } });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: computeOrderStatusFromItems(statuses.map((s) => ItemStatusSchema.parse(s.status))) },
  });

  return NextResponse.json({ ok: true });
}
