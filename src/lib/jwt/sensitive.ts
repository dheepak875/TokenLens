export const DEFAULT_SENSITIVE_KEYS = [
  'access_token',
  'refresh_token',
  'id_token',
  'password',
  'secret',
  'api_key',
  'apikey',
  'authorization',
  'cookie',
  'session',
  'private_key',
  'secret_key',
  'client_secret',
  'ssn',
  'credit_card',
];

export function isSensitiveKey(key: string, customKeys?: string[]): boolean {
  const lower = key.toLowerCase();
  const keysToTest = customKeys || DEFAULT_SENSITIVE_KEYS;
  return keysToTest.some((k) => lower.includes(k.toLowerCase()));
}

export function redactValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  if (Array.isArray(value)) {
    return value.map((item, idx) => redactValue(`${key}[${idx}]`, item));
  }
  return `[REDACTED ${key}]`;
}

export function redactObject(
  obj: Record<string, unknown> | null,
  customKeys?: string[]
): Record<string, unknown> | null {
  if (!obj) return null;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key, customKeys)) {
      result[key] = `[REDACTED ${key}]`;
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      result[key] = redactObject(
        value as Record<string, unknown>,
        customKeys
      );
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return redactObject(item as Record<string, unknown>, customKeys);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function redactCompactToken(token: string): string {
  if (!token) return '';
  const parts = token.split('.');
  if (parts.length === 3) {
    // Redact payload part with placeholder for privacy display
    return `${parts[0]}.[REDACTED_PAYLOAD].${parts[2].slice(0, 6)}...`;
  }
  if (parts.length === 5) {
    return `${parts[0]}.[ENCRYPTED_KEY].[IV].[CIPHERTEXT].${parts[4].slice(0, 6)}...`;
  }
  return '[REDACTED_TOKEN]';
}
