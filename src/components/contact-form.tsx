"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message too short"),
});

type FormValues = z.infer<typeof Schema>;

export function ContactForm() {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to send");

      toast.success("Message saved (local)");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <div className="text-sm text-destructive">{form.formState.errors.name.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
        {form.formState.errors.email ? (
          <div className="text-sm text-destructive">{form.formState.errors.email.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Tell us what you need…" {...form.register("message")} />
        {form.formState.errors.message ? (
          <div className="text-sm text-destructive">{form.formState.errors.message.message}</div>
        ) : null}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Send"}
      </Button>
    </form>
  );
}
