# DevSmartX ERP — System Architecture Reference

**Version:** 1.1.0
**Status:** FINAL APPROVED
**Last Updated:** 2026-08-01
**Audience:** All engineers working on the DevSmartX ERP platform

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Feature-Based Architecture](#4-feature-based-architecture)
5. [Module Registry](#5-module-registry)
6. [Routing Strategy](#6-routing-strategy)
7. [Route Constants](#7-route-constants)
8. [State Management Strategy](#8-state-management-strategy)
9. [State Boundary Policy](#9-state-boundary-policy)
10. [API Layer Strategy](#10-api-layer-strategy)
11. [API Response Contract](#11-api-response-contract)
12. [Authentication and Authorization](#12-authentication-and-authorization)
13. [Permission Constants](#13-permission-constants)
14. [Role and Permission Model](#14-role-and-permission-model)
15. [Multi-Tenant Context](#15-multi-tenant-context)
16. [Entity Base Convention](#16-entity-base-convention)
17. [UI State Convention](#17-ui-state-convention)
18. [Icons Policy](#18-icons-policy)
19. [Date Strategy](#19-date-strategy)
20. [Currency Strategy](#20-currency-strategy)
21. [Business Logic Rule](#21-business-logic-rule)
22. [Type Folder Ownership](#22-type-folder-ownership)
23. [Internationalization (i18n) Approach](#23-internationalization-i18n-approach)
24. [Global Error Handling](#24-global-error-handling)
25. [File Upload Strategy](#25-file-upload-strategy)
26. [Architecture Decision Records](#26-architecture-decision-records)
27. [Financial Transaction Engine](#27-financial-transaction-engine)
28. [Audit Trail Strategy](#28-audit-trail-strategy)
29. [Domain Events (Future)](#29-domain-events-future)
30. [Feature Ownership Rule](#30-feature-ownership-rule)
31. [Feature Roadmap](#31-feature-roadmap)
32. [Conventions Summary](#32-conventions-summary)

---

## 1. Project Overview

**DevSmartX ERP** is a multi-tenant, role-based enterprise resource planning web application built with React, Vite, and TypeScript. It is designed to serve small-to-medium businesses with modules covering Finance, Projects, CRM, Assets, Reports, and Settings.

The system is cloud-native from the ground up:
- Firebase handles authentication and identity.
- Cloudinary handles all user-uploaded media and documents.
- Zustand manages client-side state with explicit scope boundaries.
- All business logic is isolated from UI rendering.
- All financial state is derived from a centralized Transaction Engine.

This document is the authoritative architectural reference. All engineering decisions must align with the rules and patterns described here. When a decision deviates from this document, an ADR must be created in `docs/adr/` before any code is merged.

---

## 2. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| UI Framework | React 18 | Component model, ecosystem maturity |
| Build Tool | Vite | Fast HMR, native ESM, first-class TypeScript |
| Language | TypeScript (strict mode) | Type safety, refactoring confidence |
| Routing | React Router v6 | Nested routes, lazy loading, data loaders |
| State Management | Zustand | Minimal boilerplate, explicit boundaries |
| Authentication | Firebase Auth | Managed auth, social providers, security rules |
| File Storage | Cloudinary | Optimized media delivery, transformation API |
| Styling | Tailwind CSS | Utility-first, design system enforceability |
| Icon Library | Lucide React | See Section 18 |
| Form Handling | React Hook Form + Zod | Performance, schema-driven validation |
| HTTP Client | Axios (wrapped) | Interceptors, centralized error handling |
| Date Library | date-fns | Tree-shakeable, immutable, locale-aware |
| Testing | Vitest + React Testing Library | Vite-native, component-level focus |
| Linting | ESLint + Prettier | Enforced style, no bikeshedding |

---

## 3. Folder Structure

The top-level structure is stable. No new top-level folders may be added without a supporting ADR.

```
src/
  app/                   # Root app setup: router, providers, global styles
  features/              # All ERP feature modules (see Section 4)
  shared/
    components/          # Truly shared, reusable UI primitives
    hooks/               # Shared hooks (useDebounce, usePagination, etc.)
    services/            # API service layer (Axios wrappers, Firebase calls)
    stores/              # Zustand stores with explicit boundary documentation
    types/               # Global shared types (see Section 22)
    utils/               # Pure utility functions
    constants/           # Route constants, permission constants, enums
    i18n/                # i18n configuration and locale files
    errors/              # Global error types and boundary components
  assets/                # Static assets (fonts, images, SVG icons not from Lucide)
  config/                # Environment-aware runtime configuration

docs/
  01_System_Architecture.md
  adr/
```

Each `features/<module>/` folder is a self-contained vertical slice:

```
features/finance/
  components/            # Finance-only UI components
  hooks/                 # Finance-only React hooks
  services/              # Finance API calls
  stores/                # Finance Zustand store(s)
  types/                 # Finance-specific types
  utils/                 # Finance-specific pure functions
  pages/                 # Route-level page components
  index.ts               # Public API surface of the module (barrel export)
```

Cross-feature imports are PROHIBITED. A feature may only import from `shared/`. If two features need shared logic, that logic must be promoted to `shared/`.

---

## 4. Feature-Based Architecture

See `docs/adr/ADR-001-feature-based-architecture.md` for full decision context.

### Core Rules

1. **Vertical slices.** Each ERP module is an isolated folder under `src/features/`. Everything a feature needs lives inside that folder or is imported from `src/shared/`.

2. **Barrel exports.** Every feature exposes a single `index.ts`. Consumers import from the barrel, not from internal paths.

3. **No cross-feature imports.** `features/crm` must never import directly from `features/finance`. Shared contracts live in `shared/types/`.

4. **Lazy loading at the route level.** Every feature's page components are code-split via `React.lazy()`. The router owns the loading boundary.

5. **Co-location.** A component's styles, tests, and types live in the same folder as the component. Global styles and global types do not.

### Example

```typescript
// CORRECT — import from barrel
import { InvoiceList } from '@/features/finance';

// WRONG — import from internal path
import { InvoiceList } from '@/features/finance/components/InvoiceList';
```

---

## 5. Module Registry

The Module Registry is the single source of truth for which ERP modules exist in the system. It drives both navigation rendering and permission checking. It is defined in `src/shared/constants/moduleRegistry.ts`.

No navigation menu item may be added without a corresponding registry entry. No permission check may reference a module key not present in the registry.

### Current Modules

| Key | Label | Description |
|---|---|---|
| `finance` | Finance | Invoices, expenses, accounts, budgets |
| `projects` | Projects | Project tracking, tasks, milestones |
| `crm` | CRM | Contacts, leads, deals, pipelines |
| `assets` | Assets | Physical and digital asset management |
| `reports` | Reports | Cross-module reporting and analytics |
| `settings` | Settings | Company config, users, roles, billing |

### Registry Shape

```typescript
interface ModuleRegistryEntry {
  key: ModuleKey;
  label: string;               // i18n key preferred
  icon: LucideIcon;
  basePath: string;            // root route path constant
  requiredPermission: PermissionKey;
  isEnabled: boolean;          // feature flag for gradual rollout
}
```

---

## 6. Routing Strategy

- React Router v6 with `createBrowserRouter` and `RouterProvider`.
- Route configuration is centralized in `src/app/router/`.
- Features register their routes into a central route map; they do not self-register.
- All route-level components are wrapped in `React.lazy()` for automatic code splitting.
- Auth-guarded routes live under a `<ProtectedRoute>` wrapper that reads from the auth store.
- Company-scoped routes include `:companyId` as a path segment for multi-tenant isolation (see Section 15).

### Route Hierarchy

```
/                          → public marketing or login redirect
/auth/login                → unauthenticated entry
/auth/register
/app/:companyId/           → authenticated, company-scoped root
  dashboard
  finance/
  projects/
  crm/
  assets/
  reports/
  settings/
```

---

## 7. Route Constants

**Rule: Route strings must never be hardcoded anywhere in the application.**

All route paths are defined in `src/shared/constants/routes.ts` and imported from there. This prevents typo bugs, enables safe refactoring, and makes route auditing straightforward.

### Pattern

```typescript
// src/shared/constants/routes.ts
export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  APP: {
    ROOT: '/app/:companyId',
    DASHBOARD: '/app/:companyId/dashboard',
    FINANCE: {
      ROOT: '/app/:companyId/finance',
      INVOICES: '/app/:companyId/finance/invoices',
      INVOICE_DETAIL: '/app/:companyId/finance/invoices/:invoiceId',
    },
    PROJECTS: { ROOT: '/app/:companyId/projects' },
    CRM: { ROOT: '/app/:companyId/crm' },
    ASSETS: { ROOT: '/app/:companyId/assets' },
    REPORTS: { ROOT: '/app/:companyId/reports' },
    SETTINGS: { ROOT: '/app/:companyId/settings' },
  },
} as const;
```

Navigation helpers that interpolate `:companyId` and other parameters are co-located in `src/shared/utils/routes.ts`.

---

## 8. State Management Strategy

See `docs/adr/ADR-004-zustand-state-management.md` for full decision context.

Zustand is the exclusive client-side state management library. Redux, MobX, Jotai, Context-for-state, and other state libraries are not permitted.

### Permitted State Categories

| Category | Location | Example |
|---|---|---|
| Global auth state | `shared/stores/authStore.ts` | Current user, token |
| Global tenant state | `shared/stores/tenantStore.ts` | Active company context |
| Feature-local UI state | `features/<name>/stores/` | Selected rows, filter panel open |
| Server-cache state | Feature store | Fetched entity lists |

React Context is permitted only for dependency injection (theme provider, i18n provider) — not for application state.

---

## 9. State Boundary Policy

Every Zustand store must declare its boundary explicitly in a JSDoc comment at the top of the file.

### Rules

1. **Auth store** owns: current user identity, Firebase token, login/logout actions.
2. **Tenant store** owns: active `companyId`, company metadata, switching logic.
3. **Feature stores** own: UI state and cached entity data for that feature only. They must not reference other feature stores directly.
4. **No derived state duplication.** If a value can be computed from store A, it must not be stored again in store B. Use Zustand selectors instead.
5. **Persistence.** Only auth and tenant stores may use `zustand/middleware/persist`. Feature stores are session-only unless explicitly justified in an ADR.

### Template

```typescript
/**
 * STORE BOUNDARY: Finance module
 * Owns: invoice list cache, active invoice ID, filter state
 * Does NOT own: auth, tenant context, user profile
 */
```

---

## 10. API Layer Strategy

All network communication goes through the service layer in `src/shared/services/` (for shared infrastructure) or `src/features/<name>/services/` (for feature-specific endpoints).

### Principles

1. **No fetch/axios calls in components or hooks directly.** Components call hooks; hooks call services; services call the network.
2. **Centralized Axios instance.** A single `src/shared/services/apiClient.ts` creates and configures the Axios instance with base URL, auth interceptor (attaches Firebase ID token), and response interceptor (normalizes errors into `AppError`).
3. **Firebase Firestore calls** follow the same pattern: Firestore logic lives in service files, not in components or stores.
4. **Service functions return typed promises.** Every service function signature must declare its return type as `Promise<ApiResponse<T>>` or a specific entity type — never `Promise<any>`.
5. **Error translation at the service boundary.** Network errors, Firebase errors, and HTTP error codes are all translated into a unified `AppError` type before being thrown or returned.

### Layered Call Chain

```
Component
  → calls custom hook (useInvoices, useCreateProject, etc.)
    → hook calls service function
      → service function uses apiClient or Firestore SDK
        → response normalized to ApiResponse<T>
          → errors normalized to AppError
```

---

## 11. API Response Contract

**Rule: Every backend API must return a response conforming to `ApiResponse<T>`. No API may return a bare object or a non-standard shape.**

This contract lives in `src/shared/types/api.ts`.

### Shape

```typescript
// src/shared/types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;          // machine-readable, e.g. "INVOICE_NOT_FOUND"
  message: string;       // human-readable, may be shown to user
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}
```

### Contract Rules

- `success: true` → `data` is populated, `error` is null.
- `success: false` → `error` is populated, `data` is null.
- `meta` is present only for paginated list responses.

---

## 12. Authentication and Authorization

See `docs/adr/ADR-002-firebase-authentication.md` for full decision context.

### Authentication Flow

1. User authenticates via Firebase Auth (email/password or OAuth provider).
2. Firebase issues a JWT ID token.
3. The Axios interceptor in `apiClient.ts` attaches the current Firebase ID token as a `Bearer` token on every request.
4. The auth store holds the decoded user identity and the Firebase `User` object.
5. Firebase silently refreshes expired tokens; the interceptor always calls `getIdToken(true)` to guarantee freshness.

### Authorization Checks

- **UI-level guards:** `<ProtectedRoute>` checks `authStore` for authenticated state.
- **Module-level guards:** The module registry entry's `requiredPermission` is checked before rendering a module route.
- **Feature-level guards:** Components call a `usePermission(key)` hook that reads from the tenant's role/permission matrix.
- **Server-level enforcement:** Firebase Security Rules and backend validation are the true authority. Client-side checks are UX only.

---

## 13. Permission Constants

**Rule: Permission strings must never be written as string literals in component or hook code.**

All permission keys are defined in `src/shared/constants/permissions.ts`.

### Pattern

```typescript
// src/shared/constants/permissions.ts

export const PERMISSIONS = {
  FINANCE: {
    VIEW_INVOICES: 'finance:invoices:view',
    CREATE_INVOICE: 'finance:invoices:create',
    EDIT_INVOICE: 'finance:invoices:edit',
    DELETE_INVOICE: 'finance:invoices:delete',
    VIEW_EXPENSES: 'finance:expenses:view',
  },
  PROJECTS: {
    VIEW_PROJECTS: 'projects:view',
    CREATE_PROJECT: 'projects:create',
    MANAGE_MEMBERS: 'projects:members:manage',
  },
  CRM: {
    VIEW_CONTACTS: 'crm:contacts:view',
    MANAGE_PIPELINE: 'crm:pipeline:manage',
  },
  ASSETS: {
    VIEW_ASSETS: 'assets:view',
    MANAGE_ASSETS: 'assets:manage',
  },
  REPORTS: {
    VIEW_REPORTS: 'reports:view',
    EXPORT_REPORTS: 'reports:export',
  },
  SETTINGS: {
    MANAGE_USERS: 'settings:users:manage',
    MANAGE_ROLES: 'settings:roles:manage',
    MANAGE_BILLING: 'settings:billing:manage',
  },
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS][string];
```

### Usage

```typescript
// CORRECT
usePermission(PERMISSIONS.FINANCE.CREATE_INVOICE)

// WRONG — string literal, not permitted
usePermission('finance:invoices:create')
```

---

## 14. Role and Permission Model

The system uses role-based access control (RBAC) scoped per company (tenant).

### Default Roles

| Role | Description |
|---|---|
| `owner` | Full access to all modules and settings |
| `admin` | Full access except billing |
| `manager` | Read/write on operational modules, no settings |
| `member` | Read-only on operational modules |
| `viewer` | Read-only on reports only |

Custom roles may be created per-tenant by users with `PERMISSIONS.SETTINGS.MANAGE_ROLES`.

### Checking Permissions in Code

```typescript
const canCreate = usePermission(PERMISSIONS.FINANCE.CREATE_INVOICE);
if (!canCreate) return <AccessDenied />;
```

---

## 15. Multi-Tenant Context

DevSmartX ERP is a multi-tenant application. Every piece of data is scoped to a `companyId`.

### Rules

1. Every API call includes `companyId` — in the URL path or request body.
2. Every Firestore document path includes `companyId`. Pattern: `companies/{companyId}/invoices/{invoiceId}`.
3. Components never access `companyId` from local state or props — they read from `useTenantId()` hook backed by the tenant store.
4. Switching companies resets all feature stores to prevent data leakage.

### Tenant Context Shape

```typescript
interface TenantContext {
  companyId: string;
  companyName: string;
  plan: 'free' | 'pro' | 'enterprise';
  locale: string;            // e.g. "en-US"
  currency: CurrencyCode;    // e.g. "USD"
  timezone: string;          // IANA, e.g. "America/New_York"
  enabledModules: ModuleKey[];
  userRole: string;
  userPermissions: PermissionKey[];
}
```

---

## 16. Entity Base Convention

**Rule: Every persisted entity must include these base fields. No exceptions.**

### Base Interface

```typescript
// src/shared/types/entity.ts

export interface EntityBase {
  id: string;           // UUID v4, generated server-side
  companyId: string;    // tenant isolation
  createdAt: string;    // UTC ISO 8601
  updatedAt: string;    // UTC ISO 8601
  createdBy: string;    // userId of creator
  updatedBy: string;    // userId of last editor
  isDeleted: boolean;   // soft delete — NEVER hard delete
}
```

### Usage

```typescript
interface Invoice extends EntityBase {
  number: string;
  clientId: string;
  lineItems: LineItem[];
  total: MonetaryAmount;
  status: InvoiceStatus;
}
```

### Soft Delete Policy

Records are never physically deleted. `isDeleted: true` marks a record as removed. All queries must filter `isDeleted === false` by default. "Delete" actions set `isDeleted = true` and update `updatedAt` and `updatedBy`.

---

## 17. UI State Convention

**Rule: Features must not invent their own loading, skeleton, empty, or error UI patterns.**

All reusable UI states are defined in `src/shared/components/states/`.

### Standard State Components

| Component | Props | Usage |
|---|---|---|
| `<LoadingSpinner>` | `size`, `label` | Inline loading indicator |
| `<PageSkeleton>` | `rows`, `variant` | Full-page loading skeleton |
| `<CardSkeleton>` | `count` | Card-grid loading skeleton |
| `<TableSkeleton>` | `rows`, `columns` | Table loading skeleton |
| `<EmptyState>` | `icon`, `title`, `description`, `action?` | No data found |
| `<ErrorState>` | `error`, `onRetry?` | Recoverable error display |
| `<AccessDenied>` | `permission?` | Permission gate fallback |

### Feature Usage Pattern

```typescript
// CORRECT
if (isLoading) return <PageSkeleton rows={5} />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
if (!data?.length) return <EmptyState title="No invoices yet" />;

// WRONG
if (isLoading) return <div className="animate-spin">...</div>;
```

---

## 18. Icons Policy

**Rule: Lucide React is the only permitted icon library in this project.**

No other icon library may be added (FontAwesome, Material Icons, Heroicons, React Icons, etc.).

### Rationale

- Tree-shakeable — only imported icons are bundled.
- De-facto standard for React + Tailwind + Vite stacks.
- MIT licensed. First-class TypeScript support with `LucideIcon` type.
- 1,300+ icons with a consistent design language.

### Usage

```typescript
import { FileText, PlusCircle, Trash2 } from 'lucide-react';

<FileText className="w-5 h-5 text-gray-500" />
```

### Exception Process

If a required icon does not exist in Lucide, create a minimal custom SVG component in `src/assets/icons/`. Document it in the PR. Adding an entirely different library is not permitted.

---

## 19. Date Strategy

**Rule: All dates are stored and transmitted as UTC ISO 8601 strings. Local-time conversion occurs only at the presentation layer.**

### Storage Rule

- Format: `"2026-08-01T12:00:00.000Z"` — always UTC, always with milliseconds and `Z` suffix.
- TypeScript type: `string` — never `Date`. Native `Date` objects are never stored in the database or Zustand state.

### Parsing and Formatting

All date parsing and formatting uses `date-fns`. Moment.js and Day.js are not permitted.

```typescript
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const date = parseISO(entity.createdAt);
const display = formatInTimeZone(date, tenantContext.timezone, 'dd MMM yyyy');
```

---

## 20. Currency Strategy

**Rule: Every monetary value carries both an `amount` and a `currencyCode`. Bare numeric values for money are not permitted.**

### Monetary Amount Type

```typescript
// src/shared/types/currency.ts

export type CurrencyCode = string; // ISO 4217, e.g. "USD", "EUR"

export interface MonetaryAmount {
  amount: number;
  currencyCode: CurrencyCode;
}
```

### Display Formatting

```typescript
// src/shared/utils/formatCurrency.ts
export function formatCurrency(value: MonetaryAmount, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currencyCode,
  }).format(value.amount);
}
```

### Rules

1. Money is stored as a precise number — rounding for display only.
2. Currency conversion is server-side only. Never convert client-side.
3. The tenant's default currency comes from `tenantContext.currency`.

---

## 21. Business Logic Rule

**Rule: Business logic must never live in UI components. It belongs exclusively in services, hooks, or use-case functions.**

### Definitions

- **UI component:** Returns JSX. Its sole job is to render data and capture user intent.
- **Hook:** Orchestrates state, calls services, derives display values.
- **Service function:** Handles network calls, data normalization, and error translation.
- **Use-case function:** Pure function in `utils/` or `useCases/` — domain calculations with no side effects.

### Pattern

```typescript
// WRONG — business logic in component
function InvoiceForm() {
  const handleSubmit = (data) => {
    const total = data.lineItems.reduce((acc, i) => acc + i.qty * i.price, 0);
    if (total > creditLimit) { setError('...'); return; }
    api.post('/invoices', { ...data, total });
  };
}

// CORRECT
function InvoiceForm() {
  const { submitInvoice } = useCreateInvoice();
  const handleSubmit = (data) => submitInvoice(data);
}
```

---

## 22. Type Folder Ownership

Types are co-located with their owner. A type lives as close to its consumer as possible, but no closer than where it needs to be shared.

### Decision Tree

| Situation | Location |
|---|---|
| Type used by one component only | Same file as the component |
| Type used by multiple files within one feature | `features/<name>/types/index.ts` |
| Type used by multiple features | `src/shared/types/` |
| Type describes an API contract or entity base | `src/shared/types/` — always |

### Rules

1. `src/shared/types/` contains only: `EntityBase`, `ApiResponse<T>`, `ApiError`, `ApiMeta`, `MonetaryAmount`, `CurrencyCode`, `TenantContext`, and other cross-cutting types.
2. Feature-internal types (form shapes, local props) must NOT be in `src/shared/types/`.
3. Every type file uses named exports — no default exports for types.

---

## 23. Internationalization (i18n) Approach

### Library

`react-i18next` with `i18next`. This is the only permitted i18n solution.

### File Organization

```
src/shared/i18n/
  index.ts               # i18next initialization
  locales/
    en/
      common.json        # Shared strings
      finance.json
      projects.json
      crm.json
      assets.json
      reports.json
      settings.json
    ar/
      ...                # Arabic translations (RTL support required)
```

### Rules

1. No hardcoded user-facing strings in components. All strings go through `t('key')`.
2. Translation keys follow `namespace.section.key` pattern: `finance.invoices.createTitle`.
3. The `en` locale is the source of truth.
4. RTL layout support is a first-class requirement. The `dir` attribute on `<html>` responds to locale. Tailwind's `rtl:` variant is used for layout mirroring.

---

## 24. Global Error Handling

### Layers

| Layer | Mechanism | Responsibility |
|---|---|---|
| React render errors | `<ErrorBoundary>` at app root and each feature route | Catch render exceptions, show fallback UI |
| Network/API errors | Axios response interceptor | Normalize HTTP errors to `AppError`, trigger toast for 5xx |
| Firebase errors | Service layer handler | Map Firebase error codes to `AppError` |
| Business logic errors | Thrown `AppError` from use-case functions | Propagate to hook, hook surfaces to component |
| Form validation errors | Zod + React Hook Form | Inline field-level errors |

### AppError Shape

```typescript
// src/shared/errors/AppError.ts

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Toast Policy

- **5xx errors:** Generic "Something went wrong" toast.
- **400/422:** Inline validation errors, no toast.
- **401:** Redirect to login, session expiry toast.
- **403:** Show `<AccessDenied>` in place of content.
- **Offline:** Persistent `<OfflineBanner>` component.

Toasts are managed by a single `toastService` in `src/shared/services/toastService.ts`.

---

## 25. File Upload Strategy

See `docs/adr/ADR-003-cloudinary-upload-strategy.md` for full decision context.

### Rules

1. **Signed uploads only.** The client never uses an unsigned upload preset.
2. **Upload UI is centralized.** `src/shared/components/upload/FileUploader.tsx` is the single component for all uploads. Features do not implement their own upload UI.
3. **Store references only.** The database stores `cloudinaryPublicId`, `secureUrl`, `resourceType`, `format`, `bytes`. Never store binary data in Firestore.
4. **Transformation at delivery.** Use `buildCloudinaryUrl(publicId, transformations)` in `src/shared/utils/cloudinary.ts`. No component constructs Cloudinary URLs manually.

---

## 26. Architecture Decision Records

All significant architectural decisions are documented as ADRs in `docs/adr/`.

### ADR Index

| ID | Title | Status |
|---|---|---|
| ADR-001 | Feature-Based Architecture | Accepted |
| ADR-002 | Firebase Authentication | Accepted |
| ADR-003 | Cloudinary Upload Strategy | Accepted |
| ADR-004 | Zustand State Management | Accepted |

### How to Create a New ADR

1. Copy the template from `docs/adr/ADR-000-template.md`.
2. Assign the next sequential ID.
3. Fill in: Title, Status, Context, Decision, Consequences.
4. Set Status to `Proposed`.
5. Get team review before setting Status to `Accepted`.
6. If superseded, set Status to `Superseded` and link to the new ADR.

---

## 27. Financial Transaction Engine

**This is an architectural principle, not a feature.**

All financial state in DevSmartX ERP — balances, reports, cash flow, debts, partner equity, and summaries — is **derived** from a single source: the Transaction ledger. No module may maintain its own independent financial counters or cached totals.

### Core Principle

Every financial operation in the system is recorded as an immutable Transaction entry. The current state of any account, wallet, partner balance, or report is computed by aggregating and filtering transactions. There is no other authoritative source for financial data.

### Transaction Types

| Type | Description |
|---|---|
| `Expense` | Money paid out for an operational cost |
| `Revenue` | Money received from customers or other income sources |
| `PartnerContribution` | Capital contributed by a business partner |
| `PartnerWithdrawal` | Capital withdrawn by a business partner |
| `WalletTransfer` | Movement of funds between internal wallets or accounts |
| `Loan` | Borrowed funds received (increases liability) |
| `LoanRepayment` | Payment toward an outstanding loan |
| `Salary` | Payroll disbursement to an employee |
| `Subscription` | Recurring payment for a subscription service |
| `Refund` | Return of previously received revenue |
| `AssetPurchase` | Acquisition of a capital asset |

### Transaction Entity Shape

```typescript
interface Transaction extends EntityBase {
  type: TransactionType;
  amount: MonetaryAmount;
  date: string;              // UTC ISO 8601
  description: string;
  referenceId?: string;      // linked entity ID (invoice, asset, etc.)
  referenceType?: string;    // entity type name
  walletId?: string;         // source/destination wallet
  partnerId?: string;        // relevant for partner transactions
  categoryId?: string;       // expense/revenue category
  attachments?: string[];    // Cloudinary public IDs
  notes?: string;
}
```

### Derivation Rule

- **Account balance** = sum of all transactions affecting that account.
- **Cash flow report** = Revenue transactions minus Expense transactions in a period.
- **Partner equity** = sum of PartnerContribution minus sum of PartnerWithdrawal per partner.
- **Outstanding loans** = sum of Loan transactions minus sum of LoanRepayment transactions.
- **Salary ledger** = all Salary transactions filtered by period and employee.

No service, store, or component may compute financial summaries without going through the transaction aggregation layer.

---

## 28. Audit Trail Strategy

Every business action that creates, modifies, or deletes a business entity must produce an audit record. This is a non-negotiable requirement for an ERP system handling financial and operational data.

### AuditEntry Interface

```typescript
// src/shared/types/audit.ts

export interface AuditEntry {
  id: string;
  companyId: string;
  entity: string;            // entity type name, e.g. "Invoice"
  entityId: string;          // ID of the affected record
  action: AuditAction;       // "create" | "update" | "delete" | "restore"
  previousValue: unknown;    // full snapshot before change (null for create)
  newValue: unknown;         // full snapshot after change (null for delete)
  userId: string;            // who performed the action
  timestamp: string;         // UTC ISO 8601
}

export type AuditAction = 'create' | 'update' | 'delete' | 'restore';
```

### Rules

1. **Service layer responsibility.** Audit entries are written by the service layer only — never by components, hooks, or stores. The service that performs the mutation is responsible for writing the corresponding audit entry.
2. **Immutable.** Audit entries are append-only. They are never updated or deleted.
3. **No audit in audit.** Writing an audit entry does not itself create another audit entry.
4. **Firestore path.** Audit entries are stored at `companies/{companyId}/auditLog/{auditEntryId}`.
5. **Async write.** Audit writes are fire-and-forget — they must not block the main mutation operation. A failure to write an audit entry logs an error but does not roll back the business operation.

---

## 29. Domain Events (Future)

This section reserves the architecture for a future domain event system. No implementation is required now. This reservation ensures future notifications, integrations, and automation are built on a consistent foundation rather than retrofitted.

### Intent

When a significant business event occurs, the system will emit a typed domain event. Subscribers (notification engine, integration webhooks, automation rules) react to these events without being tightly coupled to the originating service.

### Planned Event Examples

| Event | Trigger |
|---|---|
| `ExpenseCreated` | A new expense transaction is recorded |
| `RevenueReceived` | A revenue transaction is recorded |
| `InvoicePaid` | An invoice status transitions to `paid` |
| `SubscriptionRenewed` | A subscription transaction is recorded |
| `PartnerWithdrawal` | A partner withdrawal transaction is recorded |
| `LoanDue` | A loan repayment date is approaching |
| `AssetPurchased` | An asset purchase transaction is recorded |
| `ProjectMilestoneReached` | A project milestone is marked complete |

### Future Shape (Reference Only)

```typescript
interface DomainEvent<T> {
  eventId: string;
  eventType: string;        // e.g. "ExpenseCreated"
  companyId: string;
  occurredAt: string;       // UTC ISO 8601
  payload: T;
  triggeredBy: string;      // userId
}
```

When domain events are implemented, a dedicated ADR must be created before any code is written.

---

## 30. Feature Ownership Rule

### Principle

Each feature owns its internal implementation. The boundary of a feature is its `src/features/<name>/` folder and its `index.ts` public API.

### Rules

1. **Internal ownership.** Code inside `features/finance/` is owned exclusively by the Finance feature. No other feature or shared layer may modify files inside another feature's folder. Cross-feature modifications are prohibited.

2. **Modification requires ownership.** If work on feature B requires changing code in feature A, that is a signal that the shared logic should be extracted to `src/shared/` — not that feature B should reach into feature A.

3. **Shared code earns its place.** Code moves to `shared/` only after it has been proven necessary in two or more features. Do not prematurely abstract. Three similar lines across features is better than a premature shared abstraction with the wrong interface.

4. **No speculative exports.** Feature `index.ts` files export only what is actively consumed outside the feature. Exporting internal utilities "just in case" is not permitted.

5. **Refactoring within a feature is the feature team's responsibility.** The team that owns a feature keeps its internals clean. Other teams do not refactor features they do not own without explicit coordination.

---

## 31. Feature Roadmap

The following phases define the planned implementation sequence for DevSmartX ERP. Each phase must be fully completed and approved before the next phase begins. Architecture constraints established in this document apply to all phases.

| Phase | Focus | Key Deliverables |
|---|---|---|
| 1 — Foundation | Project scaffolding and core infrastructure | Vite + React + TypeScript setup, folder structure, linting, shared constants, environment config, Axios client, Firebase init |
| 2 — Authentication | Identity and session management | Firebase Auth integration, login/register screens, auth store, ProtectedRoute, token interceptor |
| 3 — Layout | Application shell | Sidebar with Module Registry-driven navigation, header, tenant context provider, permission gate, responsive shell |
| 4 — Finance | First business module | Transaction Engine implementation, expense/revenue recording, invoice management, wallet management, partner accounts, financial summaries |
| 5 — Reports | Cross-module analytics | Cash flow reports, expense breakdowns, revenue trends, partner equity summaries — all derived from Transaction Engine |
| 6 — Projects | Project management | Project creation, task tracking, milestone management, team assignment, project-linked expenses |
| 7 — CRM | Customer relationship management | Contact management, lead tracking, deal pipeline, CRM-linked invoices |
| 8 — Assets | Asset management | Asset registration, asset photos (Cloudinary), depreciation tracking, asset-linked purchase transactions |
| 9 — Notifications | Alerts and automation | Domain event consumers, in-app notifications, email alerts for key business events |
| 10 — Backend Migration | ASP.NET Core Web API | Migrate from Firestore to ASP.NET Core backend; Axios client switches from Firestore SDK to REST API; Firebase Auth retained for identity |

---

## 32. Conventions Summary

Quick-reference checklist for developers. Refer to the linked section for full context.

| Rule | Reference |
|---|---|
| Never hardcode route strings | Section 7 — use `ROUTES` constants |
| Never hardcode permission strings | Section 13 — use `PERMISSIONS` constants |
| Every entity extends `EntityBase` | Section 16 |
| All API responses use `ApiResponse<T>` | Section 11 |
| Never hard delete — soft delete only | Section 16 |
| Business logic not in components | Section 21 |
| One icon library: Lucide React | Section 18 |
| Dates stored as UTC ISO 8601 strings | Section 19 |
| Money always has `amount` + `currencyCode` | Section 20 |
| No custom loading/empty/error UI in features | Section 17 |
| Cross-feature imports are prohibited | Section 4 |
| State library: Zustand only | Section 8 |
| Every store has a declared boundary | Section 9 |
| i18n: react-i18next, no hardcoded strings | Section 23 |
| Type ownership follows co-location rule | Section 22 |
| File uploads via centralized FileUploader | Section 25 |
| All errors normalize to `AppError` | Section 24 |
| All financial state derived from Transactions | Section 27 |
| Every mutation writes an audit entry | Section 28 |
| Shared code earns its place — no premature abstraction | Section 30 |
| New architectural decisions require an ADR | Section 26 |
