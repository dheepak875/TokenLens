export type TokenType = 'JWS' | 'JWE' | 'INVALID' | 'EMPTY';

export interface ParsedHeader {
  raw: string;
  json: Record<string, unknown> | null;
  error: string | null;
  duplicateKeys: string[];
}

export interface ParsedPayload {
  raw: string;
  json: Record<string, unknown> | null;
  error: string | null;
  duplicateKeys: string[];
  isEncrypted?: boolean;
}

export interface ParsedToken {
  raw: string;
  type: TokenType;
  segmentCount: number;
  segments: string[];
  header: ParsedHeader;
  payload: ParsedPayload;
  signatureRaw: string;
  jweIv?: string;
  jweCiphertext?: string;
  jweTag?: string;
  parseError: string | null;
  sizeBytes: number;
}

export type SupportedAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'EdDSA';

export interface ValidationProfile {
  allowedAlgorithms: SupportedAlgorithm[];
  expectedIssuer: string;
  expectedAudience: string;
  requiredClaims: string[];
  clockToleranceSeconds: number;
  currentDifferenceSeconds: number; // For time override offset
  nowOverrideTimestamp: number | null; // epoch timestamp in seconds
  redactSensitive: boolean;
}

export type VerificationMode =
  | 'none'
  | 'hmac'
  | 'pem'
  | 'jwk'
  | 'jwks_json'
  | 'jwks_url';

export interface VerificationInput {
  mode: VerificationMode;
  hmacSecret: string;
  pemPublicKey: string;
  jwkJson: string;
  jwksJson: string;
  jwksUrl: string;
  selectedKid: string;
}

export type SignatureStatus = 'verified' | 'failed' | 'not_attempted';

export interface VerificationResult {
  status: SignatureStatus;
  algorithm: string | null;
  keyUsed: string | null;
  errorMessage: string | null;
  details: string | null;
}

export type FindingStatus = 'pass' | 'review' | 'warning' | 'cannot_determine';

export interface SecurityFinding {
  id: string;
  title: string;
  status: FindingStatus;
  explanation: string;
  whyItMatters: string;
  recommendedAction: string;
  field: string | null; // e.g., "header.alg", "payload.exp"
  reference?: {
    label: string;
    url: string;
  };
}

export interface SecurityReport {
  signatureSummary: string;
  claimsProfileSummary: string;
  passCount: number;
  reviewCount: number;
  warningCount: number;
  cannotDetermineCount: number;
  findings: SecurityFinding[];
  narrativeExplanation: string;
}

export interface StandardClaimInfo {
  key: string;
  name: string;
  value: unknown;
  formattedValue: string;
  description: string;
  status: 'valid' | 'invalid' | 'warning' | 'info';
}

export interface TimelineData {
  iat: number | null;
  nbf: number | null;
  exp: number | null;
  now: number;
  isExpired: boolean;
  isNotYetActive: boolean;
  remainingSeconds: number | null;
  elapsedSeconds: number | null;
}

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffItem {
  key: string;
  type: DiffType;
  valA: unknown;
  valB: unknown;
}

export interface SavedWorkspace {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  token: string;
  profile: ValidationProfile;
  notes?: string;
}
