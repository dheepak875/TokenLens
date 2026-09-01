import * as jose from 'jose';
import { SupportedAlgorithm } from '../types/jwt';

export interface GenerateTokenOptions {
  algorithm: SupportedAlgorithm;
  claims: Record<string, unknown>;
  secretOrPrivateKey?: string; // HMAC secret string or PEM private key string
  expirationPresetSeconds?: number; // e.g. 3600 (1 hour)
}

export interface GeneratedKeypair {
  publicKeyPem: string;
  privateKeyPem: string;
  jwkPublic: jose.JWK;
}

export async function generateKeyPair(
  alg: SupportedAlgorithm
): Promise<GeneratedKeypair> {
  const { publicKey, privateKey } = await jose.generateKeyPair(alg, {
    extractable: true,
  });

  const publicKeyPem = await jose.exportSPKI(publicKey);
  const privateKeyPem = await jose.exportPKCS8(privateKey);
  const jwkPublic = await jose.exportJWK(publicKey);

  return {
    publicKeyPem,
    privateKeyPem,
    jwkPublic,
  };
}

export async function generateTestToken(
  options: GenerateTokenOptions
): Promise<{ token: string; keyUsed: string }> {
  const { algorithm, claims, secretOrPrivateKey, expirationPresetSeconds } =
    options;

  const nowSeconds = Math.floor(Date.now() / 1000);

  const payload: Record<string, unknown> = {
    ...claims,
  };

  if (!('iat' in payload)) {
    payload.iat = nowSeconds;
  }

  if (expirationPresetSeconds && !('exp' in payload)) {
    payload.exp = nowSeconds + expirationPresetSeconds;
  }

  let key: CryptoKey | Uint8Array;
  let keyUsed = '';

  if (algorithm.startsWith('HS')) {
    const secret =
      secretOrPrivateKey || 'dev-secret-tokenlens-test-key-32bytes-minimum!';
    key = new Uint8Array(new TextEncoder().encode(secret));
    keyUsed = `HMAC Secret (${secret.length} chars)`;
  } else {
    // Asymmetric RSA/EC/EdDSA key
    if (secretOrPrivateKey && secretOrPrivateKey.includes('PRIVATE KEY')) {
      key = await jose.importPKCS8(secretOrPrivateKey, algorithm);
      keyUsed = 'Supplied Private Key';
    } else {
      // Generate keypair on the fly if no private key provided
      const pair = await generateKeyPair(algorithm);
      key = await jose.importPKCS8(pair.privateKeyPem, algorithm);
      keyUsed = `Generated ${algorithm} Key Pair`;
    }
  }

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: algorithm, typ: 'JWT' })
    .sign(key);

  return { token: jwt, keyUsed };
}
