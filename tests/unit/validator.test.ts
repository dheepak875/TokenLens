import { describe, it, expect } from 'vitest';
import { generateSecurityReport } from '../../src/lib/jwt/validator';
import { parseToken } from '../../src/lib/jwt/parser';
import { ValidationProfile, VerificationResult } from '../../src/lib/types/jwt';

describe('Security Report Rules Engine (RFC 8725 & OWASP)', () => {
  const defaultProfile: ValidationProfile = {
    allowedAlgorithms: ['HS256'],
    expectedIssuer: 'https://auth.example.com',
    expectedAudience: 'https://api.example.com',
    requiredClaims: ['sub', 'exp'],
    clockToleranceSeconds: 0,
    currentDifferenceSeconds: 0,
    nowOverrideTimestamp: 1600000000,
    redactSensitive: true,
  };

  const defaultUnverified: VerificationResult = {
    status: 'not_attempted',
    algorithm: null,
    keyUsed: null,
    errorMessage: null,
    details: null,
  };

  it('flags alg: none as warning', () => {
    const jsonHeader = btoa('{"alg":"none","typ":"JWT"}').replace(/=/g, '');
    const jsonPayload = btoa('{"sub":"user123","exp":1700000000}').replace(/=/g, '');
    const token = parseToken(`${jsonHeader}.${jsonPayload}.`);

    const report = generateSecurityReport(token, defaultUnverified, defaultProfile);
    const noneFinding = report.findings.find((f) => f.id === 'HEADER_ALG_NONE');

    expect(noneFinding).toBeDefined();
    expect(noneFinding?.status).toBe('warning');
  });

  it('flags expired token when exp < now', () => {
    const jsonHeader = btoa('{"alg":"HS256","typ":"JWT"}').replace(/=/g, '');
    // Expired at timestamp 1500000000 (now is 1600000000)
    const jsonPayload = btoa('{"sub":"user123","exp":1500000000}').replace(/=/g, '');
    const token = parseToken(`${jsonHeader}.${jsonPayload}.sig`);

    const report = generateSecurityReport(token, defaultUnverified, defaultProfile);
    const expFinding = report.findings.find((f) => f.id === 'CLAIM_EXP_EXPIRED');

    expect(expFinding).toBeDefined();
    expect(expFinding?.status).toBe('warning');
  });

  it('flags unverified signature with Warning/Review status', () => {
    const validJws =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const token = parseToken(validJws);

    const report = generateSecurityReport(token, defaultUnverified, defaultProfile);
    const sigFinding = report.findings.find((f) => f.id === 'SIG_NOT_VERIFIED');

    expect(sigFinding).toBeDefined();
    expect(sigFinding?.status).toBe('warning');
  });

  it('never uses the word "secure" in findings', () => {
    const validJws =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.sig';
    const token = parseToken(validJws);
    const report = generateSecurityReport(token, defaultUnverified, defaultProfile);

    for (const finding of report.findings) {
      expect(finding.status).not.toBe('secure');
      expect(finding.title.toLowerCase()).not.toContain('is secure');
    }
  });
});
