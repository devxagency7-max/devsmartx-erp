# DevSmartX ERP — Project Roadmap

## Completed Phases

| Phase | Title | Key Deliverables | Build Status |
|-------|-------|-----------------|--------------|
| 1–10 | Foundation | Auth, routing, i18n, Zustand, React Query, base layout, Tailwind v4, feature flags | ✅ |
| 11–14 | Finance Core | Payment Sources, Transactions (full CRUD), Expenses (full CRUD), category/tag/partner/cost-center master data | ✅ |
| 15 | Financial Workflow Engine | Transaction domain model, posting rules, ledger rules, settlement workflow | ✅ |
| 16 | Financial Application Layer | Transaction service, expense service, payment source service, DTOs | ✅ |
| 17 | People & Commitments | Recurring Commitments (CRUD + due-window logic), People Ledger (CRUD + personal ledger view) | ✅ |
| 18 | Excel Export Infrastructure | SheetJS-based shared export system (`src/shared/export/`), integrated into Transactions, Expenses, Partners, Cost Centers | ✅ |
| 18B | Financial Obligations (Phase 18B) | Revenues workflow, Commitment + People export columns, additional routes | ✅ |
| 19 | Gen-Z Glass Design System | Indigo/violet tokens, deep navy dark mode, glass surfaces, gradient accents, full Tailwind v4 token set | ✅ |
| 20 | Dashboard, Navigation & ERP Shell | Accordion sidebar IA, ⌘K command palette, data-driven dashboard, Finance Overview, Revenue list, Coming Soon shells, export on all list pages | ✅ |

---

## Current Architecture (Post Phase 20)

### Frontend Stack
- **Framework**: React 19 + TypeScript strict mode + Vite 8
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`) with CSS variable design tokens
- **State**: TanStack React Query (server state) + Zustand (UI filter state)
- **Routing**: React Router v7 with lazy-loaded feature modules
- **Forms**: React Hook Form + Zod validation
- **i18n**: react-i18next, English + Arabic (RTL)
- **Export**: SheetJS (xlsx) via `src/shared/export/`

### Feature Flags (`src/core/config/featureFlags.ts`)
| Flag | Status | Notes |
|------|--------|-------|
| `finance` | `true` | Fully implemented |
| `crm` | `false` | Coming Soon shell only |
| `projects` | `false` | Coming Soon shell only |
| `assets` | `false` | Coming Soon shell only |
| `reports` | `false` | Coming Soon shell only |

### Module Structure
```
src/
  app/            — Router, providers, app shell
  core/           — Config, feature flags
  features/
    auth/         — Login, forgot password
    dashboard/    — Home page, metrics hook
    finance/
      payment-sources/     — Full CRUD
      transactions/        — Full CRUD + settlement
      expense/             — Full CRUD + approval
      workflows/revenue/   — Revenue list + form
      commitments/         — Recurring commitments CRUD
      people/              — People ledger CRUD
      overview/            — Finance Overview analytics
      master-data/         — Categories, Tags, Partners, Cost Centers, Currencies, Payment Methods
  shared/
    components/   — UI primitives + CommandDialog
    export/       — SheetJS export infrastructure
    i18n/         — EN + AR locale files
    layout/       — Sidebar (accordion), Topbar (⌘K), Breadcrumb
    pages/        — Coming Soon shells (9 pages)
    stores/       — Auth store
    types/        — Shared TypeScript types
```

---

## Future Phases (Planned)

### Phase 21 — CRM Module
**Scope**: Full Customer Relationship Management
- Customer records (create, edit, view, archive)
- Offer/quotation creation and status tracking (Draft → Sent → Accepted/Rejected)
- Customer ledger (link to People ledger)
- CRM dashboard widget on main dashboard
- Enable `crm` feature flag

### Phase 22 — Projects Module
**Scope**: Project tracking and budget management
- Project records with status (Planning, Active, On Hold, Completed)
- Budget allocation per project
- Link expenses and commitments to projects
- Project P&L view
- Enable `projects` feature flag

### Phase 23 — Assets Module
**Scope**: Fixed asset register
- Asset records (name, category, purchase date, value, depreciation method)
- Depreciation schedule computation
- Asset disposal workflow
- Link assets to payment sources (funding source)
- Enable `assets` feature flag

### Phase 24 — Reports Module
**Scope**: Financial reporting
- Income Statement (P&L) — configurable date range
- Cash Flow Statement (indirect method)
- Balance Sheet snapshot
- Commitment schedule report
- Export all reports to Excel
- Enable `reports` feature flag

### Phase 25 — Settings & System Administration
**Scope**: System configuration
- User management (invite, role assignment, deactivate)
- Role-based access control (RBAC) with permission matrix
- Organization settings (name, logo, default currency, fiscal year)
- Audit log viewer
- Enable `settings` / `system.users` / `system.permissions` feature flags

### Phase 26 — Notifications & Alerts
**Scope**: Proactive user notifications
- Due-date alerts for upcoming commitments (email + in-app)
- Budget threshold warnings
- Pending transaction reminders
- Notification preferences per user

### Phase 27 — Mobile Optimization & PWA
**Scope**: Progressive Web App
- Service worker for offline-capable views
- Install prompt (PWA manifest)
- Touch-optimized gesture navigation
- Responsive table → card-view on mobile for all list pages

---

## Architectural Principles (Non-negotiable)

1. **Payment Sources never show balance fields** — no Opening/Current/Available Balance anywhere in the UI
2. **No `wallet`/`walletId`** — always `paymentSource`/`paymentSourceId`/`paymentSourceName`
3. **No invented data** — honest `EmptyState` when DB has no records; no seed-data-dependent KPIs
4. **No dead links** — only enable navigation items for implemented, registered routes
5. **TanStack Query for server state** — Zustand only for ephemeral UI state (filters, modals)
6. **Arabic first-class** — every string translated; RTL layout correct for all new components
7. **CSS-only charts** — no recharts or chart library; horizontal bars via inline `style={{ width: '${pct}%' }}`
8. **TypeScript strict** — zero `any`, zero `ts-ignore`; build must pass `tsc -b` with 0 errors
