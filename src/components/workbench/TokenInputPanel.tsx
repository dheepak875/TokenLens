import React from 'react';
import {
  Clipboard,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Key,
} from 'lucide-react';
import { ParsedToken, ValidationProfile } from '../../lib/types/jwt';

interface TokenInputPanelProps {
  token: string;
  onChangeToken: (val: string) => void;
  parsedToken: ParsedToken;
  profile: ValidationProfile;
  onUpdateProfile: (updated: Partial<ValidationProfile>) => void;
  onLoadExample: (exampleType: 'hs256' | 'rs256' | 'expired' | 'jwe') => void;
}

export const TokenInputPanel: React.FC<TokenInputPanelProps> = ({
  token,
  onChangeToken,
  parsedToken,
  profile,
  onUpdateProfile,
  onLoadExample,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChangeToken(text.trim());
    } catch {
      // Fallback
    }
  };

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="token-paste-area"
            className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]"
          >
            <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
            JWT / Token Input
          </label>
          {parsedToken.type !== 'EMPTY' && (
            <span
              className={`pill-badge border ${
                parsedToken.type === 'JWS'
                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 font-bold'
                  : parsedToken.type === 'JWE'
                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 font-bold'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold'
              }`}
            >
              {parsedToken.type === 'JWS'
                ? 'JWS / JWT (3 Segments)'
                : parsedToken.type === 'JWE'
                  ? 'JWE (5 Segments Encrypted)'
                  : 'Malformed / Invalid'}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            id="token-paste-area"
            rows={5}
            value={token}
            onChange={(e) => onChangeToken(e.target.value)}
            placeholder="Paste encoded JWT / token string (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            className="w-full font-mono text-xs p-3 rounded-lg bg-[var(--background)]/60 text-[var(--text-primary)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-all resize-y leading-relaxed"
            aria-label="JWT token paste area"
          />
          {token && (
            <div className="absolute right-2.5 bottom-2.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--card-border)]">
              {token.length} chars
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] text-xs font-medium transition-all border border-[var(--card-border)] cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-[var(--accent)]" />
              Paste
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!token}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] disabled:opacity-40 text-[var(--text-primary)] text-xs font-medium transition-all border border-[var(--card-border)] cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />
              Copy
            </button>
            <button
              type="button"
              onClick={() => onChangeToken('')}
              disabled={!token}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-rose-500/40 disabled:opacity-40 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-all border border-[var(--card-border)] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateProfile({ redactSensitive: !profile.redactSensitive })
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              profile.redactSensitive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 font-semibold'
                : 'bg-[var(--card-bg-elevated)] text-[var(--text-muted)] border-[var(--card-border)]'
            }`}
            title="Automatically masks sensitive claims (password, access_token, api_key, etc.)"
          >
            {profile.redactSensitive ? (
              <EyeOff className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>
              {profile.redactSensitive ? 'Redaction Active' : 'Redaction Off'}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Test Vectors Header */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-[family-name:var(--font-display)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            Quick Test Vectors
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Safe mock vectors
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onLoadExample('hs256')}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:border-cyan-500/50 hover:text-cyan-700 dark:hover:text-cyan-400 text-[var(--text-secondary)] border border-[var(--card-border)] text-left truncate transition-all font-medium cursor-pointer"
          >
            HS256 (HMAC)
          </button>
          <button
            type="button"
            onClick={() => onLoadExample('rs256')}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:border-indigo-500/50 hover:text-indigo-700 dark:hover:text-indigo-400 text-[var(--text-secondary)] border border-[var(--card-border)] text-left truncate transition-all font-medium cursor-pointer"
          >
            RS256 (RSA)
          </button>
          <button
            type="button"
            onClick={() => onLoadExample('expired')}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400 text-[var(--text-secondary)] border border-[var(--card-border)] text-left truncate transition-all font-medium cursor-pointer"
          >
            Expired Token
          </button>
          <button
            type="button"
            onClick={() => onLoadExample('jwe')}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:border-purple-500/50 hover:text-purple-700 dark:hover:text-purple-400 text-[var(--text-secondary)] border border-[var(--card-border)] text-left truncate transition-all font-medium cursor-pointer"
          >
            JWE Encrypted
          </button>
        </div>
      </div>
    </div>
  );
};
