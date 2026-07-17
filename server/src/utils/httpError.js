export function sendInternalServerError(res, error, event = 'controller_error') {
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(
    JSON.stringify({
      level: 'error',
      event,
      message: error instanceof Error ? error.message : String(error),
      ...(isProduction || !(error instanceof Error) ? {} : { stack: error.stack })
    })
  );

  return res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error.' : error.message
  });
}
