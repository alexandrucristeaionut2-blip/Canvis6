import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createPublicId } from "@/lib/public-id";
import { getBasePriceRonBani, PAPER_FINISH } from "@/lib/product";

const bodySchema = z.object({
  themeSlug: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

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

  const publicItemId = createPublicId();

  const item = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      publicItemId,
      themeId: theme.id,
      size: "A4",
      basePrice: getBasePriceRonBani("A4"),
      frameColor: "BLACK_MATTE",
      frameModel: "SLIM_MODERN_2CM",
      paperFinish: PAPER_FINISH,
      quantity: 1,
      status: "DRAFT",
    },
    select: { publicItemId: true },
  });

  return NextResponse.json({ itemPublicId: item.publicItemId });
}
