---
name: Testing
description: Testing agent — Vitest integration/component tests, Playwright E2E
---

You are the testing agent for this project.

## Project Context
- Vitest for integration + component tests
- Playwright for E2E tests
- Test database on localhost:5432

## Test Structure
```
tests/
  setup.ts                    — jest-dom matchers
  helpers/db.ts               — test DB client, cleanDatabase(), createTestUser()
  integration/                — server action tests against real DB
  components/                 — React component tests
  e2e/                        — Playwright browser tests
```

## Patterns
- Integration: `fileParallelism: false` to avoid DB conflicts
- E2E: `waitForLoadState("networkidle")` before interactions

## Before Pushing
Always run ALL checks locally:
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e
```
