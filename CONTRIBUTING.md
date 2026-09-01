# Contributing to TokenLens

Thank you for your interest in contributing to TokenLens!

## Guidelines

1. **Privacy & Local-Only Principle**:
   - All proposed features must execute 100% locally in the browser.
   - Do not add remote analytics, external backend dependencies, or server-side proxies.
2. **Security Honesty**:
   - Never output "secure" or "safe" as a binary verdict for unverified tokens.
   - Follow RFC 8725 and OWASP JWT guidelines.
3. **Code Quality**:
   - Maintain strict TypeScript type checking (`tsc --noEmit`).
   - Run ESLint (`npm run lint`).
   - Add Vitest unit tests for parser, validator, or verifier logic (`npm test`).

## Workflow

1. Fork repository & create feature branch (`git checkout -b feature/my-feature`).
2. Implement feature with tests.
3. Verify build & tests pass:
   ```bash
   npm run build
   npm test
   npm run lint
   ```
4. Submit Pull Request.
