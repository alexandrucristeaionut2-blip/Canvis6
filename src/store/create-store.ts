"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CurrencyDisplay, FrameColorValue, FrameModelValue, SizeValue } from "@/lib/product";

export type CreateStep = 1 | 2 | 3 | 4 | 5;

export type CreateState = {
  step: CreateStep;
  publicId: string | null;
  itemPublicId: string | null;

  themeSlug: string | null;
  notes: string;

  size: SizeValue | null;
  frameColor: FrameColorValue | null;
  frameModel: FrameModelValue | null;

  previewFilter: "none" | "warm" | "cool";

  currencyDisplay: CurrencyDisplay;

  wall: "WARM" | "COOL";

  setStep: (step: CreateStep) => void;
  setPublicId: (publicId: string | null) => void;
  setItemPublicId: (publicItemId: string | null) => void;
  setTheme: (slug: string) => void;
  setNotes: (notes: string) => void;
  setSize: (size: SizeValue) => void;
  setFrameColor: (color: FrameColorValue) => void;
  setFrameModel: (model: FrameModelValue) => void;
  setPreviewFilter: (filter: "none" | "warm" | "cool") => void;
  setCurrencyDisplay: (currency: CurrencyDisplay) => void;
  setWall: (wall: "WARM" | "COOL") => void;

  reset: () => void;
};

const initial: Omit<
  CreateState,
  | "setStep"
  | "setPublicId"
  | "setItemPublicId"
  | "setTheme"
  | "setNotes"
  | "setSize"
  | "setFrameColor"
  | "setFrameModel"
  | "setPreviewFilter"
  | "setCurrencyDisplay"
  | "setWall"
  | "reset"
> = {
  step: 1,
  publicId: null,
  itemPublicId: null,
  themeSlug: null,
  notes: "",
  size: null,
  frameColor: null,
  frameModel: null,
  previewFilter: "none",
  currencyDisplay: "RON",
  wall: "WARM",
};

export const useCreateStore = create<CreateState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setPublicId: (publicId) => set({ publicId }),
      setItemPublicId: (itemPublicId) => set({ itemPublicId }),
      setTheme: (slug) => set({ themeSlug: slug }),
      setNotes: (notes) => set({ notes }),
      setSize: (size) => set({ size }),
      setFrameColor: (frameColor) => set({ frameColor }),
      setFrameModel: (frameModel) => set({ frameModel }),
      setPreviewFilter: (previewFilter) => set({ previewFilter }),
      setCurrencyDisplay: (currencyDisplay) => set({ currencyDisplay }),
      setWall: (wall) => set({ wall }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "canvist_create",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        step: s.step,
        publicId: s.publicId,
        itemPublicId: s.itemPublicId,
        themeSlug: s.themeSlug,
        notes: s.notes,
        size: s.size,
        frameColor: s.frameColor,
        frameModel: s.frameModel,
        previewFilter: s.previewFilter,
        currencyDisplay: s.currencyDisplay,
        wall: s.wall,
      }),
    }
  )
);
