"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VendorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
  onConfirm: () => void;
}

export function VendorDeleteDialog({
  open,
  onOpenChange,
  vendorName,
  onConfirm,
}: VendorDeleteDialogProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="vendor-delete-dialog"
        className="max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            Delete vendor?
          </DialogTitle>
          <DialogDescription
            data-testid="vendor-delete-dialog-description"
            className="text-sm text-[#888888]"
          >
            Delete {vendorName}? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            data-testid="vendor-delete-cancel"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="vendor-delete-confirm"
            onClick={handleConfirm}
            className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
