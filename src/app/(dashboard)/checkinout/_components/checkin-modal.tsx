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

export const checkinSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type CheckinInput = z.infer<typeof checkinSchema>;

interface CheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  currentAssignee: User | null;
  onSubmit: (payload: CheckinInput) => void;
}

export function CheckinModal({
  open,
  onOpenChange,
  asset,
  currentAssignee,
  onSubmit,
}: CheckinModalProps) {
  const form = useForm<CheckinInput>({
    resolver: zodResolver(checkinSchema),
    defaultValues: { notes: "" },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ notes: "" });
    }
  }, [open, form]);

  function handleSubmit(values: CheckinInput) {
    onSubmit({
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    });
    form.reset({ notes: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="checkin-modal"
        className="max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            Check in {asset?.name ?? "asset"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {currentAssignee
              ? `Returning from ${currentAssignee.name}.`
              : "Return this device to the available pool."}{" "}
            The check-in timestamp is recorded automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-2 space-y-4"
            data-testid="checkin-form"
            noValidate
          >
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
                      placeholder="Optional notes (e.g., condition, reason for return)"
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
                data-testid="checkin-cancel-button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="checkin-submit-button"
                className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                Check in
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
