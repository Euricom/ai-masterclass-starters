# PRD — Timesheet Zone

Product requirements document for the Euricom time tracking and leave management application. Derived from [`requirements.md`](./requirements.md) and the mockups in [`./images/`](./images/). Architectural options are documented separately in [`architecture.md`](./architecture.md).

## Problem Statement

Euricom consultants spend time on client contracts and also take various types of leave (holiday, ADV, sick leave, seniority days, etc.). Today there is no single, trustworthy place where a consultant can:

- Enter how many hours they worked on each contract/task, per day of the week.
- See a month-level overview of what they entered, track which weeks are approved, and spot gaps.
- Check their remaining leave balance for the year.

At the same time, administrators, client managers, and financial controllers need a controlled way to configure the data that consultants pick from — customers, contracts, tasks, users, roles, and leave types — and to get a view on entered and approved time across the company.

Without this, timesheet data lives in ad-hoc spreadsheets and individual memory, which breaks payroll, invoicing, and leave balance tracking.

## Solution

A web application — **Timesheet Zone** — with two halves:

1. **Consultant-facing** — a weekly *Time entry* grid, a monthly *Timesheets* overview, and a yearly *Leave overview*. A consultant picks contracts/tasks and leave types from curated lists, enters hours with keyboard shortcuts, and submits the week for approval.
2. **Admin-facing** — CRUD screens for *Customers*, *Contracts*, *Users* (with per-user leave balances), and *Leave Types*, plus global *Settings* (company, payroll, fiscal year, week-submit invitations).

The app is authenticated via Azure Entra ID (Authorization Code + PKCE, planned). Roles (Consultant, Admin, SysAdmin, Financial controller, Client manager) gate which screens and actions are visible.

## User Stories

### Time Entry (Prio 1)

1. As a consultant, I want to see a week-based time entry grid with one row per task or leave, so I can enter my hours for the whole week on a single page.
2. As a consultant, I want to add a task row by picking from a list filtered to the contracts and customers I'm assigned to, so I never enter hours against a contract I'm not on.
3. As a consultant, I want to add a leave row by picking from the list of leave types allowed for me, so I cannot accidentally book a leave type I'm not entitled to.
4. As a consultant, I want to enter time per day in the range `00:15`–`8:00`, so partial and full-day entries are both supported.
5. As a consultant, I want to use the hotkeys `d` (full day), `h` (half day), and `del` (clear the field) while in a cell, so I can fill a week quickly without the mouse.
6. As a consultant, I want weekend days and public holidays to be non-editable in the grid, so I don't accidentally book time on a non-working day.
7. As a consultant, I want to see a row-total per task/leave and a column-total per day plus a week total, so I can verify completeness before submitting.
8. As a consultant, I want to navigate to the previous/next week, jump to a specific date via a calendar, or return to "Today", so I can correct past weeks without losing my place.
9. As a consultant, I want my entries to be saved automatically when I navigate away from the page or change week, so I don't lose data if I forget to click save.
10. As a consultant, I want to submit the week for approval, so the week is marked `approved` and locked from further edits.
11. As a consultant, I want the current week's approval status to be visible at the top of the grid, so I know whether I can still edit it.

### Timesheets (Prio 1)

12. As a consultant, I want a month-level calendar of my time entries, so I can see at a glance what I booked each day.
13. As a consultant, I want approved weeks to be rendered in a darker highlight than entered-but-not-approved weeks, so approval progress is obvious.
14. As a consultant, I want to see a per-task summary of days in the selected month (e.g. "9 days Euricom – Internal Affairs"), so I can verify my monthly allocation.
15. As a consultant, I want to navigate previous/next month or jump to "Today", so I can review past or current months.

### Timesheets (Prio 2)

16. As a consultant, I want to click a day-entry in the monthly calendar and land on the corresponding week in Time Entry, so I can quickly correct a specific day.
17. As a consultant, I want a per-task (per-customer) timesheet view showing every day of the month for that task with the booked hours and billable days, so I can share a clean customer-facing sheet.

