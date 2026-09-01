# TokenLens Threat Model & Boundary Analysis

## Assets to Protect

1. **User Token Contents**: JWT/JWS/JWE compact strings pasted into the app, which may contain user identities, scopes, or authentication claims.
2. **Key Material**: HMAC secrets, PEM public/private keys, and JWK data used for verification or generation.

## Threat Vectors & Countermeasures

### 1. Eavesdropping / Remote Exfiltration
- **Threat**: Malicious backend or third-party script sending tokens to remote servers.
- **Countermeasure**: TokenLens contains zero backend API routes, zero analytics SDKs, zero remote tracking fonts, and zero telemetry endpoints.

### 2. Header Parameter Exploitation (`jku`, `x5u`, `iss` SSRF)
- **Threat**: Malicious JWT contains `jku` or `x5u` headers attempting to trigger automatic SSRF attacks or force loading of attacker-controlled keys.
- **Countermeasure**: TokenLens flags dangerous parameters as warnings and NEVER automatically fetches URLs embedded in JWT headers.

### 3. Algorithm Confusion Attacks (`alg: none`, HMAC vs. RSA)
- **Threat**: Attackers supply unsigned tokens (`alg: none`) or attempt key type confusion (e.g. signing RS256 token with RSA public key treated as HMAC secret).
- **Countermeasure**: TokenLens explicitly checks key type against algorithm, warns if no algorithm allowlist is configured, and rejects `alg: none` tokens in signature verification.

### 4. Over-Trust of Base64URL Decoded Content
- **Threat**: Developers assume a decoded token is authentic without signature verification.
- **Countermeasure**: TokenLens prominent UI badges state "Unverified Signature" and explicitly explain that decoding does not establish authenticity.

## Explicit Non-Goals & Out-of-Scope Risks

- **Browser Extension Malware**: TokenLens cannot prevent compromised browser extensions or DOM keyloggers from reading browser input fields.
- **Production Secrets**: Users should not paste active production master keys into any browser tool.
