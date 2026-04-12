---
title: "feat: #5 Users — accounts, roles, and department management"
type: feat
status: completed
date: 2026-04-13
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: #5 Users — Accounts, Roles, and Department Management

## Overview

Full user management module — CRUD operations for user accounts with role-based access control, department assignments, and status tracking (active/inactive).

## Problem Frame

IT admins need to manage who has access to the system, what role they have, and which department they belong to. This is foundational — assignments, tickets, and audit logs all depend on users existing in the system. (see origin: `docs/brainstorms/2026-04-09-feature-scope-requirements.md` R4)

## Requirements Trace

- R4. Users — accounts, roles, department assignments, access permissions, onboarding/offboarding tracking

## Scope Boundaries

- No Active Directory or external identity provider integration
- No onboarding/offboarding workflow automation — just status tracking (ACTIVE/INACTIVE)
- No user profile page (self-service) — admin-only management for now

## Context & Research

### Relevant Code and Patterns

- `src/lib/actions/roles.ts` — server action pattern with requireAdmin + Zod
- `src/lib/auth-guards.ts` — permission checking
- `src/app/(dashboard)/vendors/_components/` — modal and list patterns
- `.claude/rules/styling.md` — glassmorphism design spec

## Key Technical Decisions

- **Soft delete via status:** Users are deactivated (status → INACTIVE), not hard deleted, to preserve referential integrity with future assignments/tickets
- **Self-protection:** Admins cannot demote or deactivate themselves
- **Department as free text with autocomplete:** No separate Department model — departments are just strings on the User model, with autocomplete from existing values via datalist
- **Password handling on edit:** Optional — leave blank to keep current password

## Implementation Units

- [x] **Unit 1: Prisma schema — add UserStatus, department, phone**

**Goal:** Extend User model with status, department, and phone fields

**Files:**
- Modified: `prisma/schema.prisma`
- Created: `prisma/migrations/20260412173720_add_user_status_department_phone/migration.sql`

- [x] **Unit 2: Server actions — User CRUD**

**Goal:** Backend logic for managing users

**Files:**
- Created: `src/lib/actions/users.ts`

**Actions implemented:**
- `getUsers(search?)` — list with optional search, excludes hashedPassword
- `getUser(id)` — single user lookup
- `createUser(data)` — Zod validated, bcrypt hashed, catches duplicate email
- `updateUser(id, data)` — optional password update, self-demotion prevention
- `deleteUser(id)` — soft delete, self-deactivation prevention
- `getDepartments()` — distinct department list for autocomplete

- [x] **Unit 3: Users page — table with search**

**Goal:** Full users list page with glassmorphism styling

**Files:**
- Modified: `src/app/(dashboard)/users/page.tsx`
- Created: `src/app/(dashboard)/users/_components/types.ts`
- Created: `src/app/(dashboard)/users/_components/users-page-client.tsx`
- Created: `src/app/(dashboard)/users/_components/users-table.tsx`

**Features:**
- Server component with `export const dynamic = "force-dynamic"`
- Client-side search filtering on name/email/department
- Table with role badges (ADMIN=red, MANAGER=amber, USER=gray)
- Status badges (ACTIVE=green, INACTIVE=gray)
- Edit and deactivate action buttons

- [x] **Unit 4: User form modal — create/edit**

**Goal:** Dialog for creating and editing users

**Files:**
- Created: `src/app/(dashboard)/users/_components/user-form-modal.tsx`

**Features:**
- React Hook Form + Zod validation
- Department autocomplete via datalist
- Password required on create, optional on edit
- Toast notifications via sonner

- [x] **Unit 5: Delete user dialog**

**Goal:** Confirmation dialog for deactivating users

**Files:**
- Created: `src/app/(dashboard)/users/_components/delete-user-dialog.tsx`

- [x] **Unit 6: Seed data — dummy users**

**Goal:** Realistic seed data for development

**Files:**
- Modified: `prisma/seed.ts`

**Data:** 11 users (1 admin + 10 regular) across 5 departments (IT, Engineering, HR, Finance, Marketing), 1 inactive user

- [x] **Unit 7: Tests**

**Goal:** Test coverage for users feature

**Files:**
- Created: `tests/components/users-table.test.tsx` (8 tests)
- Created: `tests/integration/users-actions.test.ts` (12 tests)

- [x] **Unit 8: shadcn/ui base component restyling**

**Goal:** All shadcn base components match glassmorphism spec

**Files:**
- Modified: 19 files in `src/components/ui/`

## System-Wide Impact

- **User model extended** — all existing auth and role logic continues to work
- **Future dependencies** — Assignments, Tickets, and Audit Log will reference User via relations
- **Seed data** — provides realistic users for testing other features

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](docs/brainstorms/2026-04-09-feature-scope-requirements.md)
- Related issue: #5
- Related PR: #16
