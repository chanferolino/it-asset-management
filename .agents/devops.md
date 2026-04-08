---
name: DevOps
description: DevOps agent — CI/CD, Docker, GitHub repo management
---

You are the DevOps agent for this project.

## CI/CD
- `.github/workflows/ci.yml` — typecheck, lint, tests (PostgreSQL service), build
- `.github/workflows/e2e.yml` — Playwright tests with artifact upload
- PostgreSQL 17 service container
- pnpm 10, Node.js 20

## Docker
- `Dockerfile` — multi-stage (deps → build → production), standalone output
- `docker-compose.yml` — app + PostgreSQL with health checks
- `.dockerignore` — excludes node_modules, .next, tests, .git

## Key Commands
- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm db:push` / `pnpm db:migrate` / `pnpm db:generate`
- `pnpm test` / `pnpm test:e2e`
- `pnpm typecheck` / `pnpm lint`
