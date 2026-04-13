---
title: "feat: #7 Reports & Audit Log"
type: feat
status: active
date: 2026-04-13
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: #7 Reports & Audit Log

## Overview

Add a Reports section with asset usage summaries, ticket resolution metrics, and a full audit log. The audit log tracks who did what and when across the system. Reports include CSV export.

## Problem Frame

IT admins need visibility into operational metrics — how assets are utilized, how fast tickets are resolved, and a trail of all changes for compliance. The audit log is nested under Reports as a tab, not a top-level sidebar item. (see origin: `docs/brainstorms/2026-04-09-feature-scope-requirements.md` R6, R9)

## Requirements Trace

- R6. Reports — asset usage, ticket resolution time, user activity, audit logs, export (CSV)
- R9. Audit Log — tracks who did what and when (asset changes, assignments, logins). Nested under Reports.

## Scope Boundaries

- CSV export only — PDF deferred to future PR
- No scheduled/automated reports — manual view and export only
- No system downtime logs — no infrastructure monitoring in scope
- Audit log is read-only — no editing or deleting audit entries
- Audit log recording is added to existing server actions (inventory, assignments, tickets) in this PR

## Context & Research

### Relevant Code and Patterns

- `src/lib/actions/tickets.ts` — server action pattern, getTicketStats for aggregation
- `src/lib/actions/assignments.ts` — getDepartmentAllocation for grouping pattern
- `src/app/(dashboard)/tickets/_components/tickets-page-client.tsx` — page with tabs/filters
- `src/app/(dashboard)/assignments/_components/department-summary.tsx` — summary cards
- `.claude/rules/styling.md` — glassmorphism spec
- `.claude/rules/conventions.md` — table actions, link styling, modal rules

### Institutional Learnings

- Pages with DB queries must use `export const dynamic = "force-dynamic"`
- Tables need action buttons, clickable text uses link styling
- Modal buttons right-aligned, use ConfirmDialog for destructive actions

## Key Technical Decisions

- **AuditLog as a Prisma model:** New model with action enum (CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN, CHECK_IN, CHECK_OUT, LOGIN, STATUS_CHANGE), entity type, entity ID, details (JSON string), user reference, timestamp.
- **Reports as tabs:** Single `/reports` page with tab navigation: Overview, Asset Usage, Ticket Metrics, Audit Log.
- **CSV export:** Client-side CSV generation from the displayed table data — no server-side file generation needed. Simple `Blob` + download link approach.
- **Audit log recording:** Add `createAuditEntry` helper. Instrument existing server actions in inventory, assignments, tickets, and checkinout to log changes. Non-blocking — audit write failures should not prevent the primary action.
- **No new migration for Ticket model:** Ticket model exists on other branches but not on main. The AuditLog model is the only new table needed. It references User optionally (system actions may have no user).

## Open Questions

### Resolved During Planning

- **Export format:** CSV only. PDF deferred.
- **Audit log placement:** Tab within Reports page, not top-level sidebar.
- **Where to record audit entries:** Instrument existing server actions — not middleware or database triggers.

### Deferred to Implementation

- Exact chart/visualization for metrics — cards with numbers are sufficient, charts can come later
- Whether to paginate audit log or use infinite scroll — start with simple pagination

## Implementation Units

- [ ] **Unit 1: Prisma schema — AuditLog model + migration**

**Goal:** Add AuditLog model to track all system changes

**Requirements:** R9

**Dependencies:** None

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_audit_log/migration.sql`

**Approach:**
- Add `AuditAction` enum: CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN, CHECK_IN, CHECK_OUT, LOGIN, STATUS_CHANGE
- Add `AuditLog` model: id, action, entity (string — "Asset", "Ticket", etc.), entityId, details (optional JSON string), userId (optional FK to User), createdAt
- Add `auditLogs` relation on User

**Patterns to follow:**
- Existing enum and model patterns in schema

**Verification:**
- Migration applies, Prisma client generates

- [ ] **Unit 2: Audit log helper + instrument existing actions**

**Goal:** Record audit entries when assets, tickets, and assignments are modified

**Requirements:** R9

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/audit.ts`
- Modify: `src/lib/actions/inventory.ts` (createAsset, updateAsset, deleteAsset)
- Modify: `src/lib/actions/tickets.ts` (createTicket, updateTicket, deleteTicket)
- Modify: `src/lib/actions/assignments.ts` (unassignAsset)
- Modify: `src/lib/actions/checkinout.ts` (checkOutAsset, checkInAsset)
- Test: `tests/integration/audit-log.test.ts`

**Approach:**
- `createAuditEntry({ action, entity, entityId, details?, userId? })` — wraps `prisma.auditLog.create`. Catches and logs errors silently (non-blocking).
- Add calls after each successful mutation in the existing server actions
- Details field stores a JSON string with relevant change info (e.g., `{ status: "RESOLVED", previousStatus: "IN_PROGRESS" }`)

**Test scenarios:**
- createAuditEntry creates a record with correct fields
- createAuditEntry silently catches errors (does not throw)
- Audit entry is created after createAsset succeeds

**Verification:**
- Audit entries appear in database after actions are performed

- [ ] **Unit 3: Report server actions — aggregation queries**

**Goal:** Backend queries for report data

