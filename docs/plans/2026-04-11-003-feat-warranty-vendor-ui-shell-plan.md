---
title: "feat: Warranty & Vendor tracking — UI shell (vendors module, asset detail, warranty status)"
type: feat
status: active
date: 2026-04-11
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: Warranty & Vendor tracking — UI shell (vendors module, asset detail, warranty status)

## Context

Issue #11 (R11 + R11a) calls for two intertwined pieces: (a) a top-level **Vendors** module with full CRUD over vendor records (name, email, phone, website, linked assets), and (b) **warranty fields on the Inventory asset detail page** (purchase date, cost, warranty expiration, vendor link), with expiring-warranty alerts that will eventually feed Notifications (R8) and the Dashboard (R1). Per the user, this plan delivers **UI only** — no Prisma schema changes, no server actions, no cross-module alert wiring. The data model, server actions, and Notifications/Dashboard integration are explicitly deferred to a follow-up plan once the visual shape is validated.

Current state: both [src/app/(dashboard)/inventory/page.tsx](../../src/app/(dashboard)/inventory/page.tsx) and [src/app/(dashboard)/vendors/page.tsx](../../src/app/(dashboard)/vendors/page.tsx) are ~10-line stubs. The sidebar already has both entries ([src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) lines 35 and 39). This plan stands up the interactive surfaces — vendors list/detail/form, inventory asset detail with warranty, and a warranty-focused v0 inventory view with an expiring-alerts banner — fed entirely by mock data so the interaction model can be iterated before committing to Prisma models.

## Problem Frame

Warranty and vendor data are reference information an IT admin reaches for when something breaks: "Is this laptop still under warranty?" "Who do I call about this monitor?" "When does the printer contract expire?" Today that information lives in spreadsheets, email threads, or nowhere at all. The admin needs:

- A place to record vendors — name, contact methods, which assets they supplied
- A place to see an asset's purchase/warranty/vendor info on the asset detail page
- A way to spot assets whose warranty is expiring or already expired, so they can act before a device dies without coverage
- A consistent warranty status shown everywhere an asset is surfaced (badge: under warranty / expiring soon / expired / none)

Building these flows visually first — with mock data — lets us validate the interaction (vendor list as cards vs table, warranty as a side panel vs a section, alerts as a banner vs a dedicated page) before committing to schema or server actions. It also unblocks the sidebar `/vendors` and `/inventory` entries, which both currently lead to stubs.

