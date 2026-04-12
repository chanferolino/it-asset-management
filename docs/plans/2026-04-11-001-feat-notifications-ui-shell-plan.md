---
title: "feat: Notifications module — UI shell (alerts, history, preferences, header bell)"
type: feat
status: active
date: 2026-04-11
origin: docs/brainstorms/2026-04-09-feature-scope-requirements.md
---

# feat: Notifications module — UI shell (alerts, history, preferences, header bell)

## Context

Issue #9 (R8) calls for a Notifications module: real-time alerts for critical system events / security incidents / scheduled maintenance, per-user notification preferences, and a notification history log — all on glassmorphism. Per the user, this plan covers **UI only**. Persistence, real-time transport (polling vs SSE vs WebSocket — still an open question in the origin doc), per-user preference storage, and any server actions are explicitly deferred to a follow-up plan once visibility is validated.

The current state is a 10-line stub at [src/app/(dashboard)/notifications/page.tsx](../../src/app/(dashboard)/notifications/page.tsx). The sidebar already has the Bell entry. This plan delivers the visual surface needed to validate the UX and unblocks the dashboard's "Notifications" entry without committing to a transport.

This work also delivers the cross-app **header bell + unread badge + recent items dropdown** so notifications are visible from every screen, not just the dedicated route.

## Problem Frame

A small-team IT ops tool needs an obvious place where admins/users can:
- See critical events (warranty expiring, security incident, maintenance window) at a glance from anywhere in the app
- Drill into a full history list with filtering
- Tune which categories they care about

Without a UI, downstream backend decisions (transport, schema, retention) are abstract. Building the visual shell first lets us iterate on the interaction model with mock data, then plug a real source behind the same components.

