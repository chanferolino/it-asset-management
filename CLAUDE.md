# IT Asset Management

Internal system for tracking and managing IT assets — hardware, software licenses, and equipment assignments.

## Rules Reference

Detailed specs live in `.claude/rules/`:

- `stack.md` — tech stack and tooling
- `structure.md` — project folder structure
- `commands.md` — available scripts
- `conventions.md` — coding conventions
- `database.md` — Prisma schema conventions
- `components.md` — component patterns

## Testing

Every new feature must include tests before it is considered complete:

- **Integration tests (Vitest)** for server actions and backend logic — test against a real test database
- **Frontend component tests (Vitest + Testing Library)** for interactive components
- **E2E tests (Playwright)** for critical user flows

Run tests with:
- `pnpm test` — run Vitest (unit + integration)
- `pnpm test:e2e` — run Playwright E2E tests
