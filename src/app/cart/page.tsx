import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata = {
  title: "Cart — Canvist",
};

export default function CartPage() {
  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <Card className="mx-auto max-w-5xl">
            <CardHeader>
              <CardTitle className="text-2xl">Cart</CardTitle>
              <CardDescription>Review items, estimate shipping, then continue to checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <CartPageClient />
            </CardContent>
          </Card>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
