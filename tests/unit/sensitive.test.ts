import { describe, it, expect } from 'vitest';
import { redactObject, isSensitiveKey, redactCompactToken } from '../../src/lib/jwt/sensitive';

describe('Sensitive Claim Redaction', () => {
  it('identifies sensitive key names correctly', () => {
    expect(isSensitiveKey('access_token')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('api_key')).toBe(true);
    expect(isSensitiveKey('user_id')).toBe(false);
  });

  it('redacts sensitive keys in JSON objects while leaving standard keys intact', () => {
    const rawObj = {
      sub: 'usr_123',
      iss: 'https://auth.example.com',
      access_token: 'secret_jwt_string_123',
      nested: {
        password: 'my-super-secret-password',
        role: 'admin',
      },
    };

    const redacted = redactObject(rawObj);
    expect(redacted?.sub).toBe('usr_123');
    expect(redacted?.access_token).toBe('[REDACTED access_token]');
    expect((redacted?.nested as Record<string, unknown>).password).toBe('[REDACTED password]');
    expect((redacted?.nested as Record<string, unknown>).role).toBe('admin');
  });

  it('redacts compact token payloads', () => {
    const compact = 'header.payload.signature';
    expect(redactCompactToken(compact)).toContain('[REDACTED_PAYLOAD]');
  });
});
