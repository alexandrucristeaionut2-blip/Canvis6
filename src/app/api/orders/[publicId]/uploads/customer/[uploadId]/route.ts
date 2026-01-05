import fs from "fs/promises";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeJoinUnderUploads } from "@/lib/upload";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; uploadId: string }> }
) {
  const { publicId, uploadId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: { id: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Uploads are closed for this order." }, { status: 409 });
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });
  if (items.length !== 1) {
    return NextResponse.json(
      { error: "This order has multiple items. Delete uploads via the item-specific endpoint." },
      { status: 400 }
    );
  }

  const upload = await prisma.upload.findFirst({
    where: { id: uploadId, orderItemId: items[0]!.id, type: "CUSTOMER_PHOTO" },
    select: { id: true, filePath: true },
  });

  if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

  // Best effort: delete file; still remove DB row if file missing.
  try {
    const abs = safeJoinUnderUploads(upload.filePath);
    await fs.unlink(abs);
  } catch {
    // ignore
  }

  await prisma.upload.delete({ where: { id: upload.id } });

  return NextResponse.json({ ok: true });
}