See origin: [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R11 and R11a.

## Requirements Trace

- **R11** — Warranty fields (expiration, purchase date, cost) per asset, visible on asset detail pages; expiring-warranty alerts eventually feed Notifications (R8) and Dashboard (R1) (origin doc)
- **R11a** — Vendors as a top-level menu with vendor CRUD (name, email, phone, website) and link to assets supplied (origin doc)
- **Issue #11 acceptance criteria:**
  - Warranty expiration date per asset — *delivered as the `warrantyExpiresAt` field on the inventory mock-asset type and a warranty block on `/inventory/[id]`*
  - Vendor contact information (name, email, phone, website) — *delivered as the `Vendor` mock type and the vendor list/detail/form UI under `/vendors`*
  - Purchase date and cost per asset — *delivered as `purchaseDate` and `purchaseCost` fields on the inventory mock-asset, surfaced in the warranty block on `/inventory/[id]`*
  - Warranty status visible on asset detail pages — *delivered via `getWarrantyStatus()` pure helper + `WarrantyBadge` component, used on `/inventory/[id]` and on the v0 `/inventory` warranty table*
  - Expiring warranty alerts — *delivered as a banner on `/inventory` listing the count of expiring (≤30d) and expired assets, plus a filterable table of those assets. Cross-module wiring to Notifications/Dashboard is explicitly out of scope for this plan (see Scope Boundaries)*
  - Prisma schema for Vendor model and warranty fields on Asset — *explicitly deferred; see Deferred to Separate Tasks. Mock types in `src/lib/vendors/types.ts` and `src/lib/inventory/types.ts` are the contract the future schema will persist*
  - Follow glassmorphism design system — *all surfaces use the established glass tokens*
- **CLAUDE.md testing mandate:** every new feature ships with Vitest + Testing Library component tests for interactive pieces, plus unit tests for pure helpers. (No server actions in this plan, so no integration tests; Playwright E2E is deferred until a real data source exists.)

## Scope Boundaries

- **No persistence** — nothing writes to Postgres. Vendor CRUD and form submits live in React `useState` inside each page's client container. Refresh resets to the mock seed.
- **No Prisma schema changes** — this plan does not add `Vendor` or warranty fields to [prisma/schema.prisma](../../prisma/schema.prisma). The types defined in `src/lib/vendors/types.ts` and `src/lib/inventory/types.ts` are the contract the future schema will persist.
- **No server actions** — everything client-side. No `'use server'` files, no Prisma writes, no API routes.
- **No cross-module alert wiring** — R11 says expiring-warranty alerts feed Notifications (R8) and the Dashboard (R1). Those are separate modules. In this plan the alert surface lives only on `/inventory` as a banner + filterable table. No write to the notifications feed, no dashboard card.
- **No full Inventory R2 CRUD** — this plan does **not** add, edit, or retire assets, nor does it deliver the full inventory table (filters, bulk actions, columns, import). R2 Inventory is its own issue. This plan only delivers the asset *detail* page and a v0 warranty-focused inventory view. Explicit non-goals: asset creation form, asset edit form, asset delete, bulk import, column pickers, advanced filters, pagination.
- **No vendor-asset linking UI** — on vendor create/edit, users cannot attach or detach assets. The "assets supplied" list on the vendor detail page is a read-only projection of assets whose `vendorId` equals the current vendor (data flowing *from* asset to vendor, not the other way). Asset → vendor linking will be part of the asset edit form delivered by Inventory R2.
- **No checkinout type unification** — [src/lib/checkinout/types.ts](../../src/lib/checkinout/types.ts) already defines a minimal `Asset` for the check-in/out flow. This plan introduces a richer `Asset` in [src/lib/inventory/types.ts](../../src/lib/inventory/types.ts) with warranty + vendor fields. The two types coexist for now — they will merge into one Prisma `Asset` model when the backend plan lands. Keeping them separate in this plan avoids dragging warranty concerns into the check-in/out module's tests and mock data.
- **No currency selector** — costs display in USD via `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`. Multi-currency is deferred.
- **No audit-log integration** — R9's audit log is deferred. Vendor CRUD and warranty edits in this plan do not emit audit events.
- **No Playwright E2E in this plan** — E2E gets added when there is a real data source to exercise. Component tests still ship.
- **No permission gating** — any signed-in user can access vendors and inventory detail in this plan. Role-based restriction (e.g., ADMIN/MANAGER only for vendor CRUD) is deferred with the backend plan.

### Deferred to Separate Tasks

- **Warranty & Vendor backend (Prisma `Vendor` model, warranty fields on `Asset`, server actions, permission gating, audit-log write)** — separate plan once UX is validated. The types defined in this plan are the contract that will be persisted.
- **Expiring-warranty notification feed** — when Notifications (R8) has a real backend, a scheduled job produces notification rows for assets whose warranty crosses the 30-day threshold. This plan only shows the banner on `/inventory`; it does not write to the notifications feed.
- **Dashboard expiring-warranty card** — when Dashboard (R1) lands, it gets a card reading the same underlying data this plan mocks. Deferred to the backend plan.
- **Full Inventory R2 CRUD module** — asset create/edit/retire, full table, filters, bulk import, column pickers, pagination. R2 is its own issue; this plan's `/inventory` warranty view is a v0 stand-in that R2 will extend.
- **Asset → vendor linking in the asset edit form** — belongs to R2. This plan's asset detail page shows the current vendor read-only; there is no "change vendor" control.
- **Playwright E2E for vendor CRUD and warranty surfacing** — added with the backend plan.

## Context & Research

### Relevant Code and Patterns

- **UI-only module pattern reference** — [docs/plans/2026-04-11-002-feat-checkinout-ui-shell-plan.md](2026-04-11-002-feat-checkinout-ui-shell-plan.md) and [docs/plans/2026-04-11-001-feat-notifications-ui-shell-plan.md](2026-04-11-001-feat-notifications-ui-shell-plan.md) — same-day precedents for the "mock data + local state + types-first contract" approach. Mirror their folder shape: `_components/` for feature-local client components, `src/lib/<module>/` for types + mock data + pure helpers, `tests/components/` for interactive tests, `tests/unit/` for pure helper tests.
- **Types-first contract** — [src/lib/checkinout/types.ts](../../src/lib/checkinout/types.ts) and [src/lib/notifications/types.ts](../../src/lib/notifications/types.ts). The types in those files are designed so each mock type can be swapped for a Prisma model without touching components. Follow the same discipline for `Vendor` and the warranty fields on `Asset`.
- **Glassmorphism tokens** — [.claude/rules/styling.md](../../.claude/rules/styling.md) — glass card (`rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`), glass panel (`rounded-2xl ... backdrop-blur-xl`), glass input (`rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm`), primary button (`bg-[#c80000] hover:bg-[#b10000]`), outline button (`border border-[#e0e0e0] text-[#7b0000] hover:bg-red-500/[0.04]`), alert (`rounded-xl border border-red-500/20 bg-red-500/[0.06] text-[#c80000]`).
- **Form pattern** — [src/app/(dashboard)/configuration/settings/_components/settings-form.tsx](../../src/app/(dashboard)/configuration/settings/_components/settings-form.tsx), [src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx](../../src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx), and [src/app/(dashboard)/checkinout/_components/checkout-modal.tsx](../../src/app/(dashboard)/checkinout/_components/checkout-modal.tsx) — RHF + Zod + sonner + shadcn `Form` wrappers. Reuse for the vendor form modal.
- **Modal rules** — [.claude/rules/components.md](../../.claude/rules/components.md): modals use shadcn `Dialog`; trigger lives in the parent, content is a separate component; forms reset on close. Use the feature-local path (`vendors/_components/`) to keep the module self-contained.
- **shadcn Dialog already installed** — [src/components/ui/dialog.tsx](../../src/components/ui/dialog.tsx) was added during the checkinout plan. No new shadcn primitives needed for this plan.
- **Existing stubs to replace** — [src/app/(dashboard)/vendors/page.tsx](../../src/app/(dashboard)/vendors/page.tsx) and [src/app/(dashboard)/inventory/page.tsx](../../src/app/(dashboard)/inventory/page.tsx).
- **Sidebar already wired** — [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) lines 35 (`Inventory → /inventory`, `Package` icon) and 39 (`Vendors → /vendors`, `Building2` icon). No sidebar change needed.
- **shadcn primitives available** — `badge`, `button`, `card`, `dialog`, `form`, `input`, `label`, `select`, `separator`, `table`, `tabs`, `textarea` are all in [src/components/ui/](../../src/components/ui/). No new installs.
- **Test infrastructure** — `tests/components/`, `tests/unit/`, `tests/setup.ts` (jest-dom matchers), Vitest + Testing Library + `fireEvent` already configured. Note: `@testing-library/user-event` is **not** installed — use `fireEvent` per the checkinout plan's established pattern.
- **Pure helper convention** — `src/lib/checkinout/lookup.ts` and `src/lib/checkinout/relative-time.ts` are the precedent for small dependency-free helpers with companion unit tests in `tests/unit/`.
- **Not-found pattern for dynamic routes** — use Next.js `notFound()` from `next/navigation` inside server components when the id param doesn't resolve against the mock dataset. Keeps the pattern identical to what R2 Inventory will use against the real DB.

### Institutional Learnings

No `docs/solutions/` entries yet. The notifications and check-in/out UI-shell plans (same day) established the "UI-only module with mock data + local state + types-first contract" convention. This plan is the third reinforcement and should lock the pattern in, particularly:
- Static ISO timestamps in mock data (no `new Date()` at module load) so tests stay stable
- Pure helpers as dependency-free modules with companion unit tests
- Client containers that hold all module state; children are presentational
- Explicit "mock data only — no persistence" notice in copy where it would confuse an admin (e.g., a subtle footer line on the vendors list: "UI-only preview — changes are not saved")

### External References

Not used. Stack is well-known, the work is purely component composition over existing primitives, and no new shadcn primitives or dependencies are required. `Intl.NumberFormat` and `Intl.DateTimeFormat` are native and already used by the checkinout `relative-time` helper.

## Key Technical Decisions

- **Separate `src/lib/inventory/` and `src/lib/vendors/` modules** — each feature gets its own types, mock data, and helpers. Cross-module reads (vendor detail reading its supplied assets, asset detail reading its vendor) go through typed helper functions, not shared state. **Rationale:** keeps module boundaries clean and makes the eventual Prisma wiring a per-module swap.
- **Introduce a richer `Asset` type in `src/lib/inventory/types.ts` rather than extending `src/lib/checkinout/types.ts`** — the check-in/out module's Asset is deliberately minimal (no warranty, no vendor, no cost). Unifying them now would drag warranty tests into the check-in/out suite and make two unrelated modules co-evolve. **Rationale:** the real Prisma `Asset` model will have all fields; in the UI-only world, each module types the subset it needs. Merge happens with the backend plan.
- **Warranty status as a pure function of `(warrantyExpiresAt, today)`** — `getWarrantyStatus(expiresAt: string | null, today: Date): WarrantyStatus` returns one of `"UNDER_WARRANTY" | "EXPIRING_SOON" | "EXPIRED" | "NO_WARRANTY"`. `EXPIRING_SOON` means `now <= expiresAt <= now + 30 days`. **Rationale:** pure function is trivially unit-testable; injecting `today` makes tests deterministic instead of drifting with the wall clock; the 30-day threshold is a decision, not a magic number (exported as a named constant for clarity).
- **`WarrantyBadge` is a shared presentational component** — one component, one place, used on the asset detail page and the v0 inventory warranty table. **Rationale:** the badge's colors and copy are visual-consistency load-bearing; a shared component guarantees they never drift.
- **Vendor list as a responsive grid of glass cards, not a table** — on desktop, 2–3 columns of vendor cards showing name, email, phone, website link, and asset count. **Rationale:** vendor records are low-cardinality (10–50), contact info is the primary surface, and glass cards look richer than a dense table. A table view can be added later if the count grows.
- **Vendor form is a single modal for both create and edit** — one `VendorFormModal` component takes an optional `vendor` prop; when present, it's edit mode (pre-filled, "Save changes"), when absent, it's create mode (empty, "Create vendor"). **Rationale:** matches the checkinout modal pattern, keeps validation logic in one place, reduces component count.
- **Vendor form uses RHF + Zod + sonner** — consistent with [.claude/rules/conventions.md](../../.claude/rules/conventions.md) and with every existing form in the repo. **Rationale:** solved problem.
- **Vendor form field rules** — `name` required (1–100 chars), `contactEmail` required (`z.string().email()`), `contactPhone` optional (free-form string, 0–30 chars, no format enforcement), `website` optional (`z.string().url()` when present, allow empty string via `.or(z.literal(""))`), `notes` optional (0–500 chars). **Rationale:** phone formats vary globally and over-strict validation annoys users more than it helps; website URL validation catches the most common typo class (missing scheme).
- **Asset detail page is a server component for the shell, client container for any mutations** — since this plan has no mutations on the asset detail page (warranty edits belong to R2), the whole page can be a server component that reads from the mock data synchronously. The vendor block links out to `/vendors/[id]`. **Rationale:** fewer client components means simpler hydration and matches how the real page will work once server actions load the asset by id.
- **Vendors list and detail pages use a client container for state** — because vendor CRUD (create/edit/delete via modal) mutates local state, `/vendors` and `/vendors/[id]` each mount a client container that holds `vendors` in `useState`, seeded from `MOCK_VENDORS`. Changes do not propagate across navigations (each page remount reseeds). **Rationale:** cross-page persistence would require a store or URL-synced state; both are over-engineering for a UI-only plan. The "UI-only preview — changes are not saved" footer copy makes this expectation explicit.
- **Currency/date formatting via `Intl.*`** — no dependency, stable, locale-friendly. Wrap in small helper functions (`formatCurrency`, `formatDate`) in `src/lib/inventory/format.ts`. **Rationale:** keeps call sites terse and makes locale changes a one-file edit.
- **Expiring-alert banner on `/inventory` is dismissible in session only** — a small X button hides the banner for the session; no persistence. **Rationale:** admins acknowledge alerts visually; cross-session dismissal needs persistence which this plan doesn't have.
- **No new dependencies** — `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `lucide-react`, `tailwindcss`, `next`, shadcn `dialog` are all already installed. **Rationale:** nothing is missing.

## Open Questions

### Resolved During Planning

- **Where do warranty fields live — on the vendor or on the asset?** — On the asset. Per R11: "warranty fields per asset". Vendors are contact records; each asset has its own purchase date, cost, and warranty expiration independent of which vendor supplied it.
- **Does each asset have exactly one vendor or many?** — Exactly one (`vendorId: string | null`). Multiple vendors per asset would be over-engineering; when it's needed, R2 can evolve to a many-to-many relationship.
- **What is "expiring soon"?** — Within 30 days. Exported as a named constant `EXPIRING_SOON_DAYS = 30` from `src/lib/inventory/warranty.ts`.
- **What does warranty status look like for an asset with no warranty on record?** — A separate `NO_WARRANTY` status, rendered as a neutral gray badge labeled "No warranty". Not an error, not a warning.
- **Can warranty expiration be in the distant past?** — Yes; those count as `EXPIRED` and surface in the alerts banner. Mock data should include at least one already-expired asset and one expiring-in-5-days asset to exercise both states.
- **Vendor list empty state?** — Yes — the vendor list page renders a glass panel "No vendors yet. Add your first vendor to get started." with a primary button that opens the create modal. Reachable by deleting all mock vendors in session.
- **Vendor detail empty state (no linked assets)?** — Yes — a glass panel "No assets supplied by this vendor yet." Shown when `assets.filter(a => a.vendorId === vendor.id)` is empty.
- **Can a vendor be deleted?** — Yes; a "Delete" button on the vendor detail page opens a confirmation dialog (shadcn `Dialog`). On confirm, removes the vendor from local state and navigates back to `/vendors`. Assets that referenced this vendor have their `vendorId` unchanged in local state (they become dangling references in the session until page reload re-seeds); the asset detail page handles a missing vendor by showing "Vendor no longer available".
- **Cost currency?** — USD. Display with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.
- **Date display format?** — Long date via `Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" })` — e.g., "March 15, 2026". Relative days-until-expiry shown in parentheses for assets within 60 days of expiration ("March 15, 2026 · in 12 days" / "January 1, 2026 · 100 days ago").
- **`/inventory` top — full inventory table or just warranty view?** — Warranty view only (the v0 scope). Shows: alert banner, then a single table of all assets with columns `Tag`, `Name`, `Warranty expires`, `Status` (badge), `Vendor` (link). Each row links to `/inventory/[id]`. Explicitly labeled "Warranty view — full inventory management coming in R2". No filters, no sort controls, no column pickers.
- **Should the inventory warranty table be filterable?** — One single control: a status filter with options `All` | `Expired` | `Expiring soon` | `Under warranty` | `No warranty`. Client-side filtering via `useState`. Rationale: admins will want to focus on the expiring/expired subset from the alert banner; clicking the banner should set the filter. More filter controls belong to R2.
- **Should vendor email/phone/website be click-to-action?** — Yes. `mailto:` for email, `tel:` for phone, `target="_blank" rel="noopener noreferrer"` for website. All three shown on the vendor card and vendor detail page.

### Deferred to Implementation

- **Exact mock vendor copy** — 5–8 vendors with plausible names (e.g., "Acme Supply Co.", "MetroTech Partners"), valid emails, phone numbers in varied formats, and websites. Chosen at implementation time.
- **Exact mock asset copy** — 10–15 inventory assets with varied warranty states (at least 2 `EXPIRED`, at least 3 `EXPIRING_SOON`, at least 4 `UNDER_WARRANTY`, at least 1 `NO_WARRANTY`). Tags like `IT-0001`, serials like `SN-WXYZ9876`, vendor links spanning the mock vendor list. Static ISO dates relative to a chosen anchor ("today" for the mock seed is 2026-04-11).
- **Exact shape of the asset detail page header** — tag + name on top, status badge, maybe a "Back to inventory" link. Final layout decided during Unit 5 based on what reads cleanest.
- **Whether the vendor detail page should show a "recent activity" section** — probably not in this plan (no audit log). Decide during Unit 3.
- **Confirmation dialog copy for vendor delete** — "Delete {name}? This cannot be undone." or similar. Exact wording chosen during Unit 4.
- **Whether to auto-focus the vendor form's `name` field on open** — lean yes. Confirm during Unit 4.
- **Whether clicking the alert banner deep-links to the filtered table or just scrolls** — lean toward setting the filter via a callback. Confirm during Unit 6.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Module surfaces:**

| Surface | Route / Mount point | Client/Server | Data source |
|---|---|---|---|
| Vendors list page | `/vendors` | Server page + client container | `MOCK_VENDORS`, `MOCK_ASSETS` (for counts) |
| Vendor list container | inside `/vendors` | Client (holds vendor state) | mock seeds |
| Vendor card | inside list | Presentational | vendor + asset count |
| Vendor form modal | launched from list/detail | Client (RHF + Zod, shadcn Dialog) | workflow state |
| Vendor detail page | `/vendors/[id]` | Server page + client container | `MOCK_VENDORS`, `MOCK_ASSETS` |
| Vendor detail container | inside `/vendors/[id]` | Client (holds edit/delete state) | mock seeds |
| Delete confirmation dialog | launched from detail | Client (shadcn Dialog) | — |
| Inventory warranty view page | `/inventory` | Client container | `MOCK_ASSETS`, `MOCK_VENDORS` |
| Expiring alerts banner | inside `/inventory` | Presentational + dismiss callback | derived from assets |
| Inventory warranty table | inside `/inventory` | Presentational + filter state | filtered assets |
| Asset detail page | `/inventory/[id]` | Server page | `MOCK_ASSETS`, `MOCK_VENDORS` |
| Warranty block | inside asset detail | Presentational | asset fields |
| Vendor block | inside asset detail | Presentational | vendor lookup result |
| `WarrantyBadge` | shared | Presentational | `WarrantyStatus` |

**Core types (shape, not literal code):**

```
Vendor {
  id: string
  name: string                 // 1..100 chars
  contactEmail: string         // RFC 5322 valid
  contactPhone?: string        // free-form, 0..30 chars
  website?: string             // URL or empty
  notes?: string               // 0..500 chars
  createdAt: string            // ISO
}

Asset (inventory) {
  id: string
  tag: string                  // e.g. "IT-0001"
  serial: string               // e.g. "SN-WXYZ9876"
  name: string                 // e.g. "MacBook Pro 14\""
  category: AssetCategory      // LAPTOP | DESKTOP | MONITOR | PHONE | ACCESSORY
  status: AssetStatus          // AVAILABLE | ASSIGNED | IN_REPAIR | RETIRED
  purchaseDate: string | null  // ISO
  purchaseCost: number | null  // cents or dollars — decide in Unit 1 (lean cents for future accuracy; format.ts divides by 100)
  warrantyExpiresAt: string | null  // ISO
  vendorId: string | null
}

WarrantyStatus = 'UNDER_WARRANTY' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_WARRANTY'
```

**Warranty status decision tree:**

```
warrantyExpiresAt == null                              -> NO_WARRANTY
warrantyExpiresAt <  today                              -> EXPIRED
today <= warrantyExpiresAt <= today + 30 days          -> EXPIRING_SOON
warrantyExpiresAt >  today + 30 days                    -> UNDER_WARRANTY
```

**Vendor form validation matrix:**

| Field | Required | Rule | Error copy |
|---|---|---|---|
| `name` | yes | 1..100 chars | "Enter a vendor name" |
| `contactEmail` | yes | email format | "Enter a valid email" |
| `contactPhone` | no | 0..30 chars | "Phone is too long" (boundary only) |
| `website` | no | valid URL or empty | "Enter a valid URL (include https://)" |
| `notes` | no | 0..500 chars | "Notes are too long" |

**Alert banner logic:**

```
expiredCount  = assets.filter(warrantyStatus == 'EXPIRED').length
expiringCount = assets.filter(warrantyStatus == 'EXPIRING_SOON').length

show banner iff (expiredCount + expiringCount) > 0
banner copy:
  "N warranties expired, M expiring within 30 days"
  [View expired] [View expiring]
```

## Output Structure

```
src/
  app/
    (dashboard)/
      vendors/
        page.tsx                                   # server; renders <VendorsListContainer />
        [id]/
          page.tsx                                 # server; notFound() on miss; renders <VendorDetailContainer />
        _components/
          vendors-list-container.tsx               # client; holds vendors state
          vendor-card.tsx                          # presentational
          vendor-form-modal.tsx                    # client; RHF + Zod + shadcn Dialog
          vendor-detail-container.tsx              # client; edit/delete state
          vendor-delete-dialog.tsx                 # client; confirmation dialog
          vendor-assets-list.tsx                   # presentational; assets supplied
      inventory/
        page.tsx                                   # server; renders <InventoryWarrantyView />
        [id]/
          page.tsx                                 # server; notFound() on miss; renders asset detail
        _components/
          inventory-warranty-view.tsx              # client; filter + banner state
          warranty-alert-banner.tsx                # presentational + dismiss
          warranty-table.tsx                       # presentational
          asset-detail-header.tsx                  # presentational
          warranty-block.tsx                       # presentational
          vendor-block.tsx                         # presentational
  components/
    warranty-badge.tsx                             # shared presentational
  lib/
    vendors/
      types.ts                                     # Vendor type
      mock-data.ts                                 # MOCK_VENDORS
      lookup.ts                                    # findVendorById, countAssetsForVendor
    inventory/
      types.ts                                     # Asset (inventory), AssetStatus, AssetCategory
      mock-data.ts                                 # MOCK_ASSETS
      warranty.ts                                  # getWarrantyStatus, EXPIRING_SOON_DAYS, WARRANTY_STATUS_LABELS
      format.ts                                    # formatCurrency, formatDate, formatRelativeDays
      lookup.ts                                    # findAssetById
tests/
  unit/
    warranty-status.test.ts                        # pure function test for getWarrantyStatus
    inventory-format.test.ts                       # formatCurrency, formatDate, formatRelativeDays
    vendors-lookup.test.ts                         # findVendorById, countAssetsForVendor
  components/
    warranty-badge.test.tsx
    vendor-card.test.tsx
    vendor-form-modal.test.tsx
    vendors-list-container.test.tsx
    vendor-detail-container.test.tsx
    vendor-delete-dialog.test.tsx
    warranty-alert-banner.test.tsx
    warranty-table.test.tsx
    inventory-warranty-view.test.tsx
    asset-detail-page.test.tsx                     # renders server page against mock asset
```

## Implementation Units

- [x] **Unit 1: Types, mock data, warranty helper, and formatters**

**Goal:** Establish the shared TypeScript contracts for vendors and inventory assets; seed a representative dataset that exercises every warranty state; provide pure helper functions for warranty status, formatting, and lookups. Every other unit builds on this foundation.

**Requirements:** R11, R11a; Issue #11 — all ACs (foundation)

**Dependencies:** None.

**Files:**
- Create: `src/lib/vendors/types.ts`
- Create: `src/lib/vendors/mock-data.ts`
- Create: `src/lib/vendors/lookup.ts`
- Create: `src/lib/inventory/types.ts`
- Create: `src/lib/inventory/mock-data.ts`
- Create: `src/lib/inventory/warranty.ts`
- Create: `src/lib/inventory/format.ts`
- Create: `src/lib/inventory/lookup.ts`
- Test: `tests/unit/warranty-status.test.ts`
- Test: `tests/unit/inventory-format.test.ts`
- Test: `tests/unit/vendors-lookup.test.ts`

**Approach:**
- `src/lib/vendors/types.ts` exports the `Vendor` interface (see High-Level Technical Design).
- `src/lib/vendors/mock-data.ts` exports `MOCK_VENDORS: Vendor[]` — 5–8 entries with static ISO `createdAt` timestamps, varied phone formats, one vendor with no phone, one with no website, one with notes.
- `src/lib/vendors/lookup.ts` exports two pure helpers: `findVendorById(vendors: Vendor[], id: string): Vendor | null` and `countAssetsForVendor(assets: Asset[], vendorId: string): number`. `Asset` imported via a type-only import from `src/lib/inventory/types.ts` to avoid a circular runtime dep.
- `src/lib/inventory/types.ts` exports `AssetStatus` and `AssetCategory` (same literal unions as checkinout — but **re-declare locally**, do not import from `src/lib/checkinout/types.ts`; see Key Technical Decisions), plus the `Asset` interface with the extra fields (`purchaseDate`, `purchaseCost`, `warrantyExpiresAt`, `vendorId`). Also export `ASSET_STATUSES`, `ASSET_CATEGORIES`, and label record maps.
- `src/lib/inventory/mock-data.ts` exports `MOCK_ASSETS: Asset[]` — 10–15 entries. Required coverage: at least 2 EXPIRED, at least 3 EXPIRING_SOON, at least 4 UNDER_WARRANTY, at least 1 NO_WARRANTY, plus varied categories, varied vendors (spanning the mock vendor list), and a mix of statuses. Mock "today" anchor is **2026-04-11**; derive `warrantyExpiresAt` values as ISO strings relative to that anchor (e.g., `2026-04-05` for an EXPIRED asset, `2026-04-20` for an EXPIRING_SOON asset, `2027-08-15` for an UNDER_WARRANTY asset, `null` for NO_WARRANTY). Costs in **cents** (integer) — `149999` renders as "$1,499.99".
- `src/lib/inventory/warranty.ts` exports:
  - `export const EXPIRING_SOON_DAYS = 30` (named constant, not a magic number).
  - `export type WarrantyStatus = "UNDER_WARRANTY" | "EXPIRING_SOON" | "EXPIRED" | "NO_WARRANTY"`.
  - `export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string>` — human-readable labels.
  - `export function getWarrantyStatus(expiresAt: string | null, today: Date): WarrantyStatus` — pure function, injects `today` for deterministic tests. Returns `NO_WARRANTY` when `expiresAt == null`. Otherwise parses `expiresAt` to a `Date`, compares against `today` and `today + 30 days`.
- `src/lib/inventory/format.ts` exports three tiny wrappers:
  - `formatCurrency(cents: number | null, opts?: { fallback?: string }): string` — renders USD via `Intl.NumberFormat`; returns `opts.fallback ?? "—"` when null.
  - `formatDate(iso: string | null, opts?: { fallback?: string }): string` — renders long date via `Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" })`; fallback on null.
  - `formatRelativeDays(iso: string, today: Date): string` — returns `"in N days"` / `"N days ago"` / `"today"`. Used for the parenthetical on warranty expiration dates within 60 days of `today`. Uses simple day-diff arithmetic; no library.
- `src/lib/inventory/lookup.ts` exports `findAssetById(assets: Asset[], id: string): Asset | null` — pure, no React.
- No `"use client"` anywhere in this unit. Everything must be safe to import from Server Components.

**Patterns to follow:**
- [src/lib/checkinout/types.ts](../../src/lib/checkinout/types.ts), [src/lib/checkinout/mock-data.ts](../../src/lib/checkinout/mock-data.ts), [src/lib/checkinout/lookup.ts](../../src/lib/checkinout/lookup.ts), [src/lib/checkinout/relative-time.ts](../../src/lib/checkinout/relative-time.ts) — same module shape, same discipline (static ISO timestamps, pure helpers, dependency-free).
- [.claude/rules/conventions.md](../../.claude/rules/conventions.md) — Zod schemas co-located with forms (not relevant here since this unit has no forms); strict TypeScript.

**Test scenarios:**
- Happy path (`warranty-status.test.ts`): returns `UNDER_WARRANTY` for an expiration date 60 days past `today` (e.g., `today = 2026-04-11`, `expiresAt = 2026-06-10`).
- Happy path: returns `UNDER_WARRANTY` for an expiration date exactly 31 days past `today`.
- Edge case: returns `EXPIRING_SOON` for an expiration date exactly 30 days past `today` (boundary).
- Edge case: returns `EXPIRING_SOON` for an expiration date exactly 1 day past `today`.
- Edge case: returns `EXPIRING_SOON` for an expiration date equal to `today` (same day — still covered, not yet expired).
- Edge case: returns `EXPIRED` for an expiration date 1 day before `today`.
- Happy path: returns `EXPIRED` for an expiration date years in the past.
- Edge case: returns `NO_WARRANTY` when `expiresAt` is `null`.
- Edge case: returns `NO_WARRANTY` when `expiresAt` is an empty string (treat as null — defensive, document in the test).
- Happy path (`inventory-format.test.ts`): `formatCurrency(149999)` returns `"$1,499.99"`.
- Happy path: `formatCurrency(0)` returns `"$0.00"`.
- Edge case: `formatCurrency(null)` returns `"—"`.
- Edge case: `formatCurrency(null, { fallback: "Unknown" })` returns `"Unknown"`.
- Happy path: `formatDate("2026-03-15")` returns `"March 15, 2026"`.
- Edge case: `formatDate(null)` returns `"—"`.
- Happy path: `formatRelativeDays("2026-04-11", new Date("2026-04-11T00:00:00Z"))` returns `"today"`.
- Happy path: `formatRelativeDays("2026-04-21", new Date("2026-04-11T00:00:00Z"))` returns `"in 10 days"`.
- Happy path: `formatRelativeDays("2026-04-01", new Date("2026-04-11T00:00:00Z"))` returns `"10 days ago"`.
- Happy path (`vendors-lookup.test.ts`): `findVendorById` returns the matching vendor.
- Edge case: `findVendorById` returns `null` for an unknown id.
- Edge case: `findVendorById` returns `null` for an empty id.
- Happy path: `countAssetsForVendor` returns the correct count for a vendor that has 3 assets.
- Edge case: `countAssetsForVendor` returns 0 for a vendor with no linked assets.
- Edge case: `countAssetsForVendor` returns 0 for an unknown vendorId.

**Verification:**
- `pnpm typecheck` clean.
- `pnpm test` — the new unit test files pass.
- Importing `MOCK_VENDORS`, `MOCK_ASSETS`, `getWarrantyStatus`, `formatCurrency` etc. from another file produces correctly typed values.
- Sanity check: applying `getWarrantyStatus` to every `MOCK_ASSETS` entry against `today = 2026-04-11` produces at least 2 EXPIRED, 3 EXPIRING_SOON, 4 UNDER_WARRANTY, 1 NO_WARRANTY (verified manually or in a one-off sanity test inside `inventory-format.test.ts`).

---

- [x] **Unit 2: Shared `WarrantyBadge` component**

**Goal:** A tiny presentational component that renders a color-coded pill for a given `WarrantyStatus`, reused by the asset detail page and the inventory warranty table. Centralizes the color mapping so it cannot drift between surfaces.

**Requirements:** R11; Issue #11 AC "Warranty status visible on asset detail pages"

**Dependencies:** Unit 1.

**Files:**
- Create: `src/components/warranty-badge.tsx`
- Test: `tests/components/warranty-badge.test.tsx`

**Approach:**
- Presentational client-safe component (no `"use client"` needed — no state, no effects). Props: `{ status: WarrantyStatus; className?: string }`.
- Maps `status` to a label + Tailwind class set:
  - `UNDER_WARRANTY` → green accent, label "Under warranty". Classes like `bg-emerald-500/[0.08] text-emerald-700 border border-emerald-500/20`.
  - `EXPIRING_SOON` → yellow/amber accent, label "Expiring soon". Classes like `bg-amber-500/[0.08] text-amber-700 border border-amber-500/20`.
  - `EXPIRED` → red accent (repo glass red), label "Expired". Classes like `bg-red-500/[0.08] text-[#c80000] border border-red-500/20`.
  - `NO_WARRANTY` → neutral gray, label "No warranty". Classes like `bg-[#e0e0e0]/[0.4] text-[#555555] border border-[#e0e0e0]`.
- Shape: `rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide`.
- Uses `cn()` from `src/lib/utils.ts` for class composition.
- Adds `data-warranty-status={status}` attribute for reliable test assertions.
- Reads labels from `WARRANTY_STATUS_LABELS` (Unit 1) so the copy has one source of truth.

**Patterns to follow:**
- [src/app/(dashboard)/checkinout/_components/asset-card.tsx](../../src/app/(dashboard)/checkinout/_components/asset-card.tsx) for the "map status to class" pattern (`STATUS_BADGE_CLASS` Record) and the `data-status` attribute discipline.
- Glass accent tones per [.claude/rules/styling.md](../../.claude/rules/styling.md) (red family); green/amber are introduced here for the two other states — keep them subtle (≤ 20% opacity borders, ≤ 10% backgrounds).

**Test scenarios:**
- Happy path: renders label "Under warranty" for `UNDER_WARRANTY`.
- Happy path: renders label "Expiring soon" for `EXPIRING_SOON`.
- Happy path: renders label "Expired" for `EXPIRED`.
- Happy path: renders label "No warranty" for `NO_WARRANTY`.
- Happy path: sets `data-warranty-status` attribute matching the status prop (checked for all four states).
- Happy path: forwards `className` prop onto the root element (merged via `cn()`).

**Verification:**
- `pnpm test` passes the badge test.
- `pnpm typecheck` and `pnpm lint` clean.
- Manual visual check during Unit 5 to confirm the four states are visually distinct and readable on a glass card.

---

- [x] **Unit 3: Vendors list page (`/vendors`)**

**Goal:** Replace the `/vendors` stub with a responsive grid of vendor cards backed by a client container holding the vendor state. Supports the create flow (via the modal delivered in Unit 4) by exposing a callback to open the modal. Also renders the empty state when there are no vendors.

**Requirements:** R11a; Issue #11 AC "Vendor contact information (name, email, phone, website)"

**Dependencies:** Unit 1.

**Files:**
- Modify: `src/app/(dashboard)/vendors/page.tsx` (convert stub to a Server Component that renders `<VendorsListContainer />` inside the standard page header)
- Create: `src/app/(dashboard)/vendors/_components/vendors-list-container.tsx`
- Create: `src/app/(dashboard)/vendors/_components/vendor-card.tsx`
- Test: `tests/components/vendor-card.test.tsx`
- Test: `tests/components/vendors-list-container.test.tsx` (scaffold — full create-flow assertions grow with Unit 4)

**Approach:**
- `page.tsx`: Server Component. Renders the module header (`<h1>Vendors</h1>` + subtitle `"Manage vendor records and see which assets each vendor supplied."`) and mounts `<VendorsListContainer />`.
- `vendors-list-container.tsx`: Client Component. Holds:
  - `const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS)`
  - `const [createOpen, setCreateOpen] = useState(false)`
- Renders:
  - A header row with a primary button "Add vendor" that sets `createOpen = true`.
  - When `vendors.length === 0`: a glass panel empty state with copy "No vendors yet. Add your first vendor to get started." and a primary button that opens the create modal.
  - Otherwise: a responsive grid (`grid gap-4 md:grid-cols-2 xl:grid-cols-3`) of `<VendorCard vendor={v} assetCount={countAssetsForVendor(MOCK_ASSETS, v.id)} />` — each card wrapped in a `<Link href={`/vendors/${v.id}`}>`.
  - A subtle footer notice: "UI-only preview — changes are not saved." in muted gray text.
- Mounts `<VendorFormModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />` — the modal is delivered by Unit 4; in Unit 3 the modal file does not yet exist, so **Unit 3 leaves the modal mount point as a TODO comment** referencing Unit 4. The container ships with the "Add vendor" button and the empty-state button both calling `setCreateOpen(true)` so Unit 4 only has to mount the modal component. `handleCreate` prepends the new vendor to state and closes the modal.
- `vendor-card.tsx`: Presentational. Props: `{ vendor: Vendor; assetCount: number }`. Renders a glass panel (`rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl`) containing:
  - Vendor name as `text-lg font-bold text-[#300000]`.
  - Contact block: email (`mailto:` link with `Mail` icon from lucide), phone (`tel:` link with `Phone` icon) when present, website (external link with `Globe` icon) when present. Each row `flex items-center gap-2 text-sm text-[#555555]`.
  - Asset count footer: `"<N> assets"` with `Package` icon, muted `text-xs text-[#888888]`.
  - Hover state: subtle border color shift (`hover:border-red-500/30 transition-all`).
  - `data-testid="vendor-card"` on the root and `data-vendor-id={vendor.id}` for test targeting.
- Use `cn()` for class composition.

**Patterns to follow:**
- Module header typography: [src/app/(dashboard)/notifications/layout.tsx](../../src/app/(dashboard)/notifications/layout.tsx) and [src/app/(dashboard)/checkinout/page.tsx](../../src/app/(dashboard)/checkinout/page.tsx).
- Client container pattern: [src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx](../../src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx) — single client component owning module state.
- Glass panel tokens per [.claude/rules/styling.md](../../.claude/rules/styling.md).
- Lucide icons already used in the codebase ([src/app/(dashboard)/checkinout/_components/history-item.tsx](../../src/app/(dashboard)/checkinout/_components/history-item.tsx) imports from `lucide-react` directly).

**Test scenarios:**
- Happy path (`vendor-card.test.tsx`): renders vendor name, email `mailto:` link with the correct `href`, phone `tel:` link with correct `href`, website anchor with `target="_blank"` and `rel="noopener noreferrer"`.
- Happy path: renders "3 assets" when `assetCount={3}`.
- Edge case: renders "0 assets" when `assetCount={0}`.
- Edge case: does **not** render a phone row when `vendor.contactPhone` is missing.
- Edge case: does not render a website row when `vendor.website` is missing.
- Happy path (`vendors-list-container.test.tsx`): renders the "Add vendor" primary button.
- Happy path: renders one card per mock vendor on first render.
- Happy path: the "UI-only preview — changes are not saved" notice is visible.
- Edge case: seeded with an empty vendor array, renders the empty state with copy "No vendors yet" and a "Add your first vendor" button.
- Edge case: clicking "Add vendor" does not throw (button is wired to state; modal mount lives in Unit 4 — this test just asserts the click handler fires without error by spying on `setCreateOpen` or observing a `data-create-open` attribute on the container root set via the state).

**Verification:**
- `pnpm dev` — `/vendors` renders the grid with styled cards, the Add button, and the footer notice.
- `pnpm typecheck` and `pnpm lint` clean.
- `pnpm test` passes the new component tests.

---

- [x] **Unit 4: Vendor form modal + wiring (create and edit)**

**Goal:** Deliver the `VendorFormModal` component — a single modal used for both create and edit — and wire it into the vendors list page (Unit 3) for creation. The edit wiring on the vendor detail page is delivered in Unit 5; this unit exports the modal and proves its behavior via component tests.

**Requirements:** R11a; Issue #11 AC "Vendor contact information (name, email, phone, website)"

**Dependencies:** Units 1, 3.

**Files:**
- Create: `src/app/(dashboard)/vendors/_components/vendor-form-modal.tsx`
- Modify: `src/app/(dashboard)/vendors/_components/vendors-list-container.tsx` (mount the modal, wire `onSubmit` to prepend the new vendor to state, show sonner toast on success)
- Test: `tests/components/vendor-form-modal.test.tsx`

**Approach:**
- `vendor-form-modal.tsx`: Client Component (`"use client"`). Props:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `vendor?: Vendor` — when present, edit mode; when absent, create mode
  - `onSubmit: (values: VendorFormValues) => void` — called on successful validation; parent is responsible for mutating state, closing the modal, and firing the toast
- Defines a co-located Zod schema matching the Vendor form validation matrix (Key Technical Decisions). Infers `VendorFormValues` via `z.infer`.
- Wires `useForm` with `zodResolver`. Default values come from `vendor` when editing, else empty strings / undefined.
- Renders a shadcn `Dialog` with `DialogHeader`, `DialogTitle` ("Add vendor" / "Edit vendor"), `DialogDescription`, and a `Form` containing five `FormField` blocks: `name` (Input), `contactEmail` (Input type=email), `contactPhone` (Input type=tel), `website` (Input type=url), `notes` (Textarea, 3 rows). Primary submit button ("Create vendor" / "Save changes") and outline Cancel button.
- All inputs use the glass input style.
- `useEffect` watches `open` — when the modal closes, calls `form.reset()` to clear stale values. When editing and `open` flips true, resets with the passed-in vendor values.
- `useEffect` calls `form.setFocus("name")` on open.
- On submit, transforms empty strings in optional fields (`contactPhone`, `website`, `notes`) into `undefined` before calling `props.onSubmit` (keeps the mock data shape clean).
- Uses the `generateEventId()` approach from checkinout's `checkinout-workflow.tsx` pattern to generate vendor IDs when the parent creates a new vendor — but that helper lives on the **parent** (the list container), not inside the modal. The modal only emits `VendorFormValues`; the parent assigns `id` and `createdAt`.
- List container (`vendors-list-container.tsx`) `handleCreate(values)`:
  - Builds `newVendor: Vendor = { id: generateVendorId(), createdAt: new Date().toISOString(), ...values }`.
  - Calls `setVendors(prev => [newVendor, ...prev])`.
  - Closes the modal.
  - Fires `toast.success("Vendor added — recorded locally (UI only)")` via `sonner`.
- `generateVendorId()` is a small helper co-located in the list container (or in `src/lib/vendors/id.ts` if we want to share with the detail container — lean toward co-location for now; extract if Unit 5 needs the same logic). Mirrors [src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx](../../src/app/(dashboard)/checkinout/_components/checkinout-workflow.tsx)'s `generateEventId` — `crypto.randomUUID` with a `Math.random + Date.now` fallback for older JSDOM.

**Patterns to follow:**
- [src/app/(dashboard)/checkinout/_components/checkout-modal.tsx](../../src/app/(dashboard)/checkinout/_components/checkout-modal.tsx) and [src/app/(dashboard)/checkinout/_components/checkin-modal.tsx](../../src/app/(dashboard)/checkinout/_components/checkin-modal.tsx) — shadcn Dialog + RHF + Zod + sonner, with `useEffect` form reset on close.
- [.claude/rules/components.md](../../.claude/rules/components.md) — modal forms reset on close.
- [.claude/rules/conventions.md](../../.claude/rules/conventions.md) — co-locate Zod schemas; use shadcn `Form` wrappers; no manual validation.
- `fireEvent` for tests (not user-event — not installed), mirroring the checkinout component tests.

**Test scenarios:**
- Happy path (`vendor-form-modal.test.tsx`): mounted with `open={true}` and no `vendor`, renders title "Add vendor" and an empty name input.
- Happy path: mounted with `vendor={somePrefilled}`, renders title "Edit vendor" and fields pre-populated with the vendor's values.
- Happy path: filling name + email and clicking submit calls `onSubmit` once with the entered values (phone/website/notes as `undefined`).
- Happy path: filling every field and submitting calls `onSubmit` with all five values populated and optional-empty strings normalized to `undefined`.
- Error path: submitting with empty name shows the error "Enter a vendor name" and does not call `onSubmit`.
- Error path: submitting with empty email shows the email error and does not call `onSubmit`.
- Error path: submitting with an invalid email (`"not-an-email"`) shows "Enter a valid email" and does not call `onSubmit`.
- Error path: submitting with an invalid website (`"notaurl"`) shows the website error and does not call `onSubmit`.
- Edge case: website field accepts an empty string without error (optional field, `.or(z.literal(""))`).
- Edge case: clicking Cancel calls `onOpenChange(false)` and does not call `onSubmit`.
- Edge case: reopening the modal after a cancel shows empty fields (reset fired).

**Integration check in `vendors-list-container.test.tsx` (extended in this unit):**
- Happy path: clicking "Add vendor" opens the modal (the dialog content becomes present in the DOM).
- Happy path: filling the form and submitting prepends a new card to the grid and fires a success toast (sonner mocked at the top of the file, same pattern as `tests/components/checkinout-workflow.test.tsx`).

**Verification:**
- `pnpm test` passes all vendor form tests.
- `pnpm typecheck` and `pnpm lint` clean.
- `pnpm dev` — clicking "Add vendor" on `/vendors` opens the modal, typing valid values and submitting adds a new card, toast appears.

---

- [x] **Unit 5: Vendor detail page (`/vendors/[id]`) + delete flow**

**Goal:** Deliver the vendor detail page showing the vendor's full contact info, a list of assets supplied, an "Edit" button that opens the `VendorFormModal` in edit mode, and a "Delete" button that opens a confirmation dialog. Uses Next.js `notFound()` for unknown ids.

**Requirements:** R11a; Issue #11 AC "Vendor contact information (name, email, phone, website)"

**Dependencies:** Units 1, 3, 4.

**Files:**
- Create: `src/app/(dashboard)/vendors/[id]/page.tsx`
- Create: `src/app/(dashboard)/vendors/_components/vendor-detail-container.tsx`
- Create: `src/app/(dashboard)/vendors/_components/vendor-delete-dialog.tsx`
- Create: `src/app/(dashboard)/vendors/_components/vendor-assets-list.tsx`
- Test: `tests/components/vendor-detail-container.test.tsx`
- Test: `tests/components/vendor-delete-dialog.test.tsx`

**Approach:**
- `src/app/(dashboard)/vendors/[id]/page.tsx`: Server Component. Reads the `id` param, calls `findVendorById(MOCK_VENDORS, params.id)`; if `null`, calls `notFound()` from `next/navigation`. Otherwise renders the standard header (`<h1>{vendor.name}</h1>`, subtitle `"Vendor details and assets supplied"`) and mounts `<VendorDetailContainer initialVendor={vendor} initialAssets={assetsForVendor} />` where `assetsForVendor = MOCK_ASSETS.filter(a => a.vendorId === vendor.id)`.
- `vendor-detail-container.tsx`: Client Component. Holds:
  - `const [vendor, setVendor] = useState<Vendor>(initialVendor)` — so edit can update in-place
  - `const [editOpen, setEditOpen] = useState(false)`
  - `const [deleteOpen, setDeleteOpen] = useState(false)`
- Reads `initialAssets` directly from props (not state — asset mutations are out of scope for vendor detail).
- Layout: two-column on desktop (`grid gap-6 lg:grid-cols-[2fr_1fr]`):
  - Left (main): Contact block in a glass card: email (mailto), phone (tel), website (external link), notes (muted paragraph) — uses the same icon + link patterns as `vendor-card.tsx`. Below it, `<VendorAssetsList assets={initialAssets} />`.
  - Right (sidebar): Action panel glass card with "Edit vendor" primary button (opens edit modal) and "Delete vendor" outline-danger button (opens delete dialog).
- `<VendorFormModal open={editOpen} onOpenChange={setEditOpen} vendor={vendor} onSubmit={handleEdit} />` — wired from Unit 4.
- `handleEdit(values)`:
  - `setVendor(prev => ({ ...prev, ...values }))`
  - Closes the modal.
  - `toast.success("Vendor updated — recorded locally (UI only)")`.
- `<VendorDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} vendorName={vendor.name} onConfirm={handleDelete} />`.
- `handleDelete()`:
  - `toast.success("Vendor deleted — recorded locally (UI only)")`.
  - Calls `router.push("/vendors")` via `useRouter()` from `next/navigation`.
  - **Does not** mutate `MOCK_VENDORS` (that array is the module seed, not the live state). The "deletion" is purely navigational in this UI-only plan — when the user lands back on `/vendors`, the list container re-seeds from `MOCK_VENDORS` so the "deleted" vendor reappears. This is a known v0 simplification captured in the Scope Boundaries. Document it in a code comment on `handleDelete`.
- `vendor-delete-dialog.tsx`: Client Component. Props: `{ open, onOpenChange, vendorName, onConfirm }`. Renders a shadcn `Dialog` with title "Delete vendor?", description "Delete {vendorName}? This cannot be undone.", and two buttons: outline Cancel (calls `onOpenChange(false)`) and a primary red "Delete" button (calls `onConfirm` then `onOpenChange(false)`).
- `vendor-assets-list.tsx`: Presentational. Props: `{ assets: Asset[] }`. Renders a glass panel with heading "Assets supplied" and either:
  - Empty state: "No assets supplied by this vendor yet."
  - A `<table>` with columns `Tag`, `Name`, `Category`. Each row wraps the tag cell in a `<Link href={`/inventory/${a.id}`}>`.
- Use `cn()`, shadcn primitives (`Table`, `Dialog`, `Button`), glass tokens.

**Patterns to follow:**
- [src/app/(dashboard)/checkinout/_components/checkout-modal.tsx](../../src/app/(dashboard)/checkinout/_components/checkout-modal.tsx) for the shadcn Dialog scaffold in the delete dialog.
- [src/app/(dashboard)/checkinout/_components/history-list.tsx](../../src/app/(dashboard)/checkinout/_components/history-list.tsx) for the "empty state or rendered list" switch pattern.
- Next.js `notFound()` from `next/navigation` for the 404 branch.
- `useRouter` from `next/navigation` for programmatic navigation in Client Components.

**Test scenarios:**
- Happy path (`vendor-detail-container.test.tsx`): renders the vendor name, email, phone, website, and notes.
- Happy path: renders the linked assets table with one row per supplied asset; each row has a `<Link>` to `/inventory/[id]`.
- Edge case: rendered with `initialAssets={[]}`, shows the empty state "No assets supplied by this vendor yet."
- Happy path: clicking "Edit vendor" opens the form modal pre-filled with the vendor's values (asserted via the name field's value).
- Happy path: editing a field in the modal and submitting updates the header name in place and fires the update toast (sonner mocked at top of file).
- Happy path: clicking "Delete vendor" opens the delete confirmation dialog with the vendor's name in the description.
- Happy path (`vendor-delete-dialog.test.tsx`): renders title "Delete vendor?", description containing the vendor name, Cancel and Delete buttons.
- Happy path: clicking Delete calls `onConfirm` exactly once and then `onOpenChange(false)`.
- Happy path: clicking Cancel calls `onOpenChange(false)` and does not call `onConfirm`.
- Integration (in `vendor-detail-container.test.tsx`): after clicking Delete in the confirmation dialog, the toast fires. (Router `push` is mocked — `vi.mock("next/navigation", ...)` at the top of the file; assert the mock was called with `"/vendors"`.)

