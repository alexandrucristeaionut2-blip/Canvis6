import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPresignedDownloadUrl, isS3Configured } from "@/lib/storage/s3";

const postBodySchema = z.object({
  assets: z
    .array(
      z.object({
        public_id: z.string().min(1),
        secure_url: z.string().url(),
        bytes: z.number().int().nonnegative().optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        format: z.string().min(1).optional(),
        resource_type: z.string().min(1).optional(),
      })
    )
    .min(1),
});

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
    select: { id: true, type: true, key: true, filePath: true, originalName: true, createdAt: true, mimeType: true, size: true },
  });

  const withUrls = await Promise.all(
    uploads.map(async (u) => {
      const key = u.key ?? null;
      const canSign = Boolean(key && u.type === "CUSTOMER_PHOTO" && isS3Configured());
      const url = canSign ? await createPresignedDownloadUrl({ key: key!, expiresInSeconds: 600 }) : null;
      return {
        ...u,
        url,
      };
    })
  );

  return NextResponse.json({ uploads: withUrls });
}

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const json = await req.json().catch(() => null);
  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({ where: { orderId: order.id, publicItemId: itemPublicId }, select: { id: true } });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const assets = parsed.data.assets;
  const publicIds = assets.map((a) => a.public_id);

  // Best-effort de-dupe (no unique constraint).
  const existing = await prisma.upload.findMany({
    where: { orderItemId: item.id, provider: "CLOUDINARY", key: { in: publicIds } },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((e) => e.key).filter(Boolean) as string[]);

  const toCreate = assets.filter((a) => !existingKeys.has(a.public_id));
  if (toCreate.length) {
    await prisma.upload.createMany({
      data: toCreate.map((a) => ({
        orderId: order.id,
        orderItemId: item.id,
        type: "CLOUDINARY_ORIGINAL",
        provider: "CLOUDINARY",
        kind: "original",
        key: a.public_id,
        filePath: a.secure_url,
        originalName: a.public_id,
        size: a.bytes ?? null,
        width: a.width ?? null,
        height: a.height ?? null,
        format: a.format ?? null,
      })),
    });
  }

  const saved = await prisma.upload.findMany({
    where: { orderItemId: item.id, provider: "CLOUDINARY", key: { in: publicIds } },
    orderBy: { createdAt: "asc" },
    select: { id: true, key: true, filePath: true, size: true, width: true, height: true, format: true, createdAt: true },
  });

  return NextResponse.json({ assets: saved });
}
