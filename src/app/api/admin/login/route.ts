import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminSessionCookie } from "@/lib/admin-session";

const BodySchema = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return NextResponse.json({ error: "ADMIN_TOKEN missing" }, { status: 500 });

  if (parsed.data.token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
