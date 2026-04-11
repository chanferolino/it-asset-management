---
title: "feat: Check-in/Out module — UI shell (lookup, actions, history)"
type: feat
status: active
date: 2026-04-11
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: Check-in/Out module — UI shell (lookup, actions, history)

## Context

Issue #10 (R10) calls for a desktop check-in/check-out flow: an IT admin enters an asset tag or serial number, sees the asset's current state, and either checks it out to a user or checks it back in — with a history of all events per asset. No QR/camera scanning. Per the user, this plan covers **UI only**. Persistence, server actions, Prisma schema for `Asset` / `CheckEvent`, the user picker's real source of truth, and any real audit-log wiring are explicitly deferred to a follow-up plan once the visual flow is validated.

The current state is a 10-line stub at [src/app/(dashboard)/checkinout/page.tsx](../../src/app/(dashboard)/checkinout/page.tsx). The sidebar already has the Check-in/Out entry ([src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) line 37). This plan delivers the interactive surface — lookup, result card, check-in/check-out modals, and per-asset history — fed entirely by a mock dataset so the interaction model can be iterated without committing to a schema.

## Problem Frame

A device handoff is the highest-frequency operational workflow in a small IT shop: someone walks up with a laptop to collect or return. The admin needs to:
- Find the asset fast — by the sticker tag or the serial on the back
- See at a glance whether the asset is currently assigned, and to whom
- Check it out to a user (with a timestamp) or check it back in (with a timestamp)
- Glance at the recent history for that asset to spot patterns or errors

Building this flow visually first — with mock data — lets us validate the interaction (single-page vs modal, confirmation vs inline, history placement) before committing to Prisma models or server actions. It also unblocks the sidebar `/checkinout` entry, which currently leads to a stub.

