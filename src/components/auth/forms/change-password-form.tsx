"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { passwordStrength } from "@/components/auth/password-strength";
import { changePasswordAction } from "@/app/account/security/actions";

type ChangePasswordState = {
  ok?: true;
  error?: string;
};

const initialState: ChangePasswordState = {};

export function ChangePasswordForm({
  hasPassword,
}: {
  hasPassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const strength = passwordStrength(newPassword);

  const [state, formAction] = React.useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {hasPassword ? (
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordField
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
          Your account doesn’t have a password yet (magic link sign-in). Set one below.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordField
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
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
      {state?.ok ? <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">Password updated.</div> : null}

      <Button type="submit" className="w-full">Update password</Button>
    </form>
  );
}
