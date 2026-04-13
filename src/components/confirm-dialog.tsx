"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading: externalLoading,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();
  const loading = externalLoading ?? isPending;

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="rounded-xl bg-[#c80000] px-4 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
