const rateLimit = require('express-rate-limit');

/** 10 requests per 15 minutes — for auth endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

/** 60 requests per minute — for chat/AI endpoints (keyed by user id when available) */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many chat requests, please slow down' },
});

/** 100 requests per minute — general API limiter */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

module.exports = { authLimiter, chatLimiter, generalLimiter };
