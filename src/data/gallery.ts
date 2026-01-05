export type StaticGalleryItem = {
  id: string;
  imagePath: string;
  mockupImage: string;
  title: string | null;
  size: "A4" | "A3";
  frameColor: string;
  frameModel: string;
  theme: { slug: string; name: string };
};

const THEMES: Array<{ slug: string; name: string; mockupImage: string }> = [
  { slug: "1930s-noir", name: "1930s Noir", mockupImage: "/gallery/1930sNoir.png" },
  { slug: "noir-outlaws", name: "Noir Outlaws", mockupImage: "/gallery/NoirOutlaws.png" },
  { slug: "vintage-getaway", name: "Vintage Getaway", mockupImage: "/gallery/VintageGetaway.png" },
  { slug: "old-money-portrait", name: "Old Money Portrait", mockupImage: "/gallery/OldMoneyPortrait.png" },
  { slug: "film-poster", name: "Film Poster", mockupImage: "/gallery/FilmPoster.png" },
  { slug: "classic-glam", name: "Classic Glam", mockupImage: "/gallery/ClassicGlam.png" },
  { slug: "modern-minimal", name: "Modern Minimal", mockupImage: "/gallery/ModernMinimal.png" },
  { slug: "cyber-neon", name: "Cyber Neon", mockupImage: "/gallery/CyberNeon.png" },
  { slug: "renaissance-light", name: "Renaissance Light", mockupImage: "/gallery/RenaissanceLight.png" },
  { slug: "luxury-crime-drama", name: "Luxury Crime Drama", mockupImage: "/gallery/LuxuryCrimeDrama.png" },
];

const FRAME_COLORS = ["BLACK_MATTE", "WHITE_MATTE", "WALNUT", "OAK", "CHAMPAGNE_GOLD", "BRUSHED_SILVER"] as const;
const FRAME_MODELS = ["SLIM_MODERN_2CM", "CLASSIC_BEVEL", "GALLERY_DEEP"] as const;

// Fully static gallery: no Prisma/DB access so it can't break prerender/build.
export const GALLERY_ITEMS: StaticGalleryItem[] = THEMES.map((t, idx) => {
  const frameColor = FRAME_COLORS[idx % FRAME_COLORS.length];
  const frameModel = FRAME_MODELS[idx % FRAME_MODELS.length];
  return {
    id: `static:${t.slug}`,
    imagePath: "/placeholders/gallery.svg",
    mockupImage: t.mockupImage,
    title: `${t.name} — Example`,
    size: idx % 2 === 0 ? "A4" : "A3",
    frameColor,
    frameModel,
    theme: { slug: t.slug, name: t.name },
  };
});
