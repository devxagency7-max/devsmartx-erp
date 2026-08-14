export const MODULES = {
  FINANCE: 'finance',
  PROJECTS: 'projects',
  CRM: 'crm',
  ASSETS: 'assets',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES];
