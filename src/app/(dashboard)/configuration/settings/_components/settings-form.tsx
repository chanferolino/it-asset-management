"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/lib/actions/settings";
import {
  settingsSchema,
  type SettingsInput,
} from "@/lib/validators/settings";

interface SettingsFormProps {
  defaultValues: SettingsInput;
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.success) {
        toast.success("Settings saved");
        form.reset(values);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        data-testid="settings-form"
      >
        <FormField
          control={form.control}
          name="logoDataUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site logo</FormLabel>
              <div className="flex items-center gap-4">
                {field.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={field.value}
                    alt="Logo preview"
                    className="h-12 w-12 rounded-lg border border-[#e0e0e0] bg-white object-contain p-1"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[#e0e0e0] bg-white/60 text-xs text-[#bbbbbb]">
                    none
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/x-icon"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 500_000) {
                          toast.error("Image too large. Please use an image under 500 KB.");
                          e.target.value = "";
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          field.onChange(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <button
                      type="button"
                      onClick={() => field.onChange("")}
                      className="cursor-pointer self-start text-xs text-[#7b0000] hover:text-[#c80000]"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
              <FormDescription>
                Shown in the sidebar and used as the browser favicon. PNG/SVG recommended. Max 500 KB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site name</FormLabel>
              <FormControl>
                <Input placeholder="IT Asset Management" {...field} />
              </FormControl>
              <FormDescription>
                Displayed in the browser tab and application header.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supportEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="support@company.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Where users are directed for help with the system.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-[#e0e0e0] bg-white/60 p-4 backdrop-blur-sm">
              <div className="space-y-0.5">
                <FormLabel className="normal-case">
                  Email notifications
                </FormLabel>
                <FormDescription>
                  Send ticket and asset update emails to assignees.
                </FormDescription>
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

        <div className="space-y-4 border-t border-[#e0e0e0] pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#555555]">
              Outbound email (SMTP)
            </h3>
            <p className="text-sm text-[#888888]">
              Optional. Leave blank to disable outbound email delivery.
            </p>
          </div>

          <FormField
            control={form.control}
            name="smtpHost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP host</FormLabel>
                <FormControl>
                  <Input placeholder="smtp.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smtpFromAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP from address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="noreply@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="rounded-xl bg-[#c80000] px-5 py-2 text-white hover:bg-[#b10000] active:bg-[#7b0000]"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
