import { prisma } from "../src/lib/prisma";

async function main() {
  const gallery = await prisma.galleryItem.findMany({
    select: { id: true, mockupImage: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const themes = await prisma.theme.findMany({
    select: { slug: true, mockupImage: true },
    orderBy: { createdAt: "asc" },
    take: 12,
  });

  console.log("galleryItem.mockupImage (sample):");
  for (const g of gallery) console.log(`- ${g.id}: ${g.mockupImage}`);

  console.log("\ntheme.mockupImage (sample):");
  for (const t of themes) console.log(`- ${t.slug}: ${t.mockupImage}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