See origin: [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R8.

## Requirements Trace

- **R8** — Notifications: real-time alerts (critical events, security incidents, scheduled maintenance), notification settings, notification history (origin doc)
- **Issue #9 acceptance criteria:**
  - Real-time alerts for critical system events, security incidents, scheduled maintenance — *delivered as the header bell surface + Inbox list rendering, fed by mock data*
  - Notification settings (per-user preferences) — *delivered as the Preferences tab with a form (no persistence yet)*
  - Notification history log — *delivered as the Inbox tab list with filtering*
  - Follow glassmorphism design system ([.claude/rules/styling.md](../../.claude/rules/styling.md)) — *all surfaces use the established glass tokens*
- **CLAUDE.md testing mandate:** every new feature must ship with Vitest + Testing Library component tests for interactive pieces. (No server actions in this plan, so no integration tests; Playwright E2E is deferred until a real data source exists.)

## Scope Boundaries

- **No persistence** — preferences form does not save to a DB. Submit shows a toast and resets form dirty state in memory only.
- **No server actions** — everything client-side, fed by a static mock array. No `'use server'` files, no Prisma writes.
- **No real-time transport** — the "real-time" part of R8 (polling, SSE, or WebSocket) is the open question called out in the origin doc and is explicitly deferred. Mock data is rendered as if it were live.
- **No notification creation flow** — we render notifications, we don't write them. Asset/ticket/security events that *trigger* notifications are out of scope.
- **No Playwright E2E in this plan** — E2E gets added when there is a real data source to exercise. Component tests still ship.
- **Per-user preference storage is mocked** — the preferences form has hard-coded defaults; "current values" do not vary per logged-in user.
- **Bell unread count is derived from the same mock array** — no separate counter store.
- **No new shadcn components needed** — every primitive used (`badge`, `button`, `card`, `dropdown-menu`, `form`, `input`, `label`, `select`, `switch`, `tabs`) is already in [src/components/ui/](../../src/components/ui/).

### Deferred to Separate Tasks

- **Notifications backend (schema, server actions, transport choice)** — separate plan once UX is validated. Will resolve the R8 transport open question.
- **Per-user preference persistence** — depends on the backend plan above; the form schema written here is the contract that will be persisted later.
- **Trigger sources (warranty expiry job, security incident hooks, maintenance scheduler)** — each lives with its owning module (Inventory/Warranty for R11, Tickets for R5, Configuration for R7).
- **Playwright E2E for the notifications flow** — added with the backend plan.

## Context & Research

### Relevant Code and Patterns

- **Tabbed sub-route module pattern** — [src/app/(dashboard)/configuration/layout.tsx](../../src/app/(dashboard)/configuration/layout.tsx) and [src/app/(dashboard)/configuration/_components/config-tabs.tsx](../../src/app/(dashboard)/configuration/_components/config-tabs.tsx) are the canonical reference. The Notifications module mirrors this exactly: a Server Component layout that renders a title + tab nav, an `_components/<module>-tabs.tsx` client component that highlights the active sub-route via `usePathname`, and a `/<module>/page.tsx` server-redirect to the default tab. **Reuse this pattern verbatim.**
- **Glassmorphism tokens** — [.claude/rules/styling.md](../../.claude/rules/styling.md) — glass card (`rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`), glass panel (`rounded-2xl ... backdrop-blur-xl`), active nav (`bg-red-500/[0.08] text-[#c80000] font-medium`), inactive nav (`text-[#888888] hover:bg-red-500/[0.04] hover:text-[#7b0000]`), primary button (`bg-[#c80000] hover:bg-[#b10000]`), input (`rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm`).
- **Form pattern** — [src/app/(dashboard)/configuration/settings/_components/settings-form.tsx](../../src/app/(dashboard)/configuration/settings/_components/settings-form.tsx) shows the React Hook Form + Zod + sonner pattern with shadcn `Form` wrappers. Reuse for the Preferences form. The only difference is the submit handler: instead of calling a server action, it shows a "Preferences saved (UI only — backend pending)" toast.
- **Dashboard header location** — [src/app/(dashboard)/layout.tsx](../../src/app/(dashboard)/layout.tsx) lines 14–17. The bell mounts here, right-aligned, after the existing `SidebarTrigger`/`Separator`.
- **Sidebar already wired** — [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) line 43 — `Notifications → /notifications`. No sidebar change needed.
- **Existing notifications stub** — [src/app/(dashboard)/notifications/page.tsx](../../src/app/(dashboard)/notifications/page.tsx) — replace with a server-redirect to `/notifications/inbox`.
- **shadcn primitives present** — `badge.tsx`, `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `form.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `switch.tsx`, `tabs.tsx` are all already in [src/components/ui/](../../src/components/ui/). No `pnpm dlx shadcn add` needed.
- **Test infrastructure** — `tests/components/`, `tests/setup.ts` (jest-dom matchers), Vitest + Testing Library configured. Component tests in this plan follow the same shape established by the Configuration plan's component tests.
- **Utility** — `cn()` from [src/lib/utils.ts](../../src/lib/utils.ts) for class composition.

### Institutional Learnings

No `docs/solutions/` entries yet. The Configuration plan (just merged) is the first established module pattern; this plan should mirror it so the second example reinforces the convention.

### External References

Not used. Stack is well-known and the work is purely component composition over existing primitives.

## Key Technical Decisions

- **UI-only with mock data** — a single shared mock array in [src/lib/notifications/mock-data.ts](../../src/lib/notifications/mock-data.ts) feeds the Inbox page, the bell dropdown, and (indirectly) the unread count. **Rationale:** keeps all surfaces consistent and gives one obvious file to delete/replace when the backend lands.
- **Tabbed sub-routes** (`/notifications/inbox`, `/notifications/preferences`) — mirrors Configuration. **Rationale:** consistency across modules; `usePathname`-driven active state already proven; each tab is independently linkable.
- **Local interactivity via React state** — "mark as read", "dismiss", and category filters live in `useState` inside the inbox client component. **Rationale:** validates the UX without committing to a state model. Refresh resets — that's an acceptable v0 cost and is called out in the toast copy.
- **Notification shape pinned now** — TypeScript types live in [src/lib/notifications/types.ts](../../src/lib/notifications/types.ts) so the future backend has a fixed contract. Fields: `id`, `title`, `body`, `category` (`SYSTEM | SECURITY | MAINTENANCE | WARRANTY`), `severity` (`INFO | WARNING | CRITICAL`), `read` (boolean), `createdAt` (Date or ISO string), optional `link` (URL to drill into the source). **Rationale:** writing the type shape now means the backend plan only has to add a Prisma model and an action — no UI churn.
- **Header bell as a Client Component dropdown** — uses the existing shadcn `dropdown-menu` primitive, mounted in the dashboard header. Unread count is derived from the same mock array. **Rationale:** dropdown-menu is already proven elsewhere and gives keyboard a11y for free.
- **No new dependencies** — `react-hook-form`, `zod`, `@hookform/resolvers`, and `sonner` were added in the Configuration plan. No `pnpm add` needed here.
- **Preferences form schema is the future contract** — Zod schema in the form file defines the per-category toggles + delivery channel toggles. When the backend lands, the same schema is reused for the server action. **Rationale:** locks in the data shape early.

## Open Questions

### Resolved During Planning

- **Bell scope?** — Bell goes in the dashboard header (visible everywhere), in addition to the dedicated `/notifications` page. (User-confirmed.)
- **Page layout?** — Tabbed sub-routes (`/notifications/inbox`, `/notifications/preferences`), mirroring Configuration. (User-confirmed.)
- **Interactivity level?** — Local React state for mark-as-read, dismiss, filters, and preferences. No persistence; refresh resets. (User-confirmed.)
- **Which shadcn components are missing?** — None. All required primitives already exist.
- **Preference categories?** — Match the notification category enum (`SYSTEM`, `SECURITY`, `MAINTENANCE`, `WARRANTY`) plus delivery channel toggles (`In-app`, `Email`). Email toggle is decorative — no email is sent in this plan.

### Deferred to Implementation

- **Exact mock notifications copy** — 6–10 entries spanning all categories and severities; final wording is decided when writing [src/lib/notifications/mock-data.ts](../../src/lib/notifications/mock-data.ts).
- **Bell unread badge max display** — likely `9+` for counts ≥10, decided when writing the bell component.
- **Empty-state copy** — for the "no notifications" and "no results after filtering" states; written inline during Unit 3.
- **Whether the dropdown closes after clicking a notification item** — depends on dropdown-menu primitive defaults; default to closing on click.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Module surface (mirrors Configuration):**

| Surface | Route / Mount point | Client/Server | Data source |
|---|---|---|---|
| Module redirect | `/notifications` | Server | — |
| Tab nav | `/notifications/*` (layout) | Server layout + client tabs | — |
| Inbox tab | `/notifications/inbox` | Server page + client list | mock array |
| Preferences tab | `/notifications/preferences` | Server page + client form | mock defaults |
| Header bell | dashboard layout header | Client | mock array |

**Notification shape:**

```
Notification {
  id: string
  title: string
  body: string
  category: 'SYSTEM' | 'SECURITY' | 'MAINTENANCE' | 'WARRANTY'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  read: boolean
  createdAt: string  // ISO; UI parses to Date for relative formatting
  link?: string
}
```

**Severity → glass accent mapping** (directional, not literal CSS):

```
INFO     → neutral gray border, no badge accent
WARNING  → amber-tinted border, "Warning" badge
CRITICAL → red-500/20 border, "Critical" badge in red-600
```

## Output Structure

```
src/
  app/
    (dashboard)/
      notifications/
        page.tsx                                  # server redirect → /notifications/inbox
        layout.tsx                                # title + NotificationsTabs
        _components/
          notifications-tabs.tsx                  # client; usePathname active state
        inbox/
          page.tsx                                # server; renders <NotificationList />
          _components/
            notification-list.tsx                 # client; useState for read/dismiss/filter
            notification-item.tsx                 # presentational
            notification-filters.tsx              # client; category + read-state filter
        preferences/
          page.tsx                                # server; renders <PreferencesForm />
          _components/
            preferences-form.tsx                  # client; RHF + Zod, toast on submit
  components/
    notifications-bell.tsx                        # client; header dropdown
  lib/
    notifications/
      types.ts                                    # Notification, NotificationCategory, NotificationSeverity
      mock-data.ts                                # MOCK_NOTIFICATIONS array
tests/
  components/
    notification-item.test.tsx
    notification-list.test.tsx
    notification-filters.test.tsx
    preferences-form.test.tsx
    notifications-bell.test.tsx
```

## Implementation Units

- [ ] **Unit 1: Notification types and mock data**

**Goal:** Establish the shared TypeScript contract for a notification and a representative mock dataset that all UI surfaces consume.

**Requirements:** R8; Issue #9 — all ACs (foundation)

**Dependencies:** None.

**Files:**
- Create: `src/lib/notifications/types.ts`
- Create: `src/lib/notifications/mock-data.ts`

**Approach:**
- `types.ts` exports `NotificationCategory` (string-literal union: `'SYSTEM' | 'SECURITY' | 'MAINTENANCE' | 'WARRANTY'`), `NotificationSeverity` (`'INFO' | 'WARNING' | 'CRITICAL'`), and a `Notification` interface matching the shape in the High-Level Technical Design section. Also export small helper constants: `NOTIFICATION_CATEGORIES` (array, for filter dropdowns) and `NOTIFICATION_SEVERITIES`.
- `mock-data.ts` exports `MOCK_NOTIFICATIONS: Notification[]` with 6–10 entries spanning all four categories and all three severities. Mix `read: true` and `read: false`. Use realistic copy ("MacBook Pro warranty expires in 14 days", "Failed login attempt for admin@example.com", "Scheduled maintenance: 2026-04-15 22:00 UTC", etc.). Use static ISO strings so snapshots are stable.
- No imports from `react`, no client-only code — both files must be safe to import from Server and Client Components.

**Patterns to follow:**
- Plain TypeScript module shape; no Prisma references.
- Place under `src/lib/notifications/` to keep the module self-contained.

**Test scenarios:**
- Test expectation: none — pure data and types, no behavior to test. Coverage comes implicitly through Units 3, 4, and 5 component tests that consume the mock array.

**Verification:**
- `pnpm typecheck` clean.
- Importing `MOCK_NOTIFICATIONS` from another file produces correctly typed `Notification[]`.

---

- [ ] **Unit 2: Notifications module layout, redirect, and tabs**

**Goal:** Replace the notifications stub with a tabbed module shell mirroring the Configuration pattern.

**Requirements:** R8; Issue #9 AC "Follow glassmorphism design system"

**Dependencies:** None (can land in parallel with Unit 1).

**Files:**
- Modify: `src/app/(dashboard)/notifications/page.tsx` (turn into a server redirect to `/notifications/inbox`)
- Create: `src/app/(dashboard)/notifications/layout.tsx`
- Create: `src/app/(dashboard)/notifications/_components/notifications-tabs.tsx`

**Approach:**
- `page.tsx`: Server Component that calls `redirect("/notifications/inbox")` — same shape as [src/app/(dashboard)/configuration/page.tsx](../../src/app/(dashboard)/configuration/page.tsx).
- `layout.tsx`: Server Component. Renders the page title (`"Notifications"`) and subtitle (`"Real-time alerts and notification history."`) inside the same `space-y-2` header used by Configuration, then a glass panel wrapping `<NotificationsTabs />`, then `{children}`. **No auth guard** — notifications are visible to all signed-in users (unlike Configuration which requires admin).
- `notifications-tabs.tsx`: Client Component (`"use client"`). Mirrors [src/app/(dashboard)/configuration/_components/config-tabs.tsx](../../src/app/(dashboard)/configuration/_components/config-tabs.tsx) verbatim — `usePathname()`, `pathname.startsWith(tab.href)`, same active/inactive class strings. Two tabs: `{ href: "/notifications/inbox", label: "Inbox" }`, `{ href: "/notifications/preferences", label: "Preferences" }`.

**Patterns to follow:**
- [src/app/(dashboard)/configuration/layout.tsx](../../src/app/(dashboard)/configuration/layout.tsx) — exact structural twin minus the `requireAdmin()` line.
- [src/app/(dashboard)/configuration/_components/config-tabs.tsx](../../src/app/(dashboard)/configuration/_components/config-tabs.tsx) — exact pattern for the tab nav.
- Glass panel: `rounded-2xl border border-white/80 bg-white/70 p-1 backdrop-blur-xl`.

**Test scenarios:**
- Test expectation: none — purely structural/presentational. The tab navigation behavior is identical to the already-tested ConfigTabs and adds no new logic worth retesting; visiting `/notifications` correctly redirecting and the active tab highlight working are validated by Unit 3 and Unit 4 page tests when they mount inside this layout.

**Verification:**
- Visiting `/notifications` in dev redirects to `/notifications/inbox`.
- The tab row is visible and the active tab is styled red.
- `pnpm typecheck` and `pnpm lint` clean.

---

- [ ] **Unit 3: Inbox tab — list, item, filters, and local interactivity**

**Goal:** Render the notification history list with category/read-state filtering and local mark-as-read / dismiss interactions.

**Requirements:** R8; Issue #9 AC "Notification history log", "Real-time alerts for critical system events..."

**Dependencies:** Unit 1 (types + mock data), Unit 2 (layout).

**Files:**
- Create: `src/app/(dashboard)/notifications/inbox/page.tsx`
- Create: `src/app/(dashboard)/notifications/inbox/_components/notification-list.tsx`
- Create: `src/app/(dashboard)/notifications/inbox/_components/notification-item.tsx`
- Create: `src/app/(dashboard)/notifications/inbox/_components/notification-filters.tsx`
- Test: `tests/components/notification-item.test.tsx`
- Test: `tests/components/notification-list.test.tsx`
- Test: `tests/components/notification-filters.test.tsx`

**Approach:**
- `page.tsx`: Server Component. Imports `MOCK_NOTIFICATIONS` and passes it as `initialNotifications` prop to `<NotificationList />`. Wraps the list in the same outer glass card used by Configuration's settings page (`rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl`). Includes a small heading row ("Inbox" + count of unread).
- `notification-list.tsx`: Client Component. Holds `useState<Notification[]>` seeded from `initialNotifications`. Holds `useState` for filter state (`category: 'ALL' | NotificationCategory`, `showRead: boolean`). Renders `<NotificationFilters />` above the list and maps the filtered array to `<NotificationItem />` rows. Provides `onMarkAsRead(id)`, `onMarkAllRead()`, and `onDismiss(id)` callbacks that update local state. Renders an empty state when filtered list is empty.
- `notification-item.tsx`: Presentational. Renders one row inside a glass panel with: severity badge (color from the High-Level Technical Design mapping), category label, title (bold, `text-[#300000]`), body (`text-[#888888]`), relative timestamp (e.g., "2 hours ago" — use `Intl.RelativeTimeFormat`, no extra dependency), and a small action row with "Mark as read" (hidden if already read) and "Dismiss" buttons. Unread items get a left border accent (`border-l-4 border-l-[#c80000]`).
- `notification-filters.tsx`: Client. Renders a category `Select` (uses shadcn `select`) and a "Show read" `Switch` (uses shadcn `switch`). Calls back to parent on change. Includes a "Mark all as read" button.

**Patterns to follow:**
- Glass card outer wrapper from [src/app/(dashboard)/configuration/settings/page.tsx](../../src/app/(dashboard)/configuration/settings/page.tsx).
- Button styles from [.claude/rules/styling.md](../../.claude/rules/styling.md): primary `bg-[#c80000]`, outline `border border-[#e0e0e0] text-[#7b0000]`.
- Typography: title `text-[#300000] font-bold`, body `text-[#888888]`, labels `text-xs font-semibold uppercase tracking-wide text-[#555555]`.
- Use `cn()` from [src/lib/utils.ts](../../src/lib/utils.ts) for the conditional unread border class.

**Test scenarios:**
- Happy path (`notification-item.test.tsx`): renders title, body, category label, severity badge, and timestamp from a sample `Notification`.
- Happy path: a `read: false` notification renders the unread accent class and a visible "Mark as read" button; a `read: true` notification does not.
- Edge case: a `severity: 'CRITICAL'` notification renders the "Critical" badge with the red accent class; `INFO` renders without a severity badge.
- Happy path (`notification-list.test.tsx`): renders one item per notification in `initialNotifications`.
- Happy path: clicking "Mark as read" on an unread item flips its state and the unread accent disappears.
- Happy path: clicking "Dismiss" removes the item from the rendered list.
- Happy path: clicking "Mark all as read" clears the unread accent on every item.
- Edge case: when filtered to a category with no matches, the empty state copy is rendered.
- Happy path (`notification-filters.test.tsx`): changing the category Select calls the parent callback with the new value.
- Happy path: toggling the "Show read" Switch calls the parent callback with the new boolean.
- Integration (component-level): rendering `<NotificationList />` with a 4-item mock, switching the category filter to one specific category, then asserting only matching items are visible — proves the filter wiring works end-to-end across the three components.

**Verification:**
- `/notifications/inbox` renders the mock items with correct styling.
- All component tests pass (`pnpm test`).
- Mark as read / dismiss / filter visibly work in the browser.

---

- [ ] **Unit 4: Preferences tab — form with toggles (no persistence)**

**Goal:** Render a per-user preferences form with category toggles and delivery channel toggles, validated by Zod and submitted to a no-op handler that shows a sonner toast.

**Requirements:** R8; Issue #9 AC "Notification settings (per-user preferences)"

**Dependencies:** Unit 1 (types — the form imports `NotificationCategory`), Unit 2 (layout).

**Files:**
- Create: `src/app/(dashboard)/notifications/preferences/page.tsx`
- Create: `src/app/(dashboard)/notifications/preferences/_components/preferences-form.tsx`
- Test: `tests/components/preferences-form.test.tsx`

**Approach:**
- `page.tsx`: Server Component. Renders the same outer glass card wrapper as the inbox page, with a heading ("Preferences") and subtitle ("Choose which notifications you want to receive and how."). Mounts `<PreferencesForm />` with hard-coded `defaultValues` (all categories enabled, in-app on, email off).
- `preferences-form.tsx`: Client Component. Defines a co-located Zod schema with one boolean per category (`system`, `security`, `maintenance`, `warranty`) and one boolean per delivery channel (`inApp`, `email`). Infers the type with `z.infer`. Wires `useForm` with `zodResolver` and the `defaultValues` prop. Renders shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` wrappers — one section for "Notify me about" (the four category switches) and one for "Delivery" (the two channel switches). Submit handler **does not call any server action**; it shows `toast.success("Preferences saved (UI only — backend pending)")` from sonner and resets the form's `dirty` state via `form.reset(values)`.
- The Zod schema is exported from the form file so the future backend plan can import it for the server action without rewriting.
- Switches use the shadcn `Switch` primitive with the standard glass styling.

**Patterns to follow:**
- [src/app/(dashboard)/configuration/settings/_components/settings-form.tsx](../../src/app/(dashboard)/configuration/settings/_components/settings-form.tsx) — exact RHF + Zod + sonner shape. The only structural difference is the submit handler body (no server action call).
- Co-locate the Zod schema in the same file per [.claude/rules/conventions.md](../../.claude/rules/conventions.md).
- Glass input/switch styling per [.claude/rules/styling.md](../../.claude/rules/styling.md).

**Test scenarios:**
- Happy path: form renders six switches (4 categories + 2 channels) with the expected default values pre-set.
- Happy path: toggling a switch updates its `aria-checked` / `data-state` attribute.
- Happy path: clicking Save calls `toast.success` (mock sonner) and the form is no longer dirty.
- Edge case: Zod schema rejects a payload missing a required boolean — verified by direct schema parse, not via the form (since the form's defaultValues always satisfy the schema).
- Edge case: form does not call any server action — verified by ensuring no fetch / server action is invoked on submit (or simply by inspecting the file: this is more of a code review check than a runtime test).

**Verification:**
- `/notifications/preferences` renders the form with all defaults visible.
- Toggling switches and clicking Save shows the toast.
- `pnpm test` passes the new component test file.

---

- [ ] **Unit 5: Header bell — unread badge and recent items dropdown**

**Goal:** Add a notification bell to the dashboard header that shows an unread count badge and a dropdown panel listing the most recent notifications, with a footer link to `/notifications/inbox`.

**Requirements:** R8; Issue #9 AC "Real-time alerts for critical system events..." (cross-app visibility surface)

**Dependencies:** Unit 1 (types + mock data).

**Files:**
- Create: `src/components/notifications-bell.tsx`
- Modify: `src/app/(dashboard)/layout.tsx` (mount the bell in the header, right-aligned)
- Test: `tests/components/notifications-bell.test.tsx`

**Approach:**
- `notifications-bell.tsx`: Client Component (`"use client"`). Imports `MOCK_NOTIFICATIONS` from Unit 1 and computes `unreadCount = notifications.filter(n => !n.read).length` (initial render only; no live updates in this plan). Renders the lucide `Bell` icon inside a button trigger. If `unreadCount > 0`, overlays a small red badge in the top-right corner of the icon showing the count, capped at `9+`.
- Trigger opens a shadcn `DropdownMenu` panel styled as a glass surface (`rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl`). Panel content:
  - Header row: "Notifications" + "Mark all as read" link (sets local state).
  - Up to 5 most recent notifications (sorted by `createdAt` desc), each rendered as a compact row: severity dot, title (truncated to one line), relative timestamp.
  - Empty state: "No notifications" if the list is empty.
  - Footer row: link to `/notifications/inbox` ("View all").
- Local `useState` mirrors the inbox tab's pattern (mark-as-read flips local state). The bell and the inbox **do not share state** — they each maintain independent local copies of the same starting array. This is a deliberate v0 simplification; the backend plan will add a shared store. Document this in a one-line comment (the "why" is non-obvious).
- Mount in `src/app/(dashboard)/layout.tsx`: insert into the existing `<header>` after the `Separator`, right-aligned (`ml-auto`). Add `import { NotificationsBell } from "@/components/notifications-bell"` at the top.
- Use the existing lucide `Bell` icon already imported in [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx) (no new icon dependency).
- Active button styling: `text-[#888888] hover:bg-red-500/[0.04] hover:text-[#7b0000] rounded-xl transition-all`. Badge: `absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-[#c80000] text-white text-[10px] font-semibold flex items-center justify-center px-1`.

**Patterns to follow:**
- shadcn `dropdown-menu` usage — refer to [src/components/ui/dropdown-menu.tsx](../../src/components/ui/dropdown-menu.tsx) for the available subcomponents.
- Glass dropdown panel styling per [.claude/rules/styling.md](../../.claude/rules/styling.md).
- Header layout (where to mount): [src/app/(dashboard)/layout.tsx](../../src/app/(dashboard)/layout.tsx) lines 14–17.

**Test scenarios:**
- Happy path: with mock data containing N unread items, the bell renders the badge with text `String(N)`.
- Edge case: with 10+ unread items, the badge renders `"9+"`.
- Edge case: with all items read, no badge is rendered.
- Happy path: clicking the bell opens the dropdown panel and the panel contains the 5 most recent notifications by `createdAt` desc.
- Happy path: the dropdown footer contains an anchor pointing to `/notifications/inbox`.
- Happy path: clicking "Mark all as read" inside the dropdown clears the badge and updates the rendered rows so no row shows the unread severity dot.
- Edge case: with an empty mock array, the dropdown renders the "No notifications" empty state and no badge is shown on the bell.

**Verification:**
- The bell appears in the top-right of every dashboard page.
- Unread count matches the mock data on first render.
- Dropdown opens on click, lists recent items, and links to the full inbox.
- All component tests pass.

---

- [ ] **Unit 6: Visual / a11y pass and lint cleanup**

**Goal:** Walk every new surface in the browser, verify glassmorphism fidelity, and resolve any lint or typecheck issues introduced by Units 1–5.

**Requirements:** Issue #9 AC "Follow glassmorphism design system"; CLAUDE.md `pnpm lint` / `pnpm typecheck` cleanliness.

**Dependencies:** Units 1–5.

**Files:**
- No new files. May modify any of the Unit 1–5 files for class fixes, copy fixes, or a11y attributes.

**Approach:**
- Run `pnpm dev` and visit each surface: `/notifications`, `/notifications/inbox`, `/notifications/preferences`, plus the bell from any page. Confirm:
  - All cards/panels use the correct glass tokens.
  - Active tab styling matches Configuration exactly.
  - Severity colors match the mapping in the High-Level Technical Design section.
  - Buttons and switches use the documented hover/active styles.
  - Empty states are visible when filters exclude everything / when all read.
- Confirm a11y basics: bell trigger has an accessible name (`aria-label="Notifications"`), badge has `aria-label` with the unread count, dropdown items are keyboard-reachable, switches and selects have associated labels via shadcn `FormLabel`.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` and resolve any failures.
- Quick visual diff against the Configuration module to confirm the two modules feel like siblings.

**Test scenarios:**
- Test expectation: none — this is a manual QA + cleanup unit. Coverage for new behavior already lives in Units 3, 4, and 5 component tests.

**Verification:**
- `pnpm lint` clean.
- `pnpm typecheck` clean.
- `pnpm test` green.
- Manual walkthrough confirms every surface matches glassmorphism.

## System-Wide Impact

- **Interaction graph:** Only one shared touchpoint outside the new module — the dashboard header in [src/app/(dashboard)/layout.tsx](../../src/app/(dashboard)/layout.tsx) gains the bell. No other layouts, server actions, or global state are touched.
- **Error propagation:** Pure client-side state; no error boundaries needed beyond React defaults. The preferences "save" path has no failure mode in this plan (no I/O).
- **State lifecycle risks:** Bell and inbox each maintain independent local state from the same mock seed. Marking an item read in one place will not reflect in the other — this is documented as a deliberate v0 simplification and is the first thing the backend plan will fix. Refresh resets all state. Both behaviors are acceptable for a UI-only validation pass.
- **API surface parity:** None — no public API routes, no server actions, no Prisma writes.
- **Integration coverage:** None needed — there are no cross-layer interactions to test. Component tests cover all behavioral surfaces.
- **Unchanged invariants:** The dashboard layout structure (sidebar + header + main content), the Configuration module, the auth flow, and every existing route are untouched. The sidebar Notifications entry already exists and gets no behavioral change. The `Setting` model's `notificationsEnabled` field is unrelated to this UI-only plan and is not read or written here.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Mock data drift between bell and inbox confuses reviewers | Both components import from the same `MOCK_NOTIFICATIONS` source. Independent local state divergence is documented in code and in this plan. |
| The deferred backend changes the notification shape | The `Notification` interface in `src/lib/notifications/types.ts` is intentionally minimal and matches what a Prisma model would produce. The backend plan can extend without breaking. |
| Preferences form schema doesn't survive backend integration | Zod schema is exported from the form file specifically so the future server action can re-import it. Any field churn is a single-file change. |
| Bell badge accessibility is overlooked | Unit 6 explicitly checks `aria-label` on the trigger and badge; the component test asserts the rendered count text which doubles as a screen-reader cue. |
| Glassmorphism inconsistency with Configuration | Unit 6 includes a manual side-by-side visual pass against the Configuration module. |
| The deferred E2E leaves a gap in the testing mandate | Component tests cover every interactive surface in this plan. E2E is added with the backend plan when there is a real data path to exercise; this trade-off is called out explicitly in Scope Boundaries. |

## Documentation / Operational Notes

- **No README update needed** — no new env vars, no new commands, no migration. The existing `pnpm dev` flow exposes everything.
- **No production rollout steps** — pure UI; deploys with the next merge to `main`.
- **Future-plan handoff note** — when the backend plan starts, its first action should be to delete `src/lib/notifications/mock-data.ts` and replace `MOCK_NOTIFICATIONS` imports with a server-side Prisma query that returns the same `Notification[]` shape. The bell and inbox components should not need to change their props.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-09-feature-scope-requirements.md](../brainstorms/2026-04-09-feature-scope-requirements.md) — R8
- **GitHub issue:** chanferolino/it-asset-management #9 — "feat: Notifications — real-time alerts and history"
- **Reference plan:** [docs/plans/2026-04-10-001-feat-configuration-module-plan.md](2026-04-10-001-feat-configuration-module-plan.md) — module pattern this plan mirrors
- **Rules:** [.claude/rules/conventions.md](../../.claude/rules/conventions.md), [.claude/rules/components.md](../../.claude/rules/components.md), [.claude/rules/styling.md](../../.claude/rules/styling.md), [.claude/rules/structure.md](../../.claude/rules/structure.md)
- **Related code:** [src/app/(dashboard)/layout.tsx](../../src/app/(dashboard)/layout.tsx), [src/app/(dashboard)/configuration/layout.tsx](../../src/app/(dashboard)/configuration/layout.tsx), [src/app/(dashboard)/configuration/_components/config-tabs.tsx](../../src/app/(dashboard)/configuration/_components/config-tabs.tsx), [src/app/(dashboard)/configuration/settings/_components/settings-form.tsx](../../src/app/(dashboard)/configuration/settings/_components/settings-form.tsx), [src/app/(dashboard)/notifications/page.tsx](../../src/app/(dashboard)/notifications/page.tsx), [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx), [src/components/ui/dropdown-menu.tsx](../../src/components/ui/dropdown-menu.tsx), [src/lib/utils.ts](../../src/lib/utils.ts)
