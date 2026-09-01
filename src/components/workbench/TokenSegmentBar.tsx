import React from 'react';
import { Layers } from 'lucide-react';
import { ParsedToken } from '../../lib/types/jwt';

interface TokenSegmentBarProps {
  parsedToken: ParsedToken;
  activeSegment: number | null;
  onSelectSegment: (idx: number | null) => void;
}

export const TokenSegmentBar: React.FC<TokenSegmentBarProps> = ({
  parsedToken,
  activeSegment,
  onSelectSegment,
}) => {
  if (parsedToken.type === 'EMPTY' || !parsedToken.segments.length) return null;

  const segmentColorsJws = [
    {
      label: 'Header (Algorithm & Type)',
      textColor: 'text-purple-700 dark:text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
      dotBg: 'bg-purple-600 dark:bg-purple-400',
    },
    {
      label: 'Payload (Claims & Identity)',
      textColor: 'text-sky-700 dark:text-cyan-400',
      badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-cyan-400 border-sky-500/30 hover:bg-sky-500/20',
      dotBg: 'bg-sky-600 dark:bg-cyan-400',
    },
    {
      label: 'Signature (Cryptographic Proof)',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
      dotBg: 'bg-emerald-600 dark:bg-emerald-400',
    },
  ];

  const segmentColorsJwe = [
    {
      label: 'Protected Header',
      textColor: 'text-purple-700 dark:text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
      dotBg: 'bg-purple-600 dark:bg-purple-400',
    },
    {
      label: 'Encrypted Key',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      dotBg: 'bg-indigo-600 dark:bg-indigo-400',
    },
    {
      label: 'Initialization Vector',
      textColor: 'text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
      dotBg: 'bg-blue-600 dark:bg-blue-400',
    },
    {
      label: 'Ciphertext',
      textColor: 'text-sky-700 dark:text-cyan-400',
      badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-cyan-400 border-sky-500/30',
      dotBg: 'bg-sky-600 dark:bg-cyan-400',
    },
    {
      label: 'Authentication Tag',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dotBg: 'bg-emerald-600 dark:bg-emerald-400',
    },
  ];

  const colorScheme =
    parsedToken.type === 'JWE' ? segmentColorsJwe : segmentColorsJws;

  return (
    <div className="glass-card p-4 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
        <span className="flex items-center gap-1.5 font-[family-name:var(--font-display)]">
          <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
          Compact Segment Inspector
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          {parsedToken.sizeBytes} bytes &bull; {parsedToken.segments.length} segments
        </span>
      </div>

      <div className="font-mono text-xs break-all leading-relaxed p-3 bg-[var(--background)]/70 rounded-lg border border-[var(--card-border)]">
        {parsedToken.segments.map((seg, idx) => {
          const item = colorScheme[idx] || {
            label: `Segment ${idx + 1}`,
            badgeBg: 'text-[var(--text-muted)]',
            textColor: 'text-[var(--text-secondary)]',
            dotBg: 'bg-[var(--text-muted)]',
          };
          const isSelected = activeSegment === idx;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[var(--text-muted)] font-bold px-0.5 select-none">.</span>}
              <button
                type="button"
                onClick={() =>
                  onSelectSegment(isSelected ? null : idx)
                }
                className={`px-1 py-0.5 rounded border transition-all cursor-pointer ${item.badgeBg} ${
                  isSelected ? 'ring-2 ring-[var(--accent)] font-bold' : ''
                }`}
                title={`${item.label}: click to inspect`}
              >
                {seg}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2.5 pt-1 text-[11px]">
        {colorScheme.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSegment(activeSegment === idx ? null : idx)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all text-xs ${
              activeSegment === idx
                ? 'bg-[var(--card-border)] font-semibold text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${item.dotBg}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

