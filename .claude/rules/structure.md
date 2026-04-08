# Project Structure

```
src/
  app/              # Next.js App Router pages
  components/       # Shared and feature-specific components
    ui/             # shadcn/ui components
  lib/              # Utilities, auth config, prisma client
    actions/        # Server actions
prisma/             # Prisma schema and migrations
tests/
  setup.ts          # jest-dom matchers
  helpers/          # Test utilities (db client, helpers)
  integration/      # Server action tests against real DB
  components/       # React component tests
  e2e/              # Playwright browser tests
```
