"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Asset, User } from "@/lib/checkinout/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const checkoutSchema = z.object({
  userId: z.string().min(1, "Select a user"),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  users: User[];
  onSubmit: (payload: CheckoutInput) => void;
}

export function CheckoutModal({
  open,
  onOpenChange,
  asset,
  users,
  onSubmit,
}: CheckoutModalProps) {
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { userId: "", notes: "" },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ userId: "", notes: "" });
    }
  }, [open, form]);

  function handleSubmit(values: CheckoutInput) {
    onSubmit({
      userId: values.userId,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    });
    form.reset({ userId: "", notes: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="checkout-modal"
        className="max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            Check out {asset?.name ?? "asset"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            Assign this device to a user. The check-out timestamp is recorded
            automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-2 space-y-4"
            data-testid="checkout-form"
            noValidate
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Assign to
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      data-testid="checkout-user-select"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-white/60 px-3 py-2 text-sm text-[#300000] backdrop-blur-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/[0.08]"
                    >
                      <option value="">Select a user…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                          {u.department ? ` — ${u.department}` : ""}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Notes (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Optional notes (e.g., loaner, remote worker)"
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                data-testid="checkout-cancel-button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="checkout-submit-button"
                className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                Check out
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
