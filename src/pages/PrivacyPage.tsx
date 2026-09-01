import React from 'react';
import { ShieldCheck, Lock, HardDrive, EyeOff, ServerOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--card-border)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5 font-[family-name:var(--font-display)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          Privacy Model & Zero-Trust Threat Analysis
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          TokenLens is engineered around strict local execution boundaries with zero network exfiltration.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="glass-card p-5 space-y-2">
          <ServerOff className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            Zero Server Exfiltration
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            All parsing, Base64URL decoding, Web Crypto signature verification, and report generation execute locally in your browser context. There is no backend server, proxy API, or telemetry endpoint.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <EyeOff className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            Zero Telemetry & Trackers
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            TokenLens does not load third-party analytics scripts, Google Analytics, trackers, or external assets that could log user IP addresses or activity.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <Lock className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            Ephemeral Key Material
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            HMAC secrets, PEM private/public keys, and JWK data entered during verification exist purely in ephemeral JavaScript memory while the browser tab is open.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            IndexedDB Local Storage Only
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Saved workspaces are written only to your browser’s local IndexedDB database upon explicit save. Data remains exclusively on your physical machine.
          </p>
        </div>
      </div>

      {/* Threat Model Box */}
      <div className="glass-card p-6 space-y-4 text-xs leading-relaxed">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Threat Model & Security Boundary Analysis
        </h2>

        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="p-3.5 bg-[var(--card-bg-elevated)] rounded-xl border border-[var(--card-border)]">
            <span className="font-bold text-emerald-400 block mb-1 font-[family-name:var(--font-display)]">
              What TokenLens Protects Against:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
              <li>Token & Secret exfiltration over network calls (0 outbound calls).</li>
              <li>Third-party script injection or tracker eavesdropping.</li>
              <li>Unintended automatic fetching of malicious `jku`/`x5u` URLs.</li>
              <li>False sense of security (never claims unverified tokens are "secure").</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[var(--card-bg-elevated)] rounded-xl border border-[var(--card-border)]">
            <span className="font-bold text-amber-400 block mb-1 font-[family-name:var(--font-display)]">
              What Client-Side Applications Cannot Protect Against:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
              <li>Malicious browser extensions installed on the user device.</li>
              <li>Compromised client OS, keyloggers, or screen capture malware.</li>
              <li>Users manually pasting live production secrets into shared screens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

