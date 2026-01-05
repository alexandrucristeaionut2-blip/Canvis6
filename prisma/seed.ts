import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const THEMES = [
  {
    slug: "1930s-noir",
    name: "1930s Noir",
    description: "Contrast puternic, lumină tăioasă, atmosferă cinematografică.",
    tags: ["Cinematic", "Dark", "Retro"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "noir-outlaws",
    name: "Noir Outlaws",
    description: "Accente dramatice, texturi vintage și vibe de poveste.",
    tags: ["Cinematic", "Dark"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "vintage-getaway",
    name: "Vintage Getaway",
    description: "Culori calde și nostalgie discretă, ca o vacanță pe film.",
    tags: ["Retro", "Colorful"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "old-money-portrait",
    name: "Old Money Portrait",
    description: "Eleganță editorială, tonuri rafinate și simplitate luxoasă.",
    tags: ["Elegant"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "film-poster",
    name: "Film Poster",
    description: "Compoziție de afiș, titlu discret și aer de premieră.",
    tags: ["Cinematic", "Colorful"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "classic-glam",
    name: "Classic Glam",
    description: "Strălucire controlată, piele luminoasă, vibe de studio.",
    tags: ["Elegant", "Cinematic"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "modern-minimal",
    name: "Modern Minimal",
    description: "Spațiu alb, echilibru și un look contemporan curat.",
    tags: ["Elegant"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "cyber-neon",
    name: "Cyber Neon",
    description: "Neon, contrast și energie nocturnă.",
    tags: ["Dark", "Colorful"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "renaissance-light",
    name: "Renaissance Light",
    description: "Lumină picturală și umbre moi, cu dramatism subtil.",
    tags: ["Elegant", "Cinematic"],
    heroImage: "/placeholders/theme.svg",
  },
  {
    slug: "luxury-crime-drama",
    name: "Luxury Crime Drama",
    description: "Lux modern, tensiune și atmosferă premium.",
    tags: ["Cinematic", "Dark"],
    heroImage: "/placeholders/theme.svg",
  },
] as const;

const GALLERY_MOCKUP_BY_THEME_SLUG: Record<(typeof THEMES)[number]["slug"], string> = {
  "1930s-noir": "/gallery/1930sNoir.png",
  "noir-outlaws": "/gallery/NoirOutlaws.png",
  "vintage-getaway": "/gallery/VintageGetaway.png",
  "old-money-portrait": "/gallery/OldMoneyPortrait.png",
  "film-poster": "/gallery/FilmPoster.png",
  "classic-glam": "/gallery/ClassicGlam.png",
  "modern-minimal": "/gallery/ModernMinimal.png",
  "cyber-neon": "/gallery/CyberNeon.png",
  "renaissance-light": "/gallery/RenaissanceLight.png",
  "luxury-crime-drama": "/gallery/LuxuryCrimeDrama.png",
};

const FRAME_COLORS: Array<{ value: string; label: string }> = [
  { value: "BLACK_MATTE", label: "Black Matte" },
  { value: "WHITE_MATTE", label: "White Matte" },
  { value: "WALNUT", label: "Walnut" },
  { value: "OAK", label: "Oak" },
  { value: "CHAMPAGNE_GOLD", label: "Champagne Gold" },
  { value: "BRUSHED_SILVER", label: "Brushed Silver" },
];

const FRAME_MODELS: Array<{ value: string; label: string }> = [
  { value: "SLIM_MODERN_2CM", label: "Slim Modern (2cm)" },
  { value: "CLASSIC_BEVEL", label: "Classic Bevel" },
  { value: "GALLERY_DEEP", label: "Gallery Deep" },
];

async function main() {
  for (const theme of THEMES) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: {
        name: theme.name,
        description: theme.description,
        tags: JSON.stringify(theme.tags),
        heroImage: theme.heroImage,
        mockupImage: GALLERY_MOCKUP_BY_THEME_SLUG[theme.slug],
      },
      create: {
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        tags: JSON.stringify(theme.tags),
        heroImage: theme.heroImage,
        mockupImage: GALLERY_MOCKUP_BY_THEME_SLUG[theme.slug],
      },
    });
  }

  for (const color of FRAME_COLORS) {
    for (const model of FRAME_MODELS) {
      await prisma.frameOption.upsert({
        where: { color_model: { color: color.value, model: model.value } },
        update: { displayName: `${color.label} — ${model.label}` },
        create: {
          color: color.value,
          model: model.value,
          displayName: `${color.label} — ${model.label}`,
        },
      });
    }
  }

  const themeRows: Array<{ id: string; slug: string }> = await prisma.theme.findMany({
    select: { id: true, slug: true },
  });
  const themesBySlug = new Map(themeRows.map((t) => [t.slug, t.id] as const));

  // Curated gallery: 10 items (one per theme), stable and non-duplicated.
  const galleryItems = THEMES.map((theme, idx) => {
    const color = FRAME_COLORS[idx % FRAME_COLORS.length];
    const model = FRAME_MODELS[idx % FRAME_MODELS.length];

    return {
      themeId: themesBySlug.get(theme.slug)!,
      size: idx % 2 === 0 ? "A4" : "A3",
      frameColor: color.value,
      frameModel: model.value,
      imagePath: "/placeholders/gallery.svg",
      mockupImage: GALLERY_MOCKUP_BY_THEME_SLUG[theme.slug],
      title: `${theme.name} — Example`,
    };
  });

  await prisma.galleryItem.deleteMany();
  await prisma.galleryItem.createMany({ data: galleryItems });

  // Seed testimonials + FAQ etc are static in code (no DB required).
  console.log("Seed complete:", {
    themes: THEMES.length,
    frameOptions: FRAME_COLORS.length * FRAME_MODELS.length,
    galleryItems: galleryItems.length,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
