import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const uploads = await prisma.upload.findMany({
    where: { orderItemId: item.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, type: true, filePath: true, originalName: true, createdAt: true },
  });

  return NextResponse.json({ uploads });
}
