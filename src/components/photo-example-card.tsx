import Image from "next/image";

import { cn } from "@/lib/utils";

const blurDataURL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzIwJyBoZWlnaHQ9JzI0MCcgdmlld0JveD0nMCAwIDMyMCAyNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnJyB4MT0nMCcgeTE9JzAnIHgyPScxJyB5Mj0nMSc+PHN0b3Agb2Zmc2V0PScwJScgc3RvcC1jb2xvcj0nI2YzZjRmNicgc3RvcC1vcGFjaXR5PScxJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjZTVlN2ViJyBzdG9wLW9wYWNpdHk9JzEnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMzIwJyBoZWlnaHQ9JzI0MCcgZmlsbD0ndXJsKCNnKScvPjwvc3ZnPg==";

export function PhotoExampleCard({
  src,
  alt,
  hint,
  objectPosition,
  className,
}: {
  src: string;
  alt: string;
  hint?: string;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-muted shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-glow",
        className
      )}
      title={hint}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          style={{ objectPosition: objectPosition ?? "50% 50%" }}
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      </div>
    </div>
  );
}
