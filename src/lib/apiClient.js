import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  withCredentials: true,
  // No default Content-Type — axios sets it automatically per request:
  //   FormData  → multipart/form-data; boundary=...
  //   plain object → application/json
})

// NOTE:
// Do NOT strip trailing slashes from request URLs.
// Some backends (e.g. FastAPI routes) redirect `/api/products` -> `/api/products/` (307)
// when the canonical URL expects a trailing slash.
// Keeping URLs as-is avoids the redirect + extra latency.


// Attach auth token automatically
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally - refresh token or redirect to login
// Deduplicate concurrent refresh requests to avoid refresh storms + rate limiting.
let refreshPromise = null

async function refreshAccessToken(original) {
  if (refreshPromise) return refreshPromise

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    return Promise.reject(new Error('Missing refresh token'))
  }

  refreshPromise = axios
    .post(
      `${original.baseURL}/api/auth/refresh`,
      { refresh_token: refreshToken },
      { withCredentials: true }
    )
    .then(({ data }) => {
      localStorage.setItem('access_token', data.access_token)
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
      return data
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const data = await refreshAccessToken(original)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
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

