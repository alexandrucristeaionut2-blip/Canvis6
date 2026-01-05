"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email().max(120) });

type State = { ok?: true; error?: string };

function randomToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function forgotPasswordAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const parsed = schema.safeParse({ email });
  if (!parsed.success) return { error: "Please enter a valid email." };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

  // Do not reveal whether the email exists.
  if (user?.email) {
    const token = randomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${user.email}`,
        token,
        expires,
      },
    });

    console.log("\n[Canvist] Password reset link");
    console.log(`http://localhost:3000/verify?type=reset&token=${encodeURIComponent(token)}`);
    console.log("\n");
  }

  return { ok: true };
}
