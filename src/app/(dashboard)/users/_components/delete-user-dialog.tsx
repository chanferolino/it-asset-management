"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from "@/lib/actions/users";
import type { User } from "./types";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!user) return;

    startTransition(async () => {
      try {
        const result = await deleteUser(user.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(`Deactivated ${user.name}`);
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            Deactivate {user?.name}?
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            This will prevent the user from logging in and accessing the system.
            You can reactivate them later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-[#c80000]">
          The user will lose access immediately. Any assets assigned to them will
          remain assigned but should be reassigned.
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
          >
            {isPending ? "Deactivating..." : "Deactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
