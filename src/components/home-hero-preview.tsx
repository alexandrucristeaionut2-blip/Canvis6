"use client";

import dynamic from "next/dynamic";

const HeroPreview = dynamic(() => import("@/components/hero-preview"), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-2xl border bg-card" />,
});

export function HomeHeroPreview({
  themes,
}: {
  themes: Array<{ slug: string; name: string; tags: string[] }>;
}) {
  return <HeroPreview themes={themes} />;
}
