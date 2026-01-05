import { shippingForCountry } from "@/lib/shipping";

export function computeOrderTotalsRonBani(params: {
  items: Array<{ basePrice: number; quantity: number }>;
  countryCode: string | null | undefined;
}) {
  const subtotal = params.items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
  const shipping = params.countryCode ? shippingForCountry(params.countryCode).costRonBani : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}
