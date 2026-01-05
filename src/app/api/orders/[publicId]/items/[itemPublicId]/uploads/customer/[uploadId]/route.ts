import fs from "fs/promises";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeJoinUnderUploads } from "@/lib/upload";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; itemPublicId: string; uploadId: string }> }
) {
  const { publicId, itemPublicId, uploadId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: { id: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Uploads are closed for this order." }, { status: 409 });
  }

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const upload = await prisma.upload.findFirst({
    where: { id: uploadId, orderItemId: item.id, type: "CUSTOMER_PHOTO" },
    select: { id: true, filePath: true },
  });

  if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

  try {
    const abs = safeJoinUnderUploads(upload.filePath);
    await fs.unlink(abs);
  } catch {
    // ignore
  }

  await prisma.upload.delete({ where: { id: upload.id } });

  return NextResponse.json({ ok: true });
}
