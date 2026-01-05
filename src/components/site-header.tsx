"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/themes", label: "Themes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/quality", label: "Quality" },
  { href: "/shipping", label: "Shipping" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userLabel = React.useMemo(() => {
    const name = session?.user?.name?.trim();
    const email = session?.user?.email?.trim();
    return name || email || "Account";
  }, [session?.user?.email, session?.user?.name]);

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background/70 backdrop-blur", className)}>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Canvist home">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-background overflow-hidden border sm:h-8 sm:w-8">
            <Image src="/brand/logo-mark.png" alt="Canvist" width={32} height={32} priority />
          </div>
          <div className="font-display text-lg tracking-tight">Canvist</div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:inline-flex">
                  {userLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/addresses">Addresses</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/security">Security</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    void signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="ghost" className="hidden lg:inline-flex">
                <Link href="/signup">Create account</Link>
              </Button>
            </>
          )}
          <CartDrawer />
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/themes">Vezi exemple</Link>
          </Button>
          <Button asChild>
            <Link href="/create">Creează tabloul tău</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
