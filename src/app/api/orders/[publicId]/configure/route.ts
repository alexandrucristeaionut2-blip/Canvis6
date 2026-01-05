import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { PAPER_FINISH, FRAME_COLORS, FRAME_MODELS, SIZE_OPTIONS, getBasePriceRonBani } from "@/lib/product";
import { computeOrderTotalsRonBani } from "@/lib/order-totals";
import { createPublicId } from "@/lib/public-id";

const bodySchema = z.object({
  themeSlug: z.string().min(1),
  size: z.enum(SIZE_OPTIONS.map((s) => s.value) as ["A4", "A3"]),
  frameColor: z.enum(FRAME_COLORS.map((c) => c.value) as [string, ...string[]]),
  frameModel: z.enum(FRAME_MODELS.map((m) => m.value) as [string, ...string[]]),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    select: { id: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "DRAFT" && order.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Order is no longer editable." }, { status: 409 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { themeSlug, size, frameColor, frameModel, notes } = parsed.data;

  const theme = await prisma.theme.findUnique({ where: { slug: themeSlug }, select: { id: true } });
  if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

  // Back-compat single-item configure: update the first item, or create one if missing.
  const existing = await prisma.orderItem.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: "asc" } });

  if (existing) {
    await prisma.orderItem.update({
      where: { id: existing.id },
      data: {
        publicItemId: existing.publicItemId ?? createPublicId(),
        size,
        basePrice: getBasePriceRonBani(size),
        themeId: theme.id,
        frameColor,
        frameModel,
        paperFinish: PAPER_FINISH,
        quantity: 1,
      },
    });
  } else {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        publicItemId: createPublicId(),
        size,
        basePrice: getBasePriceRonBani(size),
        themeId: theme.id,
        frameColor,
        frameModel,
        paperFinish: PAPER_FINISH,
        quantity: 1,
        status: "DRAFT",
      },
    });
  }

  const allItems = await prisma.orderItem.findMany({ where: { orderId: order.id }, select: { basePrice: true, quantity: true } });
  const totals = computeOrderTotalsRonBani({ items: allItems, countryCode: null });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    },
  });

  const cleanNotes = (notes ?? "").trim();
  if (cleanNotes.length) {
    await prisma.eventLog.create({
      data: { orderId: order.id, type: "CUSTOMER_NOTES", message: cleanNotes },
    });
  }

  return NextResponse.json({ ok: true });
}
