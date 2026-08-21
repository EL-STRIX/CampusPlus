const { verifyToken } = require('../services/auth.service');
const { AppError } = require('./error.middleware');

/**
 * JWT Authentication Middleware
 * Enforces admin authorization on protected endpoints per TRD.md §5.4+ and architecture.md §9.2
 */
function jwtAuthMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required. Invalid token format.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = verifyToken(token);
    req.admin = {
      id: decoded.id,
      username: decoded.username,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  jwtAuthMiddleware,
};
