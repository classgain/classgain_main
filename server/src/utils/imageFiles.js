import path from 'node:path';

export const supportedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif'
]);

const mimeAliases = new Map([
  ['image/jpg', 'image/jpeg'],
  ['image/pjpeg', 'image/jpeg'],
  ['image/x-png', 'image/png']
]);

const extensionMimeTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif']
]);

export function normalizeImageMimeType(file = {}) {
  const providedType = String(file.mimetype || '').toLowerCase();
  const normalizedType = mimeAliases.get(providedType) || providedType;

  if (supportedImageMimeTypes.has(normalizedType)) {
    return normalizedType;
  }

  return extensionMimeTypes.get(path.extname(file.originalname || '').toLowerCase()) || '';
}

export function isSupportedImageFile(file) {
  return Boolean(normalizeImageMimeType(file));
}

export function unsupportedImageError() {
  const error = new Error('Only JPG, JPEG, PNG, GIF, WebP, and AVIF images are allowed.');
  error.status = 400;
  return error;
}
