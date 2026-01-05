export type SizeValue = "A4" | "A3";
export type CurrencyDisplay = "RON" | "EUR" | "USD";

export type FrameColorValue =
  | "BLACK_MATTE"
  | "WHITE_MATTE"
  | "WALNUT"
  | "OAK"
  | "CHAMPAGNE_GOLD"
  | "BRUSHED_SILVER";

export type FrameModelValue =
  | "SLIM_MODERN_2CM"
  | "CLASSIC_BEVEL"
  | "GALLERY_DEEP";

export type FrameColorConfig = {
  name: string;
  hex: string;
};

export type FrameModelConfig = {
  name: string;
  thicknessPx: number;
  radiusPx: number;
  outerShadow: string;
  innerHighlight: string;
  innerShadow: string;
  innerEdge: string;
  bevelIntensity: number;
};

export const FRAME_OPTIONS: {
  colors: Record<FrameColorValue, FrameColorConfig>;
  models: Record<FrameModelValue, FrameModelConfig>;
} = {
  colors: {
    BLACK_MATTE: { name: "Black Matte", hex: "#1B1B1B" },
    WHITE_MATTE: { name: "White Matte", hex: "#F2F2F2" },
    WALNUT: { name: "Walnut", hex: "#5A3A2E" },
    OAK: { name: "Oak", hex: "#B58A5A" },
    CHAMPAGNE_GOLD: { name: "Champagne Gold", hex: "#C7A46A" },
    BRUSHED_SILVER: { name: "Brushed Silver", hex: "#B9BCC1" },
  },
  models: {
    SLIM_MODERN_2CM: {
      name: "Slim Modern (2cm)",
      thicknessPx: 18,
      radiusPx: 28,
      outerShadow: "0 10px 18px rgba(0,0,0,0.10)",
      innerHighlight: "rgba(255,255,255,0.10)",
      innerShadow: "rgba(0,0,0,0.18)",
      innerEdge: "rgba(0,0,0,0.14)",
      bevelIntensity: 0.08,
    },
    CLASSIC_BEVEL: {
      name: "Classic Bevel",
      thicknessPx: 28,
      radiusPx: 30,
      outerShadow: "0 14px 24px rgba(0,0,0,0.16)",
      innerHighlight: "rgba(255,255,255,0.38)",
      innerShadow: "rgba(0,0,0,0.24)",
      innerEdge: "rgba(0,0,0,0.20)",
      bevelIntensity: 0.62,
    },
    GALLERY_DEEP: {
      name: "Gallery Deep",
      thicknessPx: 44,
      radiusPx: 34,
      outerShadow: "0 18px 34px rgba(0,0,0,0.22)",
      innerHighlight: "rgba(255,255,255,0.22)",
      innerShadow: "rgba(0,0,0,0.40)",
      innerEdge: "rgba(0,0,0,0.30)",
      bevelIntensity: 0.82,
    },
  },
} as const;

export const PAPER_FINISH = "glossy" as const;

export const SIZE_OPTIONS: Array<{
  value: SizeValue;
  label: string;
  dimensionsCm: string;
  priceRonBani: number;
  badge?: string;
}> = [
  { value: "A4", label: "A4", dimensionsCm: "21×29.7 cm", priceRonBani: 8999, badge: "Popular" },
  { value: "A3", label: "A3", dimensionsCm: "29.7×42 cm", priceRonBani: 12999, badge: "Impact maxim" },
];

export const FRAME_COLORS: Array<{ value: FrameColorValue; label: string }> = (Object.keys(
  FRAME_OPTIONS.colors
) as FrameColorValue[]).map((value) => ({ value, label: FRAME_OPTIONS.colors[value].name }));

export const FRAME_MODELS: Array<{ value: FrameModelValue; label: string }> = (Object.keys(
  FRAME_OPTIONS.models
) as FrameModelValue[]).map((value) => ({ value, label: FRAME_OPTIONS.models[value].name }));

export function formatFrameColor(value: string) {
  const key = value as FrameColorValue;
  return FRAME_OPTIONS.colors[key]?.name ?? value;
}

export function formatFrameModel(value: string) {
  const key = value as FrameModelValue;
  return FRAME_OPTIONS.models[key]?.name ?? value;
}

export function formatSize(value: string) {
  const s = SIZE_OPTIONS.find((o) => o.value === value);
  return s ? `${s.label} (${s.dimensionsCm})` : value;
}

export function getBasePriceRonBani(size: SizeValue) {
  return SIZE_OPTIONS.find((o) => o.value === size)?.priceRonBani ?? 0;
}
