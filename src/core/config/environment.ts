function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    throw new Error(`[Environment] Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return (import.meta.env[key] as string | undefined) ?? fallback;
}

export const environment = {
  isDevelopment: import.meta.env.DEV as boolean,
  isProduction: import.meta.env.PROD as boolean,
  isStaging: import.meta.env.MODE === 'staging',

  apiBaseUrl: optionalEnv('VITE_API_BASE_URL', '/api'),

  firebase: {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
  },

  cloudinary: {
    cloudName: optionalEnv('VITE_CLOUDINARY_CLOUD_NAME'),
    uploadPreset: optionalEnv('VITE_CLOUDINARY_UPLOAD_PRESET'),
  },
} as const;
