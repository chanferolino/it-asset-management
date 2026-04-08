# Component Patterns

## Modals

- Use shadcn/ui `Dialog` for all modals
- Modal trigger lives in the parent; modal content is a separate component
- Each modal gets its own file in `src/components/modals/`
- Modal forms reset on close

## Forms

- Use React Hook Form + Zod with shadcn/ui Form wrappers
- Toast notifications via `sonner` for success/error feedback
