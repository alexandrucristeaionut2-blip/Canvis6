"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/normalize";

const schema = z.object({
  name: z.string().min(1).max(80).optional().or(z.literal("")),
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
  next: z.string().optional(),
});

type State = { error?: string };

export async function signUpAction(_: State, formData: FormData): Promise<State> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: normalizeEmail(String(formData.get("email") ?? "")),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "").trim() || undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: "Please check the form fields." };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      name: parsed.data.name || null,
      email: parsed.data.email,
      passwordHash,
    },
  });

  const next = parsed.data.next ? `&next=${encodeURIComponent(parsed.data.next)}` : "";
  redirect(`/signin?created=1${next}`);
}