**Verification:**
- `pnpm dev` — navigating to `/vendors/<some-mock-id>` renders the detail page with correct data; `/vendors/not-a-real-id` shows Next.js's notFound page.
- Edit flow: click Edit, change a field, Save → header updates, toast fires.
- Delete flow: click Delete, confirm → toast fires, navigation to `/vendors`.
- `pnpm test`, `pnpm typecheck`, `pnpm lint` all clean.

---

- [x] **Unit 6: Inventory asset detail page (`/inventory/[id]`) + warranty/vendor blocks**

**Goal:** Deliver the asset detail page shell under `/inventory/[id]` with three sections — header (identity), warranty block (purchase date, cost, expiration, status badge), and vendor block (linked vendor contact info with a deep-link to `/vendors/[id]`). This is the surface R11 calls "asset detail page" and the primary visibility target for warranty info.

**Requirements:** R11; Issue #11 ACs "Warranty expiration date per asset", "Purchase date and cost per asset", "Warranty status visible on asset detail pages"

**Dependencies:** Units 1, 2 (for `WarrantyBadge`).

**Files:**
- Create: `src/app/(dashboard)/inventory/[id]/page.tsx`
- Create: `src/app/(dashboard)/inventory/_components/asset-detail-header.tsx`
- Create: `src/app/(dashboard)/inventory/_components/warranty-block.tsx`
- Create: `src/app/(dashboard)/inventory/_components/vendor-block.tsx`
- Test: `tests/components/asset-detail-page.test.tsx`

