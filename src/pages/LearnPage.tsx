import React from 'react';
import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

export const LearnPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--card-border)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5 font-[family-name:var(--font-display)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center border border-[var(--accent)]/30">
            <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          </div>
          JOSE & JWT Security Primer & Standards
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Developer reference for JSON Web Tokens, cryptographic signing primitives, and RFC 8725 compliance.
        </p>
      </div>

      {/* Section 1 */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          1. JWT vs JWS vs JWE Serialization Formats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="glass-card p-4 space-y-2">
            <span className="font-bold text-[var(--accent)] text-sm block font-[family-name:var(--font-display)]">
              JWT (JSON Web Token)
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              RFC 7519 standard format representing claims transferred between
              parties as a structured JSON object. Can be serialized as either a JWS or JWE.
            </p>
          </div>

          <div className="glass-card p-4 space-y-2">
            <span className="font-bold text-emerald-400 text-sm block font-[family-name:var(--font-display)]">
              JWS (JSON Web Signature)
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              RFC 7515 structure containing 3 compact segments (Header, Payload,
              Signature). Claims are <strong>Base64URL encoded</strong> in plaintext, accompanied by an HMAC or asymmetric signature.
            </p>
          </div>

          <div className="glass-card p-4 space-y-2">
            <span className="font-bold text-purple-400 text-sm block font-[family-name:var(--font-display)]">
              JWE (JSON Web Encryption)
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              RFC 7516 structure containing 5 compact segments. Payload claims are
              encrypted for confidentiality and can only be read with the matching private/shared key.
            </p>
          </div>
        </div>
      </div>

      {/* Security Callout Box */}
      <div className="glass-card p-5 space-y-3 text-xs leading-relaxed border-l-4 border-l-[var(--accent)]">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Why a Decoded Token is NOT Necessarily Trustworthy
        </h2>
        <p className="text-[var(--text-secondary)]">
          Base64URL encoding is a string representation format, <strong>NOT cryptographic protection</strong>. Any client or intermediate party can forge or modify the payload claims of an unverified token.
        </p>
        <p className="font-semibold text-[var(--accent)]">
          To safely accept and authorize an incoming token, backends MUST:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)] pl-2">
          <li>Verify the cryptographic signature against an explicit allowed algorithm list (reject <code className="text-rose-400">alg: "none"</code>).</li>
          <li>Validate the server clock against <code className="text-[var(--accent)] font-mono">exp</code> (Expiration) and <code className="text-[var(--accent)] font-mono">nbf</code> (Not Before).</li>
          <li>Ensure <code className="text-[var(--accent)] font-mono">iss</code> matches the trusted Identity Provider domain.</li>
          <li>Ensure <code className="text-[var(--accent)] font-mono">aud</code> matches your specific service client ID or API audience.</li>
        </ol>
      </div>

      {/* Claims Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          2. Standard Registered Claims (RFC 7519)
        </h2>
        <div className="glass-card p-4 overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Claim</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Purpose & Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/50 text-[var(--text-primary)]">
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">iss</td>
                <td className="py-2.5 px-3 font-medium">Issuer</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Identifies who issued the token (e.g. auth server domain).</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">sub</td>
                <td className="py-2.5 px-3 font-medium">Subject</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Identifies the authenticated principal / user ID.</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">aud</td>
                <td className="py-2.5 px-3 font-medium">Audience</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Identifies the intended recipient services for this token.</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">exp</td>
                <td className="py-2.5 px-3 font-medium">Expiration Time</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Unix timestamp after which the token MUST be rejected.</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">nbf</td>
                <td className="py-2.5 px-3 font-medium">Not Before</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Unix timestamp before which the token MUST NOT be accepted.</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">iat</td>
                <td className="py-2.5 px-3 font-medium">Issued At</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Unix timestamp when the token was created.</td>
              </tr>
              <tr className="hover:bg-[var(--card-border)]/20 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)]">jti</td>
                <td className="py-2.5 px-3 font-medium">JWT ID</td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">Unique identifier for audit logging and replay attack mitigation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          3. Security Standards & Formal Specifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <a
            href="https://datatracker.ietf.org/doc/html/rfc8725"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-card hover:border-[var(--accent)] transition-all block space-y-1.5 group"
          >
            <div className="flex items-center justify-between font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
              <span>RFC 8725: JWT Best Current Practices</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Official IETF BCP guidance covering algorithm pinning, explicit typing, duplicate keys, and dangerous parameters.
            </p>
          </a>

          <a
            href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-card hover:border-[var(--accent)] transition-all block space-y-1.5 group"
          >
            <div className="flex items-center justify-between font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
              <span>OWASP JWT Security Cheat Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              OWASP guidelines for secure token handling, key storage, and preventing signature bypass vulnerabilities.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

