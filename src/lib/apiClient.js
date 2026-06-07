import axios from 'axios'

import { tokenStore } from './tokenStore.js'

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;

  // Treat empty string / whitespace as unset
  if (!raw || (typeof raw === 'string' && raw.trim().length === 0)) {
    return 'http://localhost:8000';
  }

  const value = String(raw).trim();

  // Guard against misconfigured values like ':8000'
  if (/^:\d+$/.test(value)) {
    return `http://localhost${value}`;
  }

  // If someone configured just '8000' or similar, also guard (optional)
  if (/^\d+$/.test(value)) {
    return `http://localhost:${value}`;
  }

  return value;
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
})

// NOTE:
// Do NOT strip trailing slashes from request URLs.
// Some backends (e.g. FastAPI routes) redirect `/api/products` -> `/api/products/` (307)
// when the canonical URL expects a trailing slash.
// Keeping URLs as-is avoids the redirect + extra latency.

// Attach auth token automatically
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function _emitAuthExpired(detail = 'Token refresh failed') {
  // Let pending microtasks settle first.
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('roots:auth-expired', { detail })
    )
  }, 0)
}

// Deduplicate/queue concurrent 401 refreshes.
let _refreshInFlight = null
let _queue = []

async function _doRefresh() {
  if (_refreshInFlight) return _refreshInFlight

  _refreshInFlight = (async () => {
    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) {
      tokenStore.clear()
      throw new Error('Missing refresh token')
    }

    // Use a plain axios instance to avoid re-entering this interceptor chain.
    const plainAxios = axios

    const res = await plainAxios.post(
      `${apiClient.defaults.baseURL}/api/auth/refresh`,
      { refresh_token: refreshToken },
      { withCredentials: true }
    )

    tokenStore.setTokens(res.data.access_token, res.data.refresh_token)
    return res.data
  })()

  try {
    return await _refreshInFlight
  } catch (e) {
    tokenStore.clear()
    _emitAuthExpired(e?.message || 'Token expired')
    throw e
  } finally {
    _refreshInFlight = null
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    // While refresh is in flight, queue the retry handlers.
    if (_refreshInFlight) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject, original })
      })
    }

    try {
      const data = await _doRefresh()
      // Replay queued requests + current one.
      const token = tokenStore.getAccess() || data.access_token

      // Resolve queued
      const queued = _queue
      _queue = []
      queued.forEach(({ resolve, reject, original: queuedOriginal }) => {
        try {
          queuedOriginal.headers = queuedOriginal.headers || {}
          queuedOriginal.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(queuedOriginal))
        } catch (e) {
          reject(e)
        }
      })

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${token}`
      return apiClient(original)
    } catch (e) {
      // Reject queued
      const queued = _queue
      _queue = []
      queued.forEach(({ reject }) => reject(e))
      return Promise.reject(error)
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Image URL resolver
//
// Backend mounts FastAPI static files at:
//   /uploads
//
// Some API responses may accidentally return URLs like:
//   /api/uploads/<file>          (wrong)
//   /uploads/<file>/            (wrong: trailing slash)
//
// This resolver normalizes those cases so the frontend requests:
//   /uploads/<file>
// ─────────────────────────────────────────────────────────────────────────────
export function resolveImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;

  // Already absolute (http/https) or protocol-relative: keep as-is.
  if (/^(https?:)?\/\//i.test(imageUrl)) return imageUrl;

  // Trim whitespace (fixes trailing space in DB)
  const trimmed = imageUrl.trim();
  if (!trimmed) return '';

  // Normalize slashes and accidental prefixes
  let url = trimmed.replace(/\/+$/,'');
  url = url.replace(/^\/api\/uploads\//i, '/uploads/');
  url = url.replace(/^\/api\/uploads$/i, '/uploads');

  // Only absolute-path uploads should become FULL backend URLs.
  // Also encode each path segment individually so spaces/special chars work.
  if (/^\/uploads(\/|$)/i.test(url)) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const encoded = url
      .split('/')
      .map((seg) => (seg === '' ? '' : encodeURIComponent(seg.trim())))
      .join('/');
    return `${apiBase.replace(/\/+$/,'')}${encoded}`;
  }

  // If the backend stores a relative uploads path without leading slash (rare), handle it.
  if (/^uploads(\/|$)/i.test(url)) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const encoded = url
      .split('/')
      .map((seg) => (seg === '' ? '' : encodeURIComponent(seg.trim())))
      .join('/');
    return `${apiBase.replace(/\/+$/,'')}/${encoded.replace(/^\//,'')}`;
  }

  // For other app-relative strings, keep as-is.
  return url;
}

export default apiClient



