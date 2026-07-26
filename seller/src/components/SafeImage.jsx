import { useState } from 'react';

import { FALLBACK_IMAGE } from '../services/imageFallback';
import { resolveMediaUrl } from '../services/mediaUrl';

export default function SafeImage({ src, fallbackSrc, alt = '', onError, ...props }) {
  const primarySource = resolveMediaUrl(src);
  const fallbackSource = resolveMediaUrl(fallbackSrc) || FALLBACK_IMAGE;
  const [failedSource, setFailedSource] = useState('');
  const currentSource =
    primarySource && primarySource !== failedSource ? primarySource : fallbackSource;

  const handleError = (event) => {
    onError?.(event);
    if (currentSource !== fallbackSource) {
      setFailedSource(primarySource);
    }
  };

  return <img {...props} src={currentSource} alt={alt} onError={handleError} />;
}
