import { NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  orderPublicId: z.string().min(1),
  itemId: z.string().min(1).optional(),
});

const safeId = /^[a-zA-Z0-9-]+$/;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const cloudName = getRequiredEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = getRequiredEnv("CLOUDINARY_API_KEY");
    const apiSecret = getRequiredEnv("CLOUDINARY_API_SECRET");

    const { orderPublicId, itemId } = parsed.data;

    if (!safeId.test(orderPublicId)) {
      return NextResponse.json({ error: "Invalid orderPublicId" }, { status: 400 });
    }

    if (itemId && !safeId.test(itemId)) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { publicId: orderPublicId },
      select: { id: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (itemId) {
      const item = await prisma.orderItem.findFirst({ where: { orderId: order.id, publicItemId: itemId }, select: { id: true } });
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const folder = `canvist/orders/${orderPublicId}/originals`;
    const tags = `canvist,order_${orderPublicId}`;

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        tags,
        timestamp,
      },
      apiSecret
    );

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      tags,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
