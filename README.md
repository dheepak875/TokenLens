# TokenLens 🔍🔒

> **Privacy-First JWT/JWS/JWE Workbench & Plain-English Security Inspector**

TokenLens is a production-quality, open-source web application designed to help developers inspect, verify, generate, compare, and understand JSON Web Tokens (JWT/JWS/JWE).

Unlike generic decoders or online tools that send your tokens or secrets to remote servers, TokenLens runs **100% locally in your browser** using standard Web Crypto APIs and `jose`. No token, private key, HMAC secret, or pasted JWKS ever leaves your device.

---

## 🌟 Key Features & Product Principles

- 🔒 **Privacy-First Architecture**:
  - All token parsing, Base64URL decoding, cryptographic signature verification, and report generation execute locally in your browser.
  - Zero server backend, zero database, zero telemetry, zero analytics, zero remote fonts, zero trackers.
  - Never automatically fetches URLs embedded in JWT headers (`jku`, `x5u`, `iss`).
  - Optional local workspace saving uses browser IndexedDB only.
- 🛡️ **Security Honesty & Plain-English Security Report**:
  - Deterministic checks based on **RFC 8725** (JWT Best Current Practices) and **OWASP JWT Guidance**.
  - Evaluates status as `Pass`, `Review`, `Warning`, or `Cannot determine`. Never uses deceptive terms like "secure".
  - Discloses critical distinctions: structurally valid vs. decodable vs. signature verified vs. profile compliant.
- ⚙️ **Comprehensive JOSE Support**:
  - HMAC (`HS256`, `HS384`, `HS512`)
  - RSA (`RS256`, `RS384`, `RS512`, `PS256`, `PS384`, `PS512`)
  - ECDSA (`ES256`, `ES384`, `ES512`)
  - EdDSA
  - JWE 5-segment protected header inspection
- 🔀 **Side-by-Side Token Comparison (`/compare`)**:
  - Diff headers and claims across two tokens (Added, Removed, Modified, Unchanged).
  - Human-readable timestamp delta calculation (`exp`, `iat`).
- 🔑 **Test Token Generator (`/generate`)**:
  - Local browser keypair generation (`RS256`, `ES256`).
  - Copy safe verification snippets for Node.js (`jose`), Python (`PyJWT`), Go (`golang-jwt`), Java (`JJWT`), and .NET (`System.IdentityModel.Tokens.Jwt`).
- 📱 **PWA & Offline Capable**:
  - Works offline after first load as a Progressive Web App.
  - Fully static build suitable for Cloudflare Pages or GitHub Pages.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `^20.19.0 || ^22.13.0 || >=24`
- npm `^10.0.0`

### Installation

```bash
# Clone repository
git clone https://github.com/dheepak875/TokenLens.git
cd TokenLens

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Code Quality

```bash
# Run TypeScript strict typecheck & Vite build
npm run build

# Run Vitest unit tests
npm test

# Run ESLint validation
npm run lint

# Run Playwright E2E smoke tests
npx playwright test
```

---

## ☁️ Deployment (Cloudflare Pages)

TokenLens compiles to static HTML/CSS/JS assets with zero runtime server dependencies.

### Deploying via Cloudflare Pages CLI (`wrangler`):

```bash
npm run build
npx wrangler pages deploy dist --project-name=tokenlens
```

### Deploying via Cloudflare Pages Dashboard:
1. Connect your GitHub repository (`dheepak875/TokenLens`).
2. Set **Build command**: `npm run build`
3. Set **Build output directory**: `dist`
4. Deploy!

---

## 📚 Documentation & Specifications

- [Architecture Guide](docs/architecture.md)
- [Threat Model & Privacy](docs/threat-model.md)
- [Implementation Plan](docs/plan.md)
- [RFC 8725 - JWT Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)

---

## 📄 License

Distributed under the [MIT License](LICENSE).
