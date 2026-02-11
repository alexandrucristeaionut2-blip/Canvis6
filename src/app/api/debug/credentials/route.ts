import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/auth/normalize";
import { verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getDbProvider(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) return "postgres";
  if (url.startsWith("mysql://")) return "mysql";
  if (url.startsWith("sqlite:")) return "sqlite";
  return "unknown";
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const password = parsed.data.password;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  const userFound = Boolean(user?.id);
  const hasPasswordHash = Boolean(user?.passwordHash);
  const passwordCompareOk = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  return NextResponse.json({
    userFound,
    hasPasswordHash,
    passwordCompareOk,
    emailInDb: user?.email ?? null,
    dbProvider: getDbProvider(),
  });
}
