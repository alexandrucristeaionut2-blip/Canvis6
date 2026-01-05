"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const schema = z.object({
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(8).max(128),
});

type State = { ok?: true; error?: string };

export async function changePasswordAction(_: State, formData: FormData): Promise<State> {
  const user = await requireUser("/account/security");

  const raw = {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: "Please check the form fields." };

  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row) return { error: "Account not found." };

  if (row.passwordHash) {
    const ok = await verifyPassword(parsed.data.currentPassword ?? "", row.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true };
}
