import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  Sparkles,
  ArrowRight,
  FileCode,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { SupportedAlgorithm, ValidationProfile } from '../lib/types/jwt';
import { generateTestToken, generateKeyPair, GeneratedKeypair } from '../lib/jwt/generator';
import { generateCodeSnippets } from '../lib/jwt/snippets';

const PRESET_TEMPLATES: Record<string, Record<string, unknown>> = {
  'OAuth 2.0 Access Token': {
    iss: 'https://auth.example.com',
    sub: 'usr_dev_987',
    aud: 'https://api.example.com',
    scope: 'read:profile write:orders',
    roles: ['developer', 'admin'],
    email: 'alex.developer@example.com',
  },
  'OpenID Connect (OIDC)': {
    iss: 'https://accounts.example.com',
    sub: 'oidc_sub_1029384756',
    aud: 'client_app_xyz789',
    name: 'Alex Rivera',
    preferred_username: 'arivera',
    email: 'alex.rivera@example.com',
    email_verified: true,
  },
  'Microservice Service-to-Service': {
    iss: 'https://auth.internal.mesh',
    sub: 'svc_payment_processor',
    aud: 'svc_order_management',
    service_id: 'payment-svc-node-04',
    tenant_id: 'tenant_enterprise_001',
    permissions: ['payments:charge', 'refunds:create', 'ledger:write'],
  },
  'Minimal Token': {
    iss: 'https://auth.example.com',
    sub: 'user_42',
  },
};