**Approach:**
- `src/app/(dashboard)/inventory/[id]/page.tsx`: Server Component. Reads `params.id`, calls `findAssetById(MOCK_ASSETS, params.id)`; if `null`, calls `notFound()`. Otherwise:
  - Looks up the vendor via `findVendorById(MOCK_VENDORS, asset.vendorId ?? "")` (returns `null` when no vendorId or unknown vendor — both render as "Vendor no longer available" in `vendor-block`).
  - Computes `warrantyStatus = getWarrantyStatus(asset.warrantyExpiresAt, new Date("2026-04-11T00:00:00Z"))` using the hard-coded "mock today" for consistency with mock data (see Deferred to Implementation). **Alternative:** use `new Date()` for real wall-clock — decide at implementation time. Lean toward `new Date()` for realism but document that tests must control `today` explicitly.
  - Renders `<AssetDetailHeader asset={asset} />`, then a two-column grid containing `<WarrantyBlock asset={asset} status={warrantyStatus} />` and `<VendorBlock vendor={vendor} />`.
- `asset-detail-header.tsx`: Presentational. Renders a glass card with:
  - Back link "← Back to inventory" linking to `/inventory`.
  - `<h1>{asset.name}</h1>` (page-title typography).
  - Muted row: `Tag: {tag} · Serial: {serial} · Category: {ASSET_CATEGORY_LABELS[category]}`.
  - An asset-status badge (reuse the checkinout `STATUS_BADGE_CLASS` idea — either extract it into a shared component in a follow-up or inline a small local map here; lean toward inlining to avoid scope creep, with a TODO comment for the eventual extraction).