### Leave Overview (Prio 1)

18. As a consultant, I want a full-year calendar of my taken leave days, so I see the shape of my year at a glance.
19. As a consultant, I want to navigate to previous/next year, so I can review historical leave or plan ahead.
20. As a consultant, I want a balance panel showing, per leave type, the total, taken, and remaining days for the selected year, so I know what I have left.
21. As a consultant, I want the current date and weekends to be visually distinct in the calendar, so scanning is easier.

### Leave Overview (Prio 2)

22. As a consultant, I want school and public holidays for Belgium to be auto-fetched from `openholidaysapi.org` and shown in the calendar, so I can plan around them.
23. As a consultant, I want to click a day in the leave calendar and jump to Time Entry for that week, so I can correct a misbooked leave day.

### Customers (admin)

24. As an admin, I want to see a filterable, sortable list of customers with customer number, name, client manager, VAT, contact person, invoicing channel (e.g. Peppol), email, GTC status, and contract start date, so I can locate and manage customer records.
25. As an admin, I want a toggle to show only active customers, so inactive records don't clutter the view.
26. As an admin, I want to add a new customer and have the customer number auto-generated, so I can't create duplicates or typos.
27. As an admin, I want to enter a customer's address (street, zip, city, country) and contact person (name, email), so invoicing and communication have correct details.
28. As a client manager (Prio 2), I want to be assignable as the responsible contact on a customer, so customers map to an internal owner.

### Contracts (admin)

29. As an admin, I want a filterable list of contracts scoped by client manager and active/inactive state, so I can see the contracts I'm responsible for.
30. As an admin, I want each contract to carry an auto-generated contract number, linked customer, subject (typically project name), assigned consultant, task (name + day rate), start date, end date, and document status (Signed / Pending client / Unsigned), so I have everything required for billing.
31. As an admin, I want the contract's subject to appear on the consultant's time entry grid, so the consultant recognises which project the row represents.
32. As an admin, I want only contracts whose date range covers the selected week to appear in the consultant's "Add task" picker, so consultants can't book outside a contract's validity.
33. As a client manager (Prio 2), I want to be assignable to a contract independently of the customer-level client manager, so ownership can differ per contract.
34. As an admin, I want to clone an existing contract as a starting point for a renewal/extra contract, so I don't re-type shared fields.

### Users (admin)

35. As an admin, I want a filterable user list showing personnel number, first/last name, nickname, consultant type (Employee/…), staff flag, and roles, so I can locate users.
36. As an admin, I want a toggle to show only active users, so ex-employees don't clutter the list.
37. As an admin, I want to create/edit a user's general profile — first name, last name, nickname, consultant type, personnel number, active flag, staff flag, start date, end date, email, phone number, hours per day, Dima code, title, and roles — so user records are complete.
38. As an admin, I want to pick one or more roles from {Consultant, Admin, SysAdmin, Financial controller, Client manager}, so access to features can be granted appropriately.
39. As an admin, I want each user to have a list of leave entitlements per year, each with name, allowed mode (Allowed / Not allowed / Limited), total days, taken days, balance days, and year, so I can manage individual leave setups.
40. As an admin, when I create a new user I want leave entitlements to be prefilled (`Verlof: 20`, `ADV: 5`, `Anciënniteit: 0`, `Ziekte: 0`) for the current year, so onboarding is fast.
41. As an admin, I want to edit a single leave entitlement in a modal that shows Name, Allowed, Total, Taken (read-only), Balance (read-only), and Year, so I can adjust quotas without opening the full user form.
42. As an admin, I want the Taken and Balance fields to be computed from booked leave in Time Entry, so the numbers stay in sync automatically.

### Leave Types (admin)

