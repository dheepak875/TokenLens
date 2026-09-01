import * as jose from 'jose';
import {
  ParsedToken,
  ValidationProfile,
  VerificationInput,
  VerificationResult,
} from '../types/jwt';

export async function verifyTokenSignature(
  parsedToken: ParsedToken,
  input: VerificationInput,
  profile: ValidationProfile
): Promise<VerificationResult> {
  if (parsedToken.type !== 'JWS') {
    return {
      status: 'not_attempted',
      algorithm: null,
      keyUsed: null,
      errorMessage: null,
      details: 'Token is not a JWS compact token or is encrypted (JWE).',
    };
  }

  if (input.mode === 'none') {
    return {
      status: 'not_attempted',
      algorithm: null,
      keyUsed: null,
      errorMessage: null,
      details: 'No verification key provided.',
    };
  }

  const tokenAlg = parsedToken.header.json?.alg as string | undefined;

  if (!tokenAlg || tokenAlg.toLowerCase() === 'none') {
    return {
      status: 'failed',
      algorithm: tokenAlg || 'none',
      keyUsed: null,
      errorMessage: 'Token algorithm is "none" or missing in header.',
      details:
        'RFC 8725 Section 3.1: Reject tokens with alg: none. Unsigned tokens must not be accepted.',
    };
  }

  // Check allowlist
  if (
    profile.allowedAlgorithms.length > 0 &&
    !profile.allowedAlgorithms.includes(tokenAlg as unknown as never)
  ) {
    return {
      status: 'failed',
      algorithm: tokenAlg,
      keyUsed: null,
      errorMessage: `Algorithm "${tokenAlg}" is not in the configured allowed algorithms list [${profile.allowedAlgorithms.join(', ')}].`,
      details:
        'RFC 8725 Section 3.2: Applications must restrict accepted algorithms to explicit allowed sets.',
    };
  }

  try {
    let keyOrSecret: CryptoKey | Uint8Array;
    let keyInfo = '';

    if (input.mode === 'hmac') {
      if (!input.hmacSecret) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: 'HMAC secret is empty.',
          details: 'Please provide the HMAC secret key for verification.',
        };
      }

      if (!tokenAlg.startsWith('HS')) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Key type mismatch: Provided HMAC secret, but token algorithm is "${tokenAlg}".`,
          details:
            'Symmetric HMAC secrets can only verify HS256, HS384, or HS512 tokens.',
        };
      }

      keyOrSecret = new Uint8Array(new TextEncoder().encode(input.hmacSecret));
      keyInfo = 'Symmetric HMAC Secret';
    } else if (input.mode === 'pem') {
      if (!input.pemPublicKey.trim()) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: 'PEM Public Key is empty.',
          details: 'Please paste a valid PEM formatted public key.',
        };
      }

      if (tokenAlg.startsWith('HS')) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Algorithm mismatch: Provided PEM public key, but token algorithm is symmetric "${tokenAlg}".`,
          details:
            'HMAC algorithms require secret bytes, not asymmetric public keys.',
        };
      }

      try {
        keyOrSecret = await jose.importSPKI(input.pemPublicKey.trim(), tokenAlg);
        keyInfo = 'PEM SPKI Public Key';
      } catch (err) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Failed to import PEM key: ${(err as Error).message}`,
          details:
            'Ensure the key is in SubjectPublicKeyInfo (SPKI) PEM format (e.g. -----BEGIN PUBLIC KEY-----).',
        };
      }
    } else if (input.mode === 'jwk') {
      if (!input.jwkJson.trim()) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: 'JWK JSON is empty.',
          details: 'Please paste a valid JSON Web Key object.',
        };
      }

      try {
        const jwkParsed = JSON.parse(input.jwkJson);
        keyOrSecret = (await jose.importJWK(jwkParsed, tokenAlg)) as CryptoKey | Uint8Array;
        keyInfo = jwkParsed.kid ? `JWK (kid: ${jwkParsed.kid})` : 'JWK JSON';
      } catch (err) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Failed to import JWK: ${(err as Error).message}`,
          details: 'Verify that the JWK is valid JSON with valid kty, crv/n/e fields.',
        };
      }
    } else if (input.mode === 'jwks_json' || input.mode === 'jwks_url') {
      const rawJwks = input.mode === 'jwks_json' ? input.jwksJson : '';
      if (input.mode === 'jwks_json' && !rawJwks.trim()) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: 'JWKS JSON is empty.',
          details: 'Please paste valid JWKS JSON containing a "keys" array.',
        };
      }

      let jwksData: jose.JSONWebKeySet;
      try {
        if (input.mode === 'jwks_json') {
          jwksData = JSON.parse(rawJwks);
        } else {
          // JWKS URL mode (user manually clicked Fetch and passed JWKS json content into jwksJson)
          if (!input.jwksJson.trim()) {
            return {
              status: 'failed',
              algorithm: tokenAlg,
              keyUsed: null,
              errorMessage: 'JWKS URL data has not been fetched.',
              details:
                'Click "Fetch JWKS" to retrieve key set directly from the entered URL.',
            };
          }
          jwksData = JSON.parse(input.jwksJson);
        }
      } catch (err) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Invalid JWKS JSON format: ${(err as Error).message}`,
          details: 'JWKS must be valid JSON object with a "keys" array.',
        };
      }

      const tokenKid = parsedToken.header.json?.kid as string | undefined;

      if (!jwksData.keys || !Array.isArray(jwksData.keys)) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: 'JWKS structure invalid: missing "keys" array.',
          details: 'JWKS object must contain a "keys" array of JSON Web Keys.',
        };
      }

      let matchedJwk: jose.JWK | undefined;
      if (tokenKid) {
        matchedJwk = jwksData.keys.find((k) => k.kid === tokenKid);
        if (!matchedJwk) {
          return {
            status: 'failed',
            algorithm: tokenAlg,
            keyUsed: null,
            errorMessage: `No key found in JWKS matching kid "${tokenKid}".`,
            details: `JWKS contains ${jwksData.keys.length} key(s), but none match token kid "${tokenKid}".`,
          };
        }
      } else {
        // If no kid in token header, attempt first key if only 1 key, else error
        if (jwksData.keys.length === 1) {
          matchedJwk = jwksData.keys[0];
        } else {
          return {
            status: 'failed',
            algorithm: tokenAlg,
            keyUsed: null,
            errorMessage:
              'Token header lacks "kid" and JWKS contains multiple keys.',
            details:
              'Cannot deterministically select verification key from JWKS without header "kid" or unambiguous key selection.',
          };
        }
      }

      try {
        keyOrSecret = (await jose.importJWK(matchedJwk, tokenAlg)) as CryptoKey | Uint8Array;
        keyInfo = matchedJwk.kid
          ? `JWKS Key (kid: ${matchedJwk.kid})`
          : 'JWKS Key';
      } catch (err) {
        return {
          status: 'failed',
          algorithm: tokenAlg,
          keyUsed: null,
          errorMessage: `Failed to import key from JWKS: ${(err as Error).message}`,
          details: 'Matched JWK in JWKS could not be converted to a Web Crypto key.',
        };
      }
    } else {
      return {
        status: 'not_attempted',
        algorithm: null,
        keyUsed: null,
        errorMessage: null,
        details: 'Unknown verification mode.',
      };
    }

    // Perform signature verification with jose.compactVerify
    const { protectedHeader } = await jose.compactVerify(
      parsedToken.raw,
      keyOrSecret,
      {
        algorithms: [tokenAlg],
      }
    );

    return {
      status: 'verified',
      algorithm: protectedHeader.alg || tokenAlg,
      keyUsed: keyInfo,
      errorMessage: null,
      details: `Cryptographic signature successfully verified using ${keyInfo} with algorithm ${tokenAlg}.`,
    };
  } catch (err) {
    const msg = (err as Error).message || 'Signature verification failed';
    return {
      status: 'failed',
      algorithm: tokenAlg,
      keyUsed: null,
      errorMessage: msg.includes('signature')
        ? 'Signature verification failed: Cryptographic signature mismatch.'
        : `Verification error: ${msg}`,
      details:
        'The signature calculated over the header and payload does not match the token signature. The key may be wrong, or the token was modified.',
    };
  }
}
