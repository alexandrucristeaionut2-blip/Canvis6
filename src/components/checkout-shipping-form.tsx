"use client";

import * as React from "react";

import { updateCheckoutShippingAction } from "@/app/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CheckoutShippingDefaults = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

type CheckoutShippingState = {
  ok?: true;
  error?: string;
};

const initialState: CheckoutShippingState = {};

export function CheckoutShippingForm({
  orderPublicId,
  defaults,
  canSaveToAccount,
  prefilledFromDefault,
}: {
  orderPublicId: string;
  defaults: CheckoutShippingDefaults;
  canSaveToAccount: boolean;
  prefilledFromDefault: boolean;
}) {
  const [state, formAction] = React.useActionState(updateCheckoutShippingAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderPublicId" value={orderPublicId} />

      {prefilledFromDefault ? (
        <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
          Prefilled from your default saved address.
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required defaultValue={defaults.fullName} autoComplete="name" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required defaultValue={defaults.phone} autoComplete="tel" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" name="line1" required defaultValue={defaults.line1} autoComplete="address-line1" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="line2">Address line 2</Label>
          <Input id="line2" name="line2" defaultValue={defaults.line2} autoComplete="address-line2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required defaultValue={defaults.city} autoComplete="address-level2" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region">Region / State</Label>
            <Input id="region" name="region" defaultValue={defaults.region} autoComplete="address-level1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" name="postalCode" required defaultValue={defaults.postalCode} autoComplete="postal-code" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required defaultValue={defaults.country} autoComplete="country-name" />
          </div>
        </div>

        {canSaveToAccount ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="saveToAccount" className="h-4 w-4 rounded border" />
            Save this address to my account
          </label>
        ) : (
          <div className="text-xs text-muted-foreground">Sign in to save addresses for faster checkout.</div>
        )}

        {state?.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{state.error}</div>
        ) : null}

        {state?.ok ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">Saved.</div> : null}

        <Button type="submit">Save shipping details</Button>
      </div>
    </form>
  );
}
