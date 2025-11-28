// Utilities for generating and verifying fingerprint tokens
// OWASP: Additional protection against Refresh Token theft

import crypto from 'crypto';

/**
 * Generates a random fingerprint (sent to client)
 */
export function generateFingerprint(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Creates a hash of fingerprint for storing in DB
 * @param fingerprint - original fingerprint
 */
export function hashFingerprint(fingerprint: string): string {
  return crypto
    .createHash('sha256')
    .update(fingerprint)
    .digest('hex');
}

/**
 * Verifies fingerprint matches its hash
 * @param fingerprint - original fingerprint
 * @param hash - hash from DB
 */
export function verifyFingerprint(fingerprint: string, hash: string): boolean {
  const computedHash = hashFingerprint(fingerprint);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}
