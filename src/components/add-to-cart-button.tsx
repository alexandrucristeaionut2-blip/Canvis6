"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AddToCartButton({
  theme,
  className,
}: {
  theme: { slug: string; name: string; mockupImage: string };
  className?: string;
}) {
  return (
    <Button asChild type="button" variant="outline" size="sm" className={className}>
      <Link href={`/create?theme=${encodeURIComponent(theme.slug)}`} onClick={(e) => e.stopPropagation()}>
      <ShoppingCart className="h-4 w-4" />
      Customize
      </Link>
    </Button>
  );
}