- `warranty-block.tsx`: Presentational. Glass panel headed "Warranty & purchase". Three rows of label + value + optional relative:
  - **Purchase date:** `formatDate(asset.purchaseDate)` — or "—" when null.
  - **Purchase cost:** `formatCurrency(asset.purchaseCost)` — or "—" when null.
  - **Warranty expires:** `formatDate(asset.warrantyExpiresAt)` plus, when the expiration is within 60 days (past or future), a muted parenthetical from `formatRelativeDays(asset.warrantyExpiresAt, today)`. When `warrantyExpiresAt` is null, show "—".
  - Trailing row: `<WarrantyBadge status={status} />`.
- Labels use `text-xs font-semibold uppercase tracking-wide text-[#555555]` (matches styling.md).
- `vendor-block.tsx`: Presentational. Props: `{ vendor: Vendor | null }`. Glass panel headed "Vendor". When `vendor` is null, shows "Vendor no longer available" in muted text. When present, renders:
  - Vendor name as a `<Link href={`/vendors/${vendor.id}`}>` (bold red-linky).
  - Contact rows: email (mailto), phone (tel) when present, website (external) when present — same icon + link shape as the `vendor-card`.

**Patterns to follow:**
- [src/app/(dashboard)/checkinout/_components/asset-card.tsx](../../src/app/(dashboard)/checkinout/_components/asset-card.tsx) for the identity/status badge idea.
- [src/app/(dashboard)/checkinout/_components/history-list.tsx](../../src/app/(dashboard)/checkinout/_components/history-list.tsx) for the glass panel heading + rows shape.
- Next.js `notFound()` from `next/navigation`.
- `next/link` for the back link and vendor deep-link.

