import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { saveImageFiles } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: { id: true, publicId: true, status: true },
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

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length < 1) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  try {
    const relativeDir = `orders/${order.publicId}/items/${itemPublicId}/customer`;
    const saved = await saveImageFiles({ files, relativeDir, maxFiles: 8 });

    await prisma.upload.createMany({
      data: saved.map((s) => ({
        orderId: null,
        orderItemId: item.id,
        type: "CUSTOMER_PHOTO",
        filePath: s.filePath,
        originalName: s.originalName,
      })),
    });

    return NextResponse.json({ ok: true, uploads: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
