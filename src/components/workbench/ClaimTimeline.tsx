import React from 'react';
import { Clock } from 'lucide-react';
import { ParsedToken, ValidationProfile } from '../../lib/types/jwt';
import { computeTimelineData, formatTimestamp, formatRelativeTime } from '../../lib/utils/formatters';
import { getEffectiveNow } from '../../lib/jwt/validator';

interface ClaimTimelineProps {
  parsedToken: ParsedToken;
  profile: ValidationProfile;
}

export const ClaimTimeline: React.FC<ClaimTimelineProps> = ({
  parsedToken,
  profile,
}) => {
  const now = getEffectiveNow(profile);
  const timeline = computeTimelineData(parsedToken.payload.json, now);

  if (!parsedToken.payload.json || parsedToken.type === 'EMPTY') {
    return null;
  }

  const { iat, nbf, exp, isExpired, isNotYetActive, remainingSeconds, elapsedSeconds } =
    timeline;

  let percent = 50;
  if (iat && exp && exp > iat) {
    const total = exp - iat;
    const current = now - iat;
    percent = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
          Lifetime & Claim Timeline
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          Eval: {new Date(now * 1000).toISOString().slice(11, 19)} UTC
        </span>
      </div>

      {iat && exp ? (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)]">
            <span>Issued ({formatTimestamp(iat).slice(11, 19)})</span>
            <span
              className={
                isExpired
                  ? 'text-rose-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }
            >
              {isExpired
                ? 'Expired'
                : remainingSeconds !== null
                  ? `${formatRelativeTime(remainingSeconds)} left`
                  : 'Active'}
            </span>
            <span>Expires ({formatTimestamp(exp).slice(11, 19)})</span>
          </div>

          <div className="w-full bg-[var(--background)]/80 rounded-full h-2.5 p-0.5 border border-[var(--card-border)] relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExpired
                  ? 'bg-rose-500'
                  : isNotYetActive
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        {/* IAT Box */}
        <div className="bg-[var(--card-bg-elevated)] p-3 rounded-xl border border-[var(--card-border)] text-xs space-y-1 overflow-hidden">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block tracking-wider font-[family-name:var(--font-display)]">
            Issued At (iat)
          </span>
          <span className="font-mono text-[var(--text-primary)] block text-xs font-medium truncate" title={iat ? formatTimestamp(iat) : ''}>
            {iat ? formatTimestamp(iat) : 'Not specified'}
          </span>
          {elapsedSeconds !== null && (
            <span className="text-[11px] text-[var(--text-muted)] block">
              {formatRelativeTime(elapsedSeconds)}
            </span>
          )}
        </div>

        {/* NBF Box */}
        <div className="bg-[var(--card-bg-elevated)] p-3 rounded-xl border border-[var(--card-border)] text-xs space-y-1 overflow-hidden">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block tracking-wider font-[family-name:var(--font-display)]">
            Active From (nbf)
          </span>
          <span className="font-mono text-[var(--text-primary)] block text-xs font-medium truncate" title={nbf ? formatTimestamp(nbf) : ''}>
            {nbf ? formatTimestamp(nbf) : 'Immediate'}
          </span>
          {isNotYetActive && (
            <span className="text-[11px] text-amber-400 font-semibold block">
              Not yet valid
            </span>
          )}
        </div>

        {/* EXP Box */}
        <div className="bg-[var(--card-bg-elevated)] p-3 rounded-xl border border-[var(--card-border)] text-xs space-y-1 overflow-hidden">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block tracking-wider font-[family-name:var(--font-display)]">
            Expires At (exp)
          </span>
          <span className="font-mono text-[var(--text-primary)] block text-xs font-medium truncate" title={exp ? formatTimestamp(exp) : ''}>
            {exp ? formatTimestamp(exp) : 'Never (Infinite)'}
          </span>
          {isExpired ? (
            <span className="text-[11px] text-rose-400 font-semibold block">
              Expired ({remainingSeconds !== null ? formatRelativeTime(Math.abs(remainingSeconds)) : ''})
            </span>
          ) : remainingSeconds !== null ? (
            <span className="text-[11px] text-emerald-400 font-semibold block">
              {formatRelativeTime(remainingSeconds)} left
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

