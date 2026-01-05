"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/app/(auth)/forgot-password/actions";

type ForgotPasswordState = {
  ok?: true;
  error?: string;
};

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = React.useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {state?.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{state.error}</div> : null}
      {state?.ok ? (
        <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
          If the email exists, we sent a link. In local dev, the reset URL is printed in the server console.
        </div>
      ) : null}

      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
