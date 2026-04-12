---
title: "feat: Configuration module — system settings, roles, integrations, backup"
type: feat
status: active
date: 2026-04-10
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: Configuration module — system settings, roles, integrations, backup

## Overview

Build out the Configuration sidebar entry (R7) as a tabbed, admin-only administration area covering four sub-modules: **System Settings**, **Roles & Permissions**, **Integrations** (placeholder), and **Backup & Restore** (placeholder). The work delivers GitHub issue #8 and establishes the first non-auth server-action patterns (Zod-validated admin actions, role-guarded routes) that the rest of the app will reuse.

Currently, `src/app/(dashboard)/configuration/page.tsx` is a 10-line stub and the only role primitive in the codebase is a 2-value enum on the `User` model. This plan adds a third role (`MANAGER`), a single-row `Setting` model, a static permission matrix helper, an `requireAdmin()` guard, a tabbed layout shell, and four tab pages (two functional, two informational placeholders).

## Problem Frame

A small-team (5–20 people) IT operations tool needs a single place where admins can manage system behavior without editing env vars or hitting the database directly. Issue #8 explicitly names system settings, role/permission management, integrations, and backup/restore as the four concerns. The tool must stay lean — over-engineered RBAC, custom backup engines, or unfinished integrations would be scope creep for v1.

