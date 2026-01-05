"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

type State = { error?: string };

export async function resetPasswordAction(_: State, formData: FormData): Promise<State> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const parsed = schema.safeParse({ token, password });
  if (!parsed.success) return { error: "Please check the form fields." };

  const vt = await prisma.verificationToken.findUnique({ where: { token: parsed.data.token } });
  if (!vt || vt.expires < new Date() || !vt.identifier.startsWith("reset:")) {
    return { error: "This link is invalid or expired." };
  }

  const email = vt.identifier.replace(/^reset:/, "");
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    // Do not leak info; just treat as expired.
    return { error: "This link is invalid or expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.verificationToken.delete({ where: { token: parsed.data.token } });

  redirect("/signin?reset=1");
}
