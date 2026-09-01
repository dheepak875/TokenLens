import React from 'react';
import { Info, Github, Shield, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--card-border)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5 font-[family-name:var(--font-display)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
            <Info className="w-4 h-4 text-[var(--accent)]" />
          </div>
          About TokenLens
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          An open-source, zero-trust JWT/JWS/JWE workbench built for privacy-first developers and security teams.
        </p>
      </div>

      {/* Main Mission Box */}
      <div className="glass-card p-6 space-y-3 leading-relaxed">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Why TokenLens?
        </h2>
        <p className="text-[var(--text-secondary)]">
          TokenLens is engineered to provide actionable, deterministic security intelligence. Its core differentiator is an automated, plain-English <strong>Security Audit</strong> based on RFC 8725 and OWASP guidance that articulates what a token does, what has been cryptographically proven, what remains unverified, and what configuration risks exist.
        </p>
        <p className="text-[var(--text-secondary)]">
          Online decoders frequently rely on remote server endpoints or embed third-party tracking scripts. TokenLens was designed from day one with 100% local client-side execution via Web Crypto APIs — no token, secret, or key ever leaves your browser sandbox.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            1. Uncompromising Local Privacy
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Local browser execution via native Web Crypto API and modern JOSE standards. Zero network telemetry, zero analytics trackers, zero server-side logging.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm font-[family-name:var(--font-display)]">
            2. Cryptographic Rigor
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We avoid vague assurances and clearly separate raw Base64URL string decoding, cryptographic signature verification, and validation profile enforcement.
          </p>
        </div>
      </div>

      {/* GitHub Repository Box */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Github className="w-4 h-4 text-[var(--accent)]" />
          Open Source Project
        </h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          TokenLens is open-source under the permissive MIT License. Contributions, test vectors, and security suggestions are welcome on GitHub.
        </p>
        <div className="pt-2">
          <a
            href="https://github.com/dheepak875/TokenLens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:opacity-90 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <Github className="w-4 h-4" />
            <span>View Source on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

