"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { passwordStrength } from "@/components/auth/password-strength";
import { resetPasswordAction } from "@/app/(auth)/verify/actions";

type ResetPasswordState = {
  ok?: true;
  error?: string;
};

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = React.useState("");
  const strength = passwordStrength(password);

  const [state, formAction] = React.useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordField id="password" name="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Password strength</span>
          <span>{strength.label}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 rounded-full ${strength.score > i ? "bg-foreground/60" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {state?.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{state.error}</div> : null}

      <Button type="submit" className="w-full">
        Set new password
      </Button>
    </form>
  );
}
