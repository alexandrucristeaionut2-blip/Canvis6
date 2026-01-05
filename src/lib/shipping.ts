export type ShippingZone = "EUROPE" | "UK" | "US_CA" | "REST";

export const SHIPPING_ZONES: Record<ShippingZone, { label: string; costRonBani: number; eta: string }> = {
  EUROPE: { label: "Europe", costRonBani: 4900, eta: "5–8 business days" },
  UK: { label: "UK", costRonBani: 5900, eta: "6–10" },
  US_CA: { label: "USA/Canada", costRonBani: 8900, eta: "8–14" },
  REST: { label: "Rest of world", costRonBani: 9900, eta: "10–18" },
};

export const COUNTRIES: Array<{ code: string; name: string; zone: ShippingZone }> = [
  { code: "RO", name: "Romania", zone: "EUROPE" },
  { code: "DE", name: "Germany", zone: "EUROPE" },
  { code: "FR", name: "France", zone: "EUROPE" },
  { code: "IT", name: "Italy", zone: "EUROPE" },
  { code: "ES", name: "Spain", zone: "EUROPE" },
  { code: "NL", name: "Netherlands", zone: "EUROPE" },
  { code: "SE", name: "Sweden", zone: "EUROPE" },
  { code: "NO", name: "Norway", zone: "EUROPE" },
  { code: "CH", name: "Switzerland", zone: "EUROPE" },
  { code: "UK", name: "United Kingdom", zone: "UK" },
  { code: "US", name: "United States", zone: "US_CA" },
  { code: "CA", name: "Canada", zone: "US_CA" },
  { code: "AU", name: "Australia", zone: "REST" },
  { code: "JP", name: "Japan", zone: "REST" },
  { code: "AE", name: "United Arab Emirates", zone: "REST" },
];

export function resolveZone(countryCode: string | null | undefined): ShippingZone {
  if (!countryCode) return "REST";
  const match = COUNTRIES.find((c) => c.code === countryCode.toUpperCase());
  return match?.zone ?? "REST";
}

export function shippingForCountry(countryCode: string | null | undefined) {
  const zone = resolveZone(countryCode);
  return { zone, ...SHIPPING_ZONES[zone] };
}
