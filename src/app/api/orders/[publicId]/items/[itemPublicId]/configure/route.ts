import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { computeOrderTotalsRonBani } from "@/lib/order-totals";
import { PAPER_FINISH, FRAME_COLORS, FRAME_MODELS, SIZE_OPTIONS, getBasePriceRonBani } from "@/lib/product";

const bodySchema = z.object({
  themeSlug: z.string().min(1),
  size: z.enum(SIZE_OPTIONS.map((s) => s.value) as ["A4", "A3"]),
  frameColor: z.enum(FRAME_COLORS.map((c) => c.value) as [string, ...string[]]),
  frameModel: z.enum(FRAME_MODELS.map((m) => m.value) as [string, ...string[]]),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true, status: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Order is no longer editable." }, { status: 409 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const theme = await prisma.theme.findUnique({ where: { slug: parsed.data.themeSlug }, select: { id: true } });
  if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true, quantity: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const updated = await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      themeId: theme.id,
      size: parsed.data.size,
      basePrice: getBasePriceRonBani(parsed.data.size),
      frameColor: parsed.data.frameColor,
      frameModel: parsed.data.frameModel,
      paperFinish: PAPER_FINISH,
    },
    select: { id: true },
  });

  const cleanNotes = (parsed.data.notes ?? "").trim();
  if (cleanNotes.length) {
    await prisma.eventLog.create({
      data: { orderId: order.id, type: "CUSTOMER_NOTES", message: `[item:${itemPublicId}] ${cleanNotes}` },
    });
  }

  const allItems = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { basePrice: true, quantity: true } });
  const totals = computeOrderTotalsRonBani({ items: allItems, countryCode: null });

  await prisma.order.update({
    where: { id: order.id },
    data: { subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total },
  });

  return NextResponse.json({ ok: true, itemId: updated.id });
}
