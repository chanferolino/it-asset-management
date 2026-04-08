# Conventions

- Use `cn()` for composing Tailwind classes
- Use shadcn/ui components as the base for all UI
- Server Components by default; `'use client'` only when needed
- Prisma for all database access
- Validate inputs at API boundaries with Zod

## Forms

- Use React Hook Form + Zod for all forms
- Define Zod schemas first, then infer types with `z.infer<typeof schema>`
- Use shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` wrappers
- Use `useForm` with `zodResolver` — no manual validation logic
- Keep form schemas co-located with their form components
