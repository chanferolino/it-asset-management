---
date: 2026-04-09
topic: feature-scope
---

# IT Asset Management — Feature Scope

## Problem Frame

Building an internal IT asset management system for a small team (5-20 people). The dashboard menu covers core ITAM (inventory, assignments, tickets, reports, configuration, notifications). Three industry-standard features were identified as gaps worth filling without over-engineering.

## Requirements

### Core Menu (from dashboard-menu.md)

- R1. **Dashboard** — overview with key metrics (total devices, active users, open tickets, system health), recent alerts, and quick-action shortcuts
- R2. **Inventory** — hardware assets (computers, servers, networking, peripherals, mobile) with lifecycle/status tracking; software assets (licenses, installations, expiration); search, filter, bulk actions
- R3. **Assignments** — device-to-user tracking, checkout/return history, current status per user, department-level view
- R4. **Users** — accounts, roles, department assignments, access permissions, onboarding/offboarding tracking
- R5. **Tickets** — open tickets with status flow (New → In Progress → Resolved), assignment, priority, SLA tracking, knowledge base/FAQ
- R6. **Reports** — asset usage, ticket resolution time, downtime logs, user activity, audit logs, export (CSV, PDF)
- R7. **Configuration** — system settings, role/permission management, integrations, backup/restore
- R8. **Notifications** — real-time alerts (critical events, security incidents, scheduled maintenance), notification settings and history

### Additional Features

- R9. **Audit Log** — tracks who did what and when across the system (asset changes, assignments, logins). Nested under Reports, not a top-level sidebar item.
- R10. **Asset Check-in/Check-out** — desktop lookup by asset tag or serial number for quick device handoffs. No QR/camera scanning for now.
- R11. **Warranty & Vendor Tracking** — warranty expiration dates, vendor contacts, purchase dates, and costs per asset.

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
