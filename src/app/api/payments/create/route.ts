import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { notifyAdminOrderPaid } from "@/lib/notify-admin";

const bodySchema = z.object({
  orderPublicId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { orderPublicId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { publicId: orderPublicId },
    select: {
      id: true,
      publicId: true,
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
    return NextResponse.json({ checkoutUrl: `/order/${encodeURIComponent(order.publicId)}`, alreadyPaid: true });
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

  await prisma.order.update({ where: { id: order.id }, data: { status: "PAID_AWAITING_PREVIEW" } });

  if (order.items.length) {
    await prisma.orderItem.updateMany({
      where: { id: { in: order.items.map((i) => i.id) } },
      data: { status: "PAID_AWAITING_PREVIEW" },
    });
  }

  await prisma.eventLog.create({
    data: { orderId: order.id, type: "PAYMENT_MOCK", message: "Paid (mock)" },
  });

  await notifyAdminOrderPaid({ publicId: order.publicId });

  return NextResponse.json({ checkoutUrl: `/order/${encodeURIComponent(order.publicId)}`, success: true });
}
