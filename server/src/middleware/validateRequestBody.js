const bodyMethods = new Set(['POST', 'PUT', 'PATCH']);
const maximumNestingDepth = 10;

function findUnsafeKey(value, depth = 0) {
  if (depth > maximumNestingDepth) {
    return 'Request body is nested too deeply.';
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      return `Request body contains an unsupported field: ${key}`;
    }

    const childError = findUnsafeKey(childValue, depth + 1);

    if (childError) {
      return childError;
    }
  }

  return '';
}

export function validateRequestBody(req, res, next) {
  if (!bodyMethods.has(req.method)) {
    return next();
  }

  // File-upload routes parse multipart bodies later with Multer. At this point
  // req.body is intentionally not populated yet, so let the route-level upload
  // middleware validate and parse it.
  if (req.is('multipart/form-data')) {
    return next();
  }

  if (!req.is('application/json')) {
    return res.status(415).json({
      success: false,
      message: 'Content-Type must be application/json or multipart/form-data.'
    });
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a JSON object.'
    });
  }

  const unsafeKeyError = findUnsafeKey(req.body);

  if (unsafeKeyError) {
    return res.status(400).json({
      success: false,
      message: unsafeKeyError
    });
  }

  return next();
}
