# Plan: Timesheet Zone

> Source PRD: [`docs/prd.md`](../docs/prd.md)

## Architectural decisions

Durable decisions that apply across every phase. Later phases may extend them, not reshape them.

- **Frontend starter**: React 19 SPA on Vite 8 (`packages/web-react`). Tailwind v4, shadcn primitives, Zustand, React Query, React Router, Vitest, OXLint/OXFmt. Uses Bun.
- **Backend**: ASP.NET Core Minimal APIs (.NET 10+) in `packages/api`. Domain-grouped under `Features/<Domain>/{Endpoints,Models,Services}`. EF Core on PostgreSQL (Docker). OpenAPI/Swagger always-on.
- **Generated API client**: `openapi-typescript` + `openapi-fetch`. Types and client regenerated from the live Swagger document; CI fails on drift. No hand-written types or `fetch()` calls from the frontend.
- **Routes**:
  - Consultant: `/time-entry`, `/timesheets`, `/leave-overview`
  - Admin: `/admin/customers`, `/admin/contracts`, `/admin/users`, `/admin/leave-types`, `/admin/settings`
  - Auth: `/auth/callback`, `/auth/login`
- **API surface** (shape, not final paths):
  - `GET /contracts?userId=&date=` / `GET /leave-types?userId=` (picker feeds)
  - `GET /time-entries?userId=&week=` / `PUT /time-entries` (batch upsert)
  - `POST /week-submissions`
  - `GET /timesheets?userId=&month=`
  - `GET /leave-overview?userId=&year=`
  - `GET|POST|PUT|DELETE /customers`, `/contracts`, `/users`, `/leave-types`
  - `GET|PUT /settings` (singleton)
- **Key data models**: `User`, `UserLeave (user × leaveType × year)`, `LeaveType`, `Customer`, `Contract`, `TimeEntry`, `WeekSubmission`, `Settings (singleton)`.
- **Auth**: Azure Entra ID, Authorization Code + PKCE on the frontend; JWT bearer validated on the API. Role set: `Consultant`, `Admin`, `SysAdmin`, `Financial controller`, `Client manager`. Role-gating enforced server-side per endpoint and mirrored client-side for navigation visibility.
- **Invariants** (hold from whichever phase first introduces them):
  - Hours stored server-side as minutes (int); rendered as `HH:MM`.
  - Weeks are ISO-8601, Monday-first, everywhere.
  - `UserLeave.taken` / `balance` are derived from `TimeEntry`, never authoritative.
  - Customer and contract numbers are assigned by the API.
  - Leave balances follow calendar year; Settings `start of fiscal year` affects financial reporting only.

---

## Phase 1: Foundation, Auth & App Shell

**User stories**: 47, 48, 49

### What to build

A walking skeleton end-to-end. `docker-compose up` starts Postgres; `dotnet run` starts the API with Swagger; `bun dev` starts the React app. The React app signs in against Azure Entra ID (PKCE), the first principal to sign in is bootstrapped as `Admin` + `SysAdmin`, and the persistent header shows the user's first name. The sidebar renders role-scoped entries (entries hidden when the user's roles don't permit them); each entry routes to a placeholder page for its feature. The OpenAPI-generated client is wired into the React app and a trivial `GET /me` round-trip proves the schema→client regeneration loop works. CI fails if the generated client is out of date vs. the API.

### Acceptance criteria

- [ ] Fresh `docker-compose up` + `dotnet run` + `bun dev` yields a live app hitting a live API
- [ ] Entra ID PKCE sign-in completes end-to-end; session persists across reloads
- [ ] The first user to sign in is created with `Admin` + `SysAdmin` roles
- [ ] Header shows the product name and the signed-in user's first name
- [ ] Sidebar entries for admin-only screens are hidden from a non-admin account
- [ ] Unauthenticated API calls return 401; calls missing the required role return 403
- [ ] `openapi-typescript` regeneration is part of the build; drift between API schema and generated client fails CI
- [ ] Entity stubs with empty tables and migrations exist for `User`, `UserLeave`, `LeaveType`, `Customer`, `Contract`, `TimeEntry`, `WeekSubmission`, `Settings`

---

## Phase 2: Leave Types catalog (admin)

**User stories**: 43, 44, 45

### What to build

Admin-only CRUD for account-wide leave types. Each type carries name, payroll code, reporting code, group (`Holiday` / `Illness` / `Leave` / `Leave.Unpaid`), priority within its group, default days, default allowed mode, and a colour indicator. The list view matches `admin-leave-types.png`. On a fresh database, the Dutch leave-type catalog visible in the mockup is seeded.