**Test scenarios:**
- Happy path (`asset-detail-page.test.tsx`): rendered against an asset with full warranty data, shows name, tag, serial, category, purchase date, purchase cost, warranty expiration, and the `WarrantyBadge` with the correct status. (Render the page component directly with mocked server-side data — same pattern as testing a server component with its props in isolation.)
- Edge case: rendered against an asset with `warrantyExpiresAt: null`, shows "—" for the expiration date and the `NO_WARRANTY` badge.
- Edge case: rendered against an asset with `purchaseCost: null`, shows "—" for cost.
- Edge case: rendered against an asset with `purchaseDate: null`, shows "—" for purchase date.
- Happy path: when the asset's `vendorId` matches a vendor, the vendor block renders the vendor name as a link to `/vendors/[id]` and shows the contact rows.
- Edge case: when the asset's `vendorId` is null or unknown, the vendor block renders "Vendor no longer available".
- Integration: against an asset whose `warrantyExpiresAt` is 10 days in the future (relative to the mock "today"), the warranty row shows the date with the parenthetical "in 10 days" and the badge renders `EXPIRING_SOON`.
- Integration: against an asset whose `warrantyExpiresAt` is 5 days in the past, the warranty row shows the date with "5 days ago" and the badge renders `EXPIRED`.

