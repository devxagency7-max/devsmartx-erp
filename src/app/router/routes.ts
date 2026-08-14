import { lazy } from 'react';
import { ROUTE_PATHS } from './constants';

export const publicRoutes = [
  {
    path: ROUTE_PATHS.LOGIN,
    Component: lazy(() =>
      import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
    ),
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    Component: lazy(() =>
      import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
        default: m.ForgotPasswordPage,
      })),
    ),
  },
];

// Each entry is a child rendered inside DashboardLayout via <Outlet>
export const dashboardRoutes = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    Component: lazy(() =>
      import('@/features/dashboard/pages/DashboardHomePage').then((m) => ({
        default: m.DashboardHomePage,
      })),
    ),
  },
  // Finance — Payment Sources
  { path: ROUTE_PATHS.PAYMENT_SOURCES, Component: lazy(() => import('@/features/finance/payment-sources/pages/PaymentSourceListPage')) },
  { path: ROUTE_PATHS.PAYMENT_SOURCES_NEW, Component: lazy(() => import('@/features/finance/payment-sources/pages/CreatePaymentSourcePage')) },
  { path: ROUTE_PATHS.PAYMENT_SOURCE_DETAILS, Component: lazy(() => import('@/features/finance/payment-sources/pages/PaymentSourceDetailsPage')) },
  { path: ROUTE_PATHS.PAYMENT_SOURCE_EDIT, Component: lazy(() => import('@/features/finance/payment-sources/pages/EditPaymentSourcePage')) },
  // Finance — Transactions
  {
    path: ROUTE_PATHS.TRANSACTIONS,
    Component: lazy(() =>
      import('@/features/finance/transactions/pages/TransactionListPage').then((m) => ({
        default: m.TransactionListPage,
      })),
    ),
  },
  {
    path: ROUTE_PATHS.TRANSACTIONS_NEW,
    Component: lazy(() =>
      import('@/features/finance/transactions/pages/CreateTransactionPage').then((m) => ({
        default: m.CreateTransactionPage,
      })),
    ),
  },
  {
    path: ROUTE_PATHS.TRANSACTION_DETAILS,
    Component: lazy(() =>
      import('@/features/finance/transactions/pages/TransactionDetailsPage').then((m) => ({
        default: m.TransactionDetailsPage,
      })),
    ),
  },
  {
    path: ROUTE_PATHS.TRANSACTION_EDIT,
    Component: lazy(() =>
      import('@/features/finance/transactions/pages/EditTransactionPage').then((m) => ({
        default: m.EditTransactionPage,
      })),
    ),
  },
  // Finance — Workflows — Expenses
  { path: ROUTE_PATHS.EXPENSES, Component: lazy(() => import('@/features/finance/workflows/expense/pages/ExpenseListPage')) },
  { path: ROUTE_PATHS.EXPENSES_NEW, Component: lazy(() => import('@/features/finance/workflows/expense/pages/CreateExpensePage')) },
  { path: ROUTE_PATHS.EXPENSE_DETAILS, Component: lazy(() => import('@/features/finance/workflows/expense/pages/ExpenseDetailsPage')) },
  { path: ROUTE_PATHS.EXPENSE_EDIT, Component: lazy(() => import('@/features/finance/workflows/expense/pages/EditExpensePage')) },
  // Finance — Master Data — Categories
  { path: ROUTE_PATHS.CATEGORIES, Component: lazy(() => import('@/features/finance/master-data/categories/pages/CategoryListPage')) },
  { path: ROUTE_PATHS.CATEGORIES_NEW, Component: lazy(() => import('@/features/finance/master-data/categories/pages/CreateCategoryPage')) },
  { path: ROUTE_PATHS.CATEGORY_EDIT, Component: lazy(() => import('@/features/finance/master-data/categories/pages/EditCategoryPage')) },
  // Finance — Master Data — Tags
  { path: ROUTE_PATHS.TAGS, Component: lazy(() => import('@/features/finance/master-data/tags/pages/TagsPage')) },
  // Finance — Master Data — Payment Methods
  { path: ROUTE_PATHS.PAYMENT_METHODS, Component: lazy(() => import('@/features/finance/master-data/payment-methods/pages/PaymentMethodsPage')) },
  // Finance — Master Data — Partners
  { path: ROUTE_PATHS.PARTNERS, Component: lazy(() => import('@/features/finance/master-data/partners/pages/PartnersListPage')) },
  { path: ROUTE_PATHS.PARTNERS_NEW, Component: lazy(() => import('@/features/finance/master-data/partners/pages/CreatePartnerPage')) },
  { path: ROUTE_PATHS.PARTNER_DETAILS, Component: lazy(() => import('@/features/finance/master-data/partners/pages/PartnerDetailsPage')) },
  { path: ROUTE_PATHS.PARTNER_EDIT, Component: lazy(() => import('@/features/finance/master-data/partners/pages/EditPartnerPage')) },
  // Finance — Master Data — Cost Centers
  { path: ROUTE_PATHS.COST_CENTERS, Component: lazy(() => import('@/features/finance/master-data/cost-centers/pages/CostCentersListPage')) },
  { path: ROUTE_PATHS.COST_CENTERS_NEW, Component: lazy(() => import('@/features/finance/master-data/cost-centers/pages/CreateCostCenterPage')) },
  { path: ROUTE_PATHS.COST_CENTER_EDIT, Component: lazy(() => import('@/features/finance/master-data/cost-centers/pages/EditCostCenterPage')) },
  // Finance — Master Data — Currencies
  { path: ROUTE_PATHS.CURRENCIES, Component: lazy(() => import('@/features/finance/master-data/currencies/pages/CurrenciesPage')) },
  // Finance — Recurring Commitments
  { path: ROUTE_PATHS.COMMITMENTS, Component: lazy(() => import('@/features/finance/commitments/pages/RecurringCommitmentsListPage')) },
  { path: ROUTE_PATHS.COMMITMENTS_NEW, Component: lazy(() => import('@/features/finance/commitments/pages/CreateCommitmentPage')) },
  { path: ROUTE_PATHS.COMMITMENT_DETAILS, Component: lazy(() => import('@/features/finance/commitments/pages/CommitmentDetailsPage')) },
  { path: ROUTE_PATHS.COMMITMENT_EDIT, Component: lazy(() => import('@/features/finance/commitments/pages/EditCommitmentPage')) },
  // Finance — People Ledger
  { path: ROUTE_PATHS.PEOPLE, Component: lazy(() => import('@/features/finance/people/pages/PeopleListPage')) },
  { path: ROUTE_PATHS.PEOPLE_NEW, Component: lazy(() => import('@/features/finance/people/pages/CreatePersonPage')) },
  { path: ROUTE_PATHS.PERSON_DETAILS, Component: lazy(() => import('@/features/finance/people/pages/PersonDetailsPage')) },
  { path: ROUTE_PATHS.PERSON_EDIT, Component: lazy(() => import('@/features/finance/people/pages/EditPersonPage')) },
  { path: ROUTE_PATHS.PERSON_LEDGER, Component: lazy(() => import('@/features/finance/people/pages/PersonLedgerPage')) },
  { path: ROUTE_PATHS.PERSON_SETTLEMENT, Component: lazy(() => import('@/features/finance/people/pages/CreateSettlementPage')) },
  // Finance — Overview
  { path: ROUTE_PATHS.FINANCE_OVERVIEW, Component: lazy(() => import('@/features/finance/overview/pages/FinanceOverviewPage')) },
  // Finance — Workflows — Revenue (list)
  { path: ROUTE_PATHS.REVENUES, Component: lazy(() => import('@/features/finance/workflows/revenue/pages/RevenueListPage')) },
  // System
  { path: ROUTE_PATHS.SETTINGS, Component: lazy(() => import('@/shared/pages/SettingsPage')) },
  { path: ROUTE_PATHS.SYSTEM_USERS, Component: lazy(() => import('@/shared/pages/SystemUsersPage')) },
  { path: ROUTE_PATHS.SYSTEM_PERMISSIONS, Component: lazy(() => import('@/shared/pages/SystemPermissionsPage')) },
  // CRM
  { path: ROUTE_PATHS.CRM, Component: lazy(() => import('@/shared/pages/CrmPage')) },
  { path: ROUTE_PATHS.CRM_CUSTOMERS, Component: lazy(() => import('@/shared/pages/CrmCustomersPage')) },
  { path: ROUTE_PATHS.CRM_OFFERS, Component: lazy(() => import('@/shared/pages/CrmOffersPage')) },
  // Projects / Assets / Reports
  { path: ROUTE_PATHS.PROJECTS, Component: lazy(() => import('@/shared/pages/ProjectsPage')) },
  { path: ROUTE_PATHS.ASSETS, Component: lazy(() => import('@/shared/pages/AssetsPage')) },
  { path: ROUTE_PATHS.REPORTS, Component: lazy(() => import('@/shared/pages/ReportsPage')) },
];

export const openRoutes = [
  {
    path: ROUTE_PATHS.HOME,
    Component: lazy(() =>
      import('@/shared/pages/HomePage').then((m) => ({ default: m.HomePage })),
    ),
  },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    Component: lazy(() =>
      import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
    ),
  },
];
