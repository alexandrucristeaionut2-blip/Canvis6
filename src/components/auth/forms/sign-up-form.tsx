"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { passwordStrength } from "@/components/auth/password-strength";
import { signUpAction } from "@/app/(auth)/signup/actions";

type SignUpState = {
  error?: string;
};

const initialState: SignUpState = {};

export function SignUpForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [password, setPassword] = React.useState("");
  const strength = passwordStrength(password);

  const [state, formAction] = React.useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Optional" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordField
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Password strength</span>
          <span>{strength.label}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${strength.score > i ? "bg-foreground/60" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {state?.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{state.error}</div> : null}

      <Button type="submit" className="w-full">
        Create account
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/signin?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}
