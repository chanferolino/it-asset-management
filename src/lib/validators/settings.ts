import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(100, "Site name must be 100 characters or fewer"),
  supportEmail: z
    .string()
    .trim()
    .min(1, "Support email is required")
    .email("Must be a valid email address"),
  notificationsEnabled: z.boolean(),
  smtpHost: z
    .string()
    .trim()
    .max(255, "SMTP host must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  smtpFromAddress: z
    .string()
    .trim()
    .max(255, "SMTP from address must be 255 characters or fewer")
    .email("Must be a valid email address")
    .optional()
    .or(z.literal("")),
  logoDataUrl: z
    .string()
    .max(700_000, "Logo image is too large (max ~500 KB)")
    .refine(
      (v) => v === "" || /^data:image\/(png|jpeg|jpg|svg\+xml|webp|gif|x-icon|vnd\.microsoft\.icon);base64,/.test(v),
      "Logo must be a PNG, JPG, SVG, WEBP, GIF, or ICO image",
    )
    .optional()
    .or(z.literal("")),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
