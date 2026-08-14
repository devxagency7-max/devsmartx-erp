const BLOCKED_FIELD_PATTERNS: RegExp[] = [
  /api.?key/i,
  /secret/i,
  /token/i,
  /credential/i,
  /password/i,
  /firebase/i,
  /cloudinary/i,
  /upload.?preset/i,
  /cloud.?name/i,
  /private/i,
];

export function isSensitiveKey(key: string): boolean {
  return BLOCKED_FIELD_PATTERNS.some((pattern) => pattern.test(key));
}

export function sanitizeRecord<T extends Record<string, unknown>>(
  record: T,
  allowedKeys: string[],
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of allowedKeys) {
    if (!isSensitiveKey(key) && key in record) {
      result[key as keyof T] = record[key as keyof T];
    }
  }
  return result;
}