### Acceptance criteria

- [ ] Admin can list, create, edit, and delete leave types
- [ ] Colour indicator is editable and renders in the list row
- [ ] Fresh database boot seeds the Dutch leave-type set from the mockup
- [ ] A non-admin user receives 403 on any `/leave-types` write
- [ ] Deleted leave types cannot be referenced by later user-leave creation

---

## Phase 3: Customers catalog (admin)

**User stories**: 24, 25, 26, 27

### What to build

Admin-only CRUD for customers. List view shows customer number, name, VAT, contact person, invoicing channel, email, GTC status, and contract start date, with filtering, sorting, and an "active only" toggle. Customer numbers are assigned by the API on create and are never editable. Client-manager assignment (story 28) is explicitly deferred to the Prio 2 phase.

### Acceptance criteria

- [ ] Admin can list, create, edit, and (soft-)deactivate customers
- [ ] Customer number is generated server-side; the UI has no input for it
- [ ] Active-only toggle filters the list
- [ ] Address (street, zip, city, country) and contact person (name, email) are captured on create and edit
- [ ] Non-admin users receive 403 on any `/customers` write

---

## Phase 4: Users + per-year UserLeave (admin)

**User stories**: 35, 36, 37, 38, 39, 40, 41, 42 (derived fields stubbed)

### What to build

Admin-only CRUD for users with the full profile form (first/last name, nickname, consultant type, personnel number, active/staff flags, start/end dates, email, phone, hours-per-day, Dima code, title, roles multi-select). Each user carries a per-year `UserLeave` list with name, allowed mode (`Allowed` / `Not allowed` / `Limited`), total, taken, balance, and year. On user create, leave entitlements are prefilled `Verlof:20 / ADV:5 / Anciënniteit:0 / Ziekte:0` for the current year. Editing a single entitlement happens in a modal. `Taken` and `Balance` are exposed as computed/read-only fields with placeholder zeros; Phase 7 makes them real.

### Acceptance criteria

- [ ] Admin can list, filter, create, and edit users
- [ ] Roles multi-select covers all five roles from the architectural decisions
- [ ] New-user form prefills the four default UserLeave rows for the current calendar year
- [ ] Single-entitlement modal matches `admin-user-leave.png` / `admin-user-leave-sickness.png` (Name, Allowed, Total, Taken read-only, Balance read-only, Year)
- [ ] Active-only toggle filters ex-employees out
- [ ] Non-admin users receive 403 on any `/users` write
- [ ] `taken` and `balance` render as 0 (placeholder) until Phase 7

---

## Phase 5: Contracts catalog (admin)

**User stories**: 29, 30, 31, 32, 34

### What to build

