"use client";

import * as React from "react";

import styles from "@/components/frame-preview.module.css";
import { cn } from "@/lib/utils";
import { FRAME_OPTIONS, type FrameColorValue, type FrameModelValue } from "@/lib/product";

export type PreviewFilter = "none" | "warm" | "cool";

type FrameCssVars = React.CSSProperties & {
  ["--frame-color"]?: string;
  ["--frame-thickness"]?: string;
  ["--frame-radius"]?: string;
  ["--frame-shadow"]?: string;
  ["--inner-highlight"]?: string;
  ["--inner-shadow"]?: string;
  ["--inner-edge"]?: string;
  ["--bevel"]?: string;

  ["--preview-filter"]?: string;
  ["--preview-overlay"]?: string;
  ["--preview-overlay-opacity"]?: string;
};

function resolveFrame(color: FrameColorValue | null, model: FrameModelValue | null) {
  const resolvedColor = color ?? (Object.keys(FRAME_OPTIONS.colors)[0] as FrameColorValue);
  const resolvedModel = model ?? (Object.keys(FRAME_OPTIONS.models)[0] as FrameModelValue);

  return {
    color: FRAME_OPTIONS.colors[resolvedColor],
    model: FRAME_OPTIONS.models[resolvedModel],
  };
}

function resolvePreviewFilter(filter: PreviewFilter) {
  if (filter === "warm") {
    return {
      cssFilter: "saturate(1.05) contrast(1.03) brightness(1.02) sepia(0.12) hue-rotate(-6deg)",
      overlay: "rgba(255, 210, 170, 0.10)",
      overlayOpacity: 1,
    };
  }

  if (filter === "cool") {
    return {
      cssFilter: "saturate(1.03) contrast(1.04) brightness(1.01) hue-rotate(10deg)",
      overlay: "rgba(170, 210, 255, 0.10)",
      overlayOpacity: 1,
    };
  }

  return {
    cssFilter: "none",
    overlay: "rgba(0, 0, 0, 0)",
    overlayOpacity: 0,
  };
}

export function FramePreview({
  imageSrc,
  alt,
  frameColor,
  frameModel,
  previewFilter = "none",
  className,
  cornerZoom = false,
  children,
}: {
  imageSrc?: string | null;
  alt?: string;
  frameColor: FrameColorValue | null;
  frameModel: FrameModelValue | null;
  previewFilter?: PreviewFilter;
  className?: string;
  cornerZoom?: boolean;
  children?: React.ReactNode;
}) {
  const resolved = React.useMemo(() => resolveFrame(frameColor, frameModel), [frameColor, frameModel]);
  const lighting = React.useMemo(() => resolvePreviewFilter(previewFilter), [previewFilter]);

  const cssVars: FrameCssVars = {
    "--frame-color": resolved.color.hex,
    "--frame-thickness": `${resolved.model.thicknessPx}px`,
    "--frame-radius": `${resolved.model.radiusPx}px`,
    "--frame-shadow": resolved.model.outerShadow,
    "--inner-highlight": resolved.model.innerHighlight,
    "--inner-shadow": resolved.model.innerShadow,
    "--inner-edge": resolved.model.innerEdge,
    "--bevel": String(resolved.model.bevelIntensity),

    "--preview-filter": lighting.cssFilter,
    "--preview-overlay": lighting.overlay,
    "--preview-overlay-opacity": String(lighting.overlayOpacity),
  };

  const art = (
    <div className={cn(styles.art, "bg-muted")}>
      <div className={cn("aspect-[3/4]", styles.artBox)}>
        {imageSrc ? (
          <div className={styles.mediaWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt={alt ?? "Preview"} className={cn(styles.image, "object-cover")} />
            <div className={styles.overlay} aria-hidden="true" />
          </div>
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            {children ?? <div className="text-sm text-muted-foreground">Upload photos to preview</div>}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(className)}>
      <div className={styles.frame} style={cssVars}>
        {cornerZoom ? <div className={styles.cornerInner}>{art}</div> : art}
      </div>
    </div>
  );
}
