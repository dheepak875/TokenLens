import { StandardClaimInfo, TimelineData } from '../types/jwt';

export const STANDARD_CLAIM_DESCRIPTIONS: Record<
  string,
  { name: string; description: string }
> = {
  iss: {
    name: 'Issuer',
    description: 'Identifies the principal/authorization server that issued the JWT.',
  },
  sub: {
    name: 'Subject',
    description: 'Identifies the principal (user, service account) that is the subject of the JWT.',
  },
  aud: {
    name: 'Audience',
    description: 'Identifies the target recipient(s) or service(s) intended to process the JWT.',
  },
  exp: {
    name: 'Expiration Time',
    description: 'Unix timestamp after which the token MUST NOT be accepted for processing.',
  },
  nbf: {
    name: 'Not Before',
    description: 'Unix timestamp before which the token MUST NOT be accepted for processing.',
  },
  iat: {
    name: 'Issued At',
    description: 'Unix timestamp identifying when the JWT was created.',
  },
  jti: {
    name: 'JWT ID',
    description: 'Unique identifier for the token; used for audit trails and replay protection.',
  },
  azp: {
    name: 'Authorized Party',
    description: 'OAuth 2.0 Authorized Party; the client ID to which the token was issued.',
  },
  scope: {
    name: 'Scopes',
    description: 'Space-delimited OAuth 2.0 scope strings indicating granted permissions.',
  },
  roles: {
    name: 'Roles',
    description: 'List of application or organizational role assignments.',
  },
  groups: {
    name: 'Groups',
    description: 'List of security group or team memberships.',
  },
};

export function formatTimestamp(ts: number | unknown): string {
  if (typeof ts !== 'number' || isNaN(ts)) return 'Invalid date';
  try {
    const d = new Date(ts * 1000);
    return d.toISOString().replace('T', ' ').replace('.000Z', ' UTC').replace('Z', ' UTC');
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeTime(seconds: number): string {
  const abs = Math.abs(seconds);
  const isPast = seconds >= 0;
  if (abs < 60) return `${Math.round(abs)}s ${isPast ? 'ago' : 'from now'}`;
  const mins = Math.round(abs / 60);
  if (mins < 60) return `${mins}m ${isPast ? 'ago' : 'from now'}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ${isPast ? 'ago' : 'from now'}`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days}d ${isPast ? 'ago' : 'from now'}`;
  const years = (days / 365).toFixed(1);
  return `${years}y ${isPast ? 'ago' : 'from now'}`;
}

export function getStandardClaimsInfo(
  payload: Record<string, unknown> | null,
  nowSeconds: number
): StandardClaimInfo[] {
  if (!payload) return [];

  const list: StandardClaimInfo[] = [];

  for (const [key, value] of Object.entries(payload)) {
    const std = STANDARD_CLAIM_DESCRIPTIONS[key];
    if (!std) continue;

    let formattedValue = String(value);
    let status: 'valid' | 'invalid' | 'warning' | 'info' = 'info';

    if (['exp', 'nbf', 'iat'].includes(key)) {
      const num = Number(value);
      if (isNaN(num)) {
        formattedValue = `${String(value)} (Invalid timestamp format)`;
        status = 'invalid';
      } else {
        formattedValue = formatTimestamp(num);
        if (key === 'exp') {
          status = num < nowSeconds ? 'warning' : 'valid';
        } else if (key === 'nbf') {
          status = num > nowSeconds ? 'warning' : 'valid';
        } else {
          status = 'valid';
        }
      }
    } else if (Array.isArray(value)) {
      formattedValue = value.join(', ');
      status = 'valid';
    } else {
      status = 'valid';
    }

    list.push({
      key,
      name: std.name,
      value,
      formattedValue,
      description: std.description,
      status,
    });
  }

  return list;
}

export function computeTimelineData(
  payload: Record<string, unknown> | null,
  nowSeconds: number
): TimelineData {
  const iat = payload && typeof payload.iat === 'number' ? payload.iat : null;
  const nbf = payload && typeof payload.nbf === 'number' ? payload.nbf : null;
  const exp = payload && typeof payload.exp === 'number' ? payload.exp : null;

  const isExpired = exp !== null && exp < nowSeconds;
  const isNotYetActive = nbf !== null && nbf > nowSeconds;

  const remainingSeconds = exp !== null && exp >= nowSeconds ? exp - nowSeconds : null;
  const elapsedSeconds = iat !== null ? nowSeconds - iat : null;

  return {
    iat,
    nbf,
    exp,
    now: nowSeconds,
    isExpired,
    isNotYetActive,
    remainingSeconds,
    elapsedSeconds,
  };
}
