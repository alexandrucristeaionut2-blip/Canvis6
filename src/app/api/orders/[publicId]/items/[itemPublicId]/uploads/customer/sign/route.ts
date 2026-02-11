import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { CUSTOMER_UPLOADS, getExtensionForMimeType, isAllowedImageMimeType } from "@/lib/upload-policy";
import { createPresignedUploadUrl, isS3Configured } from "@/lib/storage/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FileSchema = z.object({
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().int().positive().max(CUSTOMER_UPLOADS.maxBytesPerFile),
});

const BodySchema = z.object({
  files: z.array(FileSchema).min(1).max(8),
});

function uuidLike(): string {
  // Non-crypto unique-ish id to avoid an extra dependency.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  if (!isS3Configured()) {
    // Return 200 so browsers/tests don't treat this as a hard error.
    // The client can fall back to legacy local uploads.
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
  if (existingCount >= CUSTOMER_UPLOADS.maxFilesPerItem) {
    return NextResponse.json({ error: "Max files reached" }, { status: 409 });
  }

  const remaining = Math.max(0, CUSTOMER_UPLOADS.maxFilesPerItem - existingCount);
  if (parsed.data.files.length > remaining) {
    return NextResponse.json({ error: `Too many files. Remaining: ${remaining}` }, { status: 409 });
  }

  const uploads = await Promise.all(
    parsed.data.files.map(async (f) => {
      if (!isAllowedImageMimeType(f.mimeType)) {
        throw new Error(`Unsupported type: ${f.mimeType}`);
      }
      const ext = getExtensionForMimeType(f.mimeType);
      if (!ext) throw new Error(`Unsupported type: ${f.mimeType}`);

      const key = `orders/${publicId}/items/${itemPublicId}/customer/${uuidLike()}.${ext}`;
      const uploadUrl = await createPresignedUploadUrl({ key, contentType: f.mimeType, expiresInSeconds: 600 });
      return {
        key,
        uploadUrl,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        expiresInSeconds: 600,
      };
    })
  ).catch((err) => {
    const message = err instanceof Error ? err.message : "Failed to sign upload";
    return Promise.reject(new Error(message));
  });

  return NextResponse.json({ configured: true, uploads });
}
