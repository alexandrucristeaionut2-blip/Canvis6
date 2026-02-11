"use client";

import * as React from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, ImagePlus, Palette, Ruler, Sparkles, ArrowLeft, ArrowRight, ZoomIn, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FramePreview } from "@/components/frame-preview";

import { useCreateStore, type CreateStep } from "@/store/create-store";
import { useCartStore } from "@/store/cart-store";
import {
  FRAME_COLORS,
  FRAME_MODELS,
  SIZE_OPTIONS,
  PAPER_FINISH,
  formatFrameColor,
  formatFrameModel,
  getBasePriceRonBani,
  type FrameColorValue,
  type FrameModelValue,
} from "@/lib/product";
import { formatMoneyRonBani } from "@/lib/currency";

export type WizardTheme = {
  slug: string;
  name: string;
  description: string;
  heroImage: string | null;
  mockupImage: string;
  tags: string[];
};

const STEPS: Array<{ id: CreateStep; title: string; subtitle: string; icon: React.ReactNode }> = [
  { id: 1, title: "Theme", subtitle: "Alege o tematică", icon: <Sparkles className="h-4 w-4" /> },
  { id: 2, title: "Upload", subtitle: "Pozele tale", icon: <ImagePlus className="h-4 w-4" /> },
  { id: 3, title: "Size", subtitle: "A4 / A3", icon: <Ruler className="h-4 w-4" /> },
  { id: 4, title: "Frame", subtitle: "Culoare + model", icon: <Palette className="h-4 w-4" /> },
  { id: 5, title: "Review", subtitle: "Rezumat", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export function CreateWizard({
  themes,
  preselect,
}: {
  themes: WizardTheme[];
  preselect: { theme?: string; size?: string; frameColor?: string; frameModel?: string };
}) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const draftOrderPromiseRef = React.useRef<Promise<string> | null>(null);
  const draftItemPromiseRef = React.useRef<Promise<string> | null>(null);

  const {
    step,
    setStep,
    publicId,
    setPublicId,
    itemPublicId,
    setItemPublicId,
    themeSlug,
    setTheme,
    notes,
    setNotes,
    size,
    setSize,
    frameColor,
    setFrameColor,
    frameModel,
    setFrameModel,
    previewFilter,
    setPreviewFilter,
  } = useCreateStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartItem = searchParams.get("editCartItem");

  const addCartItem = useCartStore((s) => s.addItem);
  const updateCartItem = useCartStore((s) => s.updateItem);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const countryCode = useCartStore((s) => s.countryCode);

  const [uploads, setUploads] = React.useState<Array<{ id: string; filePath: string; originalName: string }>>([]);
  const [uploading, setUploading] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [warnings, setWarnings] = React.useState<string[]>([]);

  const activeTheme = themes.find((t) => t.slug === themeSlug) ?? null;

  React.useEffect(() => {
    // Preselect from URL
    if (preselect.theme && !themeSlug) setTheme(preselect.theme);
    if (preselect.size && !size && (preselect.size === "A4" || preselect.size === "A3")) setSize(preselect.size);
    if (preselect.frameColor && !frameColor) setFrameColor(preselect.frameColor as FrameColorValue);
    if (preselect.frameModel && !frameModel) setFrameModel(preselect.frameModel as FrameModelValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    // Ensure we have a draft order publicId
    if (publicId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/draft", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error ?? "Failed to start draft order");
        return;
      }
      if (!cancelled) setPublicId(json.publicId);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId, setPublicId]);

  const createFreshDraftOrder = React.useCallback(async () => {
    const res = await fetch("/api/draft", { method: "POST" });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error ?? "Failed to start draft order");
    setPublicId(json.publicId);
    return json.publicId as string;
  }, [setPublicId]);

  const ensureDraftOrder = React.useCallback(async () => {
    if (publicId) return publicId;
    if (!draftOrderPromiseRef.current) {
      draftOrderPromiseRef.current = createFreshDraftOrder().finally(() => {
        draftOrderPromiseRef.current = null;
      });
    }
    return await draftOrderPromiseRef.current;
  }, [publicId, createFreshDraftOrder]);

  const createDraftItem = React.useCallback(
    async (orderPublicId: string, themeSlugValue: string) => {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderPublicId)}/items`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ themeSlug: themeSlugValue }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMessage = json?.error ?? "Failed to start draft item";
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = res.status;
        throw error;
      }
      setItemPublicId(json.itemPublicId);
      return json.itemPublicId as string;
    },
    [setItemPublicId]
  );

  const ensureDraftItem = React.useCallback(
    async (orderPublicId: string) => {
      if (itemPublicId) return itemPublicId;
      if (!themeSlug) throw new Error("Select a theme first.");

      if (!draftItemPromiseRef.current) {
        draftItemPromiseRef.current = (async () => {
          try {
            return await createDraftItem(orderPublicId, themeSlug);
          } catch (err) {
            const status = (err as { status?: number } | null)?.status;
            const message = err instanceof Error ? err.message : "";
            const notEditable = status === 409 || /no longer editable/i.test(message);
            if (!notEditable) throw err;

            // The draft we had is no longer usable (e.g. user resumed an old draft).
            // Reset draft IDs and start a fresh draft order+item.
            setPublicId(null);
            setItemPublicId(null);
            setUploads([]);

            const freshOrderId = await createFreshDraftOrder();
            return await createDraftItem(freshOrderId, themeSlug);
          } finally {
            draftItemPromiseRef.current = null;
          }
        })();
      }

      return await draftItemPromiseRef.current;
    },
    [itemPublicId, themeSlug, createDraftItem, createFreshDraftOrder, setPublicId, setItemPublicId]
  );

  const ensureDraftReady = React.useCallback(async () => {
    const orderPublicId = await ensureDraftOrder();
    const ensuredItemPublicId = await ensureDraftItem(orderPublicId);
    return { orderPublicId, itemPublicId: ensuredItemPublicId };
  }, [ensureDraftOrder, ensureDraftItem]);

  React.useEffect(() => {
    // If editing a cart item, load it into the wizard state.
    if (!editCartItem) return;
    const item = cartItems.find((i) => i.id === editCartItem);
    if (!item) {
      toast.error("Cart item not found");
      router.push("/cart");
      return;
    }

    setPublicId(item.draftPublicId);
    setItemPublicId(item.draftItemPublicId);
    setTheme(item.themeSlug);
    setSize(item.size);
    setFrameColor(item.frameColor);
    setFrameModel(item.frameModel);
    setNotes(item.notes ?? "");
    setStep(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCartItem]);

  React.useEffect(() => {
    // Ensure we have a draft item (required for item-scoped uploads).
    if (!publicId) return;
    if (!themeSlug) return;
    if (itemPublicId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/orders/${encodeURIComponent(publicId)}/items`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ themeSlug }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error ?? "Failed to start draft item");
        return;
      }
      if (!cancelled) setItemPublicId(json.itemPublicId);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId, themeSlug, itemPublicId, setItemPublicId]);

  const refreshUploadsFor = React.useCallback(async (orderPublicId: string, itemId: string) => {
    const res = await fetch(
      `/api/orders/${encodeURIComponent(orderPublicId)}/items/${encodeURIComponent(itemId)}/uploads`,
      { cache: "no-store" }
    );
    const json = await res.json().catch(() => null);
    if (res.ok) setUploads(json.uploads ?? []);
  }, []);

  const refreshUploads = React.useCallback(async () => {
    if (!publicId || !itemPublicId) return;
    await refreshUploadsFor(publicId, itemPublicId);
  }, [publicId, itemPublicId, refreshUploadsFor]);

  React.useEffect(() => {
    void refreshUploads();
  }, [refreshUploads]);

  const validateStep = (s: CreateStep) => {
    if (s === 1) return Boolean(themeSlug);
    if (s === 2) return uploads.length >= 2 && uploads.length <= 8;
    if (s === 3) return Boolean(size);
    if (s === 4) return Boolean(frameColor && frameModel);
    return true;
  };

  const canGoNext = validateStep(step);

  const goNext = () => {
    if (!canGoNext) return;
    setStep(step === 5 ? 5 : ((step + 1) as CreateStep));
  };

  const goBack = () => setStep(step === 1 ? 1 : ((step - 1) as CreateStep));

  const basePrice = size ? getBasePriceRonBani(size) : 0;

  const openFileDialog = () => {
    if (uploading) return;
    (async () => {
      try {
        await ensureDraftReady();
        fileInputRef.current?.click();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to prepare draft");
      }
    })();
  };

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const ids = await ensureDraftReady().catch((err) => {
      toast.error(err instanceof Error ? err.message : "Failed to prepare draft");
      return null;
    });
    if (!ids) return;
    if (files.length === 0) return;

    const nextWarnings: string[] = [];

    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) nextWarnings.push(`${f.name}: too large (max 10MB)`);
      const ext = f.name.toLowerCase().split(".").pop();
      if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) nextWarnings.push(`${f.name}: unsupported type`);
      // Soft check: resolution (not blocking)
      if (f.type.startsWith("image/")) {
        try {
          const url = URL.createObjectURL(f);
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              if (img.width * img.height < 1_000_000) {
                nextWarnings.push(`${f.name}: low resolution (may look soft in print)`);
              }
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });
        } catch {
          // ignore
        }
      }
    }

    setWarnings(nextWarnings);

    setUploading(true);
    try {
      // Preferred: presigned cloud uploads (S3-compatible). Falls back to legacy local upload.
      const signRes = await fetch(
        `/api/orders/${encodeURIComponent(ids.orderPublicId)}/items/${encodeURIComponent(ids.itemPublicId)}/uploads/customer/sign`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            files: files.map((f) => ({ originalName: f.name, mimeType: f.type, size: f.size })),
          }),
        }
      );

      const signJson = (await signRes.json().catch(() => null)) as
        | {
            configured?: boolean;
            uploads?: Array<{ key: string; uploadUrl: string; originalName: string; mimeType: string; size: number }>;
            error?: string;
          }
        | null;

      if (signRes.ok && signJson?.configured === false) {
        // Legacy local upload (dev fallback)
        const form = new FormData();
        for (const f of files) form.append("files", f);

        const res = await fetch(
          `/api/orders/${encodeURIComponent(ids.orderPublicId)}/items/${encodeURIComponent(ids.itemPublicId)}/uploads/customer`,
          {
            method: "POST",
            body: form,
          }
        );
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Upload failed");

        toast.success("Photos uploaded");
        await refreshUploadsFor(ids.orderPublicId, ids.itemPublicId);
      } else if (signRes.ok) {
        const signed = signJson?.uploads ?? [];
        if (signed.length !== files.length) throw new Error("Failed to sign uploads");

        // Upload each file directly to storage.
        await Promise.all(
          signed.map(async (s, idx) => {
            const file = files[idx];
            const putRes = await fetch(s.uploadUrl, {
              method: "PUT",
              headers: { "content-type": s.mimeType },
              body: file,
            });
            if (!putRes.ok) throw new Error(`Upload failed for ${s.originalName}`);
          })
        );

        // Confirm + record in DB.
        const confirmRes = await fetch(
          `/api/orders/${encodeURIComponent(ids.orderPublicId)}/items/${encodeURIComponent(ids.itemPublicId)}/uploads/customer/confirm`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              uploads: signed.map((s) => ({
                key: s.key,
                originalName: s.originalName,
                mimeType: s.mimeType,
                size: s.size,
              })),
            }),
          }
        );
        const confirmJson = await confirmRes.json().catch(() => null);
        if (!confirmRes.ok) throw new Error(confirmJson?.error ?? "Upload confirm failed");

        toast.success("Photos uploaded");
        await refreshUploadsFor(ids.orderPublicId, ids.itemPublicId);
      } else {
        throw new Error(signJson?.error ?? "Upload failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = async (uploadId: string) => {
    if (!publicId || !itemPublicId) return;
    if (removingId) return;

    setRemovingId(uploadId);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(publicId)}/items/${encodeURIComponent(itemPublicId)}/uploads/customer/${encodeURIComponent(uploadId)}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Remove failed");

      toast.success("Removed");
      await refreshUploads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemovingId(null);
    }
  };

  const saveDraftConfig = async () => {
    if (!publicId || !itemPublicId) throw new Error("Draft not ready yet.");
    if (!themeSlug || !size || !frameColor || !frameModel) throw new Error("Missing configuration.");

    const res = await fetch(
      `/api/orders/${encodeURIComponent(publicId)}/items/${encodeURIComponent(itemPublicId)}/configure`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          themeSlug,
          size,
          frameColor,
          frameModel,
          quantity: 1,
        }),
      }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error ?? "Failed to save item");
    return json;
  };

  const addToCart = async () => {
    if (!publicId || !itemPublicId) {
      toast.error("Draft not ready yet. Please retry.");
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error("Complete all steps before adding to cart.");
      return;
    }
    if (!activeTheme || !themeSlug || !size || !frameColor || !frameModel) {
      toast.error("Missing configuration.");
      return;
    }

    setSaving(true);
    try {
      await saveDraftConfig();
      await refreshUploads();
      if (uploads.length < 2) throw new Error("Upload at least 2 photos.");

      addCartItem({
        draftPublicId: publicId,
        draftItemPublicId: itemPublicId,
        themeSlug,
        themeName: activeTheme.name,
        mockupImage: activeTheme.mockupImage,
        size,
        frameColor,
        frameModel,
        uploads: uploads.map((u) => ({ filePath: u.filePath, originalName: u.originalName })),
        notes: notes.trim() ? notes.trim() : undefined,
        quantity: 1,
      });

      toast.success("Added to cart");
      openCartDrawer();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setSaving(false);
    }
  };

  const buyNow = async () => {
    setSaving(true);
    try {
      await addToCart();
      // Create checkout order from current cart (including the new item)
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          countryCode,
          items: useCartStore
            .getState()
            .items.map((i) => ({
              themeSlug: i.themeSlug,
              size: i.size,
              frameColor: i.frameColor,
              frameModel: i.frameModel,
              quantity: i.quantity,
              notes: i.notes ?? null,
              draftPublicId: i.draftPublicId,
              draftItemPublicId: i.draftItemPublicId,
              uploads: i.uploads,
            })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to create checkout order");
      const checkoutPublicId = json?.publicId as string | undefined;
      if (!checkoutPublicId) throw new Error("Missing order id");
      router.push(`/checkout?order=${encodeURIComponent(checkoutPublicId)}&fromCart=1`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Buy now failed");
    } finally {
      setSaving(false);
    }
  };

  const saveEdits = async () => {
    if (!editCartItem) return;
    if (!publicId || !itemPublicId) {
      toast.error("Draft not ready yet. Please retry.");
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error("Complete all steps before saving.");
      return;
    }
    if (!activeTheme || !themeSlug || !size || !frameColor || !frameModel) {
      toast.error("Missing configuration.");
      return;
    }

    setSaving(true);
    try {
      await saveDraftConfig();
      await refreshUploads();
      if (uploads.length < 2) throw new Error("Upload at least 2 photos.");

      updateCartItem(editCartItem, {
        draftPublicId: publicId,
        draftItemPublicId: itemPublicId,
        themeSlug,
        themeName: activeTheme.name,
        mockupImage: activeTheme.mockupImage,
        size,
        frameColor,
        frameModel,
        uploads: uploads.map((u) => ({ filePath: u.filePath, originalName: u.originalName })),
        notes: notes.trim() ? notes.trim() : undefined,
      });

      toast.success("Saved");
      router.push("/cart");
      openCartDrawer();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
        {/* Left: steps */}
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create</CardTitle>
              <CardDescription>A 5-step guided flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                Hârtie foto glossy (standard Canvist).
              </div>

              <div className="space-y-2">
                {STEPS.map((s) => {
                  const done = s.id < step && validateStep(s.id);
                  const active = s.id === step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => (s.id <= step ? setStep(s.id) : null)}
                      className={
                        "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors " +
                        (active ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-muted")
                      }
                      aria-current={active ? "step" : undefined}
                    >
                      <div className={"grid h-9 w-9 place-items-center rounded-xl border " + (active ? "bg-background" : "bg-background")}>{s.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{s.title}</div>
                          {done ? <CheckCircle2 className="h-4 w-4 text-primary" aria-label="Completed" /> : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: `${(step / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <Separator />

              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs font-medium text-muted-foreground">Sticky summary</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Theme</span><span className="font-medium">{activeTheme?.name ?? "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium">{size ?? "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Frame</span><span className="font-medium">{frameColor ? formatFrameColor(frameColor) : "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Model</span><span className="font-medium">{frameModel ? formatFrameModel(frameModel) : "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Paper</span><span className="font-medium">{PAPER_FINISH}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Base</span><span className="font-medium">{basePrice ? formatMoneyRonBani(basePrice) : "—"}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: content + preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{STEPS.find((s) => s.id === step)?.title}</CardTitle>
                  <CardDescription>
                    {step === 1 ? "Alege o tematică. Noi păstrăm identitatea fotografiilor tale." : null}
                    {step === 2 ? "Minim 2 poze recomandate. Cu cât sunt mai clare, cu atât rezultatul e mai spectaculos." : null}
                    {step === 3 ? "A4 sau A3 — preț fix în RON." : null}
                    {step === 4 ? "Rama este inclusă și obligatorie — ca să primești un tablou gata de perete." : null}
                    {step === 5 ? (editCartItem ? "Review & save to cart." : "Review & add to cart.") : null}
                  </CardDescription>
                </div>
                <Badge variant="premium">{step}/5</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 1 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {themes.map((t) => (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => setTheme(t.slug)}
                          data-testid={`wizard-theme-${t.slug}`}
                          className={
                            "rounded-2xl border bg-background p-5 text-left transition-shadow hover:shadow-glow " +
                            (t.slug === themeSlug ? "border-primary/40" : "")
                          }
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-display text-lg tracking-tight">{t.name}</div>
                              <div className="mt-1 text-sm text-muted-foreground">{t.description}</div>
                            </div>
                            {t.slug === themeSlug ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {t.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="muted">{tag}</Badge>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border bg-background p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-medium">Upload photos</div>
                            <div className="text-sm text-muted-foreground">Accepted: jpg, jpeg, png, webp. Max 10MB each. Max 8 files.</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="muted">{uploads.length}/8</Badge>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              onChange={onPickFiles}
                              className="sr-only"
                              aria-label="Upload photos"
                            />
                            <Button
                              type="button"
                              disabled={!publicId || uploading}
                              onClick={openFileDialog}
                              data-testid="wizard-add-photos"
                            >
                              {uploading ? "Uploading…" : "Add photos"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {warnings.length ? (
                        <div className="rounded-2xl border bg-card p-4">
                          <div className="text-sm font-medium">Friendly warnings</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {warnings.slice(0, 6).map((w) => (
                              <li key={w}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {uploads.map((u) => (
                          <div key={u.id} className="flex items-center gap-3 rounded-2xl border bg-background p-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border bg-muted">
                              <NextImage
                                src={`/api/files/${u.filePath}`}
                                alt={u.originalName}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{u.originalName}</div>
                              <div className="text-xs text-muted-foreground">Saved locally</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={uploading || removingId === u.id}
                              onClick={() => removeUpload(u.id)}
                              aria-label={`Remove ${u.originalName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border bg-card p-4">
                        <Label htmlFor="notes">Optional notes</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Optional notes for the editor…"
                          className="mt-2"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Validation: must upload at least 2 images (max 8).
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {SIZE_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSize(s.value)}
                          data-testid={`wizard-size-${s.value}`}
                          className={
                            "rounded-2xl border bg-background p-6 text-left transition-shadow hover:shadow-glow " +
                            (size === s.value ? "border-primary/40" : "")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-display text-2xl tracking-tight">{s.value}</div>
                            {s.badge ? <Badge variant="premium">{s.badge}</Badge> : null}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">{s.dimensionsCm}</div>
                          <div className="mt-4 font-display text-3xl">{formatMoneyRonBani(s.priceRonBani)}</div>
                          <div className="mt-2 text-sm text-muted-foreground">Rama inclusă. Print foto glossy. Gata de pus pe perete.</div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border bg-background p-5">
                        <div className="font-medium">Frame color</div>
                        <div className="mt-2">
                          <Select value={frameColor ?? ""} onValueChange={(v) => setFrameColor(v as FrameColorValue)}>
                            <SelectTrigger aria-label="Select frame color" data-testid="wizard-frame-color">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {FRAME_COLORS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-background p-5">
                        <div className="font-medium">Frame model</div>
                        <div className="mt-2">
                          <Select value={frameModel ?? ""} onValueChange={(v) => setFrameModel(v as FrameModelValue)}>
                            <SelectTrigger aria-label="Select frame model" data-testid="wizard-frame-model">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {FRAME_MODELS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-card p-5 md:col-span-2">
                        <div className="text-sm text-muted-foreground">Rama este inclusă și obligatorie — ca să primești un tablou gata de perete.</div>
                      </div>
                    </div>
                  ) : null}

                  {step === 5 ? (
                    <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
                      <div className="rounded-2xl border bg-background p-6">
                        <div className="font-display text-2xl tracking-tight">Review</div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Theme</span><span className="font-medium">{activeTheme?.name ?? "—"}</span></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Uploads</span><span className="font-medium">{uploads.length}</span></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium">{size ?? "—"}</span></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Frame</span><span className="font-medium">{frameColor ? formatFrameColor(frameColor) : "—"}</span></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Model</span><span className="font-medium">{frameModel ? formatFrameModel(frameModel) : "—"}</span></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">Paper</span><span className="font-medium">Glossy photo paper</span></div>
                        </div>
                        <div className="mt-6 rounded-2xl border bg-card p-4">
                          <div className="text-xs text-muted-foreground">Base price</div>
                          <div className="mt-1 font-display text-3xl">{basePrice ? formatMoneyRonBani(basePrice) : "—"}</div>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">Next</div>
                        <div className="mt-2 font-display text-2xl tracking-tight">{editCartItem ? "Save changes" : "Add to cart"}</div>
                        <div className="mt-2 text-sm text-muted-foreground">{editCartItem ? "Updates this cart item." : "Adds this configured print to your cart."}</div>
                        <div className="mt-6 space-y-3">
                          {editCartItem ? (
                            <>
                              <Button
                                type="button"
                                className="w-full"
                                disabled={
                                  saving ||
                                  !publicId ||
                                  !itemPublicId ||
                                  !validateStep(1) ||
                                  !validateStep(2) ||
                                  !validateStep(3) ||
                                  !validateStep(4)
                                }
                                onClick={saveEdits}
                              >
                                {saving ? "Saving…" : "Save"}
                              </Button>
                              <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/cart")}>Back to cart</Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                className="w-full"
                                data-testid="wizard-add-to-cart"
                                disabled={
                                  saving ||
                                  !publicId ||
                                  !itemPublicId ||
                                  !validateStep(1) ||
                                  !validateStep(2) ||
                                  !validateStep(3) ||
                                  !validateStep(4)
                                }
                                onClick={addToCart}
                              >
                                {saving ? "Adding…" : "Add to cart"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                data-testid="wizard-buy-now"
                                disabled={
                                  saving ||
                                  !publicId ||
                                  !itemPublicId ||
                                  !validateStep(1) ||
                                  !validateStep(2) ||
                                  !validateStep(3) ||
                                  !validateStep(4)
                                }
                                onClick={buyNow}
                              >
                                {saving ? "Preparing…" : "Buy now"}
                              </Button>
                            </>
                          )}
                          <Button type="button" variant="outline" className="w-full" asChild>
                            <Link href="/themes">Choose another theme</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={step === 1} data-testid="wizard-back">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={goNext} disabled={!canGoNext || step === 5} data-testid="wizard-next">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Live preview</CardTitle>
                  <CardDescription>Lighting + corner zoom</CardDescription>
                </div>
                <div
                  className="inline-flex items-center rounded-xl border bg-background p-1"
                  role="group"
                  aria-label="Preview lighting"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewFilter("none")}
                    className={
                      "rounded-lg px-3 py-2 text-sm transition-colors " +
                      (previewFilter === "none" ? "bg-primary text-primary-foreground" : "hover:bg-muted")
                    }
                    aria-pressed={previewFilter === "none"}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter("warm")}
                    className={
                      "rounded-lg px-3 py-2 text-sm transition-colors " +
                      (previewFilter === "warm" ? "bg-primary text-primary-foreground" : "hover:bg-muted")
                    }
                    aria-pressed={previewFilter === "warm"}
                  >
                    Warm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter("cool")}
                    className={
                      "rounded-lg px-3 py-2 text-sm transition-colors " +
                      (previewFilter === "cool" ? "bg-primary text-primary-foreground" : "hover:bg-muted")
                    }
                    aria-pressed={previewFilter === "cool"}
                  >
                    Cool
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-muted p-6"
              >
                <div className="mx-auto max-w-[520px]">
                  <FramePreview
                    imageSrc={uploads[0] ? `/api/files/${uploads[0].filePath}` : null}
                    alt="Live preview"
                    frameColor={frameColor}
                    frameModel={frameModel}
                    previewFilter={previewFilter}
                  >
                    <div>
                      <div className="font-display text-2xl tracking-tight">{activeTheme?.name ?? "Select a theme"}</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Choose frame color + model to see the look. Upload at least 2 photos to proceed.
                      </div>
                    </div>
                  </FramePreview>

                  <div className="mt-5 flex items-center justify-between">
                    <Badge variant="muted">Frame included</Badge>
                    <Button type="button" variant="outline" size="sm" onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed}>
                      <ZoomIn className="mr-2 h-4 w-4" /> Corner zoom
                    </Button>
                  </div>

                  <AnimatePresence>
                    {zoomed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 overflow-hidden rounded-2xl border bg-card"
                      >
                        <div className="p-4">
                          <div className="text-sm font-medium">Corner zoom</div>
                          <div className="mt-2 overflow-hidden rounded-2xl border bg-muted">
                            <FramePreview
                              imageSrc={uploads[0] ? `/api/files/${uploads[0].filePath}` : null}
                              alt="Corner zoom"
                              frameColor={frameColor}
                              frameModel={frameModel}
                              previewFilter={previewFilter}
                              cornerZoom
                              className="mx-auto max-w-sm"
                            >
                              <div>
                                <div className="font-display text-lg tracking-tight">{activeTheme?.name ?? "Select a theme"}</div>
                                <div className="mt-1 text-xs text-muted-foreground">Pick frame options to see bevel + finish.</div>
                              </div>
                            </FramePreview>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">Zoom reflects selected color + model.</div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
