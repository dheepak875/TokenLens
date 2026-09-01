import React from 'react';
import { Table, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ParsedToken, ValidationProfile } from '../../lib/types/jwt';
import { getStandardClaimsInfo } from '../../lib/utils/formatters';
import { getEffectiveNow } from '../../lib/jwt/validator';
import { redactObject } from '../../lib/jwt/sensitive';

interface ClaimTableProps {
  parsedToken: ParsedToken;
  profile: ValidationProfile;
}

export const ClaimTable: React.FC<ClaimTableProps> = ({
  parsedToken,
  profile,
}) => {
  const now = getEffectiveNow(profile);
  const payloadData = profile.redactSensitive
    ? redactObject(parsedToken.payload.json)
    : parsedToken.payload.json;

  const claims = getStandardClaimsInfo(payloadData, now);

  if (!parsedToken.payload.json || parsedToken.type === 'EMPTY') {
    return null;
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Table className="w-3.5 h-3.5 text-[var(--accent)]" />
          Standard Claims Explainer
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          {claims.length} standard RFC 7519 claims
        </span>
      </div>

      {claims.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic p-3 bg-[var(--background)]/60 rounded-xl border border-[var(--card-border)]">
          No standard IANA/RFC 7519 registered claims found in payload.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-16">Claim</th>
                <th className="py-2.5 px-3 w-28">Standard Name</th>
                <th className="py-2.5 px-3 w-48">Decoded Value</th>
                <th className="py-2.5 px-3">Plain-English Meaning</th>
                <th className="py-2.5 px-3 w-24 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/50 text-[var(--text-primary)]">
              {claims.map((claim) => (
                <tr key={claim.key} className="hover:bg-[var(--card-border)]/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">
                    {claim.key}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[var(--text-primary)] whitespace-nowrap">
                    {claim.name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-secondary)] break-words">
                    {claim.formattedValue}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)] leading-relaxed text-[11px]">
                    {claim.description}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {claim.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                    {claim.status === 'warning' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Action
                      </span>
                    )}
                    {claim.status === 'invalid' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Invalid
                      </span>
                    )}
                    {claim.status === 'info' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--card-border)] text-[var(--text-muted)] text-[10px]">
                        <Info className="w-3 h-3" /> Info
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

