/**
 * encryption.js — Roots AES-GCM message encryption
 *
 * Architecture: Pre-Shared Key (PSK)
 * ──────────────────────────────────
 * A 256-bit AES-GCM key is imported once per session via initEncryption().
 * The caller is responsible for obtaining the raw hex key securely.
 *
 * Wire format (base64url, no padding)
 * ─────────────────────────────────────
 *   encryptMessage  → base64url( IV[12] || ciphertext+GCM-tag )
 *   decryptMessage  ← same token; first 12 bytes = IV, rest = ciphertext
 *
 * Exports
 * ───────
 *   initEncryption(hexKey)       import the AES key from a 64-char hex string
 *   encryptMessage(plaintext)    → Promise<string>  (base64url token)
 *   decryptMessage(token)        → Promise<string>  (plaintext)
 *   safeDecryptMessage(token)    → Promise<string>  (returns token on failure)
 *   isEncryptionReady()          → boolean
 *   clearEncryption()            wipe key material
 */

let _key = null;

function hexToBytes(hexKey) {
  const cleaned = String(hexKey || '').trim();
  const hex = cleaned.startsWith('0x') ? cleaned.slice(2) : cleaned;
  if (!hex || hex.length % 2 !== 0) throw new Error('Invalid hexKey');
  return Uint8Array.from(hex.match(/.{2}/g), (b) => parseInt(b, 16));
}

function toBase64url(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
   
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(token) {
  // Support base64url (server) and base64 (fallback)
  const normalized = String(token)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function initEncryption(hexKey) {
  const bytes = hexToBytes(hexKey);

  _key = await crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string.
 *
 * @param {string} plaintext
 * @returns {Promise<string>} base64url( IV[12] || ciphertext+GCM-tag )
 */
export async function encryptMessage(plaintext) {
  if (!_key) throw new Error('Encryption not initialized');

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(String(plaintext ?? ''));

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    _key,
    encoded
  );

  const ct = new Uint8Array(cipherBuf);
  const combined = new Uint8Array(12 + ct.byteLength);
  combined.set(iv, 0);
  combined.set(ct, 12);

  return toBase64url(combined);
}

export async function decryptMessage(token) {
  if (!_key) throw new Error('Encryption not initialized');

  const payload = fromBase64url(token);
  if (payload.length < 13) throw new Error('Invalid encrypted payload');

  const iv = payload.slice(0, 12);
  const ct = payload.slice(12);

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    _key,
    ct
  );

  return new TextDecoder().decode(plain);
}

export async function safeDecryptMessage(token) {
  try {
    return await decryptMessage(token);
  } catch {
    return token;
  }
}

export const isEncryptionReady = () => _key !== null;
export const clearEncryption = () => {
  _key = null;
};

