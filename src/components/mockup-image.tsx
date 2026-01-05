"use client";

import * as React from "react";
import Image from "next/image";

export function MockupImage({
  src,
  fallbackSrc,
  alt,
  priority,
  sizes,
  className,
  expectedAspectRatio,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  expectedAspectRatio?: number;
}) {
  const [activeSrc, setActiveSrc] = React.useState(src);
  const [fit, setFit] = React.useState<"cover" | "contain">("cover");

  React.useEffect(() => {
    setActiveSrc(src);
    setFit("cover");
  }, [src]);

  const computedClassName = React.useMemo(() => {
    const base = className ?? "";
    if (fit === "contain") return `${base} object-contain bg-background`;
    return `${base} object-cover`;
  }, [className, fit]);

  return (
    <Image
      src={activeSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={computedClassName}
      onError={() => {
        if (activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
          setFit("contain");
        }
      }}
      onLoad={(e) => {
        if (!expectedAspectRatio) return;
        const img = e.currentTarget;
        if (!img?.naturalWidth || !img?.naturalHeight) return;
        const actual = img.naturalWidth / img.naturalHeight;
        const relDiff = Math.abs(actual - expectedAspectRatio) / expectedAspectRatio;
        if (relDiff > 0.02) setFit("contain");
      }}
    />
  );
}
