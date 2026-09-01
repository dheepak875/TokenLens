import { describe, it, expect } from 'vitest';
import { compareTokens } from '../../src/lib/jwt/compare';

describe('Token Compare Module', () => {
  it('correctly identifies added, removed, and modified payload claims', () => {
    const rawA =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNjAwMDAwMDAwfQ.sig';
    const rawB =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsInJvbGUiOiJhZG1pbiIsIm5ld19jbGFpbSI6dHJ1ZSwiZXhwIjoxNjAwMDAzNjAwfQ.sig';

    const res = compareTokens(rawA, rawB, false);

    expect(res.expDeltaSeconds).toBe(3600); // 1 hour difference

    const roleDiff = res.payloadDiffs.find((d) => d.key === 'role');
    expect(roleDiff?.type).toBe('changed');
    expect(roleDiff?.valA).toBe('user');
    expect(roleDiff?.valB).toBe('admin');

    const newClaimDiff = res.payloadDiffs.find((d) => d.key === 'new_claim');
    expect(newClaimDiff?.type).toBe('added');

    const subDiff = res.payloadDiffs.find((d) => d.key === 'sub');
    expect(subDiff?.type).toBe('unchanged');
  });
});
