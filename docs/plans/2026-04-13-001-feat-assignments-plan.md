---
title: "feat: #4 Assignments — device-to-user tracking"
type: feat
status: active
date: 2026-04-13
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: #4 Assignments — Device-to-User Tracking

## Overview

Add an Assignments management page that shows which devices are assigned to which users, checkout/return history, current assignment status, and department-level allocation. This is a read-heavy management view over existing data — the operational check-out/check-in workflow lives in the Check-in/Out feature (R10).

## Problem Frame

IT admins need a single view to see all current device assignments across the org — who has what, when it was assigned, and how devices are distributed across departments. The Check-in/Out page handles individual device handoffs, but there's no overview. (see origin: `docs/brainstorms/2026-04-09-feature-scope-requirements.md` R3)

## Requirements Trace

- R3. Assignments — device-to-user tracking, checkout/return history, current status per user, department-level view

## Scope Boundaries

- Management view only — no new assignment/return workflow (that's Check-in/Out R10)
- No new data model — uses existing Asset.currentAssigneeId and CheckEvent history
- Depends on Asset and CheckEvent models existing (from wire-up PR #17 or added here if not merged)
- No bulk assign/unassign — single device operations go through Check-in/Out

## Context & Research

### Relevant Code and Patterns

- `src/lib/actions/tickets.ts` — server action pattern with filters
- `src/app/(dashboard)/tickets/_components/tickets-page-client.tsx` — page with search + filter + table
- `src/app/(dashboard)/tickets/_components/tickets-table.tsx` — table with badges, action buttons, link styling
- `src/lib/checkinout/types.ts` — CheckEvent and Asset types
- `src/components/confirm-dialog.tsx` — reusable confirmation modal
- `.claude/rules/styling.md` — glassmorphism spec
- `.claude/rules/conventions.md` — table action buttons, link styling, modal rules

### Institutional Learnings

- Pages with DB queries must use `export const dynamic = "force-dynamic"`
- Client components define types locally
- Tables need Actions column with Edit/Delete buttons
- Clickable text uses `text-[#7b0000] hover:text-[#c80000]`
- Modals right-aligned buttons, no window.confirm

## Key Technical Decisions

- **Management view over shared data:** Assignments page reads from Asset (currentAssigneeId) and CheckEvent tables. No separate Assignment model — avoids data duplication with Check-in/Out.
- **Schema addition:** Since main doesn't have Asset/CheckEvent models yet, this PR adds them (same as wire-up PR #17). If #17 merges first, these will already exist.
- **Department allocation:** Group current assignments by user department. Show count of devices per department.
- **Unassign action:** The Assignments table can trigger an unassign (check-in) directly, which creates a CHECK_IN event and clears Asset.currentAssigneeId.

## Open Questions

### Resolved During Planning

- **Relationship to Check-in/Out:** Assignments is a management view. Check-in/Out is the operational workflow. They share data.
- **New model needed?** No — reuse Asset.currentAssigneeId + CheckEvent.

### Deferred to Implementation

- Exact department summary layout — cards vs table

## Implementation Units

- [ ] **Unit 1: Schema — Asset, CheckEvent models (if not from #17)**

**Goal:** Ensure Asset and CheckEvent models exist with currentAssigneeId and department support on User

**Requirements:** R3

**Dependencies:** None

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_assignments_models/migration.sql`

**Approach:**
- Add Asset model: id, tag (unique), serial, name, category, status, currentAssigneeId (FK to User), vendorId, purchaseDate, purchaseCost, warrantyExpiresAt, timestamps
- Add CheckEvent model: id, assetId (FK), type (CHECK_OUT/CHECK_IN), userId (FK), timestamp, notes
- Add department field to User if not present
- Add enums: AssetStatus, AssetCategory, CheckEventType
- Add relation fields on User: assets (via currentAssigneeId), checkEvents

**Patterns to follow:**
- Existing Ticket model pattern in schema

**Verification:**
- Migration applies, Prisma client generates

- [ ] **Unit 2: Server actions — Assignment queries**

**Goal:** Backend queries for assignments data

**Requirements:** R3

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/actions/assignments.ts`
- Test: `tests/integration/assignments-actions.test.ts`

**Approach:**
- `getCurrentAssignments(search?)` — list assets where currentAssigneeId is not null, include user (name, email, department) and latest CheckEvent. Optional search on asset name/tag or user name.
- `getAssignmentHistory(assetId)` — list CheckEvents for an asset, include user names, order by timestamp desc
- `getDepartmentAllocation()` — group current assignments by user department, return department name + count
- `unassignAsset(assetId)` — create CHECK_IN event, clear currentAssigneeId, set status to AVAILABLE. Require asset.update permission.
- All mutations revalidate `/assignments`

**Patterns to follow:**
- `src/lib/actions/tickets.ts` — filter pattern, auth guards

**Test scenarios:**
- getCurrentAssignments returns only assigned assets with user info
- getCurrentAssignments with search filters correctly
- getAssignmentHistory returns events in reverse chronological order
- getDepartmentAllocation groups and counts correctly
- unassignAsset creates CHECK_IN event and clears assignee
- unassignAsset on already-available asset returns error

**Verification:**
- All actions callable, typecheck passes

- [ ] **Unit 3: Assignments page — table with department summary**

**Goal:** Full assignments page with current assignments table and department allocation

**Requirements:** R3

**Dependencies:** Unit 2

**Files:**
- Modify: `src/app/(dashboard)/assignments/page.tsx`
- Create: `src/app/(dashboard)/assignments/_components/types.ts`
- Create: `src/app/(dashboard)/assignments/_components/assignments-page-client.tsx`
- Create: `src/app/(dashboard)/assignments/_components/assignments-table.tsx`
- Create: `src/app/(dashboard)/assignments/_components/department-summary.tsx`
- Test: `tests/components/assignments-table.test.tsx`

**Approach:**
- Server page fetches current assignments + department allocation, passes to client
- `export const dynamic = "force-dynamic"`
- Department summary cards at top showing device count per department
- Assignments table: Asset Name (link), Asset Tag, Assigned To, Department, Checked Out date, Actions (View History, Unassign)
- Search bar filtering on asset name/tag or user name
- Unassign button opens ConfirmDialog
- Asset name links to inventory detail page

**Patterns to follow:**
- `src/app/(dashboard)/tickets/_components/tickets-page-client.tsx` — page structure
- `src/app/(dashboard)/tickets/_components/tickets-table.tsx` — table with badges and actions
- `.claude/rules/conventions.md` — table actions, link styling, modal rules

**Test scenarios:**
- Renders assignment rows with asset and user info
- Shows department in each row
- Shows formatted checkout date
- Calls onUnassign when unassign button clicked
- Calls onViewHistory when history button clicked
- Empty state when no assignments

**Verification:**
- Page renders with real data
- Department cards show correct counts

- [ ] **Unit 4: Assignment history modal**

**Goal:** Modal showing checkout/return history for a specific asset

**Requirements:** R3

**Dependencies:** Unit 2, Unit 3

**Files:**
- Create: `src/app/(dashboard)/assignments/_components/history-modal.tsx`

**Approach:**
- Dialog showing asset name + tag in title
- List of CheckEvents: type (CHECK_OUT/CHECK_IN badge), user name, timestamp, notes
- CHECK_OUT badge = amber, CHECK_IN badge = green
- Ordered by timestamp desc (most recent first)
- Glassmorphism styling

**Patterns to follow:**
- `src/app/(dashboard)/tickets/_components/ticket-detail-modal.tsx` — detail modal pattern

**Verification:**
- Modal shows history for selected asset
- Events correctly ordered and badged

- [ ] **Unit 5: Seed data — assignments**

**Goal:** Seed assets with assignments and check events for development

**Requirements:** R3

**Dependencies:** Unit 1

**Files:**
- Modify: `prisma/seed.ts`

**Approach:**
- Seed 8-10 assets (some assigned, some available)
- Seed check events creating assignment history
- Use seeded users as assignees across departments
- Ensure department allocation has variety

**Verification:**
- `pnpm db:seed` succeeds
- Assignments page shows data

- [ ] **Unit 6: Tests + CI checks**

**Goal:** Full test coverage and passing CI

**Requirements:** R3

**Dependencies:** Units 2-4

**Files:**
- Create: `tests/integration/assignments-actions.test.ts`
- Create: `tests/components/assignments-table.test.tsx`

**Approach:**
- Integration tests: mock Prisma + auth, test all server actions
- Component tests: table rendering, department summary, empty state

**Verification:**
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all pass

## System-Wide Impact

- **Interaction graph:** Assignments reads from Asset and CheckEvent. Unassign creates CheckEvent and updates Asset. Shares data with Check-in/Out feature.
- **Error propagation:** ActionResult pattern consistent with rest of app.
- **State lifecycle risks:** Unassign must atomically create CHECK_IN event + clear currentAssigneeId. Use Prisma transaction.

## Risks & Dependencies

- If wire-up PR #17 is not merged, this PR adds the Asset/CheckEvent models independently — potential merge conflict on schema. Low risk since both PRs add the same models.
- Department allocation depends on User.department being populated in seed data.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](docs/brainstorms/2026-04-09-feature-scope-requirements.md)
- Related code: `src/lib/actions/tickets.ts`, `src/lib/checkinout/types.ts`
- Related issue: #4
- Related PR: #17 (wire-up-mock-data, adds Asset/CheckEvent models)