Admin-only CRUD for contracts. Each contract has an auto-assigned contract number, linked customer, subject (project name, surfaces on the consultant's grid), assigned consultant (from the user list), task (name + day rate), start/end date, and document status (`Signed` / `Pending client` / `Unsigned`). List view is filterable by client manager (Prio 2; still render the filter control) and active/inactive state. A clone action pre-fills a new contract form from an existing one. Contract-level client manager (story 33) is deferred.

### Acceptance criteria

- [ ] Admin can list, create, edit, and clone contracts
- [ ] Contract number is assigned server-side; not editable in the UI
- [ ] Contract list filters on active/inactive state
- [ ] Customer and consultant pickers list only active records
- [ ] Date range and day rate validate server-side (end ≥ start; rate ≥ 0)

---

## Phase 6a: Time Entry — weekly grid shell (read-only)

**User stories**: 1, 7, 8, 11

### What to build

The Time Entry page loads the currently signed-in consultant's grid for the current ISO week. `GET /time-entries?userId=&week=` returns existing rows (one row per task or leave) with per-day minutes. The grid renders row totals, column totals, and a week total. Week navigation supports prev/next, a calendar jump, and a "Today" control. The approval-status indicator at the top of the grid reads the current `WeekSubmission` status (`draft` or `approved`). Weekend columns are visually distinct. No editing in this slice.

### Acceptance criteria

- [ ] Grid renders one row per existing task/leave entry for the selected week
- [ ] Row totals, per-day column totals, and week total render as `HH:MM`
- [ ] Prev / next / calendar-jump / Today all reload the grid for the correct ISO week
- [ ] Approval-status banner reflects the `WeekSubmission` for the current user + week
- [ ] Weekend columns are visually distinct from weekdays
- [ ] Consultant can only read their own entries; admin-impersonation is not yet exposed

---

## Phase 6b: Time Entry — add/remove task & leave rows

**User stories**: 2, 3

### What to build

"Add task" picker calls `GET /contracts?userId=&date=` and lists only contracts whose date range covers the selected week and are assigned to the current user; selecting one adds an empty row for that contract's task. "Add leave" picker calls `GET /leave-types?userId=` and lists only leave types whose `UserLeave` mode for the current user is not `Not allowed`; selecting one adds an empty leave row. Rows can be removed from the grid (removal is immediate client-side; server state is reconciled when cells are edited in the next slice).

### Acceptance criteria

- [ ] "Add task" picker never shows a contract the user isn't assigned to or whose date range excludes the selected week
- [ ] "Add leave" picker never shows a leave type the user isn't entitled to
- [ ] Adding a task row renders a row with the contract's subject + task name
- [ ] Adding a leave row renders a row with the leave type's name and colour indicator
- [ ] Rows can be removed; removal is reflected immediately in the grid
- [ ] Picker queries are rerun when the selected week changes

---

## Phase 6c: Time Entry — cell editing, hotkeys, auto-save

**User stories**: 4, 5, 6, 9

### What to build

Cells accept hours in the range `00:15`–`08:00` (per-cell max is the user's `hours-per-day`), stored server-side as minutes. Hotkeys on the focused cell: `d` writes the user's hours-per-day, `h` writes half of that, `del` clears. Weekend cells and (placeholder, real in Phase 11a) public-holiday cells are read-only. Edits are debounced and written to `PUT /time-entries` (batch upsert for the week). A forced flush runs before route change or week change so no in-flight edits are lost.

### Acceptance criteria

- [ ] A cell accepts values `00:15`–`08:00`; out-of-range values are rejected with a clear error
- [ ] Hotkeys only fire when a cell has focus
- [ ] `d` / `h` / `del` on a weekday cell write hours-per-day / half / empty respectively
- [ ] Weekend cells are read-only
- [ ] Navigating away from Time Entry or changing week forces any pending save to flush before the route transitions
- [ ] Refreshing the page after an edit shows the edit persisted
- [ ] Row, column, and week totals update live on edit

---

## Phase 6d: Time Entry — submit for approval & lock

**User stories**: 10, 11

### What to build

`POST /week-submissions` flips the current ISO week's `WeekSubmission` to `approved`. The grid then renders fully read-only, the approval-status banner at the top reflects the new state, and the Add task / Add leave buttons are hidden. Attempting to `PUT /time-entries` for an approved week returns 409. (A Recall action to reopen an approved week is part of Phase 11f.)

### Acceptance criteria

- [ ] Submitting a draft week creates or updates a `WeekSubmission` row with status `approved`
- [ ] An approved week renders read-only; all hotkeys are no-ops and the pickers are hidden
- [ ] Approval-status banner shows "Approved" on an approved week and "Draft" otherwise
- [ ] `PUT /time-entries` against an approved week returns 409 with an explanatory body
- [ ] Resubmitting a week that is already approved is a no-op (idempotent)

---

## Phase 7: Derived leave balances

**User stories**: 42 (real), feeds 20

### What to build

`UserLeave.taken` and `UserLeave.balance` are computed on read from `TimeEntry` rows for the user × leave type × calendar year. No column is ever stored as authoritative. The admin user-leave modal (Phase 4) now shows real numbers, and the `GET /leave-overview` endpoint (Phase 9) can rely on the same calculation. A backend integration test enforces the invariant: for any user/year/leave type, `taken = Σ minutes(TimeEntry) / (hours-per-day × 60)`.

### Acceptance criteria

- [ ] Admin user-leave modal shows non-zero `Taken` / `Balance` for a user who has booked leave in Phase 6
- [ ] No `taken` or `balance` column exists in the database
- [ ] Integration test verifies the invariant above for at least two users across two leave types
- [ ] Adjusting `Total` in the modal recomputes `Balance` live without touching `taken`

---

## Phase 8: Timesheets monthly view

**User stories**: 12, 13, 14, 15

### What to build

Monthly calendar for the signed-in consultant. `GET /timesheets?userId=&month=` returns per-day aggregates, per-task monthly summary, and per-week approval status. The calendar renders Monday-first; approved weeks are visually distinct (darker highlight) from draft weeks. A per-task summary strip below the calendar lists e.g. "9 days Euricom – Internal Affairs" for the selected month. Month navigation: prev / next / Today.

### Acceptance criteria

- [ ] Calendar renders entries booked in Phase 6 on the correct days
- [ ] Approved weeks are rendered with a darker highlight than draft weeks
- [ ] Per-task summary strip totals match the sum of booked days for each task in the selected month
- [ ] Month navigation and Today reload the calendar correctly
- [ ] View loads in a single request (no per-day round-trip)

---

## Phase 9: Leave Overview year view

**User stories**: 18, 19, 20, 21

### What to build

Full-year calendar for the signed-in consultant. `GET /leave-overview?userId=&year=` returns per-day leave markers (which leave type was booked) plus the balance table (total / taken / remaining per leave type for the selected year). The calendar is Monday-first, the current date is visually marked, and weekends are visually distinct. Year navigation: prev / next.

### Acceptance criteria

- [ ] Year calendar marks every day a leave type was booked using that leave type's colour
- [ ] Balance panel total / taken / remaining numbers match the derived values from Phase 7
- [ ] Current date and weekends are visually distinct
- [ ] Year navigation reloads the calendar and the balance panel
- [ ] Leaves booked in Phase 6 for the selected year appear without a page refresh once booked

---

## Phase 10: Admin Settings singleton

**User stories**: 46

### What to build

Admin-only Settings page, grouped into General (company name, legal entity number, display date format, ePrinter address, fiscal year, start of fiscal year), Payroll (hours per day, overtime payroll code, month for payroll export), Week submit invitations (send on day, at time), and Contact (phone, email, website). Persisted as a single row; on first boot a default row is seeded. `GET /settings` returns the current row, `PUT /settings` updates it.

### Acceptance criteria

- [ ] Fresh-DB boot seeds a default Settings row (one row, always exactly one)
- [ ] Admin can read and update every field in all four sections
- [ ] `PUT /settings` validates field types (fiscal year is a valid month, send-time is HH:MM, etc.) server-side
- [ ] Non-admin users receive 403 on `PUT /settings`
- [ ] Settings `hours-per-day` is a company default; user-level `hours-per-day` (Phase 4) still wins on the grid

---

## Phase 11: Prio 2 enhancements

Each sub-slice ships independently and must not regress earlier phases.

### 11a — Public & school holidays

**User stories**: 22

Fetch Belgium holidays from `openholidaysapi.org` per year, cache client-side. Render on the yearly leave calendar (Phase 9). In Time Entry (Phase 6c), public-holiday day cells become read-only in addition to weekends.

- [ ] Holidays for the current and previous year are fetched once per session and cached
- [ ] Yearly leave calendar renders holidays distinguishably from regular days
- [ ] Time Entry cells on a public-holiday date are not editable

### 11b — Click-through from monthly calendar

**User stories**: 16

Clicking a day in the Timesheets month view (Phase 8) navigates to Time Entry for the ISO week containing that day.

- [ ] Click on any day cell deep-links to `/time-entry?week=YYYY-Www`
- [ ] Landing on that week shows the correct grid with focus on that day's column

### 11c — Click-through from yearly leave calendar

**User stories**: 23

Same behaviour as 11b but from the Leave Overview page.

- [ ] Click on any day cell in the leave calendar deep-links to the corresponding Time Entry week

### 11d — Per-task monthly timesheet

**User stories**: 17

A customer-facing monthly sheet for a single task (contract × task) listing every day of the selected month with booked hours and a billable-days total.

- [ ] Sheet renders one row per calendar day of the selected month
- [ ] Sum of booked hours matches Phase 8's per-task summary strip for that task
- [ ] Sheet is printable without the app chrome

### 11e — Client-manager assignment

**User stories**: 28, 33

Add `clientManagerId` to `Customer` (story 28) and independently to `Contract` (story 33). Apply server-side filters so a Client Manager user sees only customers and contracts they own.

- [ ] Customer edit form exposes a client-manager picker
- [ ] Contract edit form exposes its own client-manager picker independent of the customer's
- [ ] A Client Manager user lists only the customers and contracts assigned to them

### 11f — Recall approved week

Role-gated action that reopens an approved `WeekSubmission` for edits. Visible on an approved week in Time Entry (matching the `Recall` button in `user-time-entries.png`).

- [ ] Recall flips `WeekSubmission.status` back to `draft`
- [ ] After recall, the grid becomes editable and the pickers reappear
- [ ] Recall is gated on `Admin` (or a dedicated role to be confirmed); a plain consultant does not see the button
