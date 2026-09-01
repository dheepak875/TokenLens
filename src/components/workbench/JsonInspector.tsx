import React, { useState } from 'react';
import { Copy, AlertTriangle, Lock, Check } from 'lucide-react';
import { ParsedToken, ValidationProfile } from '../../lib/types/jwt';
import { redactObject } from '../../lib/jwt/sensitive';

interface JsonInspectorProps {
  parsedToken: ParsedToken;
  profile: ValidationProfile;
}

export const JsonInspector: React.FC<JsonInspectorProps> = ({
  parsedToken,
  profile,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const getHeaderDisplay = () => {
    if (!parsedToken.header.json) return null;
    return profile.redactSensitive
      ? redactObject(parsedToken.header.json)
      : parsedToken.header.json;
  };

  const getPayloadDisplay = () => {
    if (!parsedToken.payload.json) return null;
    return profile.redactSensitive
      ? redactObject(parsedToken.payload.json)
      : parsedToken.payload.json;
  };

  const copyJson = (data: unknown, section: string) => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const headerDisplay = getHeaderDisplay();
  const payloadDisplay = getPayloadDisplay();

  return (
    <div className="space-y-4">
      {parsedToken.type === 'JWS' && (
        <div className="rounded-xl p-3.5 text-xs flex items-start gap-3 border bg-[var(--notice-amber-bg)] border-[var(--notice-amber-border)] text-[var(--notice-amber-text)]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5 text-[var(--notice-amber-title)] font-[family-name:var(--font-display)]">
              Security Notice: Base64URL Encoding vs Cryptographic Encryption
            </span>
            JWS payload claims are <strong>Base64URL encoded</strong>, NOT
            encrypted. Anyone holding this token string can read all claims below
            in plaintext. Never place sensitive passwords, plaintext API keys, or PII in JWT
            payloads.
          </div>
        </div>
      )}

      {parsedToken.type === 'JWE' && (
        <div className="rounded-xl p-3.5 text-xs flex items-start gap-3 border bg-[var(--notice-purple-bg)] border-[var(--notice-purple-border)] text-[var(--notice-purple-text)]">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5 text-[var(--notice-purple-title)] font-[family-name:var(--font-display)]">
              JWE Encrypted Structure
            </span>
            The protected header below is inspectable, but the payload claims are encrypted with JSON Web Encryption. Decryption key material is required to inspect claims.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Header Block */}
        <div className="glass-card p-4 space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400 shadow-xs" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
                Header: Algorithm & Type
              </span>
            </div>
            <button
              onClick={() => copyJson(headerDisplay, 'header')}
              disabled={!headerDisplay}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-elevated)] transition-all cursor-pointer"
            >
              {copiedSection === 'header' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--accent)]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {parsedToken.header.duplicateKeys.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-[11px]">
              ⚠️ Duplicate header key(s):{' '}
              {parsedToken.header.duplicateKeys.join(', ')}
            </div>
          )}

          {parsedToken.header.error ? (
            <div className="text-rose-600 dark:text-rose-400 text-xs p-3 bg-[var(--background)] rounded-lg border border-rose-500/20 font-mono">
              {parsedToken.header.error}
            </div>
          ) : (
            <pre className="flex-1 font-mono text-xs p-3 rounded-lg bg-[var(--background)] text-[var(--token-header-color)] overflow-x-auto leading-relaxed border border-[var(--card-border)] selection:bg-purple-500/30 font-medium">
              {JSON.stringify(headerDisplay, null, 2)}
            </pre>
          )}
        </div>

        {/* Payload Block */}
        <div className="glass-card p-4 space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-cyan-400 shadow-xs" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
                Payload: Claims & Data
              </span>
            </div>
            <button
              onClick={() => copyJson(payloadDisplay, 'payload')}
              disabled={!payloadDisplay}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-elevated)] transition-all cursor-pointer"
            >
              {copiedSection === 'payload' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--accent)]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {parsedToken.payload.duplicateKeys.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-[11px]">
              ⚠️ Duplicate payload key(s):{' '}
              {parsedToken.payload.duplicateKeys.join(', ')}
            </div>
          )}

          {parsedToken.payload.error ? (
            <div className="text-amber-600 dark:text-amber-400 text-xs p-3 bg-[var(--background)] rounded-lg border border-amber-500/20 font-mono">
              {parsedToken.payload.error}
            </div>
          ) : (
            <pre className="flex-1 font-mono text-xs p-3 rounded-lg bg-[var(--background)] text-[var(--token-payload-color)] overflow-x-auto leading-relaxed border border-[var(--card-border)] selection:bg-cyan-500/30 font-medium">
              {JSON.stringify(payloadDisplay, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

