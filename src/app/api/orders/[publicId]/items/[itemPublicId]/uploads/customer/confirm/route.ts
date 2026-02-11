import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { CUSTOMER_UPLOADS, isAllowedImageMimeType } from "@/lib/upload-policy";
import { headObject, isS3Configured } from "@/lib/storage/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UploadSchema = z.object({
  key: z.string().min(1),
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().int().positive().max(CUSTOMER_UPLOADS.maxBytesPerFile),
});

const BodySchema = z.object({
  uploads: z.array(UploadSchema).min(1).max(8),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  if (!isS3Configured()) {
    return NextResponse.json({ configured: false });
  }

  const { publicId, itemPublicId } = await params;

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true, status: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Uploads are closed for this order." }, { status: 409 });
  }

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const existingCount = await prisma.upload.count({ where: { orderItemId: item.id, type: "CUSTOMER_PHOTO" } });
  const remaining = Math.max(0, CUSTOMER_UPLOADS.maxFilesPerItem - existingCount);
  if (parsed.data.uploads.length > remaining) {
    return NextResponse.json({ error: `Too many files. Remaining: ${remaining}` }, { status: 409 });
  }

  for (const u of parsed.data.uploads) {
    if (!isAllowedImageMimeType(u.mimeType)) {
      return NextResponse.json({ error: `Unsupported type: ${u.mimeType}` }, { status: 400 });
    }
    if (!u.key.startsWith(`orders/${publicId}/items/${itemPublicId}/customer/`)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    // Verify object exists in storage.
    const head = await headObject({ key: u.key }).catch(() => null);
    const contentLength = Number(head?.ContentLength ?? 0);
    if (!head || !contentLength) {
      return NextResponse.json({ error: "Upload not found in storage" }, { status: 409 });
    }

    await prisma.upload.create({
      data: {
        orderId: null,
        orderItemId: item.id,
        type: "CUSTOMER_PHOTO",
        key: u.key,
        // Keep legacy filePath for now; for cloud uploads we store key here too.
        filePath: u.key,
        originalName: u.originalName,
        mimeType: u.mimeType,
        size: u.size,
      },
    });
  }

  return NextResponse.json({ ok: true, configured: true });
}
