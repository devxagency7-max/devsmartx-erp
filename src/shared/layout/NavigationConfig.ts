import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  DollarSign,
  FolderKanban,
  Users,
  Package,
  BarChart3,
  Settings,
  ReceiptText,
  Database,
  CreditCard,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  CalendarClock,
  Users2,
  UserCog,
  ShieldCheck,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/app/router/constants';
import type { FeatureFlag } from '@/core/config/featureFlags';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  permission: string | null;
  featureFlag: FeatureFlag | null;
  group: 'main' | 'modules' | 'system';
  badge?: string;
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  // Main
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: ROUTE_PATHS.DASHBOARD,
    permission: null,
    featureFlag: null,
    group: 'main',
  },

  // Modules — Finance
  {
    key: 'finance',
    label: 'Finance',
    icon: DollarSign,
    path: ROUTE_PATHS.FINANCE_OVERVIEW,
    permission: null,
    featureFlag: 'finance',
    group: 'modules',
    children: [
      {
        key: 'financeOverview',
        label: 'Overview',
        icon: LayoutDashboard,
        path: ROUTE_PATHS.FINANCE_OVERVIEW,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'paymentSources',
        label: 'Payment Sources',
        icon: CreditCard,
        path: ROUTE_PATHS.PAYMENT_SOURCES,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'transactions',
        label: 'Transactions',
        icon: ReceiptText,
        path: ROUTE_PATHS.TRANSACTIONS,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'expenses',
        label: 'Expenses',
        icon: ShoppingCart,
        path: ROUTE_PATHS.EXPENSES,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'revenues',
        label: 'Revenue',
        icon: TrendingUp,
        path: ROUTE_PATHS.REVENUES,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'commitments',
        label: 'Commitments',
        icon: CalendarClock,
        path: ROUTE_PATHS.COMMITMENTS,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'people',
        label: 'People',
        icon: Users,
        path: ROUTE_PATHS.PEOPLE,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
      },
      {
        key: 'masterData',
        label: 'Master Data',
        icon: Database,
        path: ROUTE_PATHS.PAYMENT_METHODS,
        permission: null,
        featureFlag: 'finance',
        group: 'modules',
        children: [
          {
            key: 'paymentMethods',
            label: 'Payment Methods',
            icon: CreditCard,
            path: ROUTE_PATHS.PAYMENT_METHODS,
            permission: null,
            featureFlag: 'finance',
            group: 'modules',
          },
          {
            key: 'partners',
            label: 'Partners',
            icon: UserCheck,
            path: ROUTE_PATHS.PARTNERS,
            permission: null,
            featureFlag: 'finance',
            group: 'modules',
          },
        ],
      },
    ],
  },

  // Modules — CRM
  {
    key: 'crm',
    label: 'CRM',
    icon: Users2,
    path: ROUTE_PATHS.CRM,
    permission: null,
    featureFlag: 'crm',
    group: 'modules',
    children: [
      {
        key: 'customers',
        label: 'Customers',
        icon: Users2,
        path: ROUTE_PATHS.CRM_CUSTOMERS,
        permission: null,
        featureFlag: 'crm',
        group: 'modules',
      },
      {
        key: 'offers',
        label: 'Offers',
        icon: ReceiptText,
        path: ROUTE_PATHS.CRM_OFFERS,
        permission: null,
        featureFlag: 'crm',
        group: 'modules',
      },
    ],
  },

  // Modules — Others
  {
    key: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    path: ROUTE_PATHS.PROJECTS,
    permission: null,
    featureFlag: 'projects',
    group: 'modules',
  },
  {
    key: 'assets',
    label: 'Assets',
    icon: Package,
    path: ROUTE_PATHS.ASSETS,
    permission: null,
    featureFlag: 'assets',
    group: 'modules',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: ROUTE_PATHS.REPORTS,
    permission: null,
    featureFlag: 'reports',
    group: 'modules',
  },

  // System
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    path: ROUTE_PATHS.SETTINGS,
    permission: null,
    featureFlag: null,
    group: 'system',
  },
  {
    key: 'users',
    label: 'Users',
    icon: UserCog,
    path: ROUTE_PATHS.SYSTEM_USERS,
    permission: null,
    featureFlag: null,
    group: 'system',
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: ShieldCheck,
    path: ROUTE_PATHS.SYSTEM_PERMISSIONS,
    permission: null,
    featureFlag: null,
    group: 'system',
  },
];
