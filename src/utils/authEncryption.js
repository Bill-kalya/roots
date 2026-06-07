import { initEncryption, clearEncryption } from './encryption';

export async function fetchAndInitEncryptionKey(accessToken) {
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  const url = `${base}/api/v1/session-key`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch encryption key');

  const { key_token } = await res.json();

  // key_token is a JWT; ek is inside payload claim (base64url)
  const payloadB64Url = String(key_token).split('.')[1];
  if (!payloadB64Url) throw new Error('Invalid key_token');

  const payloadB64 = payloadB64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payloadJson = atob(payloadB64 + '==='.slice((payloadB64.length + 3) % 4));
  const payload = JSON.parse(payloadJson);

  const { ek } = payload;
  await initEncryption(ek);
}

export { clearEncryption };

