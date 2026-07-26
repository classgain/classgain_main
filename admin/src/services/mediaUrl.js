const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const absoluteMediaPattern = /^(?:https?:|data:|blob:)/i;

export function resolveMediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';

  const normalized = value.trim().replace(/^["']|["']$/g, '').replaceAll('\\', '/');
  if (absoluteMediaPattern.test(normalized) || normalized.startsWith('//')) {
    try {
      const url = new URL(normalized, window.location.origin);
      if (window.location.protocol === 'https:' && url.protocol === 'http:') {
        url.protocol = 'https:';
      }
      return url.href;
    } catch {
      return normalized;
    }
  }

  const mediaPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

  try {
    const apiUrl = new URL(API, window.location.origin);
    return apiUrl.origin === window.location.origin ? mediaPath : `${apiUrl.origin}${mediaPath}`;
  } catch {
    return mediaPath;
  }
}
