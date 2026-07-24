import { API } from './api';

const absoluteMediaPattern = /^(?:https?:|data:|blob:)/i;

export function resolveMediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';

  const normalized = value.trim().replaceAll('\\', '/');
  if (absoluteMediaPattern.test(normalized) || normalized.startsWith('//')) return normalized;

  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;

  try {
    const apiUrl = new URL(API, window.location.origin);
    return apiUrl.origin === window.location.origin ? path : `${apiUrl.origin}${path}`;
  } catch (_error) {
    return path;
  }
}

export function resolveMediaUrls(values = []) {
  return [...new Set(values.map(resolveMediaUrl).filter(Boolean))];
}
