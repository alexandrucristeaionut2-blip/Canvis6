"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateShippingSchema = z.object({
  orderPublicId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  line1: z.string().min(2).max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().min(1).max(80),
  region: z.string().max(80).optional().or(z.literal("")),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(56),
  saveToAccount: z.string().optional(),
});

type State = { ok?: true; error?: string };

export async function updateCheckoutShippingAction(_: State, formData: FormData): Promise<State> {
  const raw = {
    orderPublicId: String(formData.get("orderPublicId") ?? "").trim(),
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    saveToAccount: String(formData.get("saveToAccount") ?? ""),
  };

  const parsed = updateShippingSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please check the form fields." };

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const order = await prisma.order.findUnique({
    where: { publicId: parsed.data.orderPublicId },
    select: { id: true, publicId: true, status: true, userId: true },
  });

  if (!order) return { error: "Order not found." };

  // If this order is already attached to a user, only that user can update it.
  if (order.userId && order.userId !== userId) return { error: "You do not have access to this order." };

  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
    return { error: "This order can no longer be edited." };
  }

  // If the user is signed in, attach guest orders to their account on first save.
  const attachUserId = !order.userId && userId ? userId : undefined;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      userId: attachUserId,
      name: parsed.data.fullName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      addressLine1: parsed.data.line1,
      addressLine2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.region || null,
      postalCode: parsed.data.postalCode,
    },
  });

  const wantsSave = parsed.data.saveToAccount === "on";
  if (wantsSave && userId) {
    const existing = await prisma.address.findFirst({
      where: {
        userId,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || null,
        city: parsed.data.city,
        region: parsed.data.region || null,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
      },
      select: { id: true },
    });

    if (!existing) {
      const hasDefault = await prisma.address.findFirst({ where: { userId, isDefault: true }, select: { id: true } });

      await prisma.address.create({
        data: {
          userId,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          line1: parsed.data.line1,
          line2: parsed.data.line2 || null,
          city: parsed.data.city,
          region: parsed.data.region || null,
          postalCode: parsed.data.postalCode,
          country: parsed.data.country,
          isDefault: !hasDefault,
        },
      });
    }
  }

  revalidatePath("/checkout");
  return { ok: true };
}