**Requirements:** R6

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/actions/reports.ts`
- Test: `tests/integration/reports-actions.test.ts`

**Approach:**
- `getAssetReport()` — total assets, count by status, count by category
- `getTicketReport()` — total tickets, count by status, count by priority, average resolution time (diff between createdAt and resolvedAt for resolved tickets)
- `getAuditLogs(filters?)` — list audit logs with optional entity/action/date range filters, include user name, order by createdAt desc, paginated (take/skip)
- `getAuditLogCount(filters?)` — count for pagination
- All require `report.read` permission

**Patterns to follow:**
- `src/lib/actions/tickets.ts` — getTicketStats pattern
- `src/lib/actions/assignments.ts` — getDepartmentAllocation grouping pattern

**Test scenarios:**
- getAssetReport returns correct counts by status and category
- getTicketReport returns correct counts and average resolution time
- getAuditLogs returns paginated results with user names
- getAuditLogs with entity filter returns only matching entries

**Verification:**
- All queries return expected data shapes, typecheck passes

- [ ] **Unit 4: Reports page — tabs with Overview, Asset Usage, Ticket Metrics, Audit Log**

**Goal:** Full reports page with tabbed navigation

**Requirements:** R6, R9

**Dependencies:** Units 2, 3

**Files:**
- Modify: `src/app/(dashboard)/reports/page.tsx`
- Create: `src/app/(dashboard)/reports/_components/types.ts`
- Create: `src/app/(dashboard)/reports/_components/reports-page-client.tsx`
- Create: `src/app/(dashboard)/reports/_components/overview-tab.tsx`
- Create: `src/app/(dashboard)/reports/_components/asset-report-tab.tsx`
- Create: `src/app/(dashboard)/reports/_components/ticket-report-tab.tsx`
- Create: `src/app/(dashboard)/reports/_components/audit-log-tab.tsx`
- Test: `tests/components/audit-log-tab.test.tsx`

**Approach:**
- Server page fetches all report data, passes to client
- `export const dynamic = "force-dynamic"`
- Tabs component using shadcn Tabs
- Overview tab: summary cards (total assets, total tickets, open tickets, total users)
- Asset report tab: cards showing count by status and category
- Ticket report tab: cards showing count by status/priority, average resolution time
- Audit log tab: filterable table with columns: Action, Entity, User, Details, Date
- Action badges with colors per type
- Glassmorphism styling throughout

**Patterns to follow:**
- `src/app/(dashboard)/tickets/_components/tickets-page-client.tsx` — filter + table pattern
- `src/app/(dashboard)/assignments/_components/department-summary.tsx` — summary cards
- `.claude/rules/styling.md`

**Test scenarios:**
- Audit log tab renders entries with correct badges
- Shows empty state when no entries
- Filter by entity type works

**Verification:**
- All 4 tabs render with real data
- Audit log shows entries from instrumented actions

- [ ] **Unit 5: CSV export**

**Goal:** Export report tables and audit log as CSV

**Requirements:** R6

**Dependencies:** Unit 4

**Files:**
- Create: `src/lib/csv-export.ts`
- Modify: `src/app/(dashboard)/reports/_components/asset-report-tab.tsx`
- Modify: `src/app/(dashboard)/reports/_components/ticket-report-tab.tsx`
- Modify: `src/app/(dashboard)/reports/_components/audit-log-tab.tsx`

**Approach:**
- `exportToCsv(headers, rows, filename)` — utility that creates a CSV Blob and triggers download
- Add "Export CSV" button to each report tab
- Client-side generation from currently displayed data — no server round-trip
- Button styled as secondary/outline per glassmorphism spec

**Patterns to follow:**
- No existing CSV pattern — simple utility function

**Verification:**
- Clicking export downloads a .csv file with correct headers and data

- [ ] **Unit 6: Seed data — audit log entries**

**Goal:** Seed realistic audit log entries

**Requirements:** R9

**Dependencies:** Unit 1

**Files:**
- Modify: `prisma/seed.ts`

**Approach:**
- Add 10-15 audit log entries with varied actions, entities, and users
- Reference seeded users, assets, and tickets
- Mix of CREATE, UPDATE, DELETE, CHECK_OUT, CHECK_IN, STATUS_CHANGE actions

**Verification:**
- `pnpm db:seed` succeeds
- Audit log tab shows seeded entries

- [ ] **Unit 7: Tests + CI checks**

**Goal:** Full test coverage and passing CI

**Requirements:** R6, R9

**Dependencies:** Units 2-5

**Files:**
- Create: `tests/integration/audit-log.test.ts`
- Create: `tests/integration/reports-actions.test.ts`
- Create: `tests/components/audit-log-tab.test.tsx`

**Verification:**
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all pass

## System-Wide Impact

- **Interaction graph:** AuditLog is written by all mutation server actions (inventory, tickets, assignments, checkinout). Reports reads from Asset, Ticket, User, and AuditLog.
- **Error propagation:** Audit write failures are silently caught — they must not block primary operations.
- **State lifecycle risks:** None — audit log is append-only, reports are read-only.
- **API surface parity:** Audit logging is added to all existing mutation actions.

## Risks & Dependencies

- Instrumenting existing server actions adds audit calls — small risk of breaking existing tests if mocks don't account for the new prisma.auditLog.create calls. Tests should mock the audit module.
- Ticket model may not exist on main yet (depends on #18 merge). If not merged, audit entries for tickets will reference entity "Ticket" by ID string without FK — acceptable since AuditLog.entityId is a plain string, not a FK.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](docs/brainstorms/2026-04-09-feature-scope-requirements.md)
- Related code: `src/lib/actions/tickets.ts`, `src/lib/actions/assignments.ts`
- Related issue: #7
