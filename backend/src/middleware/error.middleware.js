const { logger } = require('../utils/logger');
const env = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
}

/**
 * Centralized Error Handler Middleware
 * Exact response envelope per TRD.md §6.1
 */
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred';

  // Handle body-parser JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Malformed JSON request body';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File size exceeds the limit of ${env.MAX_UPLOAD_SIZE_MB}MB`;
    }
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    errorCode = 'CORS_ERROR';
  }

  // Log error using structured logger
  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
          code: errorCode,
        },
        req: {
          method: req.method,
          url: req.url,
          ip: req.ip,
        },
      },
      'Unhandled Server Error'
    );
  } else {
    logger.warn(
      {
        statusCode,
        errorCode,
        message,
        path: req.originalUrl,
      },
      'Client Request Warning/Error'
    );
  }

  // In production, do not leak internal 500 messages if not an explicit AppError
  if (statusCode === 500 && env.NODE_ENV === 'production' && !(err instanceof AppError)) {
    message = 'Internal server error. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: errorCode,
      message,
    },
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
