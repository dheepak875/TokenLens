# Security Policy

## Responsible Disclosure

Security is fundamental to TokenLens. If you discover a vulnerability or security flaw in TokenLens, we encourage you to report it responsibly.

Please **do not** create a public GitHub issue for security vulnerabilities. Instead, report security issues via email to security@tokenlens.org or by opening a private draft security advisory on GitHub.

We will acknowledge receipt within 48 hours and provide updates on resolution progress.

## Security Boundaries & Design Guarantees

TokenLens enforces strict security boundaries:

1. **Client-Side Execution Only**:
   - All cryptographic operations use browser native `window.crypto.subtle` or `jose` within the client DOM.
   - Zero outbound requests are made automatically for JWT headers (`jku`, `x5u`, `iss`).
2. **Zero Telemetry & Zero Data Collection**:
   - No tokens, keys, secrets, headers, or claims are transmitted to any remote server or analytics endpoint.
3. **No Exploit Payload Automation**:
   - TokenLens explicitly refuses to implement brute-force cracking, exploit payload generation, or automated vulnerability exploitation tools.

## Limitations Out-of-Scope for Client Applications

- **Compromised End-User Devices**: If the client OS or browser environment is infected with malware, keyloggers, or malicious browser extensions, data displayed in the browser DOM can be captured.
- **Production Secrets**: Users should avoid pasting real production secrets into any web browser workbench. TokenLens provides safe test example fixtures for local development.
