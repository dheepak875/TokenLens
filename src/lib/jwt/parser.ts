import { ParsedToken } from '../types/jwt';

export function base64UrlDecode(str: string): string {
  if (!str) return '';
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    throw new Error(`Invalid Base64Url string: ${(err as Error).message}`);
  }
}

export function detectDuplicateKeys(jsonString: string): string[] {
  const duplicateKeys: string[] = [];
  const keyRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g;
  let match: RegExpExecArray | null;

  const objectRegex = /\{([^{}]*)\}/g;
  let objMatch: RegExpExecArray | null;

  while ((objMatch = objectRegex.exec(jsonString)) !== null) {
    const objectContent = objMatch[1];
    const seenInObj = new Set<string>();
    keyRegex.lastIndex = 0;
    while ((match = keyRegex.exec(objectContent)) !== null) {
      const key = match[1];
      if (seenInObj.has(key)) {
        if (!duplicateKeys.includes(key)) {
          duplicateKeys.push(key);
        }
      } else {
        seenInObj.add(key);
      }
    }
  }

  return duplicateKeys;
}

export function parseToken(rawInput: string): ParsedToken {
  const trimmed = rawInput.trim();
  const sizeBytes = new TextEncoder().encode(trimmed).length;

  if (!trimmed) {
    return {
      raw: '',
      type: 'EMPTY',
      segmentCount: 0,
      segments: [],
      header: { raw: '', json: null, error: null, duplicateKeys: [] },
      payload: { raw: '', json: null, error: null, duplicateKeys: [] },
      signatureRaw: '',
      parseError: null,
      sizeBytes: 0,
    };
  }

  const segments = trimmed.split('.');

  if (segments.length !== 3 && segments.length !== 5) {
    return {
      raw: trimmed,
      type: 'INVALID',
      segmentCount: segments.length,
      segments,
      header: {
        raw: segments[0] || '',
        json: null,
        error: 'Invalid JWT structure',
        duplicateKeys: [],
      },
      payload: {
        raw: segments[1] || '',
        json: null,
        error: 'Invalid JWT structure',
        duplicateKeys: [],
      },
      signatureRaw: '',
      parseError: `Expected 3 segments for JWS/JWT or 5 segments for JWE. Received ${segments.length} segments.`,
      sizeBytes,
    };
  }

  const isJws = segments.length === 3;
  const type = isJws ? 'JWS' : 'JWE';

  let headerRawDecoded = '';
  let headerJson: Record<string, unknown> | null = null;
  let headerError: string | null = null;
  let headerDuplicates: string[] = [];

  try {
    headerRawDecoded = base64UrlDecode(segments[0]);
    headerDuplicates = detectDuplicateKeys(headerRawDecoded);
    headerJson = JSON.parse(headerRawDecoded);
  } catch (err) {
    headerError = `Header decode/parse error: ${(err as Error).message}`;
  }

  let payloadRawDecoded = '';
  let payloadJson: Record<string, unknown> | null = null;
  let payloadError: string | null = null;
  let payloadDuplicates: string[] = [];

  if (isJws) {
    try {
      payloadRawDecoded = base64UrlDecode(segments[1]);
      payloadDuplicates = detectDuplicateKeys(payloadRawDecoded);
      payloadJson = JSON.parse(payloadRawDecoded);
    } catch (err) {
      payloadError = `Payload decode/parse error: ${(err as Error).message}`;
    }
  } else {
    payloadRawDecoded = segments[3];
    payloadError =
      'JWE Payload is encrypted. Protected header can be inspected, but claims require decryption key material.';
  }

  return {
    raw: trimmed,
    type,
    segmentCount: segments.length,
    segments,
    header: {
      raw: segments[0],
      json: headerJson,
      error: headerError,
      duplicateKeys: headerDuplicates,
    },
    payload: {
      raw: segments[1],
      json: payloadJson,
      error: payloadError,
      duplicateKeys: payloadDuplicates,
      isEncrypted: !isJws,
    },
    signatureRaw: isJws ? segments[2] : segments[4],
    jweIv: !isJws ? segments[2] : undefined,
    jweCiphertext: !isJws ? segments[3] : undefined,
    jweTag: !isJws ? segments[4] : undefined,
    parseError: null,
    sizeBytes,
  };
}
