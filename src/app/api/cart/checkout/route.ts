import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createPublicId } from "@/lib/public-id";
import { FRAME_COLORS, FRAME_MODELS, SIZE_OPTIONS, getBasePriceRonBani } from "@/lib/product";
import { computeOrderTotalsRonBani } from "@/lib/order-totals";
import { auth } from "@/auth";

const bodySchema = z.object({
  countryCode: z.string().min(2).max(3).nullable().optional(),
  items: z
    .array(
      z.object({
        themeSlug: z.string().min(1),
        size: z.enum(SIZE_OPTIONS.map((s) => s.value) as ["A4", "A3"]),
        frameColor: z.enum(FRAME_COLORS.map((c) => c.value) as [string, ...string[]]),
        frameModel: z.enum(FRAME_MODELS.map((m) => m.value) as [string, ...string[]]),
        quantity: z.number().int().min(1).max(5),

        // Optional: wizard-backed uploads so checkout does not require re-upload.
        draftPublicId: z.string().min(1).optional(),
        draftItemPublicId: z.string().min(1).optional(),
        uploads: z
          .array(
            z.object({
              filePath: z.string().min(1),
              originalName: z.string().min(1),
            })
          )
          .optional(),

        notes: z.string().nullable().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, countryCode } = parsed.data;

  const uniqueSlugs = Array.from(new Set(items.map((i) => i.themeSlug)));
  const themes = await prisma.theme.findMany({
    where: { slug: { in: uniqueSlugs } },
    select: { id: true, slug: true },
  });

  const themeIdBySlug = new Map(themes.map((t) => [t.slug, t.id] as const));
  const missing = uniqueSlugs.filter((s) => !themeIdBySlug.has(s));
  if (missing.length) {
    return NextResponse.json({ error: `Theme not found: ${missing[0]}` }, { status: 404 });
  }

  const publicId = createPublicId();

  const itemRows = items.map((i) => ({
    publicItemId: createPublicId(),
    size: i.size,
    basePrice: getBasePriceRonBani(i.size),
    themeId: themeIdBySlug.get(i.themeSlug)!,
    frameColor: i.frameColor,
    frameModel: i.frameModel,
    paperFinish: "glossy",
    quantity: i.quantity,
    status: "DRAFT",
  }));

  const totals = computeOrderTotalsRonBani({
    items: itemRows.map((r) => ({ basePrice: r.basePrice, quantity: r.quantity })),
    countryCode: countryCode ?? null,
  });

  const created = await prisma.order.create({
    data: {
      publicId,
      status: "DRAFT",
      userId: session?.user?.id ?? null,
      country: countryCode ?? null,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      items: {
        create: itemRows,
      },
    },
    include: { items: { select: { id: true } } },
  });

  // Attach any wizard-backed uploads (re-using saved file paths) to the newly created OrderItems.
  const uploadRows: Array<{ orderItemId: string; type: string; filePath: string; originalName: string }> = [];
  for (let idx = 0; idx < created.items.length; idx++) {
    const src = items[idx];
    const dst = created.items[idx];
    const uploads = (src?.uploads ?? []).filter(Boolean);
    for (const u of uploads) {
      uploadRows.push({
        orderItemId: dst.id,
        type: "CUSTOMER_PHOTO",
        filePath: u.filePath,
        originalName: u.originalName,
      });
    }
  }
  if (uploadRows.length) {
    await prisma.upload.createMany({
      data: uploadRows.map((u) => ({
        orderId: null,
        orderItemId: u.orderItemId,
        type: u.type,
        filePath: u.filePath,
        originalName: u.originalName,
      })),
    });
  }

  const notes = items
    .map((i, idx) => {
      const t = i.themeSlug;
      const n = i.notes?.trim();
      if (!n) return null;
      return `Item ${idx + 1} (${t}): ${n}`;
    })
    .filter(Boolean)
    .join("\n");

  if (notes) {
    await prisma.eventLog.create({
      data: { orderId: created.id, type: "CUSTOMER_NOTES", message: notes },
    });
  }

  return NextResponse.json({ publicId });
}
