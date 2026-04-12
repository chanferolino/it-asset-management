---
title: "feat: #6 Tickets — support ticket system"
type: feat
status: active
date: 2026-04-13
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: #6 Tickets — Support Ticket System

## Overview

Add a ticket/support request system where users can create, track, and resolve IT support tickets. Tickets flow through statuses (New → In Progress → Resolved → Closed), have priority levels, can be assigned to staff, and optionally linked to assets.

## Problem Frame

IT teams need a way to track support requests from users — hardware issues, software problems, access requests. Without a ticketing system, requests get lost in email/chat. This feature provides structured tracking with status, priority, and assignment. (see origin: `docs/brainstorms/2026-04-09-feature-scope-requirements.md` R5)

## Requirements Trace

- R5. Tickets — open tickets with status flow (New → In Progress → Resolved), assignment, priority, SLA tracking
- R9. Audit Log — ticket changes should be auditable (deferred to Reports feature)

## Scope Boundaries

- Simple status tracking only — no automated SLA timers or escalation rules
- Optional `dueDate` field for manual deadline tracking (lightweight alternative to SLA)
- No knowledge base/FAQ in this PR — deferred to a future issue
- No email notifications on ticket changes — deferred to Notifications feature
- Ticket CRUD is available to all authenticated users (any role can create); only ADMIN/MANAGER can delete

## Context & Research

### Relevant Code and Patterns

- `src/lib/actions/users.ts` — server action pattern (Zod validation, requireAdmin, revalidatePath, ActionResult type)
- `src/app/(dashboard)/users/_components/` — page structure pattern (server page → client wrapper → table + modals)
- `src/app/(dashboard)/users/_components/types.ts` — local type definition pattern for client components
- `tests/integration/users-actions.test.ts` — integration test pattern (mock Prisma + auth)
- `tests/components/users-table.test.tsx` — component test pattern
- `.claude/rules/styling.md` — glassmorphism design spec

### Institutional Learnings

- Pages with DB queries must use `export const dynamic = "force-dynamic"` to prevent build-time DB access
- shadcn/ui components must be restyled to match styling.md
- Client components should define types locally, not import from `@/generated/prisma`

## Key Technical Decisions

- **Simple status tracking over SLA enforcement:** For a 5-20 person team, automated SLA timers add complexity without value. A manual `dueDate` field is sufficient. (Resolves deferred question from origin doc)
- **Status flow:** NEW → IN_PROGRESS → RESOLVED → CLOSED. Any status can go back to a previous one (e.g., reopen a resolved ticket).
- **Permissions:** Any authenticated user can create/view tickets. Only ADMIN/MANAGER can delete. Anyone can update status/assignment.
- **Asset linking:** Optional — tickets can reference an asset but don't have to.

## Open Questions

### Resolved During Planning

- **SLA complexity:** Simple status tracking with optional dueDate. No timers or escalation. (see origin deferred question)
- **Who can create tickets:** All authenticated users, not just admins.

### Deferred to Implementation

- Exact filter UI layout — will follow the pattern established by users-page-client search/filter bar

## Implementation Units

- [ ] **Unit 1: Prisma schema — Ticket model and migration**

**Goal:** Add Ticket model to the database

**Requirements:** R5

**Dependencies:** None (User model already exists)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_tickets/migration.sql` (auto-generated)

**Approach:**
- Add enums: `TicketStatus` (NEW, IN_PROGRESS, RESOLVED, CLOSED), `TicketPriority` (LOW, MEDIUM, HIGH, CRITICAL)
- Add Ticket model with: id, title, description, status, priority, createdById, assignedToId (optional), assetId (optional), dueDate (optional), resolvedAt (auto-set), createdAt, updatedAt
- Add relations to User (createdBy, assignedTo) — update User model with relation fields
- Follow existing conventions: `@map("snake_case")`, `@@map("tickets")`, cuid IDs

**Patterns to follow:**
- User model in `prisma/schema.prisma`

**Verification:**
- `npx prisma migrate dev` succeeds
- `npx prisma generate` succeeds

- [ ] **Unit 2: Server actions — Ticket CRUD**

**Goal:** Backend logic for creating, reading, updating, and deleting tickets

**Requirements:** R5

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/actions/tickets.ts`

**Approach:**
- `getTickets(filters?)` — list with optional status/priority/search filters, include createdBy and assignedTo names, order by createdAt desc
- `getTicket(id)` — single ticket with all relations
- `createTicket(data)` — validate with Zod, set createdById from session (use `auth()`)
- `updateTicket(id, data)` — validate, auto-set resolvedAt when status → RESOLVED, clear resolvedAt when reopened
- `deleteTicket(id)` — hard delete, require ADMIN or MANAGER role
- `getTicketStats()` — count by status (for dashboard)
- All mutations revalidate `/tickets`

**Patterns to follow:**
- `src/lib/actions/users.ts` — Zod schemas, ActionResult type, Prisma error handling

**Test scenarios:**
- getTickets returns tickets with user names
- getTickets with status filter returns only matching
- createTicket sets createdById from session
- createTicket validates required fields
- updateTicket auto-sets resolvedAt on RESOLVED status
- updateTicket clears resolvedAt when reopened
- deleteTicket requires ADMIN or MANAGER
- getTicketStats returns correct counts

**Verification:**
- All server actions callable without errors
- Typecheck passes

