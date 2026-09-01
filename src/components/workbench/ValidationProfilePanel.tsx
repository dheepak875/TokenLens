import React, { useState } from 'react';
import { SlidersHorizontal, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { SupportedAlgorithm, ValidationProfile } from '../../lib/types/jwt';

interface ValidationProfilePanelProps {
  profile: ValidationProfile;
  onUpdateProfile: (updated: Partial<ValidationProfile>) => void;
}

const ALL_ALGORITHMS: SupportedAlgorithm[] = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512',
  'EdDSA',
];

export const ValidationProfilePanel: React.FC<ValidationProfilePanelProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAlgorithm = (alg: SupportedAlgorithm) => {
    const current = profile.allowedAlgorithms;
    let next: SupportedAlgorithm[];
    if (current.includes(alg)) {
      next = current.filter((a) => a !== alg);
    } else {
      next = [...current, alg];
    }
    onUpdateProfile({ allowedAlgorithms: next });
  };

  const handleTimeOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onUpdateProfile({ nowOverrideTimestamp: null });
      return;
    }
    const ts = Math.floor(new Date(e.target.value).getTime() / 1000);
    onUpdateProfile({ nowOverrideTimestamp: ts });
  };

  return (
    <div className="glass-card shadow-sm overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between font-bold text-[var(--text-primary)] hover:text-[var(--accent)] uppercase tracking-wider text-[11px] font-[family-name:var(--font-display)] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
          Validation Profile & Rules
        </span>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-normal capitalize">
          <span>{isOpen ? 'Collapse' : 'Configure'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-[var(--card-border)]">
          <div className="pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[var(--text-primary)]">
                Allowed Algorithms Allowlist
              </label>
              {profile.allowedAlgorithms.length === 0 && (
                <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> None selected (Warning)
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-2">
              RFC 8725 § 3.2: Explicitly constrain verified algorithm signatures.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ALGORITHMS.map((alg) => {
                const selected = profile.allowedAlgorithms.includes(alg);
                return (
                  <button
                    key={alg}
                    type="button"
                    onClick={() => toggleAlgorithm(alg)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                      selected
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40 font-bold shadow-xs'
                        : 'bg-[var(--card-bg-elevated)] text-[var(--text-muted)] border-[var(--card-border)] hover:border-[var(--card-hover-border)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {alg}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">
                Expected Issuer (iss)
              </label>
              <input
                type="text"
                placeholder="e.g. https://auth.example.com"
                value={profile.expectedIssuer}
                onChange={(e) =>
                  onUpdateProfile({ expectedIssuer: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">
                Expected Audience (aud)
              </label>
              <input
                type="text"
                placeholder="e.g. https://api.example.com"
                value={profile.expectedAudience}
                onChange={(e) =>
                  onUpdateProfile({ expectedAudience: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">
                Required Payload Claims
              </label>
              <div className="flex gap-2 pt-0.5">
                {['sub', 'exp', 'nbf', 'jti'].map((c) => {
                  const checked = profile.requiredClaims.includes(c);
                  return (
                    <label
                      key={c}
                      className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...profile.requiredClaims, c]
                            : profile.requiredClaims.filter((x) => x !== c);
                          onUpdateProfile({ requiredClaims: next });
                        }}
                        className="rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span className="font-mono">{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">
                Clock Skew Tolerance (seconds)
              </label>
              <input
                type="number"
                min={0}
                max={3600}
                value={profile.clockToleranceSeconds}
                onChange={(e) =>
                  onUpdateProfile({
                    clockToleranceSeconds: Math.max(
                       0,
                      parseInt(e.target.value) || 0
                    ),
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
            </div>
          </div>

          <div className="border-t border-[var(--card-border)] pt-3">
            <label className="block text-[var(--text-secondary)] font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              Evaluation Time Override (Time-Travel Testing)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={
                  profile.nowOverrideTimestamp
                    ? new Date(profile.nowOverrideTimestamp * 1000)
                        .toISOString()
                        .slice(0, 16)
                    : ''
                }
                onChange={handleTimeOverrideChange}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--background)]/70 border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-[11px] font-mono"
              />
              {profile.nowOverrideTimestamp !== null && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProfile({ nowOverrideTimestamp: null })
                  }
                  className="px-2.5 py-1.5 bg-[var(--card-bg-elevated)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] rounded-lg text-[10px] font-semibold border border-[var(--card-border)]"
                >
                  Reset Time
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

