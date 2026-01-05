import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.eventLog.create({
    data: {
      type: "CONTACT_FORM",
      message: `Contact form: ${parsed.data.name} <${parsed.data.email}> — ${parsed.data.message}`,
    },
  });

  return NextResponse.json({ ok: true });
}
