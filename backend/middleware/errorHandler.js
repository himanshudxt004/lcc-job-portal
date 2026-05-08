/**
 * Centralized Express error handler.
 * Translates Mongoose / JWT errors into clean JSON responses.
 */
function errorHandler(err, req, res, next) {
  // Default
  let status  = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists.`;
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }

  res.status(status).json({
    ok: false,
    message: message
  });
}

module.exports = errorHandler;
