/**
 * Centralized Error Handling Middleware
 * 
 * Catches all errors thrown in route handlers and
 * returns a consistent JSON error response.
 */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Custom error class with status code support
 */
class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * 404 handler for unknown routes
 */
function notFound(req, res, next) {
  const error = new ApiError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

export { errorHandler, ApiError, notFound };
