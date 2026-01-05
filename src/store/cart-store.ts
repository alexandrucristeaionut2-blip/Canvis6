"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CurrencyDisplay, FrameColorValue, FrameModelValue, SizeValue } from "@/lib/product";
import { getBasePriceRonBani } from "@/lib/product";
import { shippingForCountry } from "@/lib/shipping";

export type CartUploadRef = {
  filePath: string;
  originalName: string;
};

export type CartItem = {
  id: string;

  // Backing draft bucket used for edit + uploaded photos
  draftPublicId: string;
  draftItemPublicId: string;

  themeSlug: string;
  themeName: string;
  mockupImage: string;

  size: SizeValue;
  basePriceRonBani: number;
  frameColor: FrameColorValue;
  frameModel: FrameModelValue;
  paperFinish: "glossy";
  uploads: CartUploadRef[];
  notes?: string;

  quantity: number;
  addedAt: number;
};

export type CartState = {
  currencyDisplay: CurrencyDisplay;
  countryCode: string | null;
  items: CartItem[];

  drawerOpen: boolean;

  setCurrencyDisplay: (currencyDisplay: CurrencyDisplay) => void;
  setCountryCode: (countryCode: string | null) => void;

  openDrawer: () => void;
  closeDrawer: () => void;

  addItem: (
    item: Omit<CartItem, "id" | "addedAt" | "basePriceRonBani" | "paperFinish"> & { id?: string }
  ) => void;
  duplicateItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateItem: (
    id: string,
    patch: Partial<
      Pick<
        CartItem,
        | "themeSlug"
        | "themeName"
        | "mockupImage"
        | "size"
        | "frameColor"
        | "frameModel"
        | "uploads"
        | "notes"
        | "draftPublicId"
        | "draftItemPublicId"
      >
    >
  ) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  getTotals: () => { subtotalRonBani: number; shippingRonBani: number; totalRonBani: number };

  count: () => number;
};

function clampQuantity(q: number) {
  if (!Number.isFinite(q)) return 1;
  return Math.max(1, Math.min(5, Math.round(q)));
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      currencyDisplay: "RON",
      countryCode: "RO",
      items: [],

      drawerOpen: false,

      setCurrencyDisplay: (currencyDisplay) => set({ currencyDisplay }),
      setCountryCode: (countryCode) => set({ countryCode }),

      openDrawer: () =>
        set((state) => {
          if (state.drawerOpen) return state;
          return { ...state, drawerOpen: true };
        }),
      closeDrawer: () =>
        set((state) => {
          if (!state.drawerOpen) return state;
          return { ...state, drawerOpen: false };
        }),

      addItem: (item) =>
        set((state) => {
          const id = item.id ?? newId();
          const basePriceRonBani = getBasePriceRonBani(item.size);
          const normalized: CartItem = {
            id,
            draftPublicId: item.draftPublicId,
            draftItemPublicId: item.draftItemPublicId,
            themeSlug: item.themeSlug,
            themeName: item.themeName,
            mockupImage: item.mockupImage,
            size: item.size,
            basePriceRonBani,
            frameColor: item.frameColor,
            frameModel: item.frameModel,
            paperFinish: "glossy",
            uploads: item.uploads ?? [],
            notes: item.notes,
            quantity: clampQuantity(item.quantity),
            addedAt: Date.now(),
          };

          return { items: [normalized, ...state.items] };
        }),

      duplicateItem: (id) =>
        set((state) => {
          const src = state.items.find((i) => i.id === id);
          if (!src) return state;
          const next: CartItem = { ...src, id: newId(), addedAt: Date.now() };
          return { items: [next, ...state.items] };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...patch,
                  size: patch.size ?? i.size,
                  basePriceRonBani: patch.size ? getBasePriceRonBani(patch.size) : i.basePriceRonBani,
                }
              : i
          ),
        })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: clampQuantity(quantity) } : i)),
        })),

      clearCart: () => set({ items: [], countryCode: "RO" }),

      getTotals: () => {
        const { items, countryCode } = get();
        const subtotalRonBani = items.reduce((sum, i) => sum + i.basePriceRonBani * i.quantity, 0);
        const shippingRonBani = shippingForCountry(countryCode).costRonBani;
        const totalRonBani = subtotalRonBani + shippingRonBani;
        return { subtotalRonBani, shippingRonBani, totalRonBani };
      },

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "canvist_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currencyDisplay: s.currencyDisplay,
        countryCode: s.countryCode,
        items: s.items,
      }),
    }
  )
);
