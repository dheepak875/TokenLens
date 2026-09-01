import { DiffItem, ParsedToken } from '../types/jwt';
import { parseToken } from './parser';
import { redactObject } from './sensitive';

export function diffObjects(
  objA: Record<string, unknown> | null,
  objB: Record<string, unknown> | null,
  redact: boolean = false
): DiffItem[] {
  const finalA = redact ? redactObject(objA) || {} : objA || {};
  const finalB = redact ? redactObject(objB) || {} : objB || {};

  const keys = Array.from(
    new Set([...Object.keys(finalA), ...Object.keys(finalB)])
  ).sort();

  const diffs: DiffItem[] = [];

  for (const key of keys) {
    const hasA = key in finalA;
    const hasB = key in finalB;
    const valA = finalA[key];
    const valB = finalB[key];

    if (!hasA && hasB) {
      diffs.push({ key, type: 'added', valA: undefined, valB });
    } else if (hasA && !hasB) {
      diffs.push({ key, type: 'removed', valA, valB: undefined });
    } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
      diffs.push({ key, type: 'changed', valA, valB });
    } else {
      diffs.push({ key, type: 'unchanged', valA, valB });
    }
  }

  return diffs;
}

export interface TokenCompareResult {
  parsedA: ParsedToken;
  parsedB: ParsedToken;
  headerDiffs: DiffItem[];
  payloadDiffs: DiffItem[];
  expDeltaSeconds: number | null;
  iatDeltaSeconds: number | null;
}

export function compareTokens(
  rawA: string,
  rawB: string,
  redact: boolean = false
): TokenCompareResult {
  const parsedA = parseToken(rawA);
  const parsedB = parseToken(rawB);

  const headerDiffs = diffObjects(parsedA.header.json, parsedB.header.json, redact);
  const payloadDiffs = diffObjects(
    parsedA.payload.json,
    parsedB.payload.json,
    redact
  );

  let expDeltaSeconds: number | null = null;
  const expA = Number(parsedA.payload.json?.exp);
  const expB = Number(parsedB.payload.json?.exp);
  if (!isNaN(expA) && !isNaN(expB)) {
    expDeltaSeconds = expB - expA;
  }

  let iatDeltaSeconds: number | null = null;
  const iatA = Number(parsedA.payload.json?.iat);
  const iatB = Number(parsedB.payload.json?.iat);
  if (!isNaN(iatA) && !isNaN(iatB)) {
    iatDeltaSeconds = iatB - iatA;
  }

  return {
    parsedA,
    parsedB,
    headerDiffs,
    payloadDiffs,
    expDeltaSeconds,
    iatDeltaSeconds,
  };
}
