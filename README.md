# IT Asset Management

Internal system for tracking and managing IT assets — hardware, software licenses, and equipment assignments.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [PostgreSQL](https://www.postgresql.org/) v17+

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/chanferolino/it-asset-management.git
cd it-asset-management
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_asset_management"
NEXTAUTH_SECRET="generate-a-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Create the database

```bash
createdb it_asset_management
```

### 5. Run migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
pnpm db:seed
```

This creates a default admin user:
- Email: `admin@company.com`
- Password: `admin123`

### 7. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin credentials above.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed the database |
| `pnpm test` | Run Vitest (unit + integration) |
| `pnpm test:e2e` | Run Playwright E2E tests |

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Language:** TypeScript (strict)
- **Auth:** NextAuth.js (credentials provider)
- **Database:** PostgreSQL + Prisma
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest + Playwright
- **Package Manager:** pnpm

## Project Structure

```
src/
  app/              # Next.js App Router pages
    (dashboard)/    # Dashboard layout and feature pages
    login/          # Login page
    api/            # API routes (NextAuth)
  components/       # Shared and feature-specific components
    ui/             # shadcn/ui components
  lib/              # Utilities, auth config, Prisma client
    actions/        # Server actions
  types/            # TypeScript type declarations
prisma/             # Schema, migrations, and seed script
tests/
  e2e/              # Playwright browser tests
  integration/      # Server action tests
  components/       # React component tests
  helpers/          # Test utilities
```

## Git Workflow

1. Never commit directly to `main` — always create a feature branch
2. Use conventional commit prefixes: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
3. Open a PR and wait for CI to pass before merging
4. Run `pnpm typecheck && pnpm lint` before pushing