See origin: [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R10.

## Requirements Trace

- **R10** — Check-in/Out: desktop lookup by asset tag or serial number for quick device handoffs; no QR/camera scanning (origin doc)
- **Issue #10 acceptance criteria:**
  - Lookup asset by asset tag or serial number — *delivered as the lookup form + client-side search over the mock dataset, matching tag **or** serial with trim + case-insensitive compare*
  - Check-out: assign device to a user with timestamp — *delivered as the Check-out modal (user select + optional notes); on submit, local state flips asset to `ASSIGNED` and prepends a `CHECK_OUT` event with `new Date().toISOString()`*
  - Check-in: return device with timestamp — *delivered as the Check-in modal (optional notes); on submit, local state flips asset to `AVAILABLE` and prepends a `CHECK_IN` event with `new Date().toISOString()`*
  - History of all check-in/check-out events per asset — *delivered as the History list rendered beneath the asset card, scoped to the looked-up asset and sorted by timestamp desc*
  - Desktop only — no QR/barcode camera scanning — *explicit non-goal; lookup is a plain text input*
  - Follow glassmorphism design system — *all surfaces use the established glass tokens*
- **CLAUDE.md testing mandate:** every new feature must ship with Vitest + Testing Library component tests for interactive pieces. (No server actions in this plan, so no integration tests; Playwright E2E is deferred until a real data source exists.)

## Scope Boundaries

- **No persistence** — nothing writes to Postgres. Check-out / check-in updates live in React `useState` inside the workflow container. Refresh resets the dataset to the mock seed.
- **No server actions** — everything client-side. No `'use server'` files, no Prisma writes, no API routes.
- **No real user directory** — the check-out modal's user picker is fed by a static `MOCK_USERS` array, not from the `User` Prisma model or from NextAuth sessions.
- **No asset creation flow** — this plan does not add, edit, or retire assets. Assets exist only in the mock dataset. Creating them lives with Inventory (R2).
- **No audit-log integration** — R9's audit log is deferred. History in this plan is a UI-local event array scoped to the mock data, not a persisted audit trail.
- **No QR / barcode / camera scanning** — explicit requirement. Lookup is a plain text input. No hardware/media APIs.
- **No Playwright E2E in this plan** — E2E gets added when there is a real data source to exercise. Component tests still ship.
- **No global "recent activity" view** — the history surface is per-asset, tied to the currently-looked-up asset. A cross-asset activity feed is out of scope (belongs with Reports R6 or Assignments R3).
- **No warranty / vendor surfacing on the asset card** — warranty fields live with Inventory (R11). The check-in/out card shows only the fields needed to confirm the asset identity and its assignment state.
- **No permission gating** — any signed-in user can access the page in this plan. Role-based restriction (e.g., IT-only) is deferred with the backend plan.

### Deferred to Separate Tasks

- **Check-in/Out backend (Prisma `Asset` + `CheckEvent` models, server actions, real user picker, audit-log write)** — separate plan once UX is validated. The types defined in this plan are the contract that will be persisted.
- **Inventory integration** — when Inventory (R2) exists, the asset card should deep-link to the full asset detail page. Stubbed in this plan as a plain text "View in inventory" link that 404s; marked `TODO` in code.
- **Assignments module cross-link** — R3's assignments view should read from the same underlying `CheckEvent` table. Deferred to the backend plan.
- **Playwright E2E for the check-in/out flow** — added with the backend plan.
- **Audit log entries for check-in/out events** — wired in when the audit log itself lands under Reports (R9).

## Context & Research

### Relevant Code and Patterns

- **Module pattern reference — single-page interactive surface** — unlike Configuration/Notifications (tabbed sub-routes), Check-in/Out is naturally a single-page workflow: lookup → result → action → history. There is no established single-page module in the codebase yet, so this plan is the reference. Structure mirrors the notifications plan where it can: `_components/` folder for feature-local components, mock data in `src/lib/checkinout/`, test files in `tests/components/`.
- **Notifications UI-shell plan** — [docs/plans/2026-04-11-001-feat-notifications-ui-shell-plan.md](2026-04-11-001-feat-notifications-ui-shell-plan.md). Mirror its approach to mock data (`src/lib/notifications/mock-data.ts`), its types-first philosophy (`src/lib/notifications/types.ts` as the future backend contract), and its use of local React state as a deliberate v0 simplification.
- **Glassmorphism tokens** — [.claude/rules/styling.md](../../.claude/rules/styling.md) — glass card (`rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`), glass panel (`rounded-2xl ... backdrop-blur-xl`), glass input (`rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm`), primary button (`bg-[#c80000] hover:bg-[#b10000]`), outline button (`border border-[#e0e0e0] text-[#7b0000] hover:bg-red-500/[0.04]`), alert (`rounded-xl border border-red-500/20 bg-red-500/[0.06] text-[#c80000]`).
- **Form pattern** — [src/app/(dashboard)/configuration/settings/_components/settings-form.tsx](../../src/app/(dashboard)/configuration/settings/_components/settings-form.tsx) and [src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx](../../src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx) — RHF + Zod + sonner + shadcn `Form` wrappers. Reuse for the lookup form, check-out form, and check-in form. Co-locate Zod schemas per [.claude/rules/conventions.md](../../.claude/rules/conventions.md).
- **Modal rules** — [.claude/rules/components.md](../../.claude/rules/components.md): modals use shadcn `Dialog`; trigger lives in the parent, content is a separate component in `src/components/modals/` or — for feature-scoped modals — in the module's own `_components/` folder; forms reset on close. This plan uses the feature-local path (`checkinout/_components/`) to keep the module self-contained, consistent with how notifications kept its client components module-local.
- **Existing check-in/out stub** — [src/app/(dashboard)/checkinout/page.tsx](../../src/app/(dashboard)/checkinout/page.tsx) — replace with the workflow container.
- **Sidebar already wired** — [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) line 37 — `Check-in/Out → /checkinout`, `ArrowDownUp` icon from lucide. No sidebar change needed.
- **shadcn primitives present** — `badge`, `button`, `card`, `form`, `input`, `label`, `select`, `separator`, `table`, `tabs`, `textarea` are already in [src/components/ui/](../../src/components/ui/). **Missing: `dialog`** — must be added via `pnpm dlx shadcn@latest add dialog` in Unit 4 before implementing the modals.
- **Test infrastructure** — `tests/components/`, `tests/setup.ts` (jest-dom matchers), Vitest + Testing Library configured. Mirror the notification component test style.
- **Utility** — `cn()` from [src/lib/utils.ts](../../src/lib/utils.ts) for class composition.
- **Timestamp formatting** — the notifications plan established `Intl.RelativeTimeFormat` (no extra dependency) for relative time ("2 hours ago"). Reuse the same approach here for history rows.

### Institutional Learnings

No `docs/solutions/` entries yet. The notifications UI-shell plan (same day) established the "UI-only module with mock data" convention; this plan is the second example and should reinforce it so the pattern is durable.

### External References

Not used. Stack is well-known, the work is purely component composition over existing primitives, and the only new primitive (`dialog`) is a standard shadcn install.

## Key Technical Decisions

- **Single-page workflow, no sub-routes** — Check-in/Out is a linear interaction (lookup → act), not a set of peer tabs. A single `/checkinout` route holds the workflow. **Rationale:** tabs would split a flow that is naturally sequential; a single page keeps focus on the action.
- **Client-side workflow container owns all state** — one `CheckinoutWorkflow` client component holds `assets`, `history`, `selectedAsset`, `notFoundQuery`, and modal open state. Child components are as presentational as possible. **Rationale:** lookup, modals, card, and history all read from and write to the same seed; centralizing state avoids prop-drilling and makes the eventual swap to server state (SWR/Prisma) a single-file change.
- **Lookup is an exact match against tag OR serial, trim + case-insensitive** — the input validates non-empty via Zod; the search is `assets.find(a => norm(a.tag) === norm(q) || norm(a.serial) === norm(q))` where `norm` trims and lowercases. No fuzzy matching, no prefix search. **Rationale:** matches the real-world workflow (read the sticker, type it, go). Fuzzy search is a future enhancement.
- **Not-found is a distinct state, not empty search results** — when lookup fails, render a dedicated "No asset matches `<query>`" panel with the red-accent alert styling and a suggestion to check the tag/serial. **Rationale:** admins need immediate feedback that the asset doesn't exist in the system so they don't re-scan or re-type assuming a UI bug.
- **Check-out and check-in are modals, not inline forms** — both flows open a shadcn `Dialog`. **Rationale:** matches [.claude/rules/components.md](../../.claude/rules/components.md); keeps the asset card as a stable "context" surface while the action form overlays; and makes cancellation cheap.
- **Mock data contract mirrors the future Prisma schema** — types in [src/lib/checkinout/types.ts](../../src/lib/checkinout/types.ts) are designed so that when the backend plan lands, each mock type can be swapped for a Prisma model without touching components. Fields are deliberately minimal (no warranty, no vendor, no cost — those live with Inventory/Vendors). **Rationale:** the UI should not drift from what the real model will expose.
- **Modal forms use RHF + Zod + sonner** — consistent with [.claude/rules/conventions.md](../../.claude/rules/conventions.md) and with the settings and preferences forms already in the repo. Submit handlers update the workflow container's state via callbacks (no server action call). **Rationale:** form ergonomics, validation, and toast feedback are already a solved problem in this repo.
- **History is per-asset and scoped to the looked-up asset** — matches the AC. When no asset is selected, the history panel shows an empty-state prompt to perform a lookup. **Rationale:** global activity views belong elsewhere (R6 Reports); mixing them here muddies the workflow.
- **No new dependencies beyond shadcn `dialog`** — `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `lucide-react`, `tailwindcss`, `next` are all already installed. **Rationale:** nothing needed for this plan is missing except the `dialog` primitive.

## Open Questions

### Resolved During Planning

- **Tabs or single page?** — Single page. The flow is sequential, not parallel. (Decision based on origin doc's emphasis on "quick device handoffs".)
- **Inline form or modal for check-out/check-in?** — Modal, per [.claude/rules/components.md](../../.claude/rules/components.md).
- **Where does the "user to assign to" come from?** — Static `MOCK_USERS` array in this plan. Real source is deferred to the backend plan (the `User` Prisma model already exists per the Configuration plan's context but is out of scope here).
- **Does check-out require notes?** — No. Notes are optional on both check-out and check-in.
- **What does the history row show?** — Event type (Check-out / Check-in), the user the device was assigned to or returned from, timestamp (relative + absolute on hover via `title` attribute), optional notes.
- **What happens when lookup targets a `RETIRED` asset?** — Asset card renders with a disabled action area and a muted "This asset is retired — cannot be checked out" note. Check-in is also disabled.
- **What happens when lookup targets an `IN_REPAIR` asset?** — Same as retired: card renders, actions disabled, muted note explaining why. This surfaces state without hiding the asset.
- **Can you check out an already-assigned asset?** — No. The card's primary action when `status === ASSIGNED` is Check-in, not Check-out. A secondary "Reassign" flow is out of scope (future enhancement).

### Deferred to Implementation

- **Exact mock asset copy** — 6–8 entries spanning `AVAILABLE`, `ASSIGNED`, `RETIRED`, `IN_REPAIR` with realistic tags (`IT-0001` style) and serials. Final values chosen when writing [src/lib/checkinout/mock-data.ts](../../src/lib/checkinout/mock-data.ts).
- **Mock user count** — 4–6 users with varied departments. Exact names/departments chosen at implementation time.
- **Initial history entries** — 6–10 seed events so the history panel has something to show for a couple of the assigned assets on first lookup.
- **Focus management on modal close** — default shadcn `Dialog` behavior is usually fine; adjust only if the visual pass reveals a problem.
- **Whether to auto-focus the lookup input on page mount** — lean yes (admins want to start typing immediately), confirm during Unit 3.
- **Whether to clear the lookup input after a successful action** — lean yes for check-out (next handoff), no for check-in (admin may want to verify). Decide during Unit 5 based on feel.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Module surface:**

| Surface | Route / Mount point | Client/Server | Data source |
|---|---|---|---|
| Page | `/checkinout` | Server page + client workflow | mock seeds |
| Workflow container | `/checkinout` | Client (holds all state) | mock seeds |
| Lookup form | inside workflow | Client (RHF + Zod) | — |
| Asset result card | inside workflow | Presentational | workflow state |
| Not-found panel | inside workflow | Presentational | workflow state |
| Check-out modal | launched from card | Client (RHF + Zod, shadcn Dialog) | `MOCK_USERS` + workflow state |
| Check-in modal | launched from card | Client (RHF + Zod, shadcn Dialog) | workflow state |
| History list | inside workflow | Presentational | workflow state (events for selected asset) |

**Core types (shape, not literal code):**

```
AssetStatus    = 'AVAILABLE' | 'ASSIGNED' | 'IN_REPAIR' | 'RETIRED'
AssetCategory  = 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'PHONE' | 'ACCESSORY'
CheckEventType = 'CHECK_OUT' | 'CHECK_IN'

Asset {
  id: string
  tag: string                 // e.g. "IT-0042"
  serial: string              // e.g. "SN-ABCD1234"
  name: string                // e.g. "MacBook Pro 14\""
  category: AssetCategory
  status: AssetStatus
  currentAssigneeId?: string  // set iff status === 'ASSIGNED'
}

User {
  id: string
  name: string
  email: string
  department?: string
}

CheckEvent {
  id: string
  assetId: string
  type: CheckEventType
  userId: string              // person the device was handed to (CHECK_OUT) or returned from (CHECK_IN)
  timestamp: string           // ISO
  notes?: string
}
```

**State transitions (asset lifecycle under this flow):**

```
AVAILABLE  --check-out-->  ASSIGNED
ASSIGNED   --check-in -->  AVAILABLE
RETIRED    --(no action; card disabled)
IN_REPAIR  --(no action; card disabled)
```

**Card action matrix:**

| `asset.status` | Primary action | Secondary | Notes |
|---|---|---|---|
| `AVAILABLE` | Check-out | — | Opens check-out modal |
| `ASSIGNED`  | Check-in  | — | Opens check-in modal; card shows current assignee |
| `IN_REPAIR` | — | — | Muted "In repair — actions disabled" note |
| `RETIRED`   | — | — | Muted "Retired — actions disabled" note |

**Workflow state shape (in one place):**

```
{
  assets: Asset[]              // seeded from MOCK_ASSETS, mutated by actions
  events: CheckEvent[]         // seeded from MOCK_HISTORY, prepended to
  selectedAssetId: string | null
  notFoundQuery: string | null
  checkoutOpen: boolean
  checkinOpen:  boolean
}
```

## Output Structure

```
src/
  app/
    (dashboard)/
      checkinout/
        page.tsx                                   # server; title + <CheckinoutWorkflow />
        _components/
          checkinout-workflow.tsx                  # client; state container
          lookup-form.tsx                          # client; RHF + Zod, single input
          asset-card.tsx                           # presentational; status + actions
          asset-not-found.tsx                      # presentational; alert + hint
          checkout-modal.tsx                       # client; shadcn Dialog + form
          checkin-modal.tsx                        # client; shadcn Dialog + form
          history-list.tsx                         # presentational; scoped to selected asset
          history-item.tsx                         # presentational; one row
  components/
    ui/
      dialog.tsx                                   # added via shadcn
  lib/
    checkinout/
      types.ts                                     # Asset, User, CheckEvent, enums
      mock-data.ts                                 # MOCK_ASSETS, MOCK_USERS, MOCK_HISTORY
      lookup.ts                                    # tiny pure helper: findAssetByTagOrSerial
tests/
  components/
    lookup-form.test.tsx
    asset-card.test.tsx
    asset-not-found.test.tsx
    checkout-modal.test.tsx
    checkin-modal.test.tsx
    history-list.test.tsx
    checkinout-workflow.test.tsx
  unit/
    checkinout-lookup.test.ts                      # pure function test for findAssetByTagOrSerial
```

## Implementation Units

- [ ] **Unit 1: Types, mock data, and lookup helper**

**Goal:** Establish the shared TypeScript contract for assets, users, and check events; seed a representative dataset; and provide a small pure-function lookup helper that every other unit can reuse and test in isolation.

**Requirements:** R10; Issue #10 — all ACs (foundation)

**Dependencies:** None.

**Files:**
- Create: `src/lib/checkinout/types.ts`
- Create: `src/lib/checkinout/mock-data.ts`
- Create: `src/lib/checkinout/lookup.ts`
- Test: `tests/unit/checkinout-lookup.test.ts`

**Approach:**
- `types.ts` exports `AssetStatus`, `AssetCategory`, `CheckEventType` as string-literal unions; `Asset`, `User`, `CheckEvent` interfaces matching the High-Level Technical Design shape. Also export `ASSET_STATUSES`, `ASSET_CATEGORIES`, `CHECK_EVENT_TYPES` arrays for iteration (dropdowns, filters).
- `mock-data.ts` exports `MOCK_ASSETS: Asset[]` (6–8 entries covering all four statuses, realistic tags like `IT-0001`, serials like `SN-ABCD1234`, a mix of categories), `MOCK_USERS: User[]` (4–6 entries with varied departments), and `MOCK_HISTORY: CheckEvent[]` (6–10 events with static ISO timestamps spread over the last ~30 days; at least one asset has multiple events so the history list demonstrates ordering). Static ISO strings — no `new Date()` at module load — so snapshots and tests are stable.
- `lookup.ts` exports `findAssetByTagOrSerial(assets: Asset[], query: string): Asset | null`. Implementation: trim + lowercase the query, return the first asset whose normalized `tag` or `serial` equals the normalized query, else `null`. Pure function, no React.
- No imports from `react`, no client-only code in these files — all must be safe to import from Server and Client Components.

**Patterns to follow:**
- Plain TypeScript module shape; no Prisma references.
- Mirror [src/lib/notifications/types.ts](../../src/lib/notifications/types.ts) and [src/lib/notifications/mock-data.ts](../../src/lib/notifications/mock-data.ts) for module shape and export style.
- Place under `src/lib/checkinout/` to keep the module self-contained.

**Test scenarios:**
- Happy path (`checkinout-lookup.test.ts`): finds an asset by its exact tag.
- Happy path: finds an asset by its exact serial.
- Happy path: trims leading/trailing whitespace before matching (`"  IT-0001  "` matches `"IT-0001"`).
- Happy path: matches case-insensitively (`"it-0001"` matches `"IT-0001"`; `"sn-abcd1234"` matches `"SN-ABCD1234"`).
- Edge case: returns `null` when no asset matches.
- Edge case: returns `null` for an empty string query.
- Edge case: when two assets somehow share a tag vs serial collision, returns the first match in array order (documents the behavior; mock data will not contain collisions).

**Verification:**
- `pnpm typecheck` clean.
- `pnpm test` — the new unit test file passes.
- Importing `MOCK_ASSETS`, `MOCK_USERS`, `MOCK_HISTORY` from another file produces correctly typed arrays.

---

- [ ] **Unit 2: Page shell and workflow state container**

**Goal:** Replace the check-in/out stub with a page that mounts a client workflow container holding all state (assets, history, selected asset, not-found query, modal open flags). Render the title header and the empty "prompt to look up" state.

**Requirements:** R10; Issue #10 AC "Follow glassmorphism design system"

**Dependencies:** Unit 1.

**Files:**
- Modify: `src/app/(dashboard)/checkinout/page.tsx` (convert stub to a Server Component that renders `<CheckinoutWorkflow />` inside the standard page header)
- Create: `src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx`
- Test: `tests/components/checkinout-workflow.test.tsx` (scaffold — full assertions grow as Units 3–6 land)

**Approach:**
- `page.tsx`: Server Component. Renders the same `space-y-2` header used by other modules — `<h1>Check-in/Out</h1>` with subtitle `"Look up an asset by tag or serial number to check it in or out."` — then `<CheckinoutWorkflow />`. No auth guard in this plan (see Scope Boundaries).
- `checkinout-workflow.tsx`: Client Component (`"use client"`). Holds:
  - `const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS)`
  - `const [events, setEvents] = useState<CheckEvent[]>(MOCK_HISTORY)`
  - `const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)`
  - `const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null)`
  - `const [checkoutOpen, setCheckoutOpen] = useState(false)`
  - `const [checkinOpen, setCheckinOpen] = useState(false)`
- Derives `selectedAsset = assets.find(a => a.id === selectedAssetId) ?? null`.
- Defines a `handleLookup(query: string)` callback (used by Unit 3) that calls `findAssetByTagOrSerial(assets, query)`; on match, sets `selectedAssetId` and clears `notFoundQuery`; on miss, sets `notFoundQuery = query` and clears `selectedAssetId`.
- Layout: outer `space-y-6` column containing the lookup form placeholder (Unit 3), then a conditional render block for one of `<AssetCard />` / `<AssetNotFound />` / empty-prompt, then the history section (Unit 6).
- In this unit, the conditional block shows **only the empty prompt**: a muted glass panel with copy like `"Enter an asset tag or serial number above to get started."`. Units 3–6 fill in the other branches.
- Use `cn()` for conditional classes; use the glass card and glass panel tokens from [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Patterns to follow:**
- Page header shape: mirror [src/app/(dashboard)/notifications/layout.tsx](../../src/app/(dashboard)/notifications/layout.tsx) — same title + subtitle typography.
- Workflow container pattern: single client component holding module state, same as how the notifications inbox client list holds read/dismiss/filter state.
- Glass tokens per [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Test scenarios:**
- Happy path: `/checkinout` renders the page title and subtitle.
- Happy path: on first render (no lookup performed), the empty-prompt panel is visible and neither the asset card nor the not-found panel is rendered.
- Edge case: no test yet for lookup/action behavior — those are covered in later units' tests and in the Unit 7 full-workflow integration test.

**Verification:**
- `pnpm dev` — `/checkinout` renders the header and empty-prompt panel with correct glass styling.
- `pnpm typecheck` and `pnpm lint` clean.
- `pnpm test` passes the scaffold workflow test.

---

- [ ] **Unit 3: Lookup form**

**Goal:** Render the lookup form inside the workflow container. Accept a single text input (asset tag or serial), validate non-empty with Zod, and on submit call the workflow's `handleLookup` callback. Auto-focus on mount.

**Requirements:** R10; Issue #10 AC "Lookup asset by asset tag or serial number"

**Dependencies:** Units 1 (types + helper) and 2 (workflow container).

**Files:**
- Create: `src/app/(dashboard)/checkinout/_components/lookup-form.tsx`
- Modify: `src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx` (mount `<LookupForm onLookup={handleLookup} />` above the conditional result block)
- Test: `tests/components/lookup-form.test.tsx`

**Approach:**
- `lookup-form.tsx`: Client Component (`"use client"`). Defines a co-located Zod schema: `{ query: z.string().trim().min(1, "Enter an asset tag or serial number") }`. Infers type with `z.infer`.
- Wires `useForm` with `zodResolver`. Default values: `{ query: "" }`.
- Renders shadcn `Form`, `FormField`, `FormItem`, `FormLabel` (`"Asset tag or serial number"`), `FormControl` (wrapping `Input` with `placeholder="e.g. IT-0001 or SN-ABCD1234"`), `FormMessage`, and a primary submit button labeled `"Look up"`.
- Wrap the form in an outer glass card: `rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl`.
- Input uses the glass input style: `rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm` with focus ring `focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]`.
- Submit handler: call `props.onLookup(values.query)`. **Do not** reset the form — the query stays visible so the user can see what they looked up.
- Auto-focus: call `form.setFocus("query")` inside a `useEffect(..., [])` on mount. (Decision note from Open Questions: admins want to start typing immediately.)
- Accept a `defaultQuery?: string` prop for future reuse; ignore for now.

**Patterns to follow:**
- Form skeleton: [src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx](../../src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx) — same RHF + Zod + shadcn wrappers, different field set.
- Co-locate the Zod schema in the form file per [.claude/rules/conventions.md](../../.claude/rules/conventions.md).
- Glass input + primary button styling per [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Test scenarios:**
- Happy path: renders the input with placeholder and label, and the submit button.
- Happy path: typing a query and submitting calls `onLookup` with the exact string typed.
- Edge case: submitting with an empty input does **not** call `onLookup`, and the Zod error message `"Enter an asset tag or serial number"` is rendered.
- Edge case: submitting with only whitespace (`"   "`) does not call `onLookup` (Zod `.trim().min(1)` rejects it) and the error message is rendered.
- Happy path: on mount, the input has focus (assert via `document.activeElement` or Testing Library's `expect(input).toHaveFocus()`).

**Verification:**
- `pnpm dev` — `/checkinout` shows the form, validation fires on empty, and typing + Enter fires the callback (wire a `console.log` briefly during dev or rely on Unit 4/5 to observe effect).
- `pnpm test` passes the new component test.
- `pnpm typecheck` and `pnpm lint` clean.

---

- [ ] **Unit 4: Asset result card and not-found panel**

**Goal:** Render the two post-lookup outcomes: (a) an asset was found → `<AssetCard />` shows identity, status, current assignee (if any), and a primary action button; (b) no asset matched → `<AssetNotFound />` shows an alert panel with the query and a hint. Wire the card's primary action to open the corresponding modal.

**Requirements:** R10; Issue #10 ACs "Check-out: assign device to a user with timestamp" and "Check-in: return device with timestamp" (action trigger surface; modal bodies land in Unit 5)

**Dependencies:** Units 1–3.

**Files:**
- Create: `src/app/(dashboard)/checkinout/_components/asset-card.tsx`
- Create: `src/app/(dashboard)/checkinout/_components/asset-not-found.tsx`
- Modify: `src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx` (replace the empty-prompt conditional with the three-branch render: `selectedAsset → <AssetCard />`, `notFoundQuery → <AssetNotFound query={notFoundQuery} />`, else empty-prompt)
- Test: `tests/components/asset-card.test.tsx`
- Test: `tests/components/asset-not-found.test.tsx`

**Approach:**
- **Shadcn dialog primitive install:** Before writing the modals in Unit 5, run `pnpm dlx shadcn@latest add dialog`. It can land with this unit to de-risk Unit 5, or at the start of Unit 5 — either is fine. Commit the generated `src/components/ui/dialog.tsx` unchanged.
- `asset-card.tsx`: Presentational client component (no state of its own; props: `asset: Asset`, `assignee: User | null`, `onCheckoutClick: () => void`, `onCheckinClick: () => void`). Renders a glass card containing:
  - Top row: asset `name` (heading, `text-[#300000] font-bold`), `tag` and `serial` as labels (`text-xs font-semibold uppercase tracking-wide text-[#555555]`), a status `Badge` styled per the status mapping below.
  - Identity row: `category` (e.g., "Laptop") and, if `status === 'ASSIGNED'`, `"Assigned to: <assignee.name> (<assignee.department>)"` in body text (`text-[#888888]`). If `assignee` is `null` but status is `ASSIGNED`, fall back to `"Assigned (user unknown)"` — defensive, should not trigger with mock data.
  - Action row: per the card action matrix in the High-Level Technical Design section. `AVAILABLE` → primary button `"Check out"` calling `onCheckoutClick`. `ASSIGNED` → primary button `"Check in"` calling `onCheckinClick`. `IN_REPAIR` / `RETIRED` → muted note (`text-[#888888]`) explaining why actions are disabled; no button.
  - Status → badge color mapping (directional): `AVAILABLE` → green-tinted neutral (`bg-white/60 border border-[#e0e0e0] text-[#555555]`); `ASSIGNED` → red accent (`bg-red-500/[0.08] border border-red-500/20 text-[#c80000]`); `IN_REPAIR` → amber-tinted (reuse notifications' warning tone from Unit 3 of the notifications plan); `RETIRED` → muted gray (`bg-[#e0e0e0]/40 text-[#888888]`).
  - Placeholder `"View in inventory"` link (inert for now; `TODO` comment referencing the Inventory R2 deferral).
- `asset-not-found.tsx`: Presentational. Renders the alert style (`rounded-xl border border-red-500/20 bg-red-500/[0.06] text-[#c80000] p-4`) with copy: `"No asset matches "{query}". Double-check the tag or serial, or confirm the asset has been added to Inventory."` Also renders a secondary "Clear" outline button that calls an `onClear` prop to reset the not-found state in the workflow. Props: `query: string`, `onClear: () => void`.
- Workflow wiring in `checkinout-workflow.tsx`:
  - Branch 1 (`selectedAsset !== null`): render `<AssetCard asset={selectedAsset} assignee={assigneeLookup} onCheckoutClick={() => setCheckoutOpen(true)} onCheckinClick={() => setCheckinOpen(true)} />`, where `assigneeLookup` is `MOCK_USERS.find(u => u.id === selectedAsset.currentAssigneeId) ?? null`.
  - Branch 2 (`notFoundQuery !== null`): render `<AssetNotFound query={notFoundQuery} onClear={() => setNotFoundQuery(null)} />`.
  - Branch 3 (neither): keep the empty-prompt panel from Unit 2.

**Patterns to follow:**
- Glass card wrapper from [src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx](../../src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx) (pattern — individual cards inside a larger list) as an acceptable reference for composition.
- Status badges: use shadcn `Badge` from [src/components/ui/badge.tsx](../../src/components/ui/badge.tsx) with the custom class strings above.
- Alert style per [.claude/rules/styling.md](../../.claude/rules/styling.md).
- Button primary/outline styles per [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Test scenarios:**
- Happy path (`asset-card.test.tsx`): renders `name`, `tag`, `serial`, and `category` from a sample `Asset`.
- Happy path: `AVAILABLE` asset renders the "Check out" primary button and clicking it calls `onCheckoutClick`.
- Happy path: `ASSIGNED` asset renders the "Check in" primary button and clicking it calls `onCheckinClick`; also renders `"Assigned to: <name>"` from the `assignee` prop.
- Edge case: `ASSIGNED` asset with `assignee={null}` renders the fallback `"Assigned (user unknown)"` copy and still shows the "Check in" button.
- Edge case: `RETIRED` asset renders neither action button and shows the `"Retired — actions disabled"` note.
- Edge case: `IN_REPAIR` asset renders neither action button and shows the `"In repair — actions disabled"` note.
- Edge case: each status renders the corresponding badge with the expected class hook (assert a distinctive class or a `data-status` attribute to avoid brittle class-string matching).
- Happy path (`asset-not-found.test.tsx`): renders the passed `query` inside the alert copy.
- Happy path: clicking "Clear" calls `onClear`.

**Verification:**
- `pnpm dev` — looking up an existing tag renders the card; an unknown query renders the not-found panel; clicking Clear returns to the empty prompt; clicking Check-out / Check-in (from the card) currently does nothing visible beyond the state flip (modals land in Unit 5). Temporarily wire a `console.log` in the workflow to observe the open-state toggling.
- `pnpm test` passes both new component tests.
- `pnpm typecheck` and `pnpm lint` clean.

---

- [ ] **Unit 5: Check-out and Check-in action modals**

**Goal:** Render the two action modals as shadcn `Dialog` instances controlled by the workflow's open-state booleans. On submit, update the workflow state (`assets` and `events`) and show a sonner toast.

**Requirements:** R10; Issue #10 ACs "Check-out: assign device to a user with timestamp" and "Check-in: return device with timestamp"

**Dependencies:** Units 1–4. **Prerequisite:** `src/components/ui/dialog.tsx` must exist (installed via `pnpm dlx shadcn@latest add dialog` in Unit 4 or at the start of this unit).

**Files:**
- Create: `src/app/(dashboard)/checkinout/_components/checkout-modal.tsx`
- Create: `src/app/(dashboard)/checkinout/_components/checkin-modal.tsx`
- Modify: `src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx` (mount both modals at the bottom of the component with `open` / `onOpenChange` wired to workflow state; pass `selectedAsset` and submit callbacks)
- Test: `tests/components/checkout-modal.test.tsx`
- Test: `tests/components/checkin-modal.test.tsx`

**Approach:**
- **Check-out modal (`checkout-modal.tsx`):** Client Component. Props: `open: boolean`, `onOpenChange(open: boolean): void`, `asset: Asset | null`, `users: User[]`, `onSubmit(payload: { userId: string; notes?: string }): void`. Wraps a shadcn `Dialog` with:
  - `DialogTitle`: `"Check out <asset.name>"` (fall back to "asset" if null — defensive).
  - `DialogDescription`: small copy reminding the admin this assigns the device with a timestamp.
  - Form (RHF + Zod). Schema: `{ userId: z.string().min(1, "Select a user"), notes: z.string().max(500).optional() }`. Infer type with `z.infer`.
  - Fields: shadcn `Select` over `users` showing `"${name} — ${department ?? "—"}"`; shadcn `Textarea` for notes (optional, `placeholder="Optional notes (e.g., loaner, remote worker)"`).
  - Footer buttons: outline "Cancel" (calls `onOpenChange(false)`) and primary "Check out" (submits).
  - Submit handler: call `onSubmit({ userId, notes })`, then `form.reset()`, then `onOpenChange(false)`. **Form resets on close** per [.claude/rules/components.md](../../.claude/rules/components.md) — also call `form.reset()` inside a `useEffect` watching `open` that triggers when `open` transitions to `false`.
- **Check-in modal (`checkin-modal.tsx`):** Client Component. Props: `open: boolean`, `onOpenChange(open: boolean): void`, `asset: Asset | null`, `currentAssignee: User | null`, `onSubmit(payload: { notes?: string }): void`. Mirrors the check-out modal's structure but:
  - Title: `"Check in <asset.name>"`.
  - Description: shows `"Returning from <currentAssignee.name>"` if available.
  - Schema: `{ notes: z.string().max(500).optional() }` — no user picker.
  - Footer buttons: outline "Cancel", primary "Check in".
  - Submit handler and reset-on-close behavior mirror check-out.
- **Workflow wiring:**
  - Mount both modals at the bottom of `<CheckinoutWorkflow />`.
  - `handleCheckoutSubmit({ userId, notes })`: (1) `setAssets(prev => prev.map(a => a.id === selectedAssetId ? { ...a, status: 'ASSIGNED', currentAssigneeId: userId } : a))`. (2) `setEvents(prev => [{ id: crypto.randomUUID(), assetId: selectedAssetId!, type: 'CHECK_OUT', userId, timestamp: new Date().toISOString(), notes }, ...prev])`. (3) `toast.success("Checked out — recorded locally (UI only)")`. (4) Do **not** auto-clear `selectedAssetId`; the admin stays on the card to see the updated status.
  - `handleCheckinSubmit({ notes })`: (1) capture `returningUserId = selectedAsset.currentAssigneeId` before mutating. (2) `setAssets(prev => prev.map(a => a.id === selectedAssetId ? { ...a, status: 'AVAILABLE', currentAssigneeId: undefined } : a))`. (3) `setEvents(prev => [{ id: crypto.randomUUID(), assetId: selectedAssetId!, type: 'CHECK_IN', userId: returningUserId!, timestamp: new Date().toISOString(), notes }, ...prev])`. (4) `toast.success("Checked in — recorded locally (UI only)")`.
  - Both submit handlers are guarded by `if (!selectedAssetId) return` as a defensive no-op (should never fire given the UI gating, but cheap insurance).

**Patterns to follow:**
- Modal pattern per [.claude/rules/components.md](../../.claude/rules/components.md): shadcn `Dialog`, trigger-in-parent (here the parent is the card, and the actual open-state lives one level higher in the workflow — this is fine and keeps state co-located), form resets on close.
- Form pattern per [.claude/rules/conventions.md](../../.claude/rules/conventions.md): RHF + `zodResolver`, co-located schema, shadcn `Form` wrappers, sonner for feedback.
- Reference form: [src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx](../../src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx) — same building blocks, different fields.
- Button and input styling per [.claude/rules/styling.md](../../.claude/rules/styling.md). Apply glass surface classes to the `DialogContent`: `rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`.

**Test scenarios:**
- Happy path (`checkout-modal.test.tsx`): when `open={true}` with a sample asset and a non-empty `users` array, renders the title containing the asset name, the user `Select`, and the notes `Textarea`.
- Happy path: selecting a user and clicking "Check out" calls `onSubmit` with `{ userId: '<selected>', notes: undefined }`.
- Happy path: filling in notes and submitting passes the notes string in the payload.
- Edge case: clicking "Check out" without selecting a user does **not** call `onSubmit`; the Zod error `"Select a user"` is rendered.
- Edge case: clicking "Cancel" calls `onOpenChange(false)` and does not call `onSubmit`.
- Edge case: when the dialog closes (via cancel or submit) and reopens, the form fields are reset (no residual state from the previous invocation).
- Happy path (`checkin-modal.test.tsx`): renders the title with the asset name and the `"Returning from <name>"` description when `currentAssignee` is provided.
- Happy path: submitting with empty notes calls `onSubmit({ notes: undefined })` (or `{}` depending on Zod `.optional()` behavior — assert the call was made, not the exact undefined-vs-missing key).
- Happy path: submitting with notes calls `onSubmit` with the notes string.
- Edge case: `currentAssignee={null}` renders the dialog without the "Returning from" line and still allows submission.
- Edge case: clicking "Cancel" closes the dialog without calling `onSubmit`.
- Integration (component-level, scoped to this unit): rendering `<CheckoutModal>` in isolation with Testing Library and driving the full happy path proves the RHF + Zod + shadcn Select + Dialog wiring is intact — the workflow-level integration is covered in Unit 7.

**Verification:**
- `pnpm dev` — look up an `AVAILABLE` asset, click Check-out, pick a user, submit → toast appears and the asset card re-renders as `ASSIGNED` with the chosen user. Look up an `ASSIGNED` asset, click Check-in, submit → toast appears and the card re-renders as `AVAILABLE`.
- `pnpm test` passes both new component tests.
- `pnpm typecheck` and `pnpm lint` clean.

---

- [ ] **Unit 6: Per-asset history list**

**Goal:** Render a chronological list of check-in/check-out events for the currently-looked-up asset, beneath the asset card. When no asset is selected, render an empty-state prompt.

**Requirements:** R10; Issue #10 AC "History of all check-in/check-out events per asset"

**Dependencies:** Units 1–5.

**Files:**
- Create: `src/app/(dashboard)/checkinout/_components/history-list.tsx`
- Create: `src/app/(dashboard)/checkinout/_components/history-item.tsx`
- Modify: `src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx` (mount `<HistoryList events={eventsForSelectedAsset} users={MOCK_USERS} />` below the card/not-found block; compute `eventsForSelectedAsset` via `events.filter(e => e.assetId === selectedAssetId).sort(by timestamp desc)` when a selection exists, else pass an empty array)
- Test: `tests/components/history-list.test.tsx`

**Approach:**
- `history-list.tsx`: Presentational. Props: `events: CheckEvent[]`, `users: User[]`, `hasSelectedAsset: boolean`. Renders a glass card (`rounded-3xl ...`) containing a heading row (`"History"` + count of events) and either the sorted list of `<HistoryItem />` rows or one of two empty states:
  - `hasSelectedAsset === false`: `"Look up an asset to see its history."`
  - `hasSelectedAsset === true && events.length === 0`: `"No check-in/out events recorded for this asset yet."`
- `history-item.tsx`: Presentational. Props: `event: CheckEvent`, `user: User | null` (the user the event was with, resolved by the parent from `users`). Renders:
  - Left column: an icon (lucide `ArrowDownCircle` for `CHECK_OUT`, `ArrowUpCircle` for `CHECK_IN`) with a color accent (`text-[#c80000]` for check-out, neutral `text-[#555555]` for check-in — directional, adjust during visual pass).
  - Middle column: the event label (`"Checked out to <user.name>"` or `"Checked in from <user.name>"`; fall back to `"unknown user"` if `user === null`). Below it, optional notes in `text-[#888888]`.
  - Right column: relative timestamp (e.g., `"2 hours ago"` via `Intl.RelativeTimeFormat`) with a `title` attribute holding the absolute ISO timestamp for hover.
- Sort the events client-side in the parent (workflow) using `.sort((a, b) => b.timestamp.localeCompare(a.timestamp))` before passing down — simpler than parsing to `Date` for ISO strings.
- Use a small local helper inside `history-item.tsx` (or shared under `src/lib/checkinout/`) to compute the relative timestamp. Keep it trivially testable.

**Patterns to follow:**
- Glass card wrapper and body/label typography per [.claude/rules/styling.md](../../.claude/rules/styling.md).
- Relative-time approach mirrors the notifications plan's Unit 3 (`Intl.RelativeTimeFormat`, no extra dependency).
- List item composition mirrors [src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx](../../src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx) in spirit.

**Test scenarios:**
- Happy path: with `hasSelectedAsset={true}` and a 3-event array, renders one row per event in timestamp-desc order (assert the first row's title matches the newest event).
- Happy path: a `CHECK_OUT` event renders `"Checked out to <name>"`; a `CHECK_IN` event renders `"Checked in from <name>"`.
- Happy path: an event with `notes` renders the notes string below the label.
- Edge case: `hasSelectedAsset={false}` renders the `"Look up an asset..."` empty state and no rows.
- Edge case: `hasSelectedAsset={true}` with an empty `events` array renders the `"No check-in/out events recorded..."` empty state.
- Edge case: an event whose `userId` does not resolve to a user (`user={null}`) renders `"unknown user"` in the label and still shows the timestamp.
- Happy path: the timestamp element carries a `title` attribute equal to the event's ISO string (so hover reveals absolute time).

**Verification:**
- `pnpm dev` — looking up an asset with seeded history shows the correct rows; performing a check-out prepends a new row to the list; performing a check-in prepends another row.
- `pnpm test` passes the new component test.
- `pnpm typecheck` and `pnpm lint` clean.

---

- [ ] **Unit 7: Workflow integration test and visual / a11y pass**

**Goal:** Prove the workflow wires end-to-end (lookup → card → action → history update) with a single component-level integration test, walk every new surface in the browser for glassmorphism fidelity, and resolve any lint / typecheck / test issues introduced by Units 1–6.

**Requirements:** Issue #10 — all ACs (cross-cutting verification); CLAUDE.md `pnpm lint` / `pnpm typecheck` / `pnpm test` cleanliness; glassmorphism design system.

**Dependencies:** Units 1–6.

**Files:**
- Modify: `tests/components/checkinout-workflow.test.tsx` (grow the scaffold from Unit 2 into a full integration test)
- May modify: any of the Unit 1–6 files for class fixes, copy fixes, or a11y attributes.

**Approach:**
- **Integration test** — render `<CheckinoutWorkflow />` inside the test (the real component, not mocks, with the real `MOCK_ASSETS` / `MOCK_USERS` / `MOCK_HISTORY`). Walk through:
  1. Type a valid tag of a seeded `AVAILABLE` asset into the lookup input and submit → assert the asset card renders with that asset's name and the "Check out" button.
  2. Click "Check out" → assert the check-out modal opens.
  3. Select a user in the modal and submit → assert the dialog closes, the asset card now shows the `ASSIGNED` badge and the chosen user's name, and the history list's first row is `"Checked out to <name>"`.
  4. Click "Check in" on the updated card → assert the check-in modal opens.
  5. Submit the check-in modal → assert the card flips back to `AVAILABLE`, and the history list's first row is now `"Checked in from <name>"` (the new top row) above the `CHECK_OUT` row from step 3.
  6. Look up an unknown tag (`"NOT-A-REAL-TAG"`) → assert the not-found panel renders with the query inline, and the asset card is gone.
  7. Click "Clear" on the not-found panel → assert the empty-prompt panel returns.
- Mock sonner's `toast.success` via `vi.mock("sonner", ...)` so the integration test doesn't depend on the real toast portal. Assert the mock was called at check-out and check-in time.
- **Visual pass:** Run `pnpm dev` and visit `/checkinout`. Confirm:
  - Outer header matches other modules (title + subtitle typography).
  - Lookup card, asset card, not-found panel, history card all use the correct glass tokens.
  - Status badges render distinctly for `AVAILABLE` / `ASSIGNED` / `IN_REPAIR` / `RETIRED`.
  - Both modals render as glass surfaces with proper backdrop blur and the button styles match the rest of the app.
  - History list rows are legible, icons align, relative timestamps render sensibly, hover on a timestamp reveals the absolute ISO string.
  - Empty states are visible when no lookup has been performed and when a selected asset has no history.
  - Disabled-action assets (`IN_REPAIR`, `RETIRED`) render the muted note and not the action button.
- **A11y basics:**
  - Lookup input has an associated label via shadcn `FormLabel`.
  - The lookup button is keyboard-reachable and the form submits on Enter.
  - The auto-focus on mount does not trap focus (Tab still works).
  - `Dialog` instances have accessible titles (shadcn's `DialogTitle` provides this; verify it is rendered, not hidden).
  - Status badges have either visible text labels or `aria-label` with the status name.
  - Action buttons have clear text labels (`"Check out"`, `"Check in"`, `"Cancel"`, `"Clear"`, `"Look up"`).
  - History item icons have `aria-hidden="true"` because the textual label already conveys the event type.
- **Lint and typecheck cleanup:** Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and resolve any failures.
- **Visual diff** against the notifications module to confirm the two modules feel like siblings: same header typography, same glass surface tokens, same button and input styles.

**Test scenarios:**
- Integration: the 7-step walkthrough above, in one test (or split into 2–3 `it` blocks if individual steps are easier to read separately). This test is the backbone of the plan's AC verification.

**Verification:**
- `pnpm lint` clean.
- `pnpm typecheck` clean.
- `pnpm test` green (all new unit + component + integration tests pass).
- Manual walkthrough confirms every surface matches glassmorphism and every action the AC requires is achievable from the UI.

## System-Wide Impact

- **Interaction graph:** Zero touchpoints outside the new module. The dashboard layout, sidebar, other routes, auth, and Prisma are not touched. The sidebar `Check-in/Out` entry already exists and gets no behavioral change.
- **Error propagation:** Pure client-side state; no error boundaries needed beyond React defaults. There are no I/O failure modes in this plan — check-out and check-in cannot fail because there is no server call.
- **State lifecycle risks:** All workflow state lives in one client container and is seeded from the mock arrays. Refresh resets the dataset to the seed — documented as a deliberate v0 simplification and called out in the toast copy (`"Checked out — recorded locally (UI only)"`). No risk of partial writes since there are no writes.
- **API surface parity:** None — no public API routes, no server actions, no Prisma reads or writes.
- **Integration coverage:** Covered by the Unit 7 workflow integration test. No cross-layer (UI ↔ server ↔ DB) interactions exist yet, so component-level integration is sufficient.
- **Unchanged invariants:** The dashboard layout structure, the Configuration module, the Notifications module, the sidebar, the auth flow, the `Setting` model, and every existing route remain untouched. The existing stub at [src/app/(dashboard)/checkinout/page.tsx](../../src/app/(dashboard)/checkinout/page.tsx) is replaced; no other file is structurally altered beyond the additions listed.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| UI-only mock data misleads stakeholders into thinking check-in/out is wired end-to-end | Submit toasts include `"(UI only)"`. This plan's Scope Boundaries, Deferred Tasks, and README-style handoff note in Documentation below all call this out. |
| The deferred backend changes the `Asset` / `CheckEvent` shape, forcing component rewrites | `src/lib/checkinout/types.ts` is intentionally minimal and designed to match what a Prisma model would produce. The mock swap is a single-file deletion plus a server-component data hydration. |
| Modal form resets on close trip over RHF's internal state lifecycle | Use the `useEffect`-on-`open`-transition pattern plus `form.reset()` at submit time. Covered by the modal component tests' "reopen → fields are reset" scenarios. |
| Card disabled-state (IN_REPAIR / RETIRED) regresses silently and accidentally allows an action | Asset-card component test explicitly asserts no action button renders for these two statuses. |
| Lookup helper case-insensitivity regresses (becomes case-sensitive) and breaks real-world entry | `checkinout-lookup.test.ts` covers the case-insensitive and trim scenarios explicitly. |
| Auto-focus on mount interferes with assistive tech or keyboard flow | Unit 7 a11y pass verifies Tab still works and that focus lands predictably; lookup-form component test asserts initial focus without asserting focus trap. |
| Glassmorphism inconsistency between this module and Notifications/Configuration | Unit 7 includes an explicit side-by-side visual pass against both sibling modules. |
| The deferred E2E leaves a gap in the testing mandate | Unit 7's workflow integration test covers every AC at the component-integration level; E2E is added with the backend plan when there is a real data path to exercise. This trade-off is called out explicitly in Scope Boundaries. |
| `crypto.randomUUID` not available in test environment (older JSDOM) | If the workflow test fails in JSDOM, shim with `Object.assign(globalThis.crypto ??= {}, { randomUUID: () => 'test-' + Math.random() })` in `tests/setup.ts`, or swap to a small local counter. Flagged here so the implementer does not get surprised. |

## Documentation / Operational Notes

- **No README update needed** — no new env vars, no new commands, no migration. `pnpm dlx shadcn@latest add dialog` is a one-time setup step captured in Unit 4; the generated file is committed.
- **No production rollout steps** — pure UI; deploys with the next merge.
- **Future-plan handoff note** — when the backend plan starts, its first actions should be:
  1. Add Prisma `Asset` and `CheckEvent` models matching the shape in [src/lib/checkinout/types.ts](../../src/lib/checkinout/types.ts).
  2. Replace `MOCK_ASSETS` / `MOCK_USERS` / `MOCK_HISTORY` imports with server-side Prisma queries fetched in `page.tsx` and hydrated into the workflow container as props.
  3. Convert `handleCheckoutSubmit` / `handleCheckinSubmit` to call `'use server'` actions that perform the state change in Postgres (inside a transaction that writes both the asset update and the event in one go).
  4. Delete `src/lib/checkinout/mock-data.ts` and update imports.
  5. Wire audit-log writes (R9) into the same transaction.
  6. Add a Playwright E2E covering the 7-step integration-test walkthrough against a real database.
  The component API for `<AssetCard />`, `<HistoryList />`, and both modals is designed so that none of them need to change when this swap happens.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R10
- **GitHub issue:** chanferolino/it-asset-management #10 — "feat: Asset check-in/check-out — desktop lookup"
- **Reference plan:** [docs/plans/2026-04-11-001-feat-notifications-ui-shell-plan.md](2026-04-11-001-feat-notifications-ui-shell-plan.md) — sibling UI-only module this plan mirrors
- **Rules:** [.claude/rules/conventions.md](../../.claude/rules/conventions.md), [.claude/rules/components.md](../../.claude/rules/components.md), [.claude/rules/styling.md](../../.claude/rules/styling.md), [.claude/rules/structure.md](../../.claude/rules/structure.md), [.claude/rules/database.md](../../.claude/rules/database.md) (for the eventual backend plan)
- **Related code:** [src/app/(dashboard)/checkinout/page.tsx](../../src/app/(dashboard)/checkinout/page.tsx), [src/app/(dashboard)/layout.tsx](../../src/app/(dashboard)/layout.tsx), [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx), [src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx](../../src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx), [src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx](../../src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx), [src/components/ui/](../../src/components/ui/), [src/lib/utils.ts](../../src/lib/utils.ts)
