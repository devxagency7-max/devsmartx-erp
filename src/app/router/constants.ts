export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  // Finance — Payment Sources
  FINANCE: '/finance',
  PAYMENT_SOURCES: '/finance/payment-sources',
  PAYMENT_SOURCES_NEW: '/finance/payment-sources/new',
  PAYMENT_SOURCE_DETAILS: '/finance/payment-sources/:id',
  PAYMENT_SOURCE_EDIT: '/finance/payment-sources/:id/edit',
  // Finance — Transactions
  TRANSACTIONS: '/finance/transactions',
  TRANSACTIONS_NEW: '/finance/transactions/new',
  TRANSACTION_DETAILS: '/finance/transactions/:id',
  TRANSACTION_EDIT: '/finance/transactions/:id/edit',
  // Finance — Workflows — Expenses
  EXPENSES: '/finance/expenses',
  EXPENSES_NEW: '/finance/expenses/new',
  EXPENSE_DETAILS: '/finance/expenses/:id',
  EXPENSE_EDIT: '/finance/expenses/:id/edit',
  // Finance — Workflows — Revenue
  REVENUES: '/finance/revenues',
  REVENUES_NEW: '/finance/revenues/new',
  REVENUE_DETAILS: '/finance/revenues/:id',
  REVENUE_EDIT: '/finance/revenues/:id/edit',
  // Finance — Master Data
  CATEGORIES: '/finance/master-data/categories',
  CATEGORIES_NEW: '/finance/master-data/categories/new',
  CATEGORY_EDIT: '/finance/master-data/categories/:id/edit',
  TAGS: '/finance/master-data/tags',
  PAYMENT_METHODS: '/finance/master-data/payment-methods',
  PARTNERS: '/finance/master-data/partners',
  PARTNERS_NEW: '/finance/master-data/partners/new',
  PARTNER_DETAILS: '/finance/master-data/partners/:id',
  PARTNER_EDIT: '/finance/master-data/partners/:id/edit',
  PARTNER_MIGRATION: '/finance/master-data/partners/migration',
  COST_CENTERS: '/finance/master-data/cost-centers',
  COST_CENTERS_NEW: '/finance/master-data/cost-centers/new',
  COST_CENTER_EDIT: '/finance/master-data/cost-centers/:id/edit',
  CURRENCIES: '/finance/master-data/currencies',
  // Finance — Recurring Commitments
  COMMITMENTS: '/finance/commitments',
  COMMITMENTS_NEW: '/finance/commitments/new',
  COMMITMENT_DETAILS: '/finance/commitments/:id',
  COMMITMENT_EDIT: '/finance/commitments/:id/edit',
  // Finance — People Ledger
  PEOPLE: '/finance/people',
  PEOPLE_NEW: '/finance/people/new',
  PERSON_DETAILS: '/finance/people/:id',
  PERSON_EDIT: '/finance/people/:id/edit',
  PERSON_LEDGER: '/finance/people/:id/ledger',
  PERSON_SETTLEMENT: '/finance/people/:id/settlement',
  // Finance — Overview
  FINANCE_OVERVIEW: '/finance/overview',
  // System
  SETTINGS: '/settings',
  SYSTEM_USERS: '/system/users',
  SYSTEM_PERMISSIONS: '/system/permissions',
  // CRM
  CRM: '/crm',
  CRM_CUSTOMERS: '/crm/customers',
  CRM_OFFERS: '/crm/offers',
  // Projects
  PROJECTS: '/projects',
  // Assets & Reports
  ASSETS: '/assets',
  REPORTS: '/reports',
  NOT_FOUND: '*',
} as const;
