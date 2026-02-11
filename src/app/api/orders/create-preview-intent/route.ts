import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createPublicId } from "@/lib/public-id";
import { auth } from "@/auth";

const bodySchema = z
  .object({
    // Optional: let the UI reuse an existing draft order (e.g. wizard-created draft).
    draftPublicId: z.string().min(1).optional(),
  })
  .optional();

export async function POST(req: Request) {
  const session = await auth();
  const json = await req.json().catch(() => null);
  const parsed = bodySchema?.safeParse(json);
  if (parsed && !parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const draftPublicId = parsed?.success ? parsed.data?.draftPublicId : undefined;

  if (draftPublicId) {
    const existing = await prisma.order.findUnique({ where: { publicId: draftPublicId }, select: { id: true, publicId: true, status: true } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (existing.status !== "DRAFT" && existing.status !== "SUBMITTED") {
      return NextResponse.json({ error: "Order is no longer editable." }, { status: 409 });
    }
    return NextResponse.json({ orderId: existing.id, orderPublicId: existing.publicId });
  }

  const publicId = createPublicId();
  const created = await prisma.order.create({
    data: {
      publicId,
      status: "DRAFT",
      userId: session?.user?.id ?? null,
    },
    select: { id: true, publicId: true },
  });

  return NextResponse.json({ orderId: created.id, orderPublicId: created.publicId });
}
