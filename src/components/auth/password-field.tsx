"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  id?: string;
  className?: string;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-1 top-1 h-9 w-9 rounded-lg p-0"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