**Verification:**
- `pnpm dev` — navigating to `/inventory/<some-mock-asset-id>` shows the detail page with warranty block + vendor block.
- Hitting `/inventory/not-a-real-id` shows the Next.js not-found page.
- Clicking the vendor link navigates to `/vendors/[id]`.
- Clicking the back link navigates to `/inventory`.
- `pnpm test`, `pnpm typecheck`, `pnpm lint` all clean.

---

- [x] **Unit 7: Inventory warranty view (`/inventory`) + expiring alerts banner + filterable table**

**Goal:** Replace the `/inventory` stub with a v0 warranty-focused view: an alert banner showing the count of expired and expiring-soon assets (with deep-links that set the table filter), followed by a filterable table of all mock assets showing tag, name, warranty expiration, status badge, and linked vendor. Each table row links to `/inventory/[id]` (delivered in Unit 6). Explicitly labeled as a v0 warranty view.

**Requirements:** R11; Issue #11 AC "Expiring warranty alerts"

**Dependencies:** Units 1, 2, 6. (Unit 6 must exist because the table rows link to `/inventory/[id]`.)

**Files:**
- Modify: `src/app/(dashboard)/inventory/page.tsx` (convert stub to a Server Component that renders `<InventoryWarrantyView />` inside a header with the v0 notice)
- Create: `src/app/(dashboard)/inventory/_components/inventory-warranty-view.tsx`
- Create: `src/app/(dashboard)/inventory/_components/warranty-alert-banner.tsx`
- Create: `src/app/(dashboard)/inventory/_components/warranty-table.tsx`
- Test: `tests/components/warranty-alert-banner.test.tsx`
- Test: `tests/components/warranty-table.test.tsx`
- Test: `tests/components/inventory-warranty-view.test.tsx`

**Approach:**
- `page.tsx`: Server Component. Renders the header (`<h1>Inventory</h1>`, subtitle `"Warranty view — full inventory management coming with R2."`) and mounts `<InventoryWarrantyView />`.
- `inventory-warranty-view.tsx`: Client Component. Holds:
  - `const [filter, setFilter] = useState<WarrantyFilter>("ALL")` where `WarrantyFilter = "ALL" | "EXPIRED" | "EXPIRING_SOON" | "UNDER_WARRANTY" | "NO_WARRANTY"`
  - `const [bannerDismissed, setBannerDismissed] = useState(false)`
- Computes once per render:
  - `const today = new Date()` (real wall-clock — note that this makes tests that assert banner counts require injecting `today` somewhere or using `vi.useFakeTimers` + `vi.setSystemTime`. Decide at implementation time; lean toward exposing a `todayOverride?: Date` prop on `<InventoryWarrantyView />` defaulting to `new Date()`, so tests can pass `new Date("2026-04-11T00:00:00Z")` to match the mock seed. Document this override in a code comment as a test-only affordance.)
  - `const assetsWithStatus = MOCK_ASSETS.map(a => ({ asset: a, status: getWarrantyStatus(a.warrantyExpiresAt, today) }))`.
  - `const expiredCount = assetsWithStatus.filter(x => x.status === "EXPIRED").length`.
  - `const expiringCount = assetsWithStatus.filter(x => x.status === "EXPIRING_SOON").length`.
  - `const filteredAssets` — filters `assetsWithStatus` based on `filter` (when `"ALL"`, pass through).
- Renders:
  - `<WarrantyAlertBanner expiredCount={...} expiringCount={...} dismissed={bannerDismissed} onDismiss={() => setBannerDismissed(true)} onViewExpired={() => setFilter("EXPIRED")} onViewExpiring={() => setFilter("EXPIRING_SOON")} />` — hidden entirely when both counts are zero OR when dismissed.
  - A filter control row: five outline buttons (`All`, `Expired`, `Expiring soon`, `Under warranty`, `No warranty`) — the active one uses the primary red accent (`bg-red-500/[0.08] text-[#c80000]`). Clicking sets the filter.
  - `<WarrantyTable assets={filteredAssets} />`.
  - A sub-footer "Manage vendors →" outline link to `/vendors` (for easy navigation back to the vendors module).
- `warranty-alert-banner.tsx`: Presentational. Props: `{ expiredCount, expiringCount, dismissed, onDismiss, onViewExpired, onViewExpiring }`. Glass alert (`rounded-xl border border-red-500/20 bg-red-500/[0.06]`). Copy: `"N warranties expired, M expiring within 30 days"` (pluralize correctly when N/M == 1). Two outline action buttons: "View expired" (only when expiredCount > 0) and "View expiring" (only when expiringCount > 0). Dismiss X button on the right. Returns `null` when `dismissed === true` or when both counts are zero.
- `warranty-table.tsx`: Presentational. Props: `{ assets: Array<{ asset: Asset; status: WarrantyStatus }> }`. Renders a glass panel with a `<table>` (reusing shadcn `Table` primitives) containing columns: `Tag`, `Name`, `Warranty expires`, `Status`, `Vendor`. Each row:
  - Tag cell wraps the tag in a `<Link href={`/inventory/${asset.id}`}>`.
  - Warranty expires cell uses `formatDate(asset.warrantyExpiresAt)`.
  - Status cell renders `<WarrantyBadge status={status} />`.
  - Vendor cell looks up the vendor via `findVendorById(MOCK_VENDORS, asset.vendorId ?? "")` and renders the vendor name as a `<Link href={`/vendors/${vendor.id}`}>`, or `"—"` when no vendor.