43. As an admin, I want a list of account-wide leave types with leave type name, payroll code, reporting code, group (Holiday / Illness / Leave / Leave.Unpaid), priority within its group, default days, and default allowed mode, so I can configure the leave catalog.
44. As an admin, I want a color-coded indicator per leave type, so leaves are visually distinguishable in the calendar views.
45. As an admin, I want to delete a leave type from the list, so obsolete codes can be retired.

### Settings (admin)

46. As an admin, I want a central settings page grouped into General (company name, legal entity number, display date format, ePrinter address, fiscal year, start of fiscal year), Payroll (hours per day, overtime payroll code, month for payroll export), Week submit invitations (send on day, at time), and Contact information (phone, email, website), so company-wide configuration lives in one place.

### Cross-cutting

47. As any authenticated user, I want to sign in via Azure Entra ID with PKCE, so I don't manage a separate password for this app.
48. As any authenticated user, I want a persistent header showing the product name and my first name, and a sidebar whose entries are scoped to my roles, so I only see what I'm allowed to use.
49. As a developer, I want the API to be documented via OpenAPI/Swagger and the frontend clients to be generated from that schema (openapi-typescript / ng-openapi-gen), so frontend and backend stay type-safe and in sync.

## Implementation Decisions

### Modules

- **Frontend** — one of three starters (see `architecture.md`): React 19 SPA (Vite 8), Angular 21 SPA, or TanStack Start full-stack React. Chosen starter implements all consultant and admin screens; domain code is organised under a `features/` folder, one folder per domain area (time-entry, timesheet, leave, customers, contracts, users, leave-types, settings, auth).
- **Backend** — ASP.NET Core Minimal APIs (.NET 10+) grouped by domain under `Features/` with `Endpoints/`, `Models/`, `Services/`. PostgreSQL via EF Core. OpenAPI/Swagger always-on.
- **Generated API clients** — `openapi-typescript` + `openapi-fetch` for React and TanStack Start; `ng-openapi-gen` for Angular. Types and client are regenerated from the live Swagger document, never hand-written.

### Domain model (logical)

- `User` — personnel number, name, nickname, consultant type, active/staff flags, start/end dates, email, phone, hours-per-day, Dima code, title, roles (multi-valued), per-year `UserLeave` entries.
- `UserLeave` — per (user, leave type, year): allowed mode, total, taken (derived), balance (derived).
- `LeaveType` — name, payroll code, reporting code, group, priority, default days, default allowed mode, color.
- `Customer` — customer number (auto), name, address, contact person, invoicing channel, email, GTC status, contract start date, client manager (Prio 2).
- `Contract` — contract number (auto), customer ref, subject, assigned consultant ref, task (name + day rate), start/end date, document status, client manager (Prio 2).
- `TimeEntry` — (user, contract-or-leave-type, date, hours). Weekend/holiday cells cannot receive entries.
- `WeekSubmission` — (user, ISO week, status ∈ {draft, approved}). Approval locks the week.
- `Settings` — singleton: company identity, payroll config, week-submit invitation schedule, contact info.

### API contracts (shape)

- `GET /contracts?userId=…&date=…` returns only contracts whose date range includes `date` and that are assigned to `userId` — drives the Time Entry "Add task" picker.
- `GET /leave-types?userId=…` returns only leave types where the user's `UserLeave` mode is not `Not allowed` — drives the "Add leave" picker.
- `GET /time-entries?userId=…&week=…` returns the grid data for one ISO week.
- `PUT /time-entries` upserts a batch of cells for a week (auto-save on navigation/week change).
- `POST /week-submissions` submits the week for approval and flips it to `approved`.
- `GET /timesheets?userId=…&month=…` returns month-aggregated entries for the monthly calendar, including per-task summary and per-week approval status.
- `GET /leave-overview?userId=…&year=…` returns per-day leave markers for the year calendar plus the balance table.
- `GET|POST|PUT|DELETE /customers`, `/contracts`, `/users`, `/leave-types`, `/settings` for admin CRUD.

