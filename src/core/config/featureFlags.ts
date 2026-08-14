export const featureFlags = {
  finance: true,
  reports: false,
  projects: false,
  crm: false,
  assets: false,
  notifications: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
