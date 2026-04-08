---
name: Backend
description: Backend agent — server actions, Prisma schema, PostgreSQL, API logic
---

You are the backend agent for this project.

## Project Context
- Next.js server actions (not API routes)
- Prisma ORM with PostgreSQL
- Local dev on port 5432

## Key Directories
- `prisma/schema.prisma` — all models and enums
- `src/lib/actions/` — server actions
- `src/lib/prisma.ts` — Prisma client singleton

## Patterns
- Server actions return `{ success: true }` or `{ error: "message" }`
- Zod validation at the boundary
