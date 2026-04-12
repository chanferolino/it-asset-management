"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export const notificationPreferencesSchema = z.object({
  system: z.boolean(),
  security: z.boolean(),
  maintenance: z.boolean(),
  warranty: z.boolean(),
  inApp: z.boolean(),
  email: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;

interface PreferencesFormProps {
  defaultValues: NotificationPreferencesInput;
}

const CATEGORY_FIELDS: {
  name: keyof Pick<
    NotificationPreferencesInput,
    "system" | "security" | "maintenance" | "warranty"
  >;
  label: string;
  description: string;
}[] = [
  {
    name: "system",
    label: "System events",
    description: "Backups, schema changes, and general system activity.",
  },
  {
    name: "security",
    label: "Security incidents",
    description: "Failed logins, permission changes, and suspicious activity.",
  },
  {
    name: "maintenance",
    label: "Scheduled maintenance",
    description: "Planned downtime and upgrade windows.",
  },
  {
    name: "warranty",
    label: "Warranty alerts",
    description: "Asset warranty expiration and renewal reminders.",
  },
];

const CHANNEL_FIELDS: {
  name: keyof Pick<NotificationPreferencesInput, "inApp" | "email">;
  label: string;
  description: string;
}[] = [
  {
    name: "inApp",
    label: "In-app",
    description: "Show notifications in the bell menu and inbox.",
  },
  {
    name: "email",
    label: "Email",
    description: "Send a copy to your account email address.",
  },
];

export function PreferencesForm({ defaultValues }: PreferencesFormProps) {
  const form = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues,
  });

  function onSubmit(values: NotificationPreferencesInput) {
    toast.success("Preferences saved (UI only — backend pending)");
    form.reset(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        data-testid="preferences-form"
      >
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#555555]">
              Notify me about
            </h3>
            <p className="text-sm text-[#888888]">
              Pick the categories of events that should generate alerts.
            </p>
          </div>
          {CATEGORY_FIELDS.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-[#e0e0e0] bg-white/60 p-4 backdrop-blur-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="normal-case">{f.label}</FormLabel>
                    <FormDescription>{f.description}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </section>

        <section className="space-y-4 border-t border-[#e0e0e0] pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#555555]">
              Delivery
            </h3>
            <p className="text-sm text-[#888888]">
              Choose how alerts should reach you.
            </p>
          </div>
          {CHANNEL_FIELDS.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-[#e0e0e0] bg-white/60 p-4 backdrop-blur-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="normal-case">{f.label}</FormLabel>
                    <FormDescription>{f.description}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isDirty}
            className="rounded-xl bg-[#c80000] px-5 py-2 text-white hover:bg-[#b10000] active:bg-[#7b0000]"
          >
            Save preferences
          </Button>
        </div>
      </form>
    </Form>
  );
}
