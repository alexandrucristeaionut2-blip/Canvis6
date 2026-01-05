"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function HeroPreview({
  themes,
}: {
  themes: Array<{ slug: string; name: string; tags: string[] }>;
}) {
  const shortlist = themes.slice(0, 4);
  const [active, setActive] = React.useState(shortlist[0]?.slug ?? "");

  const activeTheme = shortlist.find((t) => t.slug === active) ?? shortlist[0];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-lg tracking-tight">Hero preview</div>
          <div className="text-sm text-muted-foreground">Schimbă tematica și vezi mockup-ul actualizat.</div>
        </div>
        <Badge variant="premium">Preview plătit</Badge>
      </div>

      <div className="mt-4">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="w-full justify-start">
            {shortlist.map((t) => (
              <TabsTrigger key={t.slug} value={t.slug} className="data-[state=active]:bg-primary/10">
                {t.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-[radial-gradient(circle_at_30%_20%,rgba(176,141,87,0.22),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(17,17,17,0.10),transparent_55%)] p-6">
            <div className="text-xs font-medium text-muted-foreground">Framed mockup</div>
            <div className="mt-4 flex items-center justify-center">
              <div className="relative w-full max-w-[420px]">
                <div className="rounded-[28px] bg-foreground/10 p-5 shadow-card">
                  <div className="rounded-[22px] bg-background p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTheme?.slug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="aspect-[3/4] rounded-2xl bg-[radial-gradient(circle_at_25%_20%,rgba(176,141,87,0.24),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(17,17,17,0.12),transparent_60%)]"
                      >
                        <div className="p-6">
                          <div className="font-display text-2xl tracking-tight">{activeTheme?.name}</div>
                          <div className="mt-2 text-sm text-muted-foreground">Cinematic composition • premium whitespace</div>
                          <div className="mt-6 flex flex-wrap gap-2">
                            {activeTheme?.tags?.slice(0, 3).map((t) => (
                              <Badge key={t} variant="muted">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6">
            <div className="font-display text-lg tracking-tight">Rama inclusă</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Print foto glossy, înrămat. Alegi tematica și rama, plătești, apoi aprobi preview-ul înainte de print.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Hârtie</span><span className="font-medium">Glossy photo paper</span></div>
              <div className="flex items-center justify-between"><span>Revizie inclusă</span><span className="font-medium">1 rundă</span></div>
              <div className="flex items-center justify-between"><span>Flow</span><span className="font-medium">Pay → Preview → Approve</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

