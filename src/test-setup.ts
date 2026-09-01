import '@testing-library/jest-dom';

// Mock Web Crypto API if needed in Node jsdom environment
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
  const { webcrypto } = await import('node:crypto');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.crypto = webcrypto as any;
}
