"use client";

import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/spinner";
import {
  createTicket,
  updateTicket,
  type CreateTicketInput,
  type UpdateTicketInput,
} from "@/lib/actions/tickets";
import type { Ticket, SimpleUser } from "./types";
import { PRIORITY_LABELS } from "./types";

const ticketFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  assignedToId: z.string().optional(),
});

type TicketFormInput = z.infer<typeof ticketFormSchema>;

interface TicketFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket;
  users: SimpleUser[];
}

const EMPTY_VALUES: TicketFormInput = {
  title: "",
  description: "",
  priority: "MEDIUM",
  assignedToId: undefined,
};

function valuesFromTicket(ticket: Ticket | undefined): TicketFormInput {
  if (!ticket) return EMPTY_VALUES;
  return {
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    assignedToId: ticket.assignedToId ?? undefined,
  };
}

export function TicketFormModal({
  open,
  onOpenChange,
  ticket,
  users,
}: TicketFormModalProps) {
  const isEdit = ticket !== undefined;
  const form = useForm<TicketFormInput>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: valuesFromTicket(ticket),
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesFromTicket(ticket));
      const frame = requestAnimationFrame(() => form.setFocus("title"));
      return () => cancelAnimationFrame(frame);
    }
    form.reset(EMPTY_VALUES);
  }, [open, ticket, form]);

  async function handleSubmit(values: TicketFormInput) {
    if (isEdit) {
      const input: UpdateTicketInput = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        assignedToId: values.assignedToId || null,
      };
      const result = await updateTicket(ticket.id, input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Ticket updated");
    } else {
      const input: CreateTicketInput = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        assignedToId: values.assignedToId || undefined,
      };
      const result = await createTicket(input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Ticket created");
    }
    form.reset(EMPTY_VALUES);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            {isEdit ? "Edit ticket" : "New ticket"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {isEdit
              ? "Update the ticket details."
              : "Create a new support ticket."}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Laptop screen flickering"
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Describe the issue in detail..."
                      className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Priority
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.entries(PRIORITY_LABELS) as [string, string][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value} label={label}>
                          {label}
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
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                    Assigned to (optional)
                  </FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === "__unassigned__" ? undefined : val)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__unassigned__">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} label={user.name}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                disabled={form.formState.isSubmitting}
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                {form.formState.isSubmitting ? (
                  <><Spinner /> Saving...</>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create ticket"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
