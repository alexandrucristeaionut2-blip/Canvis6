import type { CurrencyDisplay } from "./product";

// Fixed, clearly-labeled approximate conversions (mock).
export const FX_RATES_APPROX: Record<Exclude<CurrencyDisplay, "RON">, number> = {
  EUR: 0.2,
  USD: 0.22,
};

export function formatMoneyRonBani(ronBani: number) {
  const ron = ronBani / 100;
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(ron);
}

export function formatMoneyApprox(ronBani: number, currency: Exclude<CurrencyDisplay, "RON">) {
  const rate = FX_RATES_APPROX[currency];
  const value = (ronBani / 100) * rate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
