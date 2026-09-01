# TokenLens Implementation Plan

## Overview
TokenLens is an open-source, privacy-first JWT/JWS/JWE workbench built with Vite, React, TypeScript, Tailwind CSS, and `jose`. It runs 100% locally in the browser with zero backend, telemetry, or remote dependencies.

## Key Phases

1. **Project Infrastructure Setup**:
   - Initialize package.json, TypeScript (strict), Vite, Tailwind CSS, Vitest, Playwright, ESLint, Prettier.
   - Configure build tools for static export (Cloudflare Pages compatible) and PWA service worker.

2. **Core JOSE & Security Library (`src/lib/jwt/`)**:
   - `parser.ts`: Token structure detection (JWS 3 parts vs JWE 5 parts), Base64URL decoding, duplicate JSON key detection, size warnings.
   - `verifier.ts`: Browser Web Crypto signature verification via `jose` (HS256-512, RS256-512, PS256-512, ES256-512, EdDSA), JWKS kid matching, PEM/JWK parsing, non-sensitive error categorization.
   - `validator.ts`: Deterministic Security Report engine enforcing RFC 8725 and OWASP JWT guidelines. Evaluates header, claim, profile, signature, and cryptographic context.
   - `explainer.ts`: Natural language narrative generator producing deterministic explanations from report findings.
   - `sensitive.ts`: Smart claim redaction engine masking sensitive keys (`access_token`, `refresh_token`, `password`, `secret`, `api_key`, `authorization`, `cookie`, `session`).
   - `compare.ts`: Semantic diffing of headers and claims across two tokens.
   - `generator.ts` & `snippets.ts`: Test token signer & generator, multi-language validation snippet generator (Node.js, Python, Go, Java, .NET).

3. **User Interface Components & Layout**:
   - Dark-first developer workbench aesthetic with status badges, theme switcher (Dark, Light, System), and persistent local-only indicator.
   - Main Workbench (`/`): Three-column responsive layout (Token Input & Profile / Decoded JSON Inspector & Timeline / Verification & Security Report).
   - Token Comparison (`/compare`): Side-by-side header/claim diffing.
   - Token Generator (`/generate`): Test claim builder, keypair generator, safe code snippet copy.
   - Education & Explainer (`/learn`): Concise guide on JWT/JWS/JWE concepts, security checklist, and RFC references.
   - Privacy & Threat Model (`/privacy`): Detailed breakdown of local processing guarantees and threat model.
   - About (`/about`) & Docs (`/docs`): Project overview and local usage guide.
   - Local Workspaces (`src/lib/db/indexedDB.ts`): IndexedDB storage for local saved tokens with explicit privacy disclosures and clear data options.

4. **Documentation & Compliance**:
   - `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, `LICENSE` (MIT).
   - `docs/architecture.md`, `docs/threat-model.md`.
   - `.github/workflows/ci.yml`.

5. **Testing & Quality Assurance**:
   - Vitest unit tests covering parsing, verification, RFC 8725 validation rules, redaction, and comparison.
   - Playwright end-to-end smoke test for token inspection, verification, and export.
   - Production static build verification.
