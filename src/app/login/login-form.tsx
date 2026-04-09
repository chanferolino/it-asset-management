"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error: string } | null, formData: FormData) => {
      const result = await login(formData);
      return result ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-[#c80000] backdrop-blur-sm">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@company.com"
          required
          autoComplete="email"
          className="rounded-xl border border-[#e0e0e0] bg-white/60 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-[#e0e0e0] bg-white/60 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
