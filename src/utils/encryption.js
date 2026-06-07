let _key = null;

function hexToBytes(hexKey) {
  const cleaned = String(hexKey || '').trim();
  const hex = cleaned.startsWith('0x') ? cleaned.slice(2) : cleaned;
  if (!hex || hex.length % 2 !== 0) throw new Error('Invalid hexKey');
  return Uint8Array.from(hex.match(/.{2}/g), (b) => parseInt(b, 16));
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

function tokenToBytes(token) {
  // Support base64url (server) and base64 (fallback)
  const normalized = String(token)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function decryptMessage(token) {
  if (!_key) throw new Error('Encryption not initialized');

  const payload = tokenToBytes(token);
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

