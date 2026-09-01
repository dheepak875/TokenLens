import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  ParsedToken,
  ValidationProfile,
  VerificationInput,
  VerificationResult,
} from '../../lib/types/jwt';

interface VerificationPanelProps {
  parsedToken: ParsedToken;
  verificationInput: VerificationInput;
  onChangeInput: (updated: Partial<VerificationInput>) => void;
  verificationResult: VerificationResult;
  profile: ValidationProfile;
  onRunVerify: () => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  parsedToken: _parsedToken,
  verificationInput,
  onChangeInput,
  verificationResult,
  onRunVerify,
}) => {
  const [showHmacSecret, setShowHmacSecret] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchJwksUrl = async () => {
    if (!verificationInput.jwksUrl.trim()) return;
    setFetchingUrl(true);
    setFetchError(null);

    try {
      const urlObj = new URL(verificationInput.jwksUrl.trim());
      const response = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      JSON.parse(text);

      onChangeInput({ jwksJson: text });
      onRunVerify();
    } catch (err) {
      setFetchError(
        `Fetch failed: ${(err as Error).message}. Ensure CORS headers are enabled on target JWKS origin.`
      );
    } finally {
      setFetchingUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Signature Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
          verificationResult.status === 'verified'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-sm'
            : verificationResult.status === 'failed'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300 shadow-sm'
              : 'glass-card text-[var(--text-primary)]'
        }`}
      >
        {verificationResult.status === 'verified' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : verificationResult.status === 'failed' ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
        )}

        <div className="space-y-1 text-xs">
          <div className="font-bold flex items-center gap-2 font-[family-name:var(--font-display)]">
            <span className="tracking-wide">
              {verificationResult.status === 'verified'
                ? 'Signature VERIFIED'
                : verificationResult.status === 'failed'
                  ? 'Signature Verification FAILED'
                  : 'Signature Unverified'}
            </span>
            {verificationResult.algorithm && (
              <span className="px-2 py-0.5 rounded-md bg-[var(--card-border)] font-mono text-[10px] text-[var(--accent)] font-semibold border border-[var(--card-border)]">
                {verificationResult.algorithm}
              </span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {verificationResult.details ||
              'Supply key material below to cryptographically verify the token signature.'}
          </p>
          {verificationResult.errorMessage && (
            <p className="text-rose-600 dark:text-rose-400 font-mono text-[11px] pt-1">
              Error: {verificationResult.errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
          Verification Key Input Mode
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'hmac', label: 'HMAC Secret' },
            { id: 'pem', label: 'PEM Public Key' },
            { id: 'jwk', label: 'JWK JSON' },
            { id: 'jwks_json', label: 'JWKS JSON' },
            { id: 'jwks_url', label: 'Fetch JWKS URL' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                onChangeInput({ mode: mode.id as VerificationInput['mode'] });
              }}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                verificationInput.mode === mode.id
                  ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-xs'
                  : 'bg-[var(--card-bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] hover:border-[var(--card-hover-border)]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="pt-2">
          {verificationInput.mode === 'hmac' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                HMAC Symmetric Secret (for HS256, HS384, HS512)
              </label>
              <div className="relative">
                <input
                  type={showHmacSecret ? 'text' : 'password'}
                  placeholder="Paste secret string..."
                  value={verificationInput.hmacSecret}
                  onChange={(e) => {
                    onChangeInput({ hmacSecret: e.target.value });
                  }}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShowHmacSecret(!showHmacSecret)}
                  className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label={showHmacSecret ? 'Hide secret' : 'Reveal secret'}
                >
                  {showHmacSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Secrets remain strictly in local memory and are never transmitted.
              </p>
            </div>
          )}

          {verificationInput.mode === 'pem' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                PEM Format Public Key (RS256/384/512, ES256/384/512, EdDSA)
              </label>
              <textarea
                rows={4}
                placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...&#10;-----END PUBLIC KEY-----"
                value={verificationInput.pemPublicKey}
                onChange={(e) =>
                  onChangeInput({ pemPublicKey: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {verificationInput.mode === 'jwk' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                JWK (JSON Web Key) Object
              </label>
              <textarea
                rows={4}
                placeholder='{ "kty": "RSA", "n": "...", "e": "AQAB", "kid": "key-1" }'
                value={verificationInput.jwkJson}
                onChange={(e) => onChangeInput({ jwkJson: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {verificationInput.mode === 'jwks_json' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Pasted JWKS JSON Set
              </label>
              <textarea
                rows={4}
                placeholder='{ "keys": [ { "kty": "RSA", "kid": "key-1", ... } ] }'
                value={verificationInput.jwksJson}
                onChange={(e) => onChangeInput({ jwksJson: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {verificationInput.mode === 'jwks_url' && (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-400">
                <span className="font-semibold block mb-0.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Explicit Browser Fetch Only
                </span>
                TokenLens fetches key sets directly from your browser with no proxy. Embedded token URLs (jku, x5u) are never automatically followed.
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  JWKS Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://auth.example.com/.well-known/jwks.json"
                    value={verificationInput.jwksUrl}
                    onChange={(e) =>
                      onChangeInput({ jwksUrl: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleFetchJwksUrl}
                    disabled={fetchingUrl || !verificationInput.jwksUrl}
                    className="px-3 py-2 bg-[var(--accent)] hover:opacity-90 disabled:opacity-40 text-slate-950 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${fetchingUrl ? 'animate-spin' : ''}`}
                    />
                    <span>{fetchingUrl ? 'Fetching...' : 'Fetch JWKS'}</span>
                  </button>
                </div>
              </div>

              {fetchError && (
                <p className="text-rose-400 text-xs font-mono p-2 bg-[var(--background)] rounded-lg border border-rose-500/30">
                  {fetchError}
                </p>
              )}
            </div>
          )}

          <div className="pt-3">
            <button
              type="button"
              onClick={onRunVerify}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Cryptographic Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

