import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: { id: true, items: { select: { id: true }, take: 2 } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Back-compat for the old Create wizard: if the order has exactly one item,
  // return that item's customer uploads.
  if (order.items.length === 1) {
    const itemId = order.items[0]!.id;
    const uploads = await prisma.upload.findMany({
      where: { orderItemId: itemId, type: "CUSTOMER_PHOTO" },
      orderBy: { createdAt: "asc" },
      select: { id: true, filePath: true, originalName: true, createdAt: true },
    });
    return NextResponse.json({ uploads });
  }

  const uploads = await prisma.upload.findMany({
    where: { orderId: order.id, orderItemId: null, type: "CUSTOMER_PHOTO" },
    orderBy: { createdAt: "asc" },
    select: { id: true, filePath: true, originalName: true, createdAt: true },
  });

  return NextResponse.json({ uploads });
}