- When `assets.length === 0`, renders an empty state inside the panel: "No assets match the current filter."
- All surfaces use glass tokens per [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Patterns to follow:**
- [src/app/(dashboard)/checkinout/_components/history-list.tsx](../../src/app/(dashboard)/checkinout/_components/history-list.tsx) for the "panel with empty state or rendered list" pattern.
- [src/components/ui/table.tsx](../../src/components/ui/table.tsx) shadcn primitives for the table scaffold.
- The `data-status` attribute discipline from `asset-card.tsx` for reliable test targeting.

**Test scenarios:**
- Happy path (`warranty-alert-banner.test.tsx`): rendered with `expiredCount=2, expiringCount=3`, shows "2 warranties expired, 3 expiring within 30 days".
- Edge case: rendered with `expiredCount=1, expiringCount=1`, shows singular "1 warranty expired, 1 expiring within 30 days".
- Edge case: rendered with `expiredCount=0, expiringCount=3`, shows only the "View expiring" button (not "View expired").
- Edge case: rendered with both counts zero, returns null (no DOM output — assert via `{ container }` from Testing Library).
- Edge case: rendered with `dismissed={true}`, returns null.
- Happy path: clicking "View expired" calls `onViewExpired` once.
- Happy path: clicking "View expiring" calls `onViewExpiring` once.
- Happy path: clicking the X dismiss button calls `onDismiss` once.
- Happy path (`warranty-table.test.tsx`): rendered against a non-empty asset list, renders one row per asset with the expected columns and the correct `WarrantyBadge` per row.
- Edge case: rendered with an empty array, renders the "No assets match the current filter." empty state.
- Integration: each row's tag cell contains an `<a>` pointing to `/inventory/<id>`; each row's vendor cell (when vendor exists) contains an `<a>` pointing to `/vendors/<id>`.
- Happy path (`inventory-warranty-view.test.tsx`): rendered with `todayOverride={new Date("2026-04-11T00:00:00Z")}`, shows the banner with counts matching the mock seed's actual expired/expiring counts (e.g., "2 warranties expired, 3 expiring within 30 days").
- Happy path: clicking the "View expired" button on the banner filters the table to only `EXPIRED` assets (assert count drops to 2).
- Happy path: clicking the "Expiring soon" filter button filters to only `EXPIRING_SOON` assets.
- Happy path: clicking the "All" filter resets the table to every asset.
- Happy path: clicking the banner's X dismiss button removes the banner from the DOM.
- Happy path: the "Manage vendors" link points to `/vendors`.

**Verification:**
- `pnpm dev` — `/inventory` renders the banner, filter buttons, table, and footer link.
- Clicking banner actions changes the filter selection visibly.
- Dismissing the banner hides it for the session; reload restores it.
- Clicking a row navigates to the asset detail page.
- `pnpm test`, `pnpm typecheck`, `pnpm lint` all clean.

---

- [x] **Unit 8: Cross-module smoke pass + lint/typecheck cleanup + visual polish**

**Goal:** Walk the full module end-to-end in the running dev server, tighten any visual or a11y rough edges, confirm every test file passes, and leave the codebase with zero lint/typecheck/test failures before handoff.

**Requirements:** Issue #11 — "Follow glassmorphism design system", CLAUDE.md testing mandate.

**Dependencies:** Units 1–7.

**Files:**
- No new files strictly required.
- Minor touch-ups allowed in any Unit 1–7 file to address visual/a11y findings.
- Possibly create: `tests/components/warranty-badge.test.tsx` rounding or a small additional integration test if the smoke pass surfaces a gap.

**Approach:**
- Run the full dev server and walk these flows manually (or document them if `pnpm dev` isn't available in CI):
  1. `/vendors` → Add vendor → fill form → submit → card appears → toast fires.
  2. `/vendors` → click a vendor card → detail page opens → Edit → change name → Save → header updates.
  3. `/vendors/<id>` → Delete → confirm → navigates back to `/vendors`, toast fires.
  4. `/inventory` → banner visible with correct counts → click "View expired" → table filters → click a row → asset detail page opens.
  5. `/inventory/<id>` → warranty block shows correct values → click vendor link → vendor detail page opens.
  6. Asset detail page for an asset with `warrantyExpiresAt: null` → shows "—" and "No warranty" badge.
  7. Asset detail page for an expired asset → shows "N days ago" and red "Expired" badge.
- A11y quick pass:
  - Every link has accessible text (no icon-only links without `aria-label`).
  - Every button has a visible or `aria-label`ed name.
  - Every form field has an associated label (shadcn `FormLabel` handles this).
  - Every `<Dialog>` has a `DialogTitle` and `DialogDescription`.
  - Icons are `aria-hidden="true"` when next to text.
  - Tables use `<th>` scope attributes.
  - Color contrast: the four warranty badges should pass WCAG AA. If the green or amber variants feel too light, bump opacity.
- Visual polish:
  - Hover states on cards and buttons animate smoothly (`transition-all duration-200`).
  - Dialog z-index doesn't clash with the sidebar.
  - The "UI-only preview — changes are not saved" notice is present on both `/vendors` and `/vendors/[id]`.
- Run the full test suite: `pnpm test` — every file from Units 1–7 passes, no skipped tests, no warnings about act() or unmounted components.
- Run `pnpm lint` and `pnpm typecheck` — clean.
- Scan for any TODO comments left behind; convert the "future work" ones into GitHub-issue-worthy lines in the plan's Deferred to Separate Tasks section if any new gaps were discovered during execution.

**Patterns to follow:**
- The post-implementation walk style used in the checkinout plan's Unit 7 (full workflow integration test + visual/a11y pass + lint/typecheck cleanup).

**Test scenarios:**
- Test expectation: none beyond re-running existing tests — this unit is a smoke + polish pass, not a behavior-adding unit.
- If the smoke pass reveals a behavior gap in Units 1–7, add or update the affected test file rather than writing new ones in this unit.

**Verification:**
- `pnpm test` — all files pass, 0 failures.
- `pnpm typecheck` — clean.
- `pnpm lint` — clean.
- Manual smoke walk completed successfully for all 7 flows above.
- Every acceptance criterion in Issue #11 that is in scope (all except "Prisma schema for Vendor model and warranty fields on Asset") is demonstrably visible in the running UI.

## System-Wide Impact

- **Interaction graph:** The three new surfaces (`/vendors`, `/vendors/[id]`, `/inventory`, `/inventory/[id]`) are self-contained and do not modify existing modules. The sidebar already links to `/vendors` and `/inventory`; no sidebar changes. The checkinout module's `Asset` type is **not** modified — the inventory module declares its own richer `Asset` locally per Key Technical Decisions.
- **Error propagation:** Server components use Next.js `notFound()` for unknown ids. Client forms surface Zod validation errors inline via shadcn `FormMessage` and a `sonner` toast is fired only on successful submit. No error boundaries added in this plan; the existing app-level boundary covers unexpected exceptions.
- **State lifecycle risks:** All state is `useState` inside client containers. Each page remount re-seeds from the mock arrays — a known v0 simplification. No localStorage, no cookies, no URL state. Vendor deletes are intentionally session-local and reset on reload (documented in code).
- **API surface parity:** None — this plan adds no server actions, no API routes, and no exported types that other modules consume. The new lib types (`Vendor`, `Asset` in inventory) are imported only by the new UI components.
- **Integration coverage:** Unit 8's smoke walk is the only cross-module exercise. Component tests stay within their own unit boundaries; there is no cross-page navigation test because mock state doesn't survive navigation (a real integration story requires the backend plan).
- **Unchanged invariants:** Prisma schema is not touched. The checkinout module's `Asset` type and behavior are not changed. Existing tests for checkinout, notifications, and configuration must still pass unchanged. The sidebar, layout, and page header styles are reused from the notifications/checkinout precedent.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Two `Asset` types (checkinout + inventory) cause TypeScript confusion or accidental imports from the wrong module | Key Technical Decision documents this explicitly; each module uses a path-based import (`@/lib/checkinout/types` vs `@/lib/inventory/types`) and tests target the correct module's types. Unit 1 includes a sanity check |
| `getWarrantyStatus` tests drift with the wall clock | Function takes `today: Date` as a parameter so tests inject a deterministic anchor. Named constant `EXPIRING_SOON_DAYS` avoids magic numbers |
| Mock data's "today" anchor (2026-04-11) drifts from the real wall clock in dev, making warranty badges look wrong weeks later | Document the anchor in `src/lib/inventory/mock-data.ts` header comment. The inventory warranty view uses real `new Date()` by default, so real-world drift only affects the dev experience, not test stability. When the backend plan lands, real DB data replaces the mock |
| Vendor detail "delete" not actually mutating any persistent array is confusing during manual QA (vendor reappears after navigation) | Footer notice "UI-only preview — changes are not saved" on both `/vendors` and `/vendors/[id]`; code comment on `handleDelete` making the behavior explicit; captured in Open Questions |
| Color contrast on the green/amber badges fails WCAG AA | Unit 8 a11y pass verifies contrast; bump opacity if needed before landing |
| shadcn `Dialog` already installed but not yet used for a delete-confirmation pattern — mounting two Dialogs (edit + delete) in one container could cause focus-trap conflicts | Both dialogs are controlled by their own `open` state; only one can be open at a time in normal UX; Unit 5's test verifies focus returns correctly after dialog close |
| Adding green/amber accent colors expands the glass palette beyond red-only | Contained to `WarrantyBadge` only; documented in Unit 2 so the pattern doesn't leak elsewhere. When the Design System is refreshed, these tokens move to `.claude/rules/styling.md` |
| `next/navigation` (`useRouter`, `notFound`) mocking in tests is easy to get wrong | Tests that rely on navigation mock at the top of the file with `vi.mock("next/navigation", ...)` exposing `push` and `notFound` as `vi.fn()`s — same pattern as any future checkinout test that needs routing |

## Documentation / Operational Notes

- No runbooks, monitoring, or deployment impact — UI-only plan.
- No environment variables added.
- No Prisma migrations.
- The new `/vendors/[id]` and `/inventory/[id]` dynamic routes should be discoverable via the sidebar (top-level `/vendors` and `/inventory`) and via cross-links from vendor cards and asset rows. No external documentation update needed until the backend plan lands.
- When the backend plan lands, the follow-up PR will:
  1. Add the `Vendor` Prisma model and warranty fields on `Asset`.
  2. Replace every `MOCK_*` import with a server action or a server component fetch.
  3. Merge `src/lib/checkinout/types.ts` and `src/lib/inventory/types.ts` into one shared module.
  4. Wire expiring-warranty alerts into the Notifications feed (R8) and the Dashboard (R1).

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R11 and R11a
- Related plans: [docs/plans/2026-04-11-002-feat-checkinout-ui-shell-plan.md](2026-04-11-002-feat-checkinout-ui-shell-plan.md), [docs/plans/2026-04-11-001-feat-notifications-ui-shell-plan.md](2026-04-11-001-feat-notifications-ui-shell-plan.md), [docs/plans/2026-04-10-001-feat-configuration-module-plan.md](2026-04-10-001-feat-configuration-module-plan.md)
- Related issue: #11 (Warranty & Vendor tracking)
- Style rules: [.claude/rules/styling.md](../../.claude/rules/styling.md), [.claude/rules/components.md](../../.claude/rules/components.md), [.claude/rules/conventions.md](../../.claude/rules/conventions.md)
- Testing rules: [CLAUDE.md](../../CLAUDE.md) — "every new feature must include tests before it is considered complete"
