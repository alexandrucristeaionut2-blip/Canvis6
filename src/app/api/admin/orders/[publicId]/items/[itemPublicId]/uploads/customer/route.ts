import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { createPresignedDownloadUrl, isS3Configured } from "@/lib/storage/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ publicId: string; itemPublicId: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId, itemPublicId } = await params;

  const order = await prisma.order.findUnique({ where: { publicId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const item = await prisma.orderItem.findFirst({
    where: { orderId: order.id, publicItemId: itemPublicId },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const uploads = await prisma.upload.findMany({
    where: { orderItemId: item.id, type: "CUSTOMER_PHOTO" },
    orderBy: { createdAt: "asc" },
    select: { id: true, key: true, filePath: true, originalName: true, mimeType: true, size: true, createdAt: true },
  });

  const withUrls = await Promise.all(
    uploads.map(async (u) => {
      const key = u.key ?? u.filePath;
      const url = isS3Configured() ? await createPresignedDownloadUrl({ key, expiresInSeconds: 600 }) : null;
      return {
        ...u,
        key,
        url,
      };
    })
  );

  return NextResponse.json({ uploads: withUrls });
}
