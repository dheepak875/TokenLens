import { describe, it, expect } from 'vitest';
import { parseToken, base64UrlDecode } from '../../src/lib/jwt/parser';

describe('JWT Parser', () => {
  it('correctly decodes Base64Url string', () => {
    const jsonStr = '{"alg":"HS256","typ":"JWT"}';
    const base64Url = btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    expect(base64UrlDecode(base64Url)).toBe(jsonStr);
  });

  it('identifies valid JWS token structure', () => {
    const validJws =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const parsed = parseToken(validJws);

    expect(parsed.type).toBe('JWS');
    expect(parsed.segmentCount).toBe(3);
    expect(parsed.header.json?.alg).toBe('HS256');
    expect(parsed.payload.json?.sub).toBe('1234567890');
    expect(parsed.parseError).toBeNull();
  });

  it('identifies JWE token structure with 5 segments', () => {
    const sampleJwe = 'header.encryptedKey.iv.ciphertext.authTag';
    const parsed = parseToken(sampleJwe);

    expect(parsed.type).toBe('JWE');
    expect(parsed.segmentCount).toBe(5);
    expect(parsed.payload.isEncrypted).toBe(true);
  });

  it('handles malformed tokens gracefully', () => {
    const invalidToken = 'not.a.valid.jwt.structure.extra.parts';
    const parsed = parseToken(invalidToken);

    expect(parsed.type).toBe('INVALID');
    expect(parsed.parseError).toContain('Expected 3 segments for JWS/JWT or 5 segments for JWE');
  });

  it('detects duplicate keys in JSON objects', () => {
    const jsonWithDupes = '{"sub": "alice", "sub": "bob"}';
    const base64Header = btoa(jsonWithDupes).replace(/=/g, '');
    const dummyToken = `${base64Header}.eyJ0ZXN0IjoxfQ.sig`;

    const parsed = parseToken(dummyToken);
    expect(parsed.header.duplicateKeys).toContain('sub');
  });
});
