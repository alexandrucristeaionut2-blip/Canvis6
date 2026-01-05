"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

const createSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  line1: z.string().min(2).max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().min(1).max(80),
  region: z.string().max(80).optional().or(z.literal("")),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(56),
  isDefault: z.string().optional(),
});

export async function addAddressAction(formData: FormData): Promise<void> {
  const user = await requireUser("/account/addresses");

  const raw = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    isDefault: String(formData.get("isDefault") ?? ""),
  };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return;

  const makeDefault = parsed.data.isDefault === "on";

  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  await prisma.address.create({
    data: {
      userId: user.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      region: parsed.data.region || null,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      isDefault: makeDefault,
    },
  });

  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser("/account/addresses");
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.update({ where: { id: addressId, userId: user.id }, data: { isDefault: true } });
}
