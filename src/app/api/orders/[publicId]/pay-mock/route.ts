import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: {
      id: true,
      status: true,
      items: {
        select: {
          id: true,
          uploads: { where: { type: "CUSTOMER_PHOTO" }, select: { id: true } },
        },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status === "PAID_AWAITING_PREVIEW") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const insufficient = order.items
    .map((it) => ({ itemId: it.id, count: it.uploads.length }))
    .filter((x) => x.count < 2);
  if (insufficient.length) {
    return NextResponse.json(
      {
        error: "Each item needs at least 2 customer photos before payment.",
        insufficient,
      },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID_AWAITING_PREVIEW" },
  });

  if (order.items.length) {
    await prisma.orderItem.updateMany({
      where: { id: { in: order.items.map((i) => i.id) } },
      data: { status: "PAID_AWAITING_PREVIEW" },
    });
  }

  await prisma.eventLog.create({
    data: { orderId: order.id, type: "PAYMENT_MOCK", message: "Paid (mock)" },
  });

  return NextResponse.json({ ok: true });
}
