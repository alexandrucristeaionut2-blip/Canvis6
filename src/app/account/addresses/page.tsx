import { revalidatePath } from "next/cache";

import { SiteShell } from "@/components/site-shell";
import { MotionSection } from "@/components/motion-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { addAddressAction, setDefaultAddressAction } from "@/app/account/addresses/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Addresses — Canvist" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  async function setDefault(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await setDefaultAddressAction(id);
    revalidatePath("/account/addresses");
  }

  return (
    <SiteShell>
      <div className="container py-10 md:py-14">
        <MotionSection>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">Addresses</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">Save your shipping details for faster checkout.</p>
          </div>
        </MotionSection>

        <MotionSection>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Add a new address</CardTitle>
                <CardDescription>Mark one as default for checkout prefill.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addAddressAction} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="line1">Address line 1</Label>
                    <Input id="line1" name="line1" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="line2">Address line 2</Label>
                    <Input id="line2" name="line2" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="region">Region / State</Label>
                    <Input id="region" name="region" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input id="postalCode" name="postalCode" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" required />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border" />
                    Set as default
                  </label>

                  <Button type="submit">Save address</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Your addresses</CardTitle>
                <CardDescription>{addresses.length} saved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No saved addresses yet.</div>
                ) : (
                  addresses.map((a) => (
                    <div key={a.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">{a.fullName}{a.isDefault ? " • Default" : ""}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                            {a.city}{a.region ? `, ${a.region}` : ""} {a.postalCode}<br />
                            {a.country}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">{a.phone}</div>
                        </div>
                        {!a.isDefault ? (
                          <form action={setDefault}>
                            <input type="hidden" name="id" value={a.id} />
                            <Button type="submit" variant="outline">Set default</Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </MotionSection>
      </div>
    </SiteShell>
  );
}
