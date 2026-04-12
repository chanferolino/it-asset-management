"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const lookupSchema = z.object({
  query: z.string().trim().min(1, "Enter an asset tag or serial number"),
});

export type LookupInput = z.infer<typeof lookupSchema>;

interface LookupFormProps {
  onLookup: (query: string) => void;
}

export function LookupForm({ onLookup }: LookupFormProps) {
  const form = useForm<LookupInput>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { query: "" },
  });

  useEffect(() => {
    form.setFocus("query");
    // Focus once on mount; re-focusing on rerenders would steal focus from
    // other elements.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: LookupInput) {
    onLookup(values.query);
  }

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 sm:flex-row sm:items-start"
          data-testid="lookup-form"
          noValidate
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                  Asset tag or serial number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. IT-0001 or SN-ABCD1234"
                    autoComplete="off"
                    className="rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="rounded-xl bg-[#c80000] px-6 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000] sm:mt-[26px]"
          >
            Look up
          </Button>
        </form>
      </Form>
    </div>
  );
}
