import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const assetSchema = z.object({
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().nonnegative().optional(),
  format: z.string().min(1).optional(),
  kind: z.enum(["original", "preview"]),
  orderItemId: z.string().min(1).optional(),
});

const bodySchema = z.object({
  orderPublicId: z.string().min(1),
  assets: z.array(assetSchema).min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { orderPublicId, assets } = parsed.data;

  const order = await prisma.order.findUnique({ where: { publicId: orderPublicId }, select: { id: true, status: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Order is no longer editable." }, { status: 409 });
  }

  const itemPublicIds = Array.from(new Set(assets.map((a) => a.orderItemId).filter(Boolean) as string[]));
  const items = itemPublicIds.length
    ? await prisma.orderItem.findMany({ where: { orderId: order.id, publicItemId: { in: itemPublicIds } }, select: { id: true, publicItemId: true } })
    : [];
  const itemIdByPublicId = new Map(items.map((it) => [it.publicItemId!, it.id] as const));

  const publicIds = assets.map((a) => a.publicId);
  const existing = await prisma.upload.findMany({
    where: {
      orderId: order.id,
      provider: "CLOUDINARY",
      key: { in: publicIds },
    },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((e) => e.key).filter(Boolean) as string[]);

  const toCreate = assets.filter((a) => !existingKeys.has(a.publicId));
  if (toCreate.length) {
    await prisma.upload.createMany({
      data: toCreate.map((a) => ({
        orderId: order.id,
        orderItemId: a.orderItemId ? itemIdByPublicId.get(a.orderItemId) ?? null : null,

        // Preserve existing semantics: these are customer-provided photos.
        type: "CUSTOMER_PHOTO",

        provider: "CLOUDINARY",
        kind: a.kind,
        key: a.publicId,
        filePath: a.secureUrl,
        originalName: a.publicId,
        size: a.bytes ?? null,
        width: a.width ?? null,
        height: a.height ?? null,
        format: a.format ?? null,
      })),
    });
  }

  return NextResponse.json({ ok: true, created: toCreate.length, skipped: assets.length - toCreate.length });
}
