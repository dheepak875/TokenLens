import { describe, it, expect } from 'vitest';
import { verifyTokenSignature } from '../../src/lib/jwt/verifier';
import { generateTestToken } from '../../src/lib/jwt/generator';
import { parseToken } from '../../src/lib/jwt/parser';
import { ValidationProfile, VerificationInput } from '../../src/lib/types/jwt';

describe('Signature Verifier Module', () => {
  const profile: ValidationProfile = {
    allowedAlgorithms: ['HS256'],
    expectedIssuer: '',
    expectedAudience: '',
    requiredClaims: [],
    clockToleranceSeconds: 0,
    currentDifferenceSeconds: 0,
    nowOverrideTimestamp: null,
    redactSensitive: true,
  };

  it('verifies valid HMAC HS256 signature locally', async () => {
    const secret = 'my-secret-key-32-bytes-minimum!!';
    const { token } = await generateTestToken({
      algorithm: 'HS256',
      claims: { sub: 'alice' },
      secretOrPrivateKey: secret,
    });

    const parsed = parseToken(token);
    const input: VerificationInput = {
      mode: 'hmac',
      hmacSecret: secret,
      pemPublicKey: '',
      jwkJson: '',
      jwksJson: '',
      jwksUrl: '',
      selectedKid: '',
    };

    const res = await verifyTokenSignature(parsed, input, profile);
    expect(res.status).toBe('verified');
    expect(res.algorithm).toBe('HS256');
  });

  it('fails verification if HMAC secret is incorrect', async () => {
    const secret = 'my-secret-key-32-bytes-minimum!!';
    const { token } = await generateTestToken({
      algorithm: 'HS256',
      claims: { sub: 'alice' },
      secretOrPrivateKey: secret,
    });

    const parsed = parseToken(token);
    const input: VerificationInput = {
      mode: 'hmac',
      hmacSecret: 'wrong-secret-key-32-bytes-minimum!',
      pemPublicKey: '',
      jwkJson: '',
      jwksJson: '',
      jwksUrl: '',
      selectedKid: '',
    };

    const res = await verifyTokenSignature(parsed, input, profile);
    expect(res.status).toBe('failed');
  });
});
