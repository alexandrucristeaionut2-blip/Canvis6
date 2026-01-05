"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockupImage } from "@/components/mockup-image";
import { FRAME_COLORS, FRAME_MODELS, SIZE_OPTIONS, formatFrameColor, formatFrameModel } from "@/lib/product";

export type GalleryItemView = {
  id: string;
  imagePath: string;
  mockupImage: string;
  title: string | null;
  size: string;
  frameColor: string;
  frameModel: string;
  theme: { slug: string; name: string };
};

export function GalleryGrid({ items }: { items: GalleryItemView[] }) {
  const themeOptions = React.useMemo(() => {
    const uniq = new Map<string, string>();
    for (const i of items) uniq.set(i.theme.slug, i.theme.name);
    return Array.from(uniq.entries()).map(([slug, name]) => ({ slug, name }));
  }, [items]);

  const [theme, setTheme] = React.useState<string>("ALL");
  const [size, setSize] = React.useState<string>("ALL");
  const [frameColor, setFrameColor] = React.useState<string>("ALL");
  const [frameModel, setFrameModel] = React.useState<string>("ALL");

  const filtered = React.useMemo(() => {
    return items.filter((i) => {
      if (theme !== "ALL" && i.theme.slug !== theme) return false;
      if (size !== "ALL" && i.size !== size) return false;
      if (frameColor !== "ALL" && i.frameColor !== frameColor) return false;
      if (frameModel !== "ALL" && i.frameModel !== frameModel) return false;
      return true;
    });
  }, [items, theme, size, frameColor, frameModel]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <div className="mb-2 text-sm font-medium">Theme</div>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger aria-label="Filter by theme">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {themeOptions.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Size</div>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger aria-label="Filter by size">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {SIZE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Frame color</div>
          <Select value={frameColor} onValueChange={setFrameColor}>
            <SelectTrigger aria-label="Filter by frame color">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {FRAME_COLORS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Frame model</div>
          <Select value={frameModel} onValueChange={setFrameModel}>
            <SelectTrigger aria-label="Filter by frame model">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {FRAME_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="group overflow-hidden rounded-2xl border bg-card text-left shadow-card transition-shadow hover:shadow-glow"
              >
                <div className="relative aspect-[1414/2000] bg-muted">
                  <MockupImage
                    src={item.mockupImage}
                    fallbackSrc={item.imagePath}
                    alt={`Canvist framed print — ${item.title ?? item.theme.name}`}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    expectedAspectRatio={1414 / 2000}
                  />
                </div>
                <div className="p-4">
                  <div className="font-display text-lg tracking-tight">{item.theme.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {item.size} • {formatFrameColor(item.frameColor)} • {formatFrameModel(item.frameModel)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="muted">{item.size}</Badge>
                    <Badge variant="muted">Frame included</Badge>
                  </div>
                </div>
              </motion.button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{item.title ?? item.theme.name}</DialogTitle>
                <DialogDescription>
                  {item.size} • {formatFrameColor(item.frameColor)} • {formatFrameModel(item.frameModel)}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div className="relative aspect-[1414/2000] overflow-hidden rounded-2xl border bg-muted shadow-card">
                  <MockupImage
                    src={item.mockupImage}
                    fallbackSrc={item.imagePath}
                    alt={`Canvist framed print — ${item.title ?? item.theme.name}`}
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    expectedAspectRatio={1414 / 2000}
                  />
                </div>
                <div className="rounded-2xl border bg-background p-5">
                  <div className="text-sm text-muted-foreground">Creează similar</div>
                  <div className="mt-2 font-display text-xl tracking-tight">{item.theme.name}</div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span>Size</span><span className="font-medium">{item.size}</span></div>
                    <div className="flex items-center justify-between"><span>Frame color</span><span className="font-medium">{formatFrameColor(item.frameColor)}</span></div>
                    <div className="flex items-center justify-between"><span>Frame model</span><span className="font-medium">{formatFrameModel(item.frameModel)}</span></div>
                    <div className="flex items-center justify-between"><span>Paper</span><span className="font-medium">Glossy</span></div>
                  </div>
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link
                        href={`/create?theme=${encodeURIComponent(item.theme.slug)}&size=${encodeURIComponent(item.size)}&frameColor=${encodeURIComponent(item.frameColor)}&frameModel=${encodeURIComponent(item.frameModel)}`}
                      >
                        Creează similar
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No gallery items match your filters.
        </div>
      ) : null}
    </div>
  );
}
