import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";

const bodySchema = z.object({
  uploadId: z.string().min(1),
  itemPublicId: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: parsed.data.itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const upload = await prisma.upload.findFirst({
    where: { id: parsed.data.uploadId, orderId: order.id, orderItemId: null },
    select: { id: true },
  });
  if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

  await prisma.upload.update({
    where: { id: upload.id },
    data: { orderItemId: item.id, orderId: null },
  });

  return NextResponse.json({ ok: true });
}