### Authorization

- Role-gated on the backend per endpoint; the frontend additionally hides sidebar entries users cannot access. Admin CRUD requires `Admin` or `SysAdmin`. Financial screens (listed in the sidebar as Payroll export / Monthly report / Budget report / Insights / Invoicing) are gated on `Financial controller`. Contract ownership filters for `Client manager` are applied server-side.

### Interactions

- **Auto-save** — every cell edit is debounced; a full flush is forced when the user navigates away or changes week, before the route changes.
- **Hotkeys** — `d` writes `hours-per-day` from the user profile; `h` writes half of that; `del` clears the cell. Hotkeys only fire when a cell is focused.
- **Approval lock** — once a week is `approved`, grid cells are read-only and a "Recall" action is exposed to reopen the week (role-gated; the mockup shows a `Recall` button on an approved week).
- **School/public holidays (Prio 2)** — fetched on demand from `openholidaysapi.org` per year and cached client-side; used to render the yearly calendar and to mark day cells in Time Entry non-editable.
- **Auto-numbering** — customer and contract numbers are assigned by the API on create, never chosen by the admin.

## Out of Scope

From the requirements document:

- Kilometer entries ("Add km") on the time entry grid — visible in the mockup but explicitly out of scope.
- Free-text comments on time entries — visible in the mockup but explicitly out of scope.
- Timesheet approval / signing flows beyond the week-approval step (i.e. no customer-signed monthly timesheet workflow in this PRD).
- Client-manager assignment on customers and contracts — deferred to Prio 2.
- Per-task/per-customer monthly timesheet view and click-through from month calendar/leave calendar into Time Entry — deferred to Prio 2.
- School & public holiday auto-import — deferred to Prio 2.

Derived from the mockups but **not** in scope for this PRD (visible in screenshots but not listed in `requirements.md`):

- Follow-up views for approvers (Approve / Time entries / Timesheets / Dashboard sidebar entries).
- Financial reporting (Payroll export, Monthly report, Budget report, Insights).
- Invoicing (New invoice, New credit note, Invoices list).
- To-do list widget.
- Peppol invoicing integration and GTC status tracking beyond a display field on the customer list.

## Further Notes

- **Locale** — mockups are in Dutch (e.g. "Verlof", "Ziekte", "maart"). Leave type names and month/day labels must be localisable; the seeded leave types use the Dutch set visible in `admin-leave-types.png`.
- **Seeded data** — on a fresh database: seed the leave types list shown in the mockups, create a default `Settings` row, and create an initial Admin user bootstrapped from the first Entra ID principal to sign in.
- **Derived fields** — `taken` and `balance` on `UserLeave` are always computed from `TimeEntry` rows booked against the corresponding leave type; they are never stored as authoritative values and must not drift from entries.
- **Time representation** — hours are stored as minutes (int) server-side to avoid floating-point errors; the UI renders them as `HH:MM`. Max per cell is `8:00` (configurable via the user's `hours-per-day`).
- **Week model** — weeks are ISO-8601 (Monday-first) everywhere; the monthly calendar renders Monday-first to match.
- **Fiscal year** — the Settings "start of fiscal year" only affects financial reporting, not leave-balance years; leave balances follow calendar year.
- **Screenshots** — every screen above maps to a mockup in [`./images/`](./images/): time entry (`user-time-entries.png`), monthly timesheets (`user-timesheets.png`), per-task timesheet (`user-timesheet.png`), leave overview (`user-leave-overview.png`), settings (`admin-settings.png`), customers (`admin-customer-list.png`), contracts (`admin-contract-list.png`), users list (`admin-user-list.png`), user edit (`admin-user-setting.png`), leave types (`admin-leave-types.png`), leave edit — limited (`admin-user-leave.png`), leave edit — unlimited (`admin-user-leave-sickness.png`).
