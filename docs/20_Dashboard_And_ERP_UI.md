# Phase 20 — Dashboard, Navigation & ERP Shell

**Phase:** 20  
**Status:** Complete  
**Build:** 2610 modules, 0 TypeScript errors

---

## Overview

Phase 20 delivers the final ERP shell experience: a collapsible accordion sidebar with full information architecture, a premium topbar with ⌘K command palette, a fully data-driven dashboard, a Finance Overview analytics page, a Revenue list page, Coming Soon shells for CRM/Projects/Assets/Reports/System, and Excel export on all remaining major list pages.

---

## New Routes

| Constant | Path | Component |
|----------|------|-----------|
| `FINANCE_OVERVIEW` | `/finance/overview` | `FinanceOverviewPage` |
| `REVENUES` | `/finance/revenues` | `RevenueListPage` |
| `SETTINGS` | `/settings` | `SettingsPage` (Coming Soon) |
| `SYSTEM_USERS` | `/system/users` | `SystemUsersPage` (Coming Soon) |
| `SYSTEM_PERMISSIONS` | `/system/permissions` | `SystemPermissionsPage` (Coming Soon) |
| `CRM` | `/crm` | `CrmPage` (Coming Soon) |
| `CRM_CUSTOMERS` | `/crm/customers` | `CrmCustomersPage` (Coming Soon) |
| `CRM_OFFERS` | `/crm/offers` | `CrmOffersPage` (Coming Soon) |
| `PROJECTS` | `/projects` | `ProjectsPage` (Coming Soon) |
| `ASSETS` | `/assets` | `AssetsPage` (Coming Soon) |
| `REPORTS` | `/reports` | `ReportsPage` (Coming Soon) |

---

## Navigation Architecture

### Sidebar (`src/shared/layout/Sidebar.tsx`)

Accordion-based sidebar with collapsible parent groups:

- **State**: `useState<Set<string>>` tracks expanded group keys (local UI state only — not persisted to Zustand)
- **Auto-expand**: `useEffect` on `location.pathname` auto-expands the parent group whose child matches the active route
- **Animation**: `max-h-0 → max-h-[600px]` + `opacity-0 → opacity-100` CSS transition on children container
- **Collapsed mode** (icon-only `w-16`): parent groups hidden; only leaf items shown as icon buttons

### Navigation Groups (`src/shared/layout/NavigationConfig.ts`)

| Group | Items |
|-------|-------|
| main | Dashboard |
| modules/finance | Overview, Payment Sources, Transactions, Expenses, Revenues, Commitments, People, Master Data (6 children) |
| modules/crm | CRM, Customers, Offers |
| modules | Projects, Assets, Reports |
| system | Settings, Users, Permissions |

**Rule**: Finance parent path is `/finance/overview` (not payment-sources). `CreditCard` icon used for Payment Sources — never `Wallet`.

---

## Topbar & Command Palette

### Topbar (`src/shared/layout/Topbar.tsx`)

- Desktop: pill-shaped search button (hidden on mobile) showing `⌘K` shortcut hint
- Mobile: icon-only search button
- `useEffect` registers `Ctrl+K` / `Meta+K` global keydown to open the command dialog

### CommandDialog (`src/shared/components/CommandDialog.tsx`)

- 14 navigation items covering all implemented routes
- Search input with `autoFocus`; client-side filter by translated label
- Keyboard navigation: `↑↓` arrows, `Enter` to navigate, `Escape` to close
- RTL-aware: `dir={i18n.dir()}` on dialog panel

---

## Dashboard

### Hook: `useDashboardMetrics` (`src/features/dashboard/hooks/useDashboardMetrics.ts`)

Aggregates data from three existing services:

```
useTransactions() → this-month revenue/expenses, net flow, pending count, recent 5
useCommitments()  → active count, upcoming (due within 7 days)
usePaymentSources() → source count
```

All computations are `useMemo`-wrapped. No fake data — honest zeros when DB is empty.

### Page: `DashboardHomePage` (`src/features/dashboard/pages/DashboardHomePage.tsx`)

