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
import { createUser, updateUser } from "@/lib/actions/users";
import type { User } from "./types";

const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email")
    .email("Enter a valid email"),
  password: z.string().max(128, "Password is too long"),
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
  department: z
    .string()
    .trim()
    .max(100, "Department name is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30, "Phone is too long")
    .optional()
    .or(z.literal("")),
});

type UserFormInput = z.input<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  departments: string[];
}

const EMPTY_VALUES: UserFormInput = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  department: "",
  phone: "",
};

function valuesFromUser(user: User | undefined): UserFormInput {
  if (!user) return EMPTY_VALUES;
  return {
    name: user.name,
    email: user.email,
    password: "",
    role: user.role,
    department: user.department ?? "",
    phone: user.phone ?? "",
  };
}

const ROLE_OPTIONS: { value: User["role"]; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "USER", label: "User" },
];

const INPUT_CLASS =
  "rounded-xl border border-[#e0e0e0] bg-white/60 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]";

export function UserFormModal({
  open,
  onOpenChange,
  user,
  departments,
}: UserFormModalProps) {
  const isEdit = user !== undefined;
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: valuesFromUser(user),
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesFromUser(user));
      const frame = requestAnimationFrame(() => form.setFocus("name"));
      return () => cancelAnimationFrame(frame);
    }
    form.reset(EMPTY_VALUES);
  }, [open, user, form]);

  function handleSubmit(values: UserFormInput) {
    // Password is required for new users
    if (!isEdit && !values.password) {
      form.setError("password", { message: "Enter a password" });
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          const result = await updateUser(user.id, {
            name: values.name,
            email: values.email,
            password: values.password || undefined,
            role: values.role,
            department: values.department || undefined,
            phone: values.phone || undefined,
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success(`Updated ${values.name}`);
        } else {
          const result = await createUser({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
            department: values.department || undefined,
            phone: values.phone || undefined,
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success(`Created ${values.name}`);
        }
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
            {isEdit ? "Edit user" : "Add user"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#888888]">
            {isEdit
              ? "Update user details and permissions."
              : "Create a new user account."}
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
                      placeholder="Full name"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="user@example.com"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{isEdit ? " (leave blank to keep current)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={isEdit ? "••••••••" : "Enter password"}
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className={INPUT_CLASS}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
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
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Engineering"
                      list="department-options"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <datalist id="department-options">
                    {departments.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
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
                className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
              >
                {isPending ? (
                  <><Spinner /> Saving...</>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create user"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
