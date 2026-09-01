import React from 'react';
import { FileText, Terminal, Layers } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--card-border)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5 font-[family-name:var(--font-display)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
            <FileText className="w-4 h-4 text-[var(--accent)]" />
          </div>
          TokenLens Documentation & Usage Guide
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Reference guide to workbench capabilities, signature verification, validation profiles, and local deployment.
        </p>
      </div>

      {/* Quickstart Guide */}
      <div className="glass-card p-6 space-y-3 leading-relaxed border-l-4 border-l-[var(--accent)]">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Terminal className="w-4 h-4 text-[var(--accent)]" />
          1. Quick Start Workflow
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
          <li>
            <strong className="text-[var(--text-primary)]">Paste Token</strong>: Paste a compact JWS (3 segments) or JWE (5 segments) string into the Workbench paste area.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Inspect Segments & Claims</strong>: Review the color-coded Base64URL segment bar, JSON payload inspector, standard claims table, and validity timeline.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Configure Validation Profile</strong>: Select explicit allowed algorithms (e.g. HS256, RS256), expected issuer, expected audience, and required claims.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Verify Signature</strong>: Open the Verification tab, choose your key input mode (HMAC secret, PEM public key, JWK, or JWKS URL), and click Verify.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Export Report</strong>: Review the RFC 8725 audit findings and export your complete analysis as Markdown or JSON.
          </li>
        </ol>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Layers className="w-4 h-4 text-emerald-400" />
          2. Core Workbench Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-1.5">
            <h3 className="font-bold text-[var(--accent)] text-sm font-[family-name:var(--font-display)]">Token Comparison</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Paste Token A and Token B in `/compare` to view side-by-side added, removed, and modified header parameters and payload claims with temporal offsets.
            </p>
          </div>

          <div className="glass-card p-5 space-y-1.5">
            <h3 className="font-bold text-[var(--accent)] text-sm font-[family-name:var(--font-display)]">Test Token Generator</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Construct custom test tokens in `/generate` with browser-generated keypairs and export copy-paste safe verification snippets for 5 major programming languages.
            </p>
          </div>

          <div className="glass-card p-5 space-y-1.5">
            <h3 className="font-bold text-[var(--accent)] text-sm font-[family-name:var(--font-display)]">Sensitive Claim Redaction</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Toggle automatic redaction of sensitive-looking keys (password, access_token, api_key, etc.) for safe screen sharing and live debugging.
            </p>
          </div>

          <div className="glass-card p-5 space-y-1.5">
            <h3 className="font-bold text-[var(--accent)] text-sm font-[family-name:var(--font-display)]">Offline PWA & Static Host</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              TokenLens compiles to pure static HTML/JS/CSS assets ready for Cloudflare Pages, GitHub Pages, or offline browser PWA installation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

