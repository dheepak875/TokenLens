# TokenLens Browser-Only Architecture & Data Flow

## Overview

TokenLens is constructed as a pure client-side Single Page Application (SPA) designed to compile down to static HTML, JavaScript, and CSS assets.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Browser Sandbox                            │
│                                                                        │
│  ┌────────────────────┐     ┌───────────────────┐     ┌─────────────┐  │
│  │ TokenInput & UI    │ ──> │ JOSE Parser &     │ ──> │ Web Crypto  │  │
│  │ Components         │     │ Redaction Engine  │     │ API (jose)  │  │
│  └────────────────────┘     └───────────────────┘     └─────────────┘  │
│            │                          │                      │         │
│            ▼                          ▼                      ▼         │
│  ┌────────────────────┐     ┌───────────────────┐     ┌─────────────┐  │
│  │ Local IndexedDB    │     │ RFC 8725 & OWASP  │     │ Security    │  │
│  │ Store (Explicit)   │     │ Rule Validator    │ ──> │ Report UI   │  │
│  └────────────────────┘     └───────────────────┘     └─────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

## Key Technical Design Decisions

1. **JOSE Library Choice (`jose`)**:
   - `jose` is selected because it is built natively on the browser **Web Crypto API** (`crypto.subtle`).
   - Requires zero Node.js runtime polyfills, buffer hacks, or native crypto binaries.

2. **Data Isolation & State**:
   - Application state is held in React component hooks (`useState`, `useMemo`).
   - Secrets, private keys, and HMAC strings exist in memory only during active session execution.
   - When the user closes or reloads the tab, un-saved temporary data is purged.

3. **Deterministic Security Engine (`validator.ts`)**:
   - Every Security Report finding is calculated deterministically from local token parameters and user-configured validation profiles.
   - Zero AI calls or external inference endpoints are used to construct narrative explanations.

4. **Explicit JWKS Fetching**:
   - Remote URL fetching for JWKS is executed strictly on explicit user action ("Fetch JWKS").
   - The browser `fetch()` API calls the target endpoint directly.
   - Tokens or secrets are NEVER attached to outbound requests.