| Row | Content |
|-----|---------|
| 1 | Time-based greeting + current date (date-fns `format`) |
| 2 | 4 KPI cards: Revenue, Expenses, Net Flow, Pending (2-col mobile / 4-col lg) |
| 3 | Financial Flow card (2/3 width, CSS bars) + Quick Actions card (1/3, 6 links) |
| 4 | Upcoming Commitments + Recent Transactions (2-col lg) |

**Financial Flow chart**: CSS-only horizontal bars. Width calculated as `(value / max(revenue, expenses, 1)) * 100`%. No recharts.

**Quick Actions**: New Expense, New Transaction, New Commitment, Payment Sources, People, Finance Overview.

---

## Finance Overview Page

### Hook: `useFinanceOverview` (`src/features/finance/overview/hooks/useFinanceOverview.ts`)

Derives from completed transactions:

- `allTimeRevenue` / `allTimeExpenses` / `allTimeNet` — all-time totals (completed transactions only)
- `sourcesSummary[]` — per-payment-source: `{ id, name, type, currency, txCount, totalIn, totalOut }`
- `topCategories[]` — top 5 expense categories by total, with `maxCategoryTotal` for bar normalization

### Page: `FinanceOverviewPage` (`src/features/finance/overview/pages/FinanceOverviewPage.tsx`)

- 3 all-time KPI stat cards (Revenue, Expenses, Net)
- "By Payment Source" table: name, currency, tx count, total in, total out
- "Top Categories" CSS horizontal bar chart (top 5 expense categories)
- Both sections show `EmptyState` when no completed transactions exist

---

## Revenue List Page

`src/features/finance/workflows/revenue/pages/RevenueListPage.tsx`

Follows the same pattern as `ExpenseListPage`:
- `useRevenues()` → filtered to `type === Revenue` transactions
- Revenue amounts rendered in `--success` color
- Excel export via `useExcelExport` + `getExpenseExportColumns` (RevenueRecord = TransactionRecord alias)
- Click row → navigates to `TRANSACTION_DETAILS`

---

## Coming Soon Pages

**Reusable shell**: `src/shared/pages/ComingSoonPage.tsx`

Accepts `{ icon, titleKey, descKey }` props. Renders centered icon + title + description + "Coming Soon" badge.

**9 thin wrappers** (all in `src/shared/pages/`):
- `CrmPage`, `CrmCustomersPage`, `CrmOffersPage`
- `ProjectsPage`, `AssetsPage`, `ReportsPage`
- `SettingsPage`, `SystemUsersPage`, `SystemPermissionsPage`

---

## Excel Export — New Columns

### Commitment Export (`src/features/finance/commitments/export/commitmentExportColumns.ts`)

Columns: code, name, vendorName, amount, currency, frequency (translated), status (translated), nextDueDate, startDate, endDate, categoryName, notes, createdAt

Integrated into `RecurringCommitmentsListPage` — Export All + Export Filtered (when filters active).

### Person Export (`src/features/finance/people/export/personExportColumns.ts`)

Columns: code, name, email, phone, type (translated), status (translated), createdAt

Integrated into `PeopleListPage` — Export All + Export Filtered (when filters active).

---

## i18n

New translation keys added to both `en.ts` and `ar.ts`:

- `nav`: `financeOverview`, `revenues`, `commitments`, `customers`, `offers`, `users`, `permissions`, `comingSoon`
- `dashboard`: greeting variants, 8 KPI labels, flow chart labels, recent/upcoming section labels, quick action labels
- `financeOverview`: title, subtitle, by_source, by_category, no_data, total_in, total_out, tx_count, all_time_*
- `comingSoon`: title/desc pairs for each Coming Soon module

---

## Constraints Enforced

- Payment Sources: no balance fields anywhere (no Opening/Current/Available Balance)
- No `wallet` / `walletId` in any new code — only `paymentSource` / `paymentSourceId` / `paymentSourceName`
- No invented financial data — all values come from real DB records; honest `EmptyState` when empty
- No dead links — every nav item points to a registered route
- TanStack Query for all server state; Zustand only for UI filter state
- Arabic first-class: all new strings translated, RTL layouts tested
