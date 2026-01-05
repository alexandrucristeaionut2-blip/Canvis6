import Link from "next/link";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container py-10 md:py-14", className)}>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="max-w-lg">
          <div className="font-display text-4xl tracking-tight">Canvist</div>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Alegi tema + rama, plătești, apoi aprobi preview-ul înainte de producție.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-foreground/40" /> Preview before print</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-foreground/40" /> 1 revision included</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-foreground/40" /> International shipping</li>
          </ul>
          <div className="mt-6 text-sm text-muted-foreground">
            By continuing you agree to our <Link href="/faq" className="underline underline-offset-4">policies</Link>.
          </div>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
