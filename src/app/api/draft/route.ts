import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPublicId } from "@/lib/public-id";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  const publicId = createPublicId();

  await prisma.order.create({
    data: {
      publicId,
      status: "DRAFT",
      userId: session?.user?.id ?? null,
    },
  });

  return NextResponse.json({ publicId });
}
