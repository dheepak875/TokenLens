import React, { useState, useMemo } from 'react';
import { GitCompare, Eye, EyeOff, ArrowRightLeft } from 'lucide-react';
import { compareTokens } from '../lib/jwt/compare';

export const ComparePage: React.FC = () => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [redact, setRedact] = useState(true);

  const compareResult = useMemo(() => {
    return compareTokens(tokenA, tokenB, redact);
  }, [tokenA, tokenB, redact]);

  const { parsedA, parsedB, headerDiffs, payloadDiffs, expDeltaSeconds, iatDeltaSeconds } =
    compareResult;

  const handleSwap = () => {
    const temp = tokenA;
    setTokenA(tokenB);
    setTokenB(temp);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5 font-[family-name:var(--font-display)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
              <GitCompare className="w-4 h-4 text-[var(--accent)]" />
            </div>
            Token Comparison Engine
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Side-by-side cryptographic parameter and claim diffing executed 100% locally.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRedact(!redact)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              redact
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                : 'bg-[var(--card-bg-elevated)] text-[var(--text-muted)] border-[var(--card-border)]'
            }`}
          >
            {redact ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{redact ? 'Redaction ON' : 'Redaction OFF'}</span>
          </button>

          <button
            onClick={handleSwap}
            disabled={!tokenA && !tokenB}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] disabled:opacity-40 text-[var(--text-primary)] text-xs font-semibold transition-all border border-[var(--card-border)] cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Swap Tokens</span>
          </button>
        </div>
      </div>

      {/* Input Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center justify-between font-[family-name:var(--font-display)]">
            <span>Token A (Base Vector)</span>
            <span className="text-[var(--text-muted)] font-mono font-normal">
              {parsedA.type !== 'EMPTY' ? `${parsedA.sizeBytes} B` : ''}
            </span>
          </label>
          <textarea
            rows={4}
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            placeholder="Paste Token A compact string..."
            className="w-full font-mono text-xs p-3 rounded-lg bg-[var(--background)]/70 text-[var(--text-primary)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="glass-card p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center justify-between font-[family-name:var(--font-display)]">
            <span>Token B (Comparison Vector)</span>
            <span className="text-[var(--text-muted)] font-mono font-normal">
              {parsedB.type !== 'EMPTY' ? `${parsedB.sizeBytes} B` : ''}
            </span>
          </label>
          <textarea
            rows={4}
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            placeholder="Paste Token B compact string..."
            className="w-full font-mono text-xs p-3 rounded-lg bg-[var(--background)]/70 text-[var(--text-primary)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Temporal Deltas */}
      {(expDeltaSeconds !== null || iatDeltaSeconds !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {expDeltaSeconds !== null && (
            <div className="glass-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-[family-name:var(--font-display)]">
                Expiration (exp) Offset
              </span>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Token B expires{' '}
                <span
                  className={
                    expDeltaSeconds > 0
                      ? 'text-emerald-400'
                      : expDeltaSeconds < 0
                        ? 'text-rose-400'
                        : 'text-[var(--accent)]'
                  }
                >
                  {expDeltaSeconds === 0
                    ? 'at the exact same time as Token A'
                    : expDeltaSeconds > 0
                      ? `${Math.abs(Math.round(expDeltaSeconds / 60))} minute(s) AFTER Token A`
                      : `${Math.abs(Math.round(expDeltaSeconds / 60))} minute(s) BEFORE Token A`}
                </span>
              </p>
            </div>
          )}

          {iatDeltaSeconds !== null && (
            <div className="glass-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-[family-name:var(--font-display)]">
                Issued At (iat) Offset
              </span>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Token B was issued{' '}
                <span className="text-[var(--accent)]">
                  {iatDeltaSeconds === 0
                    ? 'at the exact same timestamp as Token A'
                    : iatDeltaSeconds > 0
                      ? `${Math.abs(Math.round(iatDeltaSeconds / 60))} minute(s) AFTER Token A`
                      : `${Math.abs(Math.round(iatDeltaSeconds / 60))} minute(s) BEFORE Token A`}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Diff Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Header Parameters Diff ({headerDiffs.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] text-[10px] uppercase font-semibold">
                  <th className="py-2.5 px-2">Key</th>
                  <th className="py-2.5 px-2">Token A</th>
                  <th className="py-2.5 px-2">Token B</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]/50 font-mono text-[11px]">
                {headerDiffs.map((d) => (
                  <tr key={d.key} className="hover:bg-[var(--card-border)]/20 transition-colors">
                    <td className="py-2.5 px-2 text-[var(--accent)] font-bold">{d.key}</td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)] break-all">
                      {d.valA !== undefined ? JSON.stringify(d.valA) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)] break-all">
                      {d.valB !== undefined ? JSON.stringify(d.valB) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-sans">
                      {d.type === 'added' && (
                        <span className="pill-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          + Added
                        </span>
                      )}
                      {d.type === 'removed' && (
                        <span className="pill-badge bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          - Removed
                        </span>
                      )}
                      {d.type === 'changed' && (
                        <span className="pill-badge bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          ~ Modified
                        </span>
                      )}
                      {d.type === 'unchanged' && (
                        <span className="pill-badge bg-[var(--card-border)] text-[var(--text-muted)] text-[10px]">
                          Unchanged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Payload Claims Diff ({payloadDiffs.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] text-[10px] uppercase font-semibold">
                  <th className="py-2.5 px-2">Key</th>
                  <th className="py-2.5 px-2">Token A</th>
                  <th className="py-2.5 px-2">Token B</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]/50 font-mono text-[11px]">
                {payloadDiffs.map((d) => (
                  <tr key={d.key} className="hover:bg-[var(--card-border)]/20 transition-colors">
                    <td className="py-2.5 px-2 text-[var(--accent)] font-bold">{d.key}</td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)] break-all">
                      {d.valA !== undefined ? JSON.stringify(d.valA) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)] break-all">
                      {d.valB !== undefined ? JSON.stringify(d.valB) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-sans">
                      {d.type === 'added' && (
                        <span className="pill-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          + Added
                        </span>
                      )}
                      {d.type === 'removed' && (
                        <span className="pill-badge bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          - Removed
                        </span>
                      )}
                      {d.type === 'changed' && (
                        <span className="pill-badge bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          ~ Modified
                        </span>
                      )}
                      {d.type === 'unchanged' && (
                        <span className="pill-badge bg-[var(--card-border)] text-[var(--text-muted)] text-[10px]">
                          Unchanged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

