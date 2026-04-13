"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/spinner";
import { createAsset, updateAsset } from "@/lib/actions/inventory";
import type { InventoryAsset, AssetCategory, AssetStatus } from "./types";
import { CATEGORY_LABELS, STATUS_LABELS } from "./types";

const assetFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(200, "Name is too long"),
  tag: z
    .string()
    .trim()
    .min(1, "Enter an asset tag")
    .max(50, "Tag is too long"),
  serial: z
    .string()
    .trim()
    .min(1, "Enter a serial number")
    .max(100, "Serial is too long"),
  category: z.enum(["LAPTOP", "DESKTOP", "MONITOR", "PHONE", "ACCESSORY"]),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"]),
  vendorId: z.string().optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  purchaseCost: z.string().optional().or(z.literal("")),
  warrantyExpiresAt: z.string().optional().or(z.literal("")),
});

type AssetFormInput = z.input<typeof assetFormSchema>;

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: InventoryAsset;
  vendors: { id: string; name: string }[];
}

const EMPTY_VALUES: AssetFormInput = {
  name: "",
  tag: "",
  serial: "",
  category: "LAPTOP",
  status: "AVAILABLE",
  vendorId: "",
  purchaseDate: "",
  purchaseCost: "",
  warrantyExpiresAt: "",
};

function valuesFromAsset(asset: InventoryAsset | undefined): AssetFormInput {
  if (!asset) return EMPTY_VALUES;
  return {
    name: asset.name,
    tag: asset.tag,
    serial: asset.serial,
    category: asset.category as AssetCategory,
    status: asset.status as AssetStatus,
    vendorId: asset.vendorId ?? "",
    purchaseDate: asset.purchaseDate
      ? asset.purchaseDate.slice(0, 10)
      : "",
    purchaseCost: asset.purchaseCost != null
      ? (asset.purchaseCost / 100).toString()
      : "",
    warrantyExpiresAt: asset.warrantyExpiresAt
      ? asset.warrantyExpiresAt.slice(0, 10)
      : "",
  };
}

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = (
  Object.entries(CATEGORY_LABELS) as [AssetCategory, string][]
).map(([value, label]) => ({ value, label }));

const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = (
  Object.entries(STATUS_LABELS) as [AssetStatus, string][]
).map(([value, label]) => ({ value, label }));

const INPUT_CLASS =
  "rounded-xl border border-[#e0e0e0] bg-white/60 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]";

export function AssetFormModal({
  open,
  onOpenChange,
  asset,
  vendors,
}: AssetFormModalProps) {
  const isEdit = asset !== undefined;
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssetFormInput>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: valuesFromAsset(asset),
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesFromAsset(asset));
      const frame = requestAnimationFrame(() => form.setFocus("name"));
      return () => cancelAnimationFrame(frame);
    }
    form.reset(EMPTY_VALUES);
  }, [open, asset, form]);

  function handleSubmit(values: AssetFormInput) {
    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          tag: values.tag,
          serial: values.serial,
          category: values.category as AssetCategory,
          status: values.status as AssetStatus,
          vendorId: values.vendorId || null,
          purchaseDate: values.purchaseDate || null,
          purchaseCost: values.purchaseCost
            ? Math.round(parseFloat(values.purchaseCost) * 100)
            : null,
          warrantyExpiresAt: values.warrantyExpiresAt || null,
        };

        const result = isEdit
          ? await updateAsset(asset.id, payload)
          : await createAsset(payload);

        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(isEdit ? `Updated ${values.name}` : `Created ${values.name}`);
        form.reset(EMPTY_VALUES);
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            {isEdit ? "Edit asset" : "Add asset"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {isEdit
              ? "Update asset details."
              : "Add a new asset to the inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-2 space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. MacBook Pro 16&quot;"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Tag</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. IT-0042"
                        disabled={isEdit}
                        className={INPUT_CLASS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. C02XG2..."
                        className={INPUT_CLASS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_CLASS}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_CLASS}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor (optional)</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className={INPUT_CLASS}>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className={INPUT_CLASS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Cost (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={INPUT_CLASS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="warrantyExpiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Expiry (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="cursor-pointer rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                {isPending ? (
                  <><Spinner /> Saving...</>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create asset"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