See origin: [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R7.

## Requirements Trace

- **R7** — Configuration: system settings, role/permission management, integrations, backup/restore (origin doc)
- **Issue #8 acceptance criteria:**
  - System settings (email, notifications)
  - Role and permission management
  - Integrations page (placeholder for v1)
  - Backup and restore functionality
  - Follow glassmorphism design system ([.claude/rules/styling.md](../../.claude/rules/styling.md))
- **CLAUDE.md testing mandate:** every new feature must ship with Vitest integration tests for server actions, Testing Library component tests for interactive pieces, and a Playwright E2E covering the critical flow
- **R4 traceback:** the Roles tab partially discharges R4's "access permissions" requirement by surfacing the static matrix to admins

## Scope Boundaries

- **No custom role creation** — the `Role` enum stays fixed at three values (`ADMIN`, `MANAGER`, `USER`). Custom roles would require a `Role` table and a `User → Role` FK migration that is overkill for a 5–20 person tool.
- **No functional integrations in v1** — the Integrations tab is a static "coming soon" grid listing planned providers (Slack, Email/SMTP, SSO, Webhooks). No OAuth flows, no webhook handlers, no secret storage.
- **No app-level backup/restore implementation** — Vercel serverless runtime cannot host `pg_dump`, and Prisma Postgres already provides managed snapshots via the Vercel dashboard. The Backup tab is informational.
- **No email sending in this plan** — SMTP host / from-address fields are stored on the `Setting` record but no `nodemailer` or provider integration ships here. Email delivery is a follow-up task driven by issue #9 (Notifications).
- **No permission-key enforcement on existing routes** — this plan ships the matrix helper and uses it to guard Configuration routes only. Rolling it out across Inventory/Users/Tickets/etc. is separate work.
- **Admin-only access** — all four Configuration tabs are gated on `session.user.role === 'ADMIN'`. `MANAGER` and `USER` roles cannot see the page.

### Deferred to Separate Tasks

- **One-click JSON export of domain tables** — a viable v1.5 addition to the Backup tab, deferred until there is enough domain data (Assets, Vendors, Assignments) to make it useful. Noted in the Backup tab copy as "planned".
- **Permission-key enforcement across non-Configuration routes** — follow-up PR once the matrix is proven here.
- **SMTP delivery integration** — deferred to issue #9 (Notifications).

## Context & Research

### Relevant Code and Patterns

- **Server action convention** — [src/lib/actions/auth.ts](../../src/lib/actions/auth.ts) is the only existing server action. Pattern: `"use server"` top of file, named exports, explicit try/catch for known error classes (`AuthError`, `isRedirectError`). New Configuration actions should mirror this but add Zod validation (no Zod usage yet in the codebase — this plan introduces it per [.claude/rules/conventions.md](../../.claude/rules/conventions.md)).
- **Auth session** — [src/lib/auth.ts](../../src/lib/auth.ts) already threads `user.role` into both JWT token and session via the `jwt` and `session` callbacks. Server actions can read it with `await auth()` without touching Prisma.
- **Prisma singleton** — [src/lib/prisma.ts](../../src/lib/prisma.ts) exports a cached `PrismaClient` from `@/generated/prisma` (custom output path per [.claude/rules/database.md](../../.claude/rules/database.md)).
- **Sidebar integration** — [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) already has `Configuration` wired to `/configuration`. No sidebar change needed.
- **shadcn/ui base set** — present: `button, card, input, label, sidebar, sheet, dropdown-menu, avatar, separator, skeleton, tooltip`. **Missing and required for this plan:** `tabs, form, select, switch, textarea, badge, table`. Added via `pnpm dlx shadcn@latest add ...` in Unit 2.
- **Glassmorphism tokens** — all visual work follows [.claude/rules/styling.md](../../.claude/rules/styling.md). Use `cn()` from [src/lib/utils.ts](../../src/lib/utils.ts) for class composition.
- **Test infrastructure** — [tests/smoke.test.ts](../../tests/smoke.test.ts) (Vitest unit), [tests/e2e/smoke.spec.ts](../../tests/e2e/smoke.spec.ts) (Playwright E2E), [tests/helpers/db.ts](../../tests/helpers/db.ts) (test DB helper), [tests/setup.ts](../../tests/setup.ts) (jest-dom matchers). Mirror these patterns.

### Institutional Learnings

No `docs/solutions/` entries exist yet — this is early in the project lifecycle. The Configuration rollout will likely produce the first solution doc (server-action conventions, role-guard pattern).

### External References

Not used — the stack (Next.js 15 App Router, NextAuth v5, Prisma, shadcn/ui, React Hook Form + Zod) is well-patterned and already in use. No external framework research needed.

## Key Technical Decisions

- **Role model:** Fixed `Role` enum extended with `MANAGER`. Permissions live in [src/lib/permissions.ts](../../src/lib/permissions.ts) as a static `ROLE_MATRIX` keyed by role. **Rationale:** user-selected; matches the 5–20 person scope in R4/R7 without RBAC overhead. A custom-role table can be added later if the team grows.
- **Settings storage:** Single-row `Setting` model with a fixed primary key (`id = "singleton"`). **Rationale:** the 4–5 known configuration fields (siteName, supportEmail, notificationsEnabled, smtpHost, smtpFromAddress) don't justify a key-value table, and a singleton keeps forms and queries trivial.
- **Integrations v1 = static placeholder.** **Rationale:** origin doc and issue #8 explicitly call this a placeholder for v1. Shipping it as a "coming soon" grid resolves the R7 open question without scope creep.
- **Backup v1 = informational page pointing at Prisma Postgres managed snapshots.** **Rationale:** Vercel serverless cannot host `pg_dump`; Prisma Postgres already exposes point-in-time snapshots via the Vercel dashboard. Reimplementing that in-app would duplicate platform functionality.
- **Admin guard helper:** `requireAdmin()` in [src/lib/auth-guards.ts](../../src/lib/auth-guards.ts) wraps `await auth()` and redirects / throws for non-admin sessions. Reused by the Configuration layout (for routing) and every Configuration server action (for call-site enforcement). **Rationale:** centralizing the check prevents drift and makes it easy to reuse for future admin-only modules.
- **Singleton seeding:** extend the existing seed entrypoint (or add `prisma/seed.ts` if not yet present) to upsert the Settings singleton row on every `prisma db seed`. **Rationale:** every environment (local, preview, production) needs exactly one Settings row from day one, and upsert-on-seed is idempotent.
- **Zod schemas co-located with forms.** **Rationale:** [.claude/rules/conventions.md](../../.claude/rules/conventions.md) mandates this; keeps form + validation + type inference in one file.
- **Prisma migration naming:** `20260410_add_manager_role_and_settings`. One migration bundles both the enum addition and the new table to keep the production rollout atomic.

## Open Questions

### Resolved During Planning

- **Which integrations ship in v1?** — None. The Integrations tab is a static "coming soon" grid. Functional integrations are deferred to post-v1 work. (Origin doc R7 open question resolved.)
- **Role/permission model shape?** — Fixed enum (`ADMIN | MANAGER | USER`) plus static permission matrix in code (user-selected).
- **System settings storage shape?** — Single-row `Setting` table with `id = "singleton"`.
- **Backup/restore implementation strategy?** — Defer to Prisma Postgres platform snapshots; ship an informational UI only.

### Deferred to Implementation

- **Exact Zod schemas for the Settings form** — field-level constraints (max length, URL validation, etc.) will be tuned as the form is built.
- **Whether the seed script runs automatically via `prisma migrate dev` or only via an explicit `prisma db seed`** — depends on how the existing seed script is wired; decide when Unit 1 lands.
- **Shape of the permission key namespace** — the initial set (`asset.*`, `user.*`, `ticket.*`, `report.*`, `config.*`, wildcard `*`) will likely grow as other issues land. Initial keys are directional; additions come as each feature PR arrives.
- **Self-lockout UX** — whether preventing an admin from demoting their own account should be a disabled select option, a confirm dialog, or a server-action error. Decide during Unit 5 implementation.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Permission matrix shape** (Unit 2 — directional sketch only):

```
ROLE_MATRIX = {
  ADMIN:   ['*'],                                // wildcard: all permissions
  MANAGER: ['asset.*', 'ticket.*', 'report.read'],
  USER:    ['asset.read', 'ticket.create', 'ticket.read'],
}

hasPermission(role, key):
  for each entry in ROLE_MATRIX[role]:
    if entry == '*'            → true
    if entry == key            → true
    if entry endsWith '.*'
       and key startsWith entry prefix → true
  return false
```

**Tab surface shape** (Units 3–6):

| Tab | Route | Data model | Server actions | Interactive? |
|---|---|---|---|---|
| System Settings | `/configuration/settings` | `Setting` (singleton) | `updateSettings` | Yes (form) |
| Roles & Permissions | `/configuration/roles` | `User`, `ROLE_MATRIX` | `updateUserRole` | Yes (select) |
| Integrations | `/configuration/integrations` | none | none | No (placeholder) |
| Backup & Restore | `/configuration/backup` | none | none | No (placeholder) |

## Implementation Units

- [ ] **Unit 1: Prisma schema, migration, and singleton seed**

**Goal:** Extend the Prisma schema to support the Configuration module — add `MANAGER` to the `Role` enum, introduce a singleton `Setting` model, generate a migration file, and seed the default Settings row.

**Requirements:** R7; Issue #8 AC "System settings", "Role and permission management"

**Dependencies:** None (foundation)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_manager_role_and_settings/migration.sql`
- Create or modify: `prisma/seed.ts` (create if not present; wire via `package.json` `"prisma": { "seed": ... }` if not yet configured)
- Test: `tests/integration/prisma-schema.test.ts`

**Approach:**
- Add `MANAGER` to the `Role` enum between `ADMIN` and `USER`
- Add `Setting` model with: `id String @id @default("singleton")`, `siteName String`, `supportEmail String`, `notificationsEnabled Boolean @default(true)`, `smtpHost String?`, `smtpFromAddress String?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `@@map("settings")`
- Follow [.claude/rules/database.md](../../.claude/rules/database.md): `@map("snake_case")` on columns, `@@map("settings")` on table, cuid default is replaced here by the fixed `"singleton"` literal
- Run `pnpm db:migrate` locally to generate the migration SQL; the filename will embed a timestamp (`<yyyymmddhhmmss>_add_manager_role_and_settings`)
- Extend seed script to `prisma.setting.upsert({ where: { id: "singleton" }, create: { ... defaults ... }, update: {} })` so re-running the seed is idempotent
- Ensure the migration runs cleanly in production via `pnpm prisma migrate deploy` (documented in README already)

**Patterns to follow:**
- Existing migration in `prisma/migrations/20260409000919_init/migration.sql`
- Prisma model conventions in [.claude/rules/database.md](../../.claude/rules/database.md)

**Test scenarios:**
- Integration: running `prisma migrate deploy` from a clean test DB creates both `users` and `settings` tables with the expected columns and the extended `Role` enum values
- Integration: running the seed script twice does not duplicate the Settings singleton — second run leaves exactly one row with `id = "singleton"`
- Happy path: `prisma.setting.findUnique({ where: { id: "singleton" } })` returns the seeded defaults after a fresh setup

**Verification:**
- `pnpm db:migrate` succeeds locally and produces a new migration folder
- `pnpm db:generate` rebuilds the Prisma client in `src/generated/prisma` with the new `Setting` model and `MANAGER` enum value
- Integration test passes; the Settings singleton is present after seed

---

- [ ] **Unit 2: Permission matrix, auth guards, and shadcn/ui primitives**

**Goal:** Add the shared infrastructure the Configuration module depends on — the static permission matrix and `hasPermission()` helper, the `requireAdmin()` auth guard, and the missing shadcn/ui components.

**Requirements:** R7; Issue #8 AC "Role and permission management"

**Dependencies:** Unit 1 (needs `MANAGER` role from the updated Prisma client)

**Files:**
- Create: `src/lib/permissions.ts`
- Create: `src/lib/auth-guards.ts`
- Create (via `pnpm dlx shadcn@latest add tabs form select switch textarea badge table`): `src/components/ui/tabs.tsx`, `src/components/ui/form.tsx`, `src/components/ui/select.tsx`, `src/components/ui/switch.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/table.tsx`
- Install: `zod`, `react-hook-form`, `@hookform/resolvers` (if not already in `package.json`) and `sonner` (for toasts per [.claude/rules/components.md](../../.claude/rules/components.md))
- Test: `tests/integration/permissions.test.ts`, `tests/integration/auth-guards.test.ts`

**Approach:**
- `src/lib/permissions.ts` exports `PERMISSION_KEYS` (string-literal union), `ROLE_MATRIX` (`Record<Role, string[]>`), and `hasPermission(role, key)` with wildcard (`*`) and dotted-prefix (`asset.*`) support
- `src/lib/auth-guards.ts` exports `requireAdmin()` (calls `await auth()`, redirects to `/` if no session, throws / redirects if `session.user.role !== 'ADMIN'`) and `requirePermission(key)` (role-based check using `hasPermission`)
- shadcn additions are CLI-driven; no hand-authoring. Verify they land in `src/components/ui/` and compile under Next 15 / React 19.
- Any net-new npm deps go through `pnpm add` and are committed alongside the `package.json` / `pnpm-lock.yaml` changes.

**Patterns to follow:**
- Server action usage of `await auth()` will mirror what this unit sets up
- Existing shadcn components in `src/components/ui/` (style, className composition via `cn()`)

**Test scenarios:**
- Happy path: `hasPermission("ADMIN", "asset.create")` → `true` (wildcard)
- Happy path: `hasPermission("MANAGER", "asset.create")` → `true` (dotted prefix)
- Happy path: `hasPermission("USER", "asset.read")` → `true` (exact match)
- Edge case: `hasPermission("USER", "asset.create")` → `false`
- Edge case: unknown permission key returns `false` for all roles except `ADMIN`
- Error path: `requireAdmin()` throws / redirects when session is null
- Error path: `requireAdmin()` throws / redirects when `session.user.role === "USER"` or `"MANAGER"`
- Happy path: `requireAdmin()` returns the session object when `session.user.role === "ADMIN"`

**Verification:**
- Unit tests pass
- `pnpm typecheck` clean (no type errors from the new helpers)
- All shadcn components import and render without runtime errors in a quick smoke render

---

- [ ] **Unit 3: Configuration layout, tabbed navigation, and admin guard**

**Goal:** Replace the Configuration stub with a server-rendered admin-only layout that provides tabbed navigation across the four sub-routes.

**Requirements:** R7; Issue #8 AC "Follow glassmorphism design system"

**Dependencies:** Unit 2 (`requireAdmin`, `Tabs` component)

**Files:**
- Create: `src/app/(dashboard)/configuration/layout.tsx`
- Modify: `src/app/(dashboard)/configuration/page.tsx` (turn into a server redirect to `/configuration/settings`)
- Create: `src/app/(dashboard)/configuration/_components/config-tabs.tsx` (client component using `usePathname` to highlight the active tab)
- Test: `tests/components/config-tabs.test.tsx`

**Approach:**
- `layout.tsx` is a Server Component that calls `await requireAdmin()` at the top — any non-admin hitting any `/configuration/*` route is redirected out
- Layout renders a glass panel header with the page title and the `<ConfigTabs />` client component
- `ConfigTabs` uses `usePathname()` and maps active state onto the shadcn `Tabs` component or a simple link row; active style per [.claude/rules/styling.md](../../.claude/rules/styling.md) (`bg-red-500/[0.08] text-[#c80000] font-medium`)
- `/configuration` itself redirects to `/configuration/settings` so the default landing tab is obvious
- Four tab links: Settings, Roles, Integrations, Backup — wired to `/configuration/settings`, `/configuration/roles`, `/configuration/integrations`, `/configuration/backup`

**Patterns to follow:**
- Glass panel classes: `rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl`
- Active nav style already used in [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx)
- Server Component by default per [.claude/rules/conventions.md](../../.claude/rules/conventions.md); `'use client'` only on `ConfigTabs`

**Test scenarios:**
- Happy path (component): `ConfigTabs` renders four tab links with correct labels and hrefs
- Happy path (component): when `pathname === "/configuration/settings"`, the Settings tab has the active class and the others do not
- Happy path (component): clicking a tab triggers Next.js navigation (verified via mocked `Link` or presence of `href` attribute)
- Integration: visiting `/configuration` as a non-admin session triggers a redirect out of the route (covered in Unit 7 E2E since it needs a real auth flow)

**Verification:**
- Admin visiting `/configuration` is redirected to `/configuration/settings` and sees the tab row
- Active tab styling visibly matches the glassmorphism rules
- Component test passes

---

- [ ] **Unit 4: System Settings tab — view, form, and `updateSettings` server action**

**Goal:** Let admins view and edit the singleton `Setting` record via a glassmorphic form backed by a Zod-validated server action.

**Requirements:** R7; Issue #8 AC "System settings (email, notifications)"

**Dependencies:** Unit 1 (`Setting` model), Unit 2 (zod, react-hook-form, sonner, shadcn form), Unit 3 (layout)

**Files:**
- Create: `src/app/(dashboard)/configuration/settings/page.tsx` (Server Component — fetches Settings singleton and renders the client form)
- Create: `src/app/(dashboard)/configuration/settings/_components/settings-form.tsx` (Client Component — React Hook Form + Zod + sonner)
- Create: `src/lib/actions/settings.ts` (server action `updateSettings`)
- Test: `tests/integration/settings-action.test.ts`, `tests/components/settings-form.test.tsx`

**Approach:**
- `page.tsx` calls `prisma.setting.findUnique({ where: { id: "singleton" } })` and passes the row to `<SettingsForm />` as a `defaultValues` prop
- `settings-form.tsx` defines the Zod schema in the same file (co-located per conventions), infers the type with `z.infer`, wires `useForm` with `zodResolver`, renders shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` wrappers for each field
- Fields: `siteName` (Input), `supportEmail` (Input, email validation), `notificationsEnabled` (Switch), `smtpHost` (Input, optional), `smtpFromAddress` (Input, optional, email validation)
- Submit handler calls `updateSettings(data)` server action, shows `sonner` toast on success or error
- `updateSettings` in `src/lib/actions/settings.ts`:
  - `"use server"` directive
  - Calls `await requireAdmin()` first
  - Re-validates the payload with the same Zod schema (defense in depth)
  - `prisma.setting.update({ where: { id: "singleton" }, data: ... })`
  - Calls `revalidatePath("/configuration/settings")`
  - Returns `{ success: true }` or `{ error: string }` — no throws across the action boundary

**Patterns to follow:**
- [src/lib/actions/auth.ts](../../src/lib/actions/auth.ts) server action shape
- [.claude/rules/conventions.md](../../.claude/rules/conventions.md) Forms section (Zod first, inferred type, shadcn Form wrappers)
- Glass input style: `rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]`
- Primary button style: `rounded-xl bg-[#c80000] text-white hover:bg-[#b10000]`

**Test scenarios:**
- Happy path (component): form renders pre-filled with default values from the `Setting` singleton
- Happy path (component): submitting valid values calls the server action and shows a success toast
- Edge case (component): submitting with an invalid `supportEmail` shows a field-level error and does not call the server action
- Edge case (component): submitting with an empty required field (`siteName`) shows a field-level error
- Happy path (integration): calling `updateSettings` with a valid payload updates the singleton row and returns `{ success: true }`
- Error path (integration): calling `updateSettings` with an invalid payload returns `{ error }` without mutating the DB
- Error path (integration): calling `updateSettings` with a non-admin session redirects / rejects (via `requireAdmin`)
- Integration: after `updateSettings` succeeds, `revalidatePath` is called for `/configuration/settings`

**Verification:**
- Visiting `/configuration/settings` as an admin shows the current values
- Editing a field and submitting persists the change and reloads the form with the new value
- A non-admin session cannot reach the page

---

- [ ] **Unit 5: Roles & Permissions tab — matrix view and role reassignment**

**Goal:** Surface the static permission matrix to admins as a read-only table, and provide a user list with inline role reassignment.

**Requirements:** R7; R4 (partial); Issue #8 AC "Role and permission management"

**Dependencies:** Unit 1 (`MANAGER` role), Unit 2 (`ROLE_MATRIX`, `requireAdmin`, shadcn table/select), Unit 3 (layout)

**Files:**
- Create: `src/app/(dashboard)/configuration/roles/page.tsx`
- Create: `src/app/(dashboard)/configuration/roles/_components/permission-matrix.tsx` (Server Component — renders from `ROLE_MATRIX`)
- Create: `src/app/(dashboard)/configuration/roles/_components/role-assignment-table.tsx` (Client Component — shadcn Table + Select per row)
- Create: `src/lib/actions/roles.ts` (server action `updateUserRole`)
- Test: `tests/integration/roles-action.test.ts`, `tests/components/permission-matrix.test.tsx`, `tests/components/role-assignment-table.test.tsx`

**Approach:**
- `page.tsx` fetches all users (`prisma.user.findMany({ select: { id, name, email, role } })`) and retrieves the current session (to identify "self") before rendering both components
- `PermissionMatrix` renders a shadcn `Table` with rows = permission keys and columns = roles; cells show ✓ or ✗ based on `hasPermission(role, key)`. Permission key list is derived from a flattened, sorted union of all entries in `ROLE_MATRIX` plus any other known keys exported from `src/lib/permissions.ts`. Read-only.
- `RoleAssignmentTable` renders a shadcn `Table` of users; each row has name, email, and a `Select` seeded with `ADMIN / MANAGER / USER`. Selecting a new value calls `updateUserRole(userId, newRole)` and shows a sonner toast.
- `updateUserRole` in `src/lib/actions/roles.ts`:
  - `await requireAdmin()` guard
  - Zod-validated `userId: string, newRole: Role` payload
  - **Self-lockout prevention:** if `session.user.id === userId && newRole !== 'ADMIN'`, return `{ error: "You cannot demote yourself." }` without mutating
  - `prisma.user.update({ where: { id }, data: { role } })`
  - `revalidatePath("/configuration/roles")`
- Select element for the current admin's own row is visually disabled in the UI as a secondary defense; the server action is still authoritative.

**Patterns to follow:**
- Server action shape established in Unit 4
- Glass table: wrap `<Table>` in a glass panel (`rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl`)

**Test scenarios:**
- Happy path (component): `PermissionMatrix` renders one row per permission key and one column per role, with ✓ marks where `hasPermission` returns true
- Happy path (component): `RoleAssignmentTable` renders one row per user with the current role pre-selected in the Select
- Happy path (component): changing the select triggers the server action with the new role
- Edge case (component): the row for the current session user has its Select visually disabled
- Happy path (integration): `updateUserRole(validId, "MANAGER")` updates the DB row and returns `{ success: true }`
- Edge case (integration): admin calling `updateUserRole(selfId, "USER")` returns `{ error: "You cannot demote yourself." }` and leaves the DB unchanged
- Error path (integration): non-admin session calling `updateUserRole` redirects / rejects via `requireAdmin`
- Error path (integration): `updateUserRole` with an unknown `userId` returns `{ error }` (Prisma not-found)
- Integration: after `updateUserRole` succeeds, `revalidatePath` is called for `/configuration/roles`

**Verification:**
- Visiting `/configuration/roles` as an admin shows the matrix and a user list
- Promoting a seeded `USER` to `MANAGER` persists and reflects on reload
- Attempting to demote self returns the lockout error

---

- [ ] **Unit 6: Integrations and Backup placeholder tabs**

**Goal:** Ship the two informational tabs that round out the Configuration surface without introducing any server-side logic.

**Requirements:** R7; Issue #8 AC "Integrations page (placeholder for v1)", "Backup and restore functionality"

**Dependencies:** Unit 3 (layout), Unit 2 (shadcn `badge`, `card`)

**Files:**
- Create: `src/app/(dashboard)/configuration/integrations/page.tsx`
- Create: `src/app/(dashboard)/configuration/integrations/_components/integration-card.tsx`
- Create: `src/app/(dashboard)/configuration/backup/page.tsx`
- Create: `src/app/(dashboard)/configuration/backup/_components/backup-info.tsx`
- Test: `tests/components/integration-card.test.tsx`, `tests/components/backup-info.test.tsx`

**Approach:**
- **Integrations:** grid of 4 glass cards using `IntegrationCard` — props `{ name, description, iconName, status: "coming-soon" }`. Cards list Slack, Email/SMTP, SSO, and Webhooks. Each card shows a shadcn `Badge` with "Coming soon". No interactivity; no server actions.
- **Backup:** single glass panel explaining the platform backup model — "Backups are managed by Prisma Postgres. Snapshots and point-in-time restore are available via the Vercel dashboard." Includes an external link (`<a target="_blank">`) to the Vercel project's database page and a short bullet list of what IS and IS NOT covered. Mentions the deferred JSON export as "planned for v1.5".
- Both tabs inherit the Unit 3 layout's `requireAdmin()` guard — no additional auth logic needed.
- Glass card styling: `rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`

**Patterns to follow:**
- Glass card and badge styles per [.claude/rules/styling.md](../../.claude/rules/styling.md)

**Test scenarios:**
- Happy path (component): `IntegrationCard` renders the provided name, description, and a "Coming soon" badge
- Happy path (component): the Integrations page renders exactly 4 cards with the expected names (Slack, Email/SMTP, SSO, Webhooks)
- Happy path (component): the Backup page renders the info panel, the external Vercel link, and the "planned for v1.5" note

**Verification:**
- Both pages render without errors when navigated to as an admin
- Visual pass: cards and info panel match glassmorphism

---

- [ ] **Unit 7: End-to-end test for the Configuration flow**

**Goal:** Prove the full Configuration flow works end-to-end with a real session, real Prisma writes, and real tab navigation.

**Requirements:** CLAUDE.md testing mandate (E2E for critical user flows); Issue #8 all ACs

**Dependencies:** Units 1–6

**Files:**
- Create: `tests/e2e/configuration.spec.ts`
- Potentially modify: `tests/helpers/db.ts` (add helpers for seeding an admin + non-admin user if not already present)

**Approach:**
- Use Playwright + the existing [tests/helpers/db.ts](../../tests/helpers/db.ts) patterns. Mirror [tests/e2e/smoke.spec.ts](../../tests/e2e/smoke.spec.ts) setup.
- **Scenario 1 (admin happy path):** seed admin + one `USER` account → login as admin → navigate to `/configuration` → expect redirect to `/configuration/settings` → edit `siteName` → submit → expect sonner toast → reload → expect new value persisted
- **Scenario 2 (tab navigation):** from `/configuration/settings` → click Roles tab → expect matrix + user table visible → click Integrations tab → expect 4 cards → click Backup tab → expect info panel
- **Scenario 3 (role reassignment):** on Roles tab → promote seeded `USER` to `MANAGER` via Select → expect toast → reload → expect DB reflects new role
- **Scenario 4 (admin guard):** logout → login as non-admin → navigate to `/configuration` → expect redirect out of the route (to `/` or wherever `requireAdmin` sends non-admins)

**Patterns to follow:**
- [tests/e2e/smoke.spec.ts](../../tests/e2e/smoke.spec.ts) structure (beforeAll / afterAll DB helpers)
- [tests/helpers/db.ts](../../tests/helpers/db.ts) seed / teardown helpers

**Test scenarios:**
- Happy path (E2E): admin can land on Configuration, update settings, and see persistence
- Happy path (E2E): admin can navigate between all four tabs
- Happy path (E2E): admin can reassign another user's role
- Error path (E2E): non-admin cannot reach `/configuration` and is redirected
- Edge case (E2E): admin attempting to demote self sees the lockout error and the DB is unchanged

**Verification:**
- `pnpm test:e2e` passes all scenarios green
- No flake on two consecutive runs

## System-Wide Impact

- **Interaction graph:** The `Role` enum change touches the NextAuth `jwt` / `session` callbacks in [src/lib/auth.ts](../../src/lib/auth.ts) by widening the type of `session.user.role`. Verify that downstream consumers (there are none yet beyond `app-sidebar.tsx`, which just displays the role) still compile.
- **Error propagation:** Server actions return tagged `{ success: true }` / `{ error: string }` unions rather than throwing — forms can render field errors inline and show sonner toasts, while redirect errors from `requireAdmin` still throw through the action boundary (NextAuth's pattern).
- **State lifecycle risks:** The Settings singleton seeding is idempotent (upsert), so re-running seeds in preview or production is safe. The migration adds a new enum value — Postgres supports `ALTER TYPE ... ADD VALUE` non-destructively, so existing `USER` / `ADMIN` rows are untouched.
- **API surface parity:** None — no public API routes are added. All mutations go through `'use server'` actions invoked from the same origin.
- **Integration coverage:** Unit 7 E2E covers the cross-layer flow (login → server action → DB → revalidate → UI refresh) that unit tests cannot verify alone.
- **Unchanged invariants:** The existing `/login` flow, User CRUD, and session callbacks are unchanged in shape. The `User.role` column keeps its current semantics; only the set of legal values grows.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Prisma Postgres `ALTER TYPE` enum add fails in production | Migration runs in a single SQL file; `prisma migrate deploy` is transactional per file. Test the migration on a preview DB before production rollout. |
| Non-admin users bypass the layout guard via direct route hits | Server actions double-guard via `requireAdmin()`, so even if the layout fails to redirect, mutations reject. Unit 7 E2E explicitly covers direct-hit redirect. |
| shadcn/ui install picks up incompatible React 19 types | Next 15 / React 19 are already in the project and shadcn supports them. If any of the 7 components fail to install, pin the registry version and retry. |
| Settings seed collides with an existing row in a pre-existing environment | Seed uses `upsert` on a fixed `"singleton"` key — no duplicate risk. |
| Self-lockout: admin demotes themselves and loses configuration access | Server action explicitly rejects self-demotion and the UI disables the self-row select. |
| The permission matrix drifts from the roles it claims to enforce | Unit 2 test coverage pins the matrix semantics; future permission keys are added via the same helper, which is the only place that interprets roles. |

## Documentation / Operational Notes

- **README:** The existing "Deploying to Vercel" section already covers `prisma migrate deploy`. Add one sentence noting that Configuration requires a seeded Settings singleton and that the seed script runs automatically on `pnpm db:seed`.
- **Production rollout steps after merge:**
  1. Pull `main` in the Vercel project
  2. `pnpm prisma migrate deploy` (applies Unit 1 migration)
  3. `pnpm prisma db seed` (upserts the Settings singleton)
  4. Verify `/configuration` loads for an admin account
- **Monitoring:** No new observability wiring — operational errors surface via server action return values and sonner toasts.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R7
- **GitHub issue:** chanferolino/it-asset-management #8 — "feat: Configuration — system settings and role management"
- **Rules:** [.claude/rules/conventions.md](../../.claude/rules/conventions.md), [.claude/rules/database.md](../../.claude/rules/database.md), [.claude/rules/components.md](../../.claude/rules/components.md), [.claude/rules/styling.md](../../.claude/rules/styling.md)
- **Related code:** [src/lib/actions/auth.ts](../../src/lib/actions/auth.ts), [src/lib/auth.ts](../../src/lib/auth.ts), [src/lib/prisma.ts](../../src/lib/prisma.ts), [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx), [prisma/schema.prisma](../../prisma/schema.prisma), [prisma/migrations/20260409000919_init/migration.sql](../../prisma/migrations/20260409000919_init/migration.sql)
- **Test reference:** [tests/smoke.test.ts](../../tests/smoke.test.ts), [tests/e2e/smoke.spec.ts](../../tests/e2e/smoke.spec.ts), [tests/helpers/db.ts](../../tests/helpers/db.ts)