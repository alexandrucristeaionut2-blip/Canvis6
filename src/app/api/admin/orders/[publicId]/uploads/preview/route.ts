import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { computeOrderStatusFromItems } from "@/lib/order-aggregate";
import { saveImageFiles } from "@/lib/upload";
import { ItemStatusSchema } from "@/lib/item-status";

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;

  // Back-compat: allow both internal id and publicId in this slug.
  const order =
    (await prisma.order.findUnique({ where: { id: publicId }, select: { id: true, publicId: true } })) ??
    (await prisma.order.findUnique({ where: { publicId }, select: { id: true, publicId: true } }));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    select: { id: true, publicItemId: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });

  if (items.length !== 1 || !items[0]!.publicItemId) {
    return NextResponse.json(
      { error: "Order has multiple items. Upload previews via the item-specific endpoint." },
      { status: 400 }
    );
  }

  const item = items[0]!;

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length < 1) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  try {
    const relativeDir = `orders/${order.publicId}/items/${item.publicItemId}/preview`;
    const saved = await saveImageFiles({ files, relativeDir, maxFiles: 3 });

    await prisma.upload.createMany({
      data: saved.map((s) => ({
        orderId: null,
        orderItemId: item.id,
        type: "PREVIEW_IMAGE",
        filePath: s.filePath,
        originalName: s.originalName,
      })),
    });

    await prisma.orderItem.update({
      where: { id: item.id },
      data: { status: "PREVIEW_READY", previewReadyAt: new Date() },
    });

    const statuses = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { status: true } });
    await prisma.order.update({
      where: { id: order.id },
      data: { status: computeOrderStatusFromItems(statuses.map((s) => ItemStatusSchema.parse(s.status))) },
    });

    return NextResponse.json({ ok: true, uploads: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
