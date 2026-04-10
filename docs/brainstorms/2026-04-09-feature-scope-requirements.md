---
date: 2026-04-09
topic: feature-scope
---

# IT Asset Management — Feature Scope

## Problem Frame

Building an internal IT asset management system for a small team (5-20 people). The dashboard menu covers core ITAM (inventory, assignments, tickets, reports, configuration, notifications). Three industry-standard features were identified as gaps worth filling without over-engineering.

## Requirements

### Core Menu (sidebar order)

- R1. **Dashboard** — overview with key metrics (total devices, active users, open tickets, system health), recent alerts, and quick-action shortcuts
- R2. **Inventory** — hardware assets (computers, servers, networking, peripherals, mobile) with lifecycle/status tracking; software assets (licenses, installations, expiration); search, filter, bulk actions
- R3. **Assignments** — device-to-user tracking, checkout/return history, current status per user, department-level view
- R10. **Check-in/Out** — desktop lookup by asset tag or serial number for quick device handoffs (promoted to top-level menu). No QR/camera scanning for now.
- R4. **Users** — accounts, roles, department assignments, access permissions, onboarding/offboarding tracking
- R11a. **Vendors** — top-level menu for vendor records: name, contact info (email, phone, website), and link to assets supplied. Vendor CRUD lives here; warranty fields per asset live in Inventory (see R11).
- R5. **Tickets** — open tickets with status flow (New → In Progress → Resolved), assignment, priority, SLA tracking, knowledge base/FAQ
- R6. **Reports** — asset usage, ticket resolution time, downtime logs, user activity, audit logs, export (CSV, PDF)
- R7. **Configuration** — system settings, role/permission management, integrations, backup/restore
- R8. **Notifications** — real-time alerts (critical events, security incidents, scheduled maintenance), notification settings and history

### Additional Features

- R9. **Audit Log** — tracks who did what and when across the system (asset changes, assignments, logins). Nested under Reports, not a top-level sidebar item.
- R11. **Warranty & Vendor Tracking** — warranty expiration dates, purchase dates, and costs per asset (fields on the Inventory asset detail page). Vendor management is its own top-level menu — see R11a above. Expiring-warranty alerts feed into Notifications (R8) and the Dashboard (R1).

### Auth

- R12. **Username + Password auth** — no external OAuth providers. Simple credentials-based login with bcrypt password hashing.

## Scope Boundaries

- No QR code or barcode camera scanning (desktop lookup only)
- No asset depreciation or financial cost tracking
- No CMDB, change management, or procurement workflows
- No Active Directory or external identity provider integration in v1
- Small team scale (5-20 people) — no multi-tenancy

## Key Decisions

- **Auth:** Username + password (no Google OAuth) — avoids external dependency for an internal tool
- **Audit log placement:** Under Reports — keeps sidebar clean for a small-team tool
- **Check-in/check-out:** Desktop lookup by asset tag/serial — phone scanning deferred
- **Check-in/Out promoted to top-level menu:** High-frequency operational workflow deserves quick access between Assignments and Users
- **Vendors as a top-level menu:** Vendor records are operational reference data (like Users), not admin settings — sits between Users and Tickets. Warranty fields stay co-located on the asset record in Inventory.

## Success Criteria

- IT admin can log in, manage assets end-to-end (add, assign, check-out, check-in, retire)
- All asset changes are tracked in an audit log
- Warranty/vendor info is visible on asset detail pages
- Dashboard gives a quick operational snapshot

## Outstanding Questions

### Deferred to Planning
- [Affects R5][Technical] Ticket system complexity — simple status tracking or full SLA enforcement with timers?
- [Affects R8][Technical] Real-time notifications implementation — polling, SSE, or WebSocket?
- [Affects R7][Needs research] What integrations are worth supporting in v1 vs deferring?

## Next Steps

→ `/ce:plan` for structured implementation planning
