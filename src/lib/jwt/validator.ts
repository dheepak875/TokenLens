
import {
  ParsedToken,
  SecurityFinding,
  SecurityReport,
  ValidationProfile,
  VerificationResult,
} from '../types/jwt';
import { isSensitiveKey } from './sensitive';

export function getEffectiveNow(profile: ValidationProfile): number {
  if (profile.nowOverrideTimestamp !== null) {
    return profile.nowOverrideTimestamp;
  }
  const realNowSeconds = Math.floor(Date.now() / 1000);
  return realNowSeconds + profile.currentDifferenceSeconds;
}

export function generateSecurityReport(
  token: ParsedToken,
  verification: VerificationResult,
  profile: ValidationProfile
): SecurityReport {
  const findings: SecurityFinding[] = [];
  const now = getEffectiveNow(profile);

  if (token.type === 'EMPTY' || !token.raw) {
    return {
      signatureSummary: 'Not attempted',
      claimsProfileSummary: 'Not configured',
      passCount: 0,
      reviewCount: 0,
      warningCount: 0,
      cannotDetermineCount: 1,
      findings: [
        {
          id: 'EMPTY_TOKEN',
          title: 'No token provided',
          status: 'cannot_determine',
          explanation: 'Paste or enter a compact JWT to inspect and analyze.',
          whyItMatters: 'Security analysis requires a token.',
          recommendedAction: 'Paste a token or click "Load example".',
          field: null,
        },
      ],
      narrativeExplanation:
        'No token has been entered yet. Paste a JWT into the input field to generate a full plain-English security report.',
    };
  }

  if (token.type === 'INVALID') {
    return {
      signatureSummary: 'Not attempted',
      claimsProfileSummary: 'Failed',
      passCount: 0,
      reviewCount: 0,
      warningCount: 1,
      cannotDetermineCount: 0,
      findings: [
        {
          id: 'MALFORMED_TOKEN',
          title: 'Malformed token structure',
          status: 'warning',
          explanation:
            token.parseError ||
            `Expected 3 segments for JWS or 5 segments for JWE. Received ${token.segmentCount} segments.`,
          whyItMatters:
            'A malformed token cannot be safely parsed or validated by standard JOSE libraries.',
          recommendedAction:
            'Check for missing or extra period (.) characters or truncation.',
          field: null,
          reference: {
            label: 'RFC 7519 § 7.1 Compact Serialization',
            url: 'https://datatracker.ietf.org/doc/html/rfc7519#section-7.1',
          },
        },
      ],
      narrativeExplanation:
        'The input string is malformed and does not follow JOSE compact serialization conventions.',
    };
  }

  const header = token.header.json || {};
  const payload = token.payload.json || {};

  // ==================== 1. HEADER CHECKS ====================

  // Check duplicate keys in header or payload
  if (token.header.duplicateKeys.length > 0) {
    findings.push({
      id: 'HEADER_DUPLICATE_KEYS',
      title: 'Duplicate JSON key in Header',
      status: 'warning',
      explanation: `Header contains duplicate JSON key(s): ${token.header.duplicateKeys.join(', ')}.`,
      whyItMatters:
        'RFC 8725 § 3.11: Duplicate keys cause parser ambiguities where different implementations evaluate different values, creating severe security bypass vulnerabilities.',
      recommendedAction:
        'Ensure the issuer JSON serializer generates unique object keys.',
      field: 'header',
      reference: {
        label: 'RFC 8725 § 3.11 Duplicate Key Ambiguity',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.11',
      },
    });
  }

  if (token.payload.duplicateKeys.length > 0) {
    findings.push({
      id: 'PAYLOAD_DUPLICATE_KEYS',
      title: 'Duplicate JSON key in Payload',
      status: 'warning',
      explanation: `Payload contains duplicate JSON key(s): ${token.payload.duplicateKeys.join(', ')}.`,
      whyItMatters:
        'RFC 8725 § 3.11: Duplicate keys in payload claims cause parser ambiguity and inconsistent authorization decisions.',
      recommendedAction:
        'Remove duplicate keys in token generation pipeline.',
      field: 'payload',
      reference: {
        label: 'RFC 8725 § 3.11 Duplicate Key Ambiguity',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.11',
      },
    });
  }

  // Check alg claim
  const alg = header.alg as string | undefined;
  if (!alg) {
    findings.push({
      id: 'HEADER_ALG_MISSING',
      title: 'Missing "alg" header parameter',
      status: 'warning',
      explanation: 'The token protected header does not specify an "alg" field.',
      whyItMatters:
        'RFC 7515 requires an explicit "alg" parameter to identify the cryptographic algorithm.',
      recommendedAction:
        'Configure issuer to include a valid "alg" header parameter.',
      field: 'header.alg',
      reference: {
        label: 'RFC 7515 § 4.1.1 "alg" Parameter',
        url: 'https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.1',
      },
    });
  } else if (alg.toLowerCase() === 'none') {
    findings.push({
      id: 'HEADER_ALG_NONE',
      title: 'Unsigned token algorithm (alg: "none")',
      status: 'warning',
      explanation:
        'The token explicitly uses "alg": "none", meaning it contains no cryptographic signature.',
      whyItMatters:
        'RFC 8725 § 3.1: Rejecting "none" is critical. Unsigned tokens allow arbitrary forgery of all claims.',
      recommendedAction:
        'Reject tokens with "alg": "none" in application verification logic.',
      field: 'header.alg',
      reference: {
        label: 'RFC 8725 § 3.1 Unsigned JWTs',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.1',
      },
    });
  } else if (
    profile.allowedAlgorithms.length > 0 &&
    !profile.allowedAlgorithms.includes(alg as unknown as never)
  ) {
    findings.push({
      id: 'HEADER_ALG_NOT_ALLOWED',
      title: `Algorithm "${alg}" not in allowed list`,
      status: 'warning',
      explanation: `Token specifies algorithm "${alg}", which is not present in the allowed algorithms list [${profile.allowedAlgorithms.join(', ')}].`,
      whyItMatters:
        'RFC 8725 § 3.2: Applications must pin explicit allowed algorithms to prevent algorithm confusion attacks.',
      recommendedAction:
        'Configure explicit algorithm allowlist matching expected key type.',
      field: 'header.alg',
      reference: {
        label: 'RFC 8725 § 3.2 Explicit Algorithm Restrictions',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.2',
      },
    });
  } else {
    findings.push({
      id: 'HEADER_ALG_VALID',
      title: `Specified algorithm "${alg}"`,
      status: 'pass',
      explanation: `Token uses non-none algorithm "${alg}".`,
      whyItMatters:
        'Identifies the cryptographic algorithm intended for signature validation.',
      recommendedAction:
        'Ensure verification key matches algorithm family.',
      field: 'header.alg',
    });
  }

  // Check typ claim
  const typ = header.typ as string | undefined;
  if (!typ) {
    findings.push({
      id: 'HEADER_TYP_MISSING',
      title: 'Missing "typ" header parameter',
      status: 'review',
      explanation:
        'The header does not declare a "typ" (type) header parameter.',
      whyItMatters:
        'RFC 8725 § 3.11 recommends explicit typing (e.g. "at+jwt" or "JWT") to prevent cross-JWT confusion attacks.',
      recommendedAction:
        'Consider setting explicit "typ" header values for targeted token types (e.g. access tokens).',
      field: 'header.typ',
      reference: {
        label: 'RFC 8725 § 3.11 Explicit Typing',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.11',
      },
    });
  } else {
    findings.push({
      id: 'HEADER_TYP_PRESENT',
      title: `Header declares typ: "${typ}"`,
      status: 'pass',
      explanation: `Token header includes typ: "${typ}".`,
      whyItMatters: 'Helps prevent cross-protocol and cross-token confusion.',
      recommendedAction:
        'Verify application validates typ parameter when expected.',
      field: 'header.typ',
    });
  }

  // Check crit header
  if (header.crit) {
    findings.push({
      id: 'HEADER_CRIT_PRESENT',
      title: 'Critical "crit" header parameter present',
      status: 'review',
      explanation: `Header includes "crit": ${JSON.stringify(header.crit)}.`,
      whyItMatters:
        'RFC 7515 § 4.1.11: Recipients must understand and process all listed parameters, or reject the token.',
      recommendedAction:
        'Verify your JWT implementation handles all critical extension parameters listed.',
      field: 'header.crit',
    });
  }

  // Check dangerous header parameters: jku, x5u, jwk, x5c
  const headerKeys = Object.keys(header);
  const dangerousKeyParams = ['jku', 'x5u', 'jwk', 'x5c'];
  const presentDangerous = dangerousKeyParams.filter((k) =>
    headerKeys.includes(k)
  );

  if (presentDangerous.length > 0) {
    findings.push({
      id: 'HEADER_DANGEROUS_KEY_PARAMS',
      title: `Header contains embedded key parameter(s): ${presentDangerous.join(', ')}`,
      status: 'warning',
      explanation:
        'Token includes parameters pointing to remote keys or embedded key material. TokenLens never fetches remote URLs embedded in token headers automatically.',
      whyItMatters:
        'RFC 8725 § 3.10: Automatically fetching jku or x5u URLs allows attackers to supply malicious keys or trigger SSRF attacks.',
      recommendedAction:
        'Never fetch header URLs automatically. Pre-configure trusted JWKS endpoints out-of-band.',
      field: `header.${presentDangerous[0]}`,
      reference: {
        label: 'RFC 8725 § 3.10 Key Location Parameters',
        url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.10',
      },
    });
  }

  // Check cty header (nested JWT)
  if (header.cty) {
    findings.push({
      id: 'HEADER_CTY_NESTED',
      title: `Content Type "cty": "${header.cty}" (Nested JWT indicator)`,
      status: 'review',
      explanation:
        'Header indicates payload contains nested content such as an inner JWT/JWS.',
      whyItMatters:
        'Nested tokens require multi-stage unwrapping and verification.',
      recommendedAction:
        'Ensure application unwraps and verifies both inner and outer layer tokens.',
      field: 'header.cty',
    });
  }

  // Header size check
  if (token.segments[0] && token.segments[0].length > 1024) {
    findings.push({
      id: 'HEADER_SIZE_LARGE',
      title: 'Header size is unusually large',
      status: 'review',
      explanation: `Header segment is ${token.segments[0].length} characters long (> 1 KB).`,
      whyItMatters:
        'Large headers increase memory usage and bandwidth overhead.',
      recommendedAction:
        'Audit header claims and remove unnecessary custom header properties.',
      field: 'header',
    });
  }

  // ==================== 2. CLAIMS CHECKS ====================

  if (token.type === 'JWE') {
    findings.push({
      id: 'JWE_ENCRYPTED_PAYLOAD',
      title: 'JWE encrypted token (claims hidden)',
      status: 'cannot_determine',
      explanation:
        'Token is a JWE (5-segment JSON Web Encryption). Protected header is visible, but payload claims are encrypted.',
      whyItMatters:
        'Claim verification requires decryption using private key material.',
      recommendedAction:
        'Supply decryption key if inspecting JWE payload contents.',
      field: 'payload',
    });
  } else {
    // Expiration (exp) check
    if (!('exp' in payload)) {
      findings.push({
        id: 'CLAIM_EXP_MISSING',
        title: 'Missing "exp" (Expiration Time) claim',
        status: 'warning',
        explanation: 'The payload does not contain an "exp" expiration claim.',
        whyItMatters:
          'RFC 8725 § 3.3: Tokens without expiration never expire, increasing damage window if leaked.',
        recommendedAction:
          'Always set a short-lived "exp" claim on access tokens.',
        field: 'payload.exp',
        reference: {
          label: 'RFC 8725 § 3.3 Expiration Time',
          url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.3',
        },
      });
    } else {
      const exp = Number(payload.exp);
      if (isNaN(exp)) {
        findings.push({
          id: 'CLAIM_EXP_INVALID',
          title: 'Invalid "exp" claim data type',
          status: 'warning',
          explanation: '"exp" claim must be a NumericDate number (seconds since Unix epoch).',
          whyItMatters: 'Non-numeric expiration claims cause validation errors.',
          recommendedAction: 'Encode exp as a Unix timestamp integer.',
          field: 'payload.exp',
        });
      } else {
        const tol = profile.clockToleranceSeconds;
        if (exp + tol < now) {
          const diffMinutes = Math.round((now - exp) / 60);
          findings.push({
            id: 'CLAIM_EXP_EXPIRED',
            title: 'Token is EXPIRED',
            status: 'warning',
            explanation: `Token expired at ${new Date(exp * 1000).toISOString()} (${diffMinutes} minute(s) ago). Current evaluated time is ${new Date(now * 1000).toISOString()}.`,
            whyItMatters: 'Expired tokens must be rejected by application logic.',
            recommendedAction:
              'Obtain a fresh token using refresh token or re-authentication flow.',
            field: 'payload.exp',
          });
        } else if (exp - now > 30 * 86400) {
          const days = Math.round((exp - now) / 86400);
          findings.push({
            id: 'CLAIM_EXP_FAR_FUTURE',
            title: `Excessively long expiration (${days} days)`,
            status: 'review',
            explanation: `Token expiration is set ${days} days in the future.`,
            whyItMatters:
              'Long-lived tokens elevate risk upon token leakage or compromise.',
            recommendedAction:
              'Consider reducing token lifetime and utilizing refresh tokens.',
            field: 'payload.exp',
          });
        } else {
          const remainingMinutes = Math.round((exp - now) / 60);
          findings.push({
            id: 'CLAIM_EXP_VALID',
            title: `Token active (expires in ${remainingMinutes} min)`,
            status: 'pass',
            explanation: `Token exp claim is valid. Expires: ${new Date(exp * 1000).toISOString()}.`,
            whyItMatters: 'Token is within valid operational lifetime window.',
            recommendedAction: 'No action required for expiration.',
            field: 'payload.exp',
          });
        }
      }
    }

    // Not Before (nbf) check
    if ('nbf' in payload) {
      const nbf = Number(payload.nbf);
      if (isNaN(nbf)) {
        findings.push({
          id: 'CLAIM_NBF_INVALID',
          title: 'Invalid "nbf" claim data type',
          status: 'warning',
          explanation: '"nbf" claim must be a NumericDate number.',
          whyItMatters: 'Invalid nbf formats prevent proper active-time validation.',
          recommendedAction: 'Set nbf as Unix timestamp integer.',
          field: 'payload.nbf',
        });
      } else {
        const tol = profile.clockToleranceSeconds;
        if (now + tol < nbf) {
          findings.push({
            id: 'CLAIM_NBF_FUTURE',
            title: 'Token NOT YET ACTIVE',
            status: 'warning',
            explanation: `Token is not valid before ${new Date(nbf * 1000).toISOString()}. Current time is ${new Date(now * 1000).toISOString()}.`,
            whyItMatters:
              'Tokens must not be accepted prior to their nbf timestamp.',
            recommendedAction: 'Delay processing until nbf time has elapsed.',
            field: 'payload.nbf',
          });
        } else {
          findings.push({
            id: 'CLAIM_NBF_VALID',
            title: 'Valid "nbf" (Not Before) timestamp',
            status: 'pass',
            explanation: `Token is active since ${new Date(nbf * 1000).toISOString()}.`,
            whyItMatters: 'Token active start threshold met.',
            recommendedAction: 'No action required.',
            field: 'payload.nbf',
          });
        }
      }
    }

    // Issued At (iat) check
    if (!('iat' in payload)) {
      findings.push({
        id: 'CLAIM_IAT_MISSING',
        title: 'Missing "iat" (Issued At) claim',
        status: 'review',
        explanation: 'Payload does not state when the token was issued.',
        whyItMatters:
          'Helps determine token age and evaluate revocation windows.',
        recommendedAction: 'Include "iat" timestamp in issued tokens.',
        field: 'payload.iat',
      });
    } else {
      const iat = Number(payload.iat);
      if (!isNaN(iat) && iat > now + 300) {
        findings.push({
          id: 'CLAIM_IAT_FUTURE',
          title: 'Issued At timestamp is in the future',
          status: 'warning',
          explanation: `iat timestamp ${new Date(iat * 1000).toISOString()} is ahead of evaluated current time ${new Date(now * 1000).toISOString()}.`,
          whyItMatters:
            'Indicates system clock skew between issuer and consumer or invalid issuance timestamp.',
          recommendedAction:
            'Check issuer clock synchronization (NTP) or configure clock tolerance.',
          field: 'payload.iat',
        });
      }
    }

    // Issuer (iss) check
    const iss = payload.iss as string | undefined;
    if (profile.expectedIssuer) {
      if (!iss) {
        findings.push({
          id: 'CLAIM_ISS_MISSING',
          title: 'Missing expected Issuer ("iss")',
          status: 'warning',
          explanation: `Profile expects issuer "${profile.expectedIssuer}", but token payload has no "iss" claim.`,
          whyItMatters:
            'RFC 8725 § 3.4: Issuer validation is required to ensure token originates from a trusted identity provider.',
          recommendedAction: 'Reject tokens missing expected issuer.',
          field: 'payload.iss',
          reference: {
            label: 'RFC 8725 § 3.4 Issuer Validation',
            url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.4',
          },
        });
      } else if (iss !== profile.expectedIssuer) {
        findings.push({
          id: 'CLAIM_ISS_MISMATCH',
          title: `Issuer mismatch: "${iss}"`,
          status: 'warning',
          explanation: `Token issuer "${iss}" does not match configured expected issuer "${profile.expectedIssuer}".`,
          whyItMatters:
            'Token was issued by a different entity than expected.',
          recommendedAction:
            'Verify expected issuer configuration or reject token.',
          field: 'payload.iss',
        });
      } else {
        findings.push({
          id: 'CLAIM_ISS_MATCH',
          title: `Issuer matched ("${iss}")`,
          status: 'pass',
          explanation: `Token issuer matches expected issuer "${iss}".`,
          whyItMatters: 'Confirms expected issuing identity provider.',
          recommendedAction: 'Issuer check passed.',
          field: 'payload.iss',
        });
      }
    } else if (iss) {
      findings.push({
        id: 'CLAIM_ISS_PRESENT',
        title: `Issuer claim present ("${iss}")`,
        status: 'pass',
        explanation: `Token declares iss: "${iss}".`,
        whyItMatters: 'Issuer identity claim is present.',
        recommendedAction:
          'Configure expected issuer in validation profile to enforce strict matching.',
        field: 'payload.iss',
      });
    }

    // Audience (aud) check
    const aud = payload.aud as string | string[] | undefined;
    if (profile.expectedAudience) {
      const audList = Array.isArray(aud) ? aud : aud ? [aud] : [];
      if (!audList.includes(profile.expectedAudience)) {
        findings.push({
          id: 'CLAIM_AUD_MISMATCH',
          title: 'Audience mismatch',
          status: 'warning',
          explanation: `Token aud claim [${audList.join(', ')}] does not contain expected audience "${profile.expectedAudience}".`,
          whyItMatters:
            'RFC 8725 § 3.5: Audience validation prevents token confusion across different services.',
          recommendedAction:
            'Reject tokens issued for other applications or services.',
          field: 'payload.aud',
          reference: {
            label: 'RFC 8725 § 3.5 Audience Validation',
            url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.5',
          },
        });
      } else {
        findings.push({
          id: 'CLAIM_AUD_MATCH',
          title: `Audience matched ("${profile.expectedAudience}")`,
          status: 'pass',
          explanation: 'Token target audience matches expected audience.',
          whyItMatters: 'Ensures token was intended for this target service.',
          recommendedAction: 'Audience check passed.',
          field: 'payload.aud',
        });
      }
    } else if (!aud) {
      findings.push({
        id: 'CLAIM_AUD_MISSING',
        title: 'Missing "aud" (Audience) claim',
        status: 'review',
        explanation: 'Payload contains no "aud" claim.',
        whyItMatters:
          'Without an audience claim, a token issued for service A might be accepted by service B.',
        recommendedAction:
          'Set explicit "aud" claim and configure expected audience in validation profile.',
        field: 'payload.aud',
      });
    }

    // Subject (sub) check
    if (profile.requiredClaims.includes('sub') && !payload.sub) {
      findings.push({
        id: 'CLAIM_SUB_REQUIRED_MISSING',
        title: 'Missing required "sub" (Subject) claim',
        status: 'warning',
        explanation: 'Validation profile requires "sub", but claim is missing.',
        whyItMatters: 'Subject identifies the principal entity of the token.',
        recommendedAction: 'Include subject identifier in token payload.',
        field: 'payload.sub',
      });
    }

    // jti check (revocation / audit)
    if (!('jti' in payload)) {
      findings.push({
        id: 'CLAIM_JTI_ABSENT',
        title: 'No "jti" (JWT ID) claim present',
        status: 'review',
        explanation:
          'Token lacks a unique "jti" identifier. This is a tradeoff: jti is required for single-use replay protection and blacklisting, but increases payload size and state tracking overhead.',
        whyItMatters:
          'Without jti, replay attacks cannot be prevented via token identifier revocation stores.',
        recommendedAction:
          'Assess whether your threat model requires replay protection or token revocation.',
        field: 'payload.jti',
        reference: {
          label: 'RFC 8725 § 3.9 JWT Identification',
          url: 'https://datatracker.ietf.org/doc/html/rfc8725#section-3.9',
        },
      });
    }

    // Broad scope / role review prompt
    const scope = payload.scope || payload.scopes;
    const roles = payload.roles || payload.groups;
    if (scope || roles) {
      findings.push({
        id: 'CLAIM_SCOPES_ROLES_REVIEW',
        title: 'Scopes / Roles claim present for review',
        status: 'review',
        explanation: `Token contains scope/roles claims: scope=${JSON.stringify(scope)}, roles=${JSON.stringify(roles)}.`,
        whyItMatters:
          'A valid signature proves token integrity, but application authorization depends on fine-grained scope checking.',
        recommendedAction:
          'Verify application checks specific privileges, not just token presence.',
        field: scope ? 'payload.scope' : 'payload.roles',
      });
    }

    // Sensitive claims in plaintext check
    const sensitiveFound: string[] = [];
    for (const key of Object.keys(payload)) {
      if (isSensitiveKey(key)) {
        sensitiveFound.push(key);
      }
    }
    if (sensitiveFound.length > 0) {
      findings.push({
        id: 'CLAIM_SENSITIVE_PLAINTEXT',
        title: `Sensitive claim(s) in plaintext: ${sensitiveFound.join(', ')}`,
        status: 'warning',
        explanation: `Payload contains sensitive claim name(s) in unencrypted JWS: ${sensitiveFound.join(', ')}.`,
        whyItMatters:
          'JWS payloads are encoded in Base64URL, NOT encrypted. Anyone holding or inspecting the compact token can read all payload claims in plaintext.',
        recommendedAction:
          'Remove credentials/tokens from JWT claims or use JWE encryption.',
        field: `payload.${sensitiveFound[0]}`,
      });
    }
  }

  // ==================== 3. CONTEXT & VERIFICATION CHECKS ====================

  if (verification.status === 'verified') {
    findings.push({
      id: 'SIG_VERIFIED',
      title: 'Cryptographic signature VERIFIED',
      status: 'pass',
      explanation: `Signature successfully verified using ${verification.keyUsed || 'supplied key'} with algorithm ${verification.algorithm || alg}.`,
      whyItMatters:
        'Confirms the token was signed by the key holder and header/payload have not been tampered with.',
      recommendedAction:
        'A valid signature proves integrity, but claims (exp, iss, aud) must still be validated against your application profile.',
      field: 'signature',
    });
  } else if (verification.status === 'failed') {
    findings.push({
      id: 'SIG_FAILED',
      title: 'Signature verification FAILED',
      status: 'warning',
      explanation:
        verification.errorMessage ||
        'Cryptographic signature check failed with supplied key material.',
      whyItMatters:
        'Unverified or invalid signatures indicate potential tampering or wrong verification key.',
      recommendedAction:
        'Reject the token immediately. Verify key material and algorithm allowlist.',
      field: 'signature',
    });
  } else {
    findings.push({
      id: 'SIG_NOT_VERIFIED',
      title: 'Signature HAS NOT been verified',
      status: 'warning',
      explanation:
        'Token claims have been decoded locally, but no cryptographic key was provided to verify authenticity.',
      whyItMatters:
        'Base64URL decoding does NOT establish trust. Anyone can craft a decodable token with arbitrary claims.',
      recommendedAction:
        'Supply verification key (HMAC secret, PEM public key, or JWKS) in the Verification tab to check signature.',
      field: 'signature',
    });
  }

  // Weak HMAC secret heuristic check
  if (verification.status === 'verified' && alg && alg.startsWith('HS')) {
    findings.push({
      id: 'HMAC_STRENGTH_HEURISTIC',
      title: 'HMAC secret entropy guideline check',
      status: 'review',
      explanation:
        'RFC 7518 § 3.2: HMAC keys must have key length >= hash output length (e.g. 256 bits / 32 bytes for HS256).',
      whyItMatters:
        'Short or low-entropy HMAC secrets are vulnerable to offline dictionary attack if tokens are intercepted.',
      recommendedAction:
        'Use strong randomly generated secrets with at least 32 bytes (256 bits) of entropy.',
      field: 'header.alg',
      reference: {
        label: 'RFC 7518 § 3.2 Cryptographic Algorithms for Key Management',
        url: 'https://datatracker.ietf.org/doc/html/rfc7518#section-3.2',
      },
    });
  }

  // Calculate summary stats
  const passCount = findings.filter((f) => f.status === 'pass').length;
  const reviewCount = findings.filter((f) => f.status === 'review').length;
  const warningCount = findings.filter((f) => f.status === 'warning').length;
  const cannotDetermineCount = findings.filter(
    (f) => f.status === 'cannot_determine'
  ).length;

  const signatureSummary =
    verification.status === 'verified'
      ? 'Signature verified'
      : verification.status === 'failed'
        ? 'Signature verification failed'
        : 'Signature not attempted';

  const claimsProfileSummary =
    warningCount === 0 && passCount > 0
      ? 'Claims profile passed'
      : warningCount > 0
        ? 'Claims profile has warnings'
        : 'Claims profile not configured';

  // Construct deterministic narrative explanation
  const narrativeExplanation = buildNarrativeExplanation(
    token,
    verification,
    profile,
    findings,
    now
  );

  return {
    signatureSummary,
    claimsProfileSummary,
    passCount,
    reviewCount,
    warningCount,
    cannotDetermineCount,
    findings,
    narrativeExplanation,
  };
}

