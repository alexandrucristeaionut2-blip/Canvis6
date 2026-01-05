import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { GalleryGrid } from "@/components/gallery-grid";
import { GALLERY_ITEMS } from "@/data/gallery";

export const metadata = {
  title: "Gallery — Canvist",
};

export default async function GalleryPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Gallery</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Exemple curate pentru a-ți seta vibe-ul. Deschide un exemplu și apasă “Creează similar”.
            </p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10">
            <GalleryGrid items={GALLERY_ITEMS} />
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
