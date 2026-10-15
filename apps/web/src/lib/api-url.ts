/**
 * VITE_API_URL is the complete API base, including /api for direct backend URLs.
 * Without it, requests use the Vite /api development proxy.
 */
export function buildApiUrl(path: string, apiBaseUrl = '/api') {
  return `${apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