export const GeneratePage: React.FC = () => {
  const navigate = useNavigate();

  const [algorithm, setAlgorithm] = useState<SupportedAlgorithm>('HS256');
  const [editorMode, setEditorMode] = useState<'json' | 'form'>('json');

  // JSON Payload String
  const [payloadJsonStr, setPayloadJsonStr] = useState<string>(
    JSON.stringify(PRESET_TEMPLATES['OAuth 2.0 Access Token'], null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Form Fields Mode State
  const [issuer, setIssuer] = useState('https://auth.example.com');
  const [subject, setSubject] = useState('usr_dev_987');
  const [audience, setAudience] = useState('https://api.example.com');
  const [scope, setScope] = useState('read:profile write:orders');
  const [roles, setRoles] = useState('developer, admin');
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');

  // Key & Expiration Configuration
  const [expirationPreset, setExpirationPreset] = useState(3600); // 1 hour
  const [autoTimestamps, setAutoTimestamps] = useState(true);
  const [hmacSecret, setHmacSecret] = useState(
    'dev-secret-key-test-fixture-32bytes-min!'
  );

  // Output
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatedPair, setGeneratedPair] = useState<GeneratedKeypair | null>(null);
  const [activeSnippetLang, setActiveSnippetLang] = useState('Node.js (jose)');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Helper to validate and parse JSON
  const getParsedPayload = (): { valid: boolean; data: Record<string, unknown> | null; error: string | null } => {
    try {
      const parsed = JSON.parse(payloadJsonStr);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { valid: false, data: null, error: 'JSON payload must be a JSON object {...}' };
      }
      return { valid: true, data: parsed as Record<string, unknown>, error: null };
    } catch (err: unknown) {
      return { valid: false, data: null, error: err instanceof Error ? err.message : 'Invalid JSON syntax' };
    }
  };

  // Sync Form fields to JSON
  const syncFormToJson = (
    newIss = issuer,
    newSub = subject,
    newAud = audience,
    newScope = scope,
    newRoles = roles
  ) => {
    const roleArray = newRoles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const obj: Record<string, unknown> = {};
    if (newIss) obj.iss = newIss;
    if (newSub) obj.sub = newSub;
    if (newAud) obj.aud = newAud;
    if (newScope) obj.scope = newScope;
    if (roleArray.length > 0) obj.roles = roleArray;

    const str = JSON.stringify(obj, null, 2);
    setPayloadJsonStr(str);
    setJsonError(null);
  };

  // Switch to Form Mode: parse JSON into form fields if possible
  const handleSwitchToForm = () => {
    const { valid, data } = getParsedPayload();
    if (valid && data) {
      if (typeof data.iss === 'string') setIssuer(data.iss);
      if (typeof data.sub === 'string') setSubject(data.sub);
      if (typeof data.aud === 'string') setAudience(data.aud);
      if (typeof data.scope === 'string') setScope(data.scope);
      if (Array.isArray(data.roles)) setRoles(data.roles.join(', '));
    }
    setEditorMode('form');
  };

  // Switch to JSON Mode
  const handleSwitchToJson = () => {
    syncFormToJson();
    setEditorMode('json');
  };

  // Apply a template preset
  const handleApplyPreset = (name: string) => {
    const preset = PRESET_TEMPLATES[name];
    if (!preset) return;
    const str = JSON.stringify(preset, null, 2);
    setPayloadJsonStr(str);
    setJsonError(null);

    // Update form mirrors
    if (typeof preset.iss === 'string') setIssuer(preset.iss);
    if (typeof preset.sub === 'string') setSubject(preset.sub);
    if (typeof preset.aud === 'string') setAudience(preset.aud);
    if (typeof preset.scope === 'string') setScope(preset.scope);
    if (Array.isArray(preset.roles)) setRoles(preset.roles.join(', '));
  };

  // Format JSON
  const handleFormatJson = () => {
    const { valid, data, error } = getParsedPayload();
    if (valid && data) {
      setPayloadJsonStr(JSON.stringify(data, null, 2));
      setJsonError(null);
    } else {
      setJsonError(error);
    }
  };

  const handleJsonChange = (val: string) => {
    setPayloadJsonStr(val);
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setJsonError('JSON payload must be a JSON object {...}');
      } else {
        setJsonError(null);
      }
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON syntax');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    let claims: Record<string, unknown> = {};

    if (editorMode === 'json') {
      const { valid, data, error } = getParsedPayload();
      if (!valid || !data) {
        setJsonError(error || 'Please fix the JSON errors before generating.');
        return;
      }
      claims = data;
    } else {
      const roleArray = roles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      claims = {
        iss: issuer || undefined,
        sub: subject || undefined,
        aud: audience || undefined,
        scope: scope || undefined,
        roles: roleArray.length > 0 ? roleArray : undefined,
      };

      if (customKey.trim() && customValue.trim()) {
        try {
          claims[customKey.trim()] = JSON.parse(customValue.trim());
        } catch {
          claims[customKey.trim()] = customValue.trim();
        }
      }
    }

    let pair: GeneratedKeypair | null = null;
    let secretOrKey = hmacSecret;

    if (!algorithm.startsWith('HS')) {
      pair = await generateKeyPair(algorithm);
      setGeneratedPair(pair);
      secretOrKey = pair.privateKeyPem;
    } else {
      setGeneratedPair(null);
    }

    const res = await generateTestToken({
      algorithm,
      claims,
      secretOrPrivateKey: secretOrKey,
      expirationPresetSeconds: autoTimestamps ? expirationPreset : undefined,
    });

    setGeneratedToken(res.token);
  };

  const profileForSnippets: ValidationProfile = {
    allowedAlgorithms: [algorithm],
    expectedIssuer: issuer || 'https://auth.example.com',
    expectedAudience: audience || 'https://api.example.com',
    requiredClaims: ['sub', 'exp'],
    clockToleranceSeconds: 0,
    currentDifferenceSeconds: 0,
    nowOverrideTimestamp: null,
    redactSensitive: true,
  };

  const snippets = generateCodeSnippets(profileForSnippets, algorithm);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Notice Banner */}
      <div className="rounded-xl p-4 text-xs flex items-start gap-3 border bg-[var(--notice-amber-bg)] border-[var(--notice-amber-border)] text-[var(--notice-amber-text)]">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block font-[family-name:var(--font-display)] text-[var(--notice-amber-title)]">
            Development Vector Generator Sandbox
          </span>
          <p className="leading-relaxed text-[var(--text-secondary)]">
            Generated tokens and cryptographic keys are constructed 100% locally via browser Web Crypto APIs for debugging and automated testing purposes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Configuration Form / JSON Editor Column */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-6 glass-card p-5 space-y-5 text-xs"
        >
          {/* Header & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
                JWT Generator & Payload Builder
              </h2>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-lg bg-[var(--card-bg-elevated)] p-0.5 border border-[var(--card-border)] text-xs">
              <button
                type="button"
                onClick={handleSwitchToJson}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  editorMode === 'json'
                    ? 'bg-[var(--card-border)] text-[var(--accent)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Payload Editor</span>
              </button>
              <button
                type="button"
                onClick={handleSwitchToForm}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  editorMode === 'form'
                    ? 'bg-[var(--card-border)] text-[var(--accent)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Quick Fields Form</span>
              </button>
            </div>
          </div>

          {/* Preset Templates Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider block font-[family-name:var(--font-display)]">
              Payload Templates
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PRESET_TEMPLATES).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleApplyPreset(name)}
                  className="px-2 py-1 rounded-lg bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] text-[11px] transition-all cursor-pointer font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm & Secret/Key Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                Signing Algorithm (alg)
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as SupportedAlgorithm)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
              >
                <option value="HS256">HS256 (Symmetric HMAC SHA-256)</option>
                <option value="HS384">HS384 (Symmetric HMAC SHA-384)</option>
                <option value="HS512">HS512 (Symmetric HMAC SHA-512)</option>
                <option value="RS256">RS256 (Asymmetric RSA SHA-256)</option>
                <option value="RS384">RS384 (Asymmetric RSA SHA-384)</option>
                <option value="RS512">RS512 (Asymmetric RSA SHA-512)</option>
                <option value="ES256">ES256 (Asymmetric ECDSA P-256)</option>
                <option value="ES384">ES384 (Asymmetric ECDSA P-384)</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                Token Expiration (exp)
              </label>
              <select
                value={expirationPreset}
                onChange={(e) => setExpirationPreset(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
              >
                <option value={900}>15 Minutes from now</option>
                <option value={3600}>1 Hour from now</option>
                <option value={86400}>24 Hours from now</option>
                <option value={604800}>7 Days from now</option>
                <option value={2592000}>30 Days from now</option>
              </select>
            </div>
          </div>

          {algorithm.startsWith('HS') && (
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                HMAC Test Secret Key
              </label>
              <input
                type="text"
                value={hmacSecret}
                onChange={(e) => setHmacSecret(e.target.value)}
                placeholder="Enter secret key string (min 32 bytes recommended)"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* MAIN PAYLOAD INPUT ZONE: JSON Editor OR Form Fields */}
          {editorMode === 'json' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="json-payload-textarea"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 font-[family-name:var(--font-display)]"
                >
                  <FileCode className="w-3.5 h-3.5 text-[var(--accent)]" />
                  JSON Payload Claims (Key-in or Paste Custom JSON)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded border border-[var(--card-border)] bg-[var(--card-bg-elevated)] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Format JSON</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="json-payload-textarea"
                  rows={10}
                  value={payloadJsonStr}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder={`{\n  "iss": "https://auth.example.com",\n  "sub": "user_123",\n  "roles": ["admin"],\n  "custom_claim": 42\n}`}
                  className="w-full font-mono text-xs p-3.5 rounded-xl bg-[var(--background)] text-[var(--token-payload-color)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-all resize-y leading-relaxed font-medium"
                  aria-label="JSON Payload Claims editor"
                />
              </div>

              {/* JSON Error or Validation Indicator */}
              {jsonError ? (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON Object
                  </span>
                  <label className="flex items-center gap-1.5 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTimestamps}
                      onChange={(e) => setAutoTimestamps(e.target.checked)}
                      className="rounded border-[var(--card-border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                    />
                    <span>Auto-inject `iat` and `exp` if omitted</span>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                    Issuer (iss)
                  </label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => {
                      setIssuer(e.target.value);
                      syncFormToJson(e.target.value, subject, audience, scope, roles);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                    Subject (sub)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      syncFormToJson(issuer, e.target.value, audience, scope, roles);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                    Audience (aud)
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => {
                      setAudience(e.target.value);
                      syncFormToJson(issuer, subject, e.target.value, scope, roles);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                    OAuth Scopes (space delimited)
                  </label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => {
                      setScope(e.target.value);
                      syncFormToJson(issuer, subject, audience, e.target.value, roles);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Roles (comma delimited)
                </label>
                <input
                  type="text"
                  value={roles}
                  onChange={(e) => {
                    setRoles(e.target.value);
                    syncFormToJson(issuer, subject, audience, scope, e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Custom Key-Value Claim */}
              <div className="pt-1">
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Add Custom Claim (Key & Value)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Claim Name (e.g. tenant_id)"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    type="text"
                    placeholder="Value or JSON (e.g. 123 or true)"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={editorMode === 'json' && Boolean(jsonError)}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 rounded-xl cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate & Sign JWT Token</span>
          </button>
        </form>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
                Generated Compact JWT
              </span>
              {generatedToken && (
                <button
                  type="button"
                  onClick={() => {
                    if (generatedToken) {
                      navigator.clipboard.writeText(generatedToken);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-semibold cursor-pointer"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                </button>
              )}
            </div>

            {generatedToken ? (
              <div className="space-y-3">
                <textarea
                  readOnly
                  rows={4}
                  value={generatedToken}
                  className="w-full font-mono text-xs p-3 rounded-xl bg-[var(--background)] text-[var(--accent)] border border-[var(--card-border)] leading-relaxed resize-none font-medium"
                />

                {generatedPair && (
                  <div className="bg-[var(--card-bg-elevated)] p-3 rounded-xl border border-[var(--card-border)] space-y-2 text-xs">
                    <span className="font-bold text-[var(--text-primary)] block font-[family-name:var(--font-display)]">
                      Generated Public Key (SPKI PEM)
                    </span>
                    <pre className="font-mono text-[10px] text-[var(--text-secondary)] overflow-x-auto p-2.5 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
                      {generatedPair.publicKeyPem}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/', { state: { token: generatedToken } });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
                  >
                    <span>Inspect & Verify in Workbench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-[var(--text-muted)] text-xs italic bg-[var(--background)]/40 rounded-xl border border-dashed border-[var(--card-border)]">
                Click &ldquo;Generate & Sign JWT Token&rdquo; to build and sign a custom JWT locally.
              </div>
            )}
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-[family-name:var(--font-display)]">
                  Safe Verification Code Snippets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const code = snippets[activeSnippetLang];
                  if (code) {
                    navigator.clipboard.writeText(code);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {Object.keys(snippets).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveSnippetLang(lang)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs cursor-pointer ${
                    activeSnippetLang === lang
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'bg-[var(--card-bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <pre className="font-mono text-xs p-4 rounded-xl bg-[var(--background)] text-[var(--text-primary)] overflow-x-auto leading-relaxed border border-[var(--card-border)] font-medium">
              {snippets[activeSnippetLang]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