function buildNarrativeExplanation(
  token: ParsedToken,
  verification: VerificationResult,
  profile: ValidationProfile,
  findings: SecurityFinding[],
  now: number
): string {
  const parts: string[] = [];

  const alg = (token.header.json?.alg as string) || 'none';
  const exp = token.payload.json?.exp as number | undefined;

  if (token.type === 'JWE') {
    return 'Your token is a JWE (JSON Web Encryption) encrypted structure. The outer protected header is visible, but the claims payload is encrypted and cannot be decoded without the corresponding decryption key.';
  }

  if (verification.status === 'verified') {
    parts.push(
      `Your token signature has been cryptographically verified using ${verification.keyUsed || 'supplied key'} with algorithm ${alg}.`
    );
  } else if (verification.status === 'failed') {
    parts.push(
      `Signature verification failed for algorithm ${alg}. The signature does not match the header and payload claims.`
    );
  } else {
    parts.push(
      `Your token can be decoded, but decoding does not establish authenticity. Its signature has not been checked because no verification key was provided.`
    );
  }

  if (exp) {
    if (exp < now) {
      const mins = Math.round((now - exp) / 60);
      parts.push(`It expired ${mins} minute(s) ago.`);
    } else {
      const mins = Math.round((exp - now) / 60);
      parts.push(`It is currently active and will expire in ${mins} minute(s).`);
    }
  } else {
    parts.push(
      'It contains no "exp" claim and will never expire automatically.'
    );
  }

  const warnings = findings.filter((f) => f.status === 'warning');
  if (warnings.length > 0) {
    parts.push(
      `There are ${warnings.length} warning(s) to review before using this token in production.`
    );
  }

  parts.push(
    `Applications should verify tokens using an explicit algorithm allowlist (${profile.allowedAlgorithms.length > 0 ? profile.allowedAlgorithms.join(', ') : 'none configured'}), expected issuer, expected audience, and current-time checks.`
  );

  return parts.join(' ');
}
