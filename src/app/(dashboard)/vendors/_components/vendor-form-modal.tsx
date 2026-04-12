"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import type { Vendor } from "@/lib/vendors/types";

export const vendorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a vendor name")
    .max(100, "Vendor name is too long"),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Enter a contact email")
    .email("Enter a valid email"),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Phone is too long")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

type VendorFormInput = z.input<typeof vendorFormSchema>;

export interface VendorFormValues {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  notes?: string;
}

interface VendorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor;
  onSubmit: (values: VendorFormValues) => void;
}

const EMPTY_VALUES: VendorFormInput = {
  name: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  notes: "",
};

function valuesFromVendor(vendor: Vendor | undefined): VendorFormInput {
  if (!vendor) return EMPTY_VALUES;
  return {
    name: vendor.name,
    contactEmail: vendor.contactEmail,
    contactPhone: vendor.contactPhone ?? "",
    website: vendor.website ?? "",
    notes: vendor.notes ?? "",
  };
}

export function VendorFormModal({
  open,
  onOpenChange,
  vendor,
  onSubmit,
}: VendorFormModalProps) {
  const isEdit = vendor !== undefined;
  const form = useForm<VendorFormInput>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: valuesFromVendor(vendor),
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesFromVendor(vendor));
      const frame = requestAnimationFrame(() => form.setFocus("name"));
      return () => cancelAnimationFrame(frame);
    }
    form.reset(EMPTY_VALUES);
  }, [open, vendor, form]);

  function handleSubmit(values: VendorFormInput) {
    const payload: VendorFormValues = {
      name: values.name.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhone:
        values.contactPhone && values.contactPhone.trim()
          ? values.contactPhone.trim()
          : undefined,
      website:
        values.website && values.website.trim()
          ? values.website.trim()
          : undefined,
      notes:
        values.notes && values.notes.trim() ? values.notes.trim() : undefined,
    };
    onSubmit(payload);
    form.reset(EMPTY_VALUES);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="vendor-form-modal"
        className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            {isEdit ? "Edit vendor" : "Add vendor"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {isEdit
              ? "Update vendor contact details. Changes are recorded locally (UI only)."
              : "Record a new vendor. Changes are recorded locally (UI only)."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-2 space-y-4"
            data-testid="vendor-form"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Vendor name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="vendor-form-name"
                      placeholder="e.g. Acme Supply Co."
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Contact email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      data-testid="vendor-form-email"
                      placeholder="sales@example.com"
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Contact phone (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      data-testid="vendor-form-phone"
                      placeholder="+1 (415) 555-0100"
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Website (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      data-testid="vendor-form-website"
                      placeholder="https://example.com"
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
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
                      rows={3}
                      data-testid="vendor-form-notes"
                      placeholder="Payment terms, coverage details, etc."
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
                data-testid="vendor-form-cancel"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="vendor-form-submit"
                className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                {isEdit ? "Save changes" : "Create vendor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
