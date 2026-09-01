import React, { useState } from 'react';
import { MessageSquareText, Copy, Check } from 'lucide-react';
import { SecurityReport } from '../../lib/types/jwt';

interface ExplainPanelProps {
  report: SecurityReport;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.narrativeExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[var(--accent)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Plain-English Narrative Breakdown
          </h4>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Copy Narrative</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-[var(--card-bg-elevated)] p-4 rounded-xl border border-[var(--card-border)] text-sm text-[var(--text-primary)] leading-relaxed font-sans italic border-l-4 border-l-[var(--accent)]">
        &ldquo;{report.narrativeExplanation}&rdquo;
      </div>

      <div className="bg-[var(--background)]/60 p-3 rounded-lg border border-[var(--card-border)] text-xs text-[var(--text-secondary)] space-y-1">
        <span className="font-semibold text-[var(--text-primary)] block">
          Deterministic Local Generation
        </span>
        <p className="text-[11px] leading-relaxed">
          This audit breakdown is deterministically constructed from local Web Crypto cryptographic verification, claim state analysis, and RFC 8725 compliance checks.
        </p>
      </div>
    </div>
  );
};

