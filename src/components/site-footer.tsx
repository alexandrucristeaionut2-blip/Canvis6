import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container grid gap-6 py-10 md:grid-cols-3">
        <div className="space-y-2">
          <div className="font-display text-xl">Canvist</div>
          <p className="text-sm text-muted-foreground">
            Print foto glossy, înrămat. Alegi tematica și rama, plătești, apoi aprobi preview-ul înainte de print.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href="/themes" className="text-muted-foreground hover:text-foreground">Themes</Link>
          <Link href="/gallery" className="text-muted-foreground hover:text-foreground">Gallery</Link>
          <Link href="/quality" className="text-muted-foreground hover:text-foreground">Quality</Link>
          <Link href="/shipping" className="text-muted-foreground hover:text-foreground">Shipping</Link>
          <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Privacy: placeholder</div>
          <div>Terms: placeholder</div>
          <div className="text-xs">Local-only MVP • no emails are sent.</div>
        </div>
      </div>
    </footer>
  );
}
