import type { AppEnvironment } from '@/shared/types/AppEnvironment';

export const APP_NAME = 'DevSmartX ERP';
export const APP_VERSION = '0.1.0';

export const APP_ENV: AppEnvironment =
  (import.meta.env.MODE as AppEnvironment) ?? 'development';

export const IS_DEV = APP_ENV === 'development';
export const IS_PROD = APP_ENV === 'production';
