# Conventions

- Use `cn()` for composing Tailwind classes
- Use shadcn/ui components as the base for all UI
- Server Components by default; `'use client'` only when needed
- All frontend design work must follow the glassmorphism design system defined in `.agents/design.md`
- Prisma for all database access
- Validate inputs at API boundaries with Zod

## Tables & Interactivity

- Every data table row must have an Actions column with Edit and Delete icon buttons
- Clickable text (e.g., titles that open a detail view) must look like a link — use `text-[#7b0000] hover:text-[#c80000] cursor-pointer` (no underline, color change on hover)
- All clickable elements must have `cursor-pointer` — buttons, links, clickable table rows, icon buttons
- Never make text clickable without visual affordance

## Modals

- Modal buttons must always be right-aligned: `flex justify-end gap-2`
- Cancel button first, primary action button second (right-most)
- Never use `window.confirm()` or browser-native dialogs — always use a shadcn Dialog confirmation modal with glassmorphism styling
- Delete confirmations must show what's being deleted and warn that it's irreversible

## Forms

- Use React Hook Form + Zod for all forms
- Define Zod schemas first, then infer types with `z.infer<typeof schema>`
- Use shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` wrappers
- Use `useForm` with `zodResolver` — no manual validation logic
- Keep form schemas co-located with their form components