- [ ] **Unit 3: Tickets page — table with filters**

**Goal:** Full tickets list page with filtering and search

**Requirements:** R5

**Dependencies:** Unit 2

**Files:**
- Modify: `src/app/(dashboard)/tickets/page.tsx`
- Create: `src/app/(dashboard)/tickets/_components/types.ts`
- Create: `src/app/(dashboard)/tickets/_components/tickets-page-client.tsx`
- Create: `src/app/(dashboard)/tickets/_components/tickets-table.tsx`

**Approach:**
- Server page fetches tickets + users list (for assignment dropdown), passes to client
- `export const dynamic = "force-dynamic"`
- Client wrapper with search bar, status/priority filter dropdowns, "New Ticket" button
- Table columns: Title, Status (badge), Priority (badge), Created By, Assigned To, Due Date, Created
- Status badges: NEW=blue, IN_PROGRESS=amber, RESOLVED=green, CLOSED=gray
- Priority badges: LOW=gray, MEDIUM=blue, HIGH=amber, CRITICAL=red
- Click row to open detail modal

**Patterns to follow:**
- `src/app/(dashboard)/users/_components/users-page-client.tsx` — page structure
- `src/app/(dashboard)/users/_components/users-table.tsx` — table with badges

**Verification:**
- Page renders with ticket data
- Filters narrow results correctly
- Styling matches glassmorphism spec

- [ ] **Unit 4: Ticket form modal — create/edit**

**Goal:** Dialog for creating and editing tickets

**Requirements:** R5

**Dependencies:** Unit 2, Unit 3

**Files:**
- Create: `src/app/(dashboard)/tickets/_components/ticket-form-modal.tsx`

**Approach:**
- Fields: title (required), description (required, textarea), priority (select), assignedToId (select from users list), dueDate (date input, optional)
- React Hook Form + Zod
- On create: call createTicket
- On edit: call updateTicket with changed fields
- Toast on success/error, reset on close

**Patterns to follow:**
- `src/app/(dashboard)/users/_components/user-form-modal.tsx`

**Verification:**
- Create ticket appears in table
- Edit ticket persists changes

- [ ] **Unit 5: Ticket detail modal — view and status changes**

**Goal:** Modal showing full ticket details with status transition buttons

**Requirements:** R5

**Dependencies:** Unit 2, Unit 3

**Files:**
- Create: `src/app/(dashboard)/tickets/_components/ticket-detail-modal.tsx`

**Approach:**
- Show all ticket fields: title, description, status, priority, created by, assigned to, due date, created at, resolved at
- Status action buttons based on current status (e.g., "Start Progress" when NEW, "Resolve" when IN_PROGRESS, "Reopen" when RESOLVED/CLOSED)
- Inline reassignment dropdown
- Delete button (ADMIN/MANAGER only — check session role)
- Confirmation dialog before delete

**Patterns to follow:**
- `src/app/(dashboard)/vendors/_components/vendor-detail-container.tsx` — detail view pattern

**Verification:**
- Status transitions update correctly and reflect immediately
- Delete removes ticket from list

- [ ] **Unit 6: Seed data — dummy tickets**

**Goal:** Seed realistic ticket data for development/testing

**Requirements:** R5

**Dependencies:** Unit 1

**Files:**
- Modify: `prisma/seed.ts`

**Approach:**
- Add 8-10 tickets with varied statuses, priorities, and assignments
- Reference seeded users as creators/assignees
- Include some with due dates, some resolved, some unassigned

**Verification:**
- `pnpm db:seed` succeeds
- Tickets appear on the page

- [ ] **Unit 7: Tests — integration + component**

**Goal:** Test coverage for tickets feature

**Requirements:** R5

**Dependencies:** Units 2-5

**Files:**
- Create: `tests/integration/tickets-actions.test.ts`
- Create: `tests/components/tickets-table.test.tsx`

**Approach:**
- Integration tests: mock Prisma + auth, test all server actions (same pattern as users-actions.test.ts)
- Component tests: render table with mock data, verify badges, verify row click, verify empty state

**Test scenarios:**
- Server actions: CRUD operations, status transitions, permission checks, validation errors
- Component: renders columns, status/priority badge colors, empty state, filter interaction

**Verification:**
- `pnpm test` passes with all new tests
- `pnpm typecheck && pnpm lint` clean
- `pnpm build` succeeds

## System-Wide Impact

- **Interaction graph:** Tickets reference Users (createdBy, assignedTo). Future: Audit Log will track ticket changes. Dashboard will show ticket stats.
- **Error propagation:** Server action errors return `{ success: false, error }` — consistent with existing pattern.
- **State lifecycle risks:** resolvedAt must be auto-managed — set on RESOLVED, cleared on reopen. No partial-write concerns since each update is a single Prisma call.
- **API surface parity:** getTicketStats will be consumed by the Dashboard feature later.

## Risks & Dependencies

- Ticket model adds relations to User — User model needs `ticketsCreated` and `ticketsAssigned` relation fields added
- Optional asset linking means the Asset model needs a `tickets` relation field — but Asset model doesn't exist yet. Use optional `assetId` field now, add the relation when Asset model is created in the Inventory feature.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](docs/brainstorms/2026-04-09-feature-scope-requirements.md)
- Related code: `src/lib/actions/users.ts`, `src/app/(dashboard)/users/_components/`
- Related issue: #6
