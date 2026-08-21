const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * General rate limiter for public routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

/**
 * Stricter rate limiter for report submissions per TRD.md §5.1, §7 (10 requests/hour/IP)
 */
const reportSubmissionLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000, // default 60 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS, // default 10 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many submissions from this network. Please try again later.',
      },
    });
  },
});

module.exports = {
  generalLimiter,
  reportSubmissionLimiter,
};
