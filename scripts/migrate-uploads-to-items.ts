import { prisma } from "../src/lib/prisma";
import { createPublicId } from "../src/lib/public-id";

async function main() {
  const itemsMissingPublic = await prisma.orderItem.findMany({
    where: { publicItemId: null },
    select: { id: true },
  });

  for (const it of itemsMissingPublic) {
    // Use createPublicId() to keep IDs short and random.
    await prisma.orderItem.update({
      where: { id: it.id },
      data: { publicItemId: createPublicId() },
    });
  }

  const legacyUploads = await prisma.upload.findMany({
    where: { orderItemId: null, orderId: { not: null } },
    select: { id: true, orderId: true, type: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byOrder = new Map<string, Array<{ id: string; type: string }>>();
  for (const u of legacyUploads) {
    const orderId = u.orderId!;
    const arr = byOrder.get(orderId) ?? [];
    arr.push({ id: u.id, type: u.type });
    byOrder.set(orderId, arr);
  }

  let attached = 0;
  let leftUnassigned = 0;

  for (const [orderId, uploads] of byOrder.entries()) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, publicId: true, items: { select: { id: true } } },
    });

    if (!order) continue;

    if (order.items.length === 1) {
      const itemId = order.items[0]!.id;
      await prisma.upload.updateMany({
        where: { id: { in: uploads.map((u) => u.id) } },
        data: { orderItemId: itemId, orderId: null },
      });
      attached += uploads.length;
    } else {
      // Multi-item legacy order: keep as unassigned legacy uploads linked to the order.
      // Admin UI can reassign to a specific item.
      leftUnassigned += uploads.length;
    }
  }

  console.log(
    JSON.stringify(
      {
        itemsBackfilled: itemsMissingPublic.length,
        uploadsAttachedToSingleItemOrders: attached,
        uploadsLeftUnassigned: leftUnassigned,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
