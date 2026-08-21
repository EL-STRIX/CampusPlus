const { AppError } = require('./error.middleware');

/**
 * Creates a middleware that validates request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        // Format first error message cleanly
        const firstError = err.errors[0];
        const field = firstError.path.join('.');
        const message = field ? `${firstError.message} (${field})` : firstError.message;
        return next(new AppError(message, 400, 'VALIDATION_ERROR'));
      }
      return next(new AppError('Invalid request data', 400, 'VALIDATION_ERROR'));
    }
  };
}

module.exports = {
  validate,
};
