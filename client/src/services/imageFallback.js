import { resolveMediaUrl } from './mediaUrl';

export const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22700%22 viewBox=%220 0 1200 700%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop stop-color=%22%23e8f1ff%22/%3E%3Cstop offset=%221%22 stop-color=%22%23e4f5ea%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%221200%22 height=%22700%22 fill=%22url(%23g)%22/%3E%3Cpath d=%22M330 490l170-180 120 120 95-105 155 165H330z%22 fill=%22%23125aa3%22 opacity=%22.3%22/%3E%3Ccircle cx=%22430%22 cy=%22220%22 r=%2260%22 fill=%22%231f7b48%22 opacity=%22.35%22/%3E%3Ctext x=%22600%22 y=%22590%22 text-anchor=%22middle%22 font-family=%22Arial,sans-serif%22 font-size=%2248%22 font-weight=%22700%22 fill=%22%23123963%22%3EImage unavailable%3C/text%3E%3C/svg%3E';

export function installGlobalImageFallback(rootElement) {
  rootElement?.addEventListener(
    'error',
    (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && !image.dataset.fallbackApplied) {
        const normalizedSource = resolveMediaUrl(image.getAttribute('src'));
        if (
          !image.dataset.normalizedSourceAttempted &&
          normalizedSource &&
          normalizedSource !== image.src
        ) {
          image.dataset.normalizedSourceAttempted = 'true';
          image.src = normalizedSource;
          return;
        }
        image.dataset.fallbackApplied = 'true';
        image.src = FALLBACK_IMAGE;
      }
    },
    true
  );
}
