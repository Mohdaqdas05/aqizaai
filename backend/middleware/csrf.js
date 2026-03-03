/**
 * CSRF protection for endpoints that rely on httpOnly cookies (e.g. refresh).
 *
 * Strategy: verify that the Origin (or Referer) header matches the allowed
 * frontend origin.  This is sufficient for a same-site REST+SPA setup where
 * Bearer tokens protect all other state-changing routes.
 */
const verifyCsrfOrigin = (req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Non-mutating methods are safe; skip the check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers['origin'] || req.headers['referer'];

  if (!origin) {
    // No Origin/Referer in requests from non-browser clients (e.g. mobile apps,
    // Postman) — allow but only if the request carries a valid Bearer token,
    // which is checked by the auth middleware on protected routes.
    // For the refresh endpoint (cookie-only) we must reject missing Origin in
    // production to be safe.
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'CSRF check failed: missing origin' });
    }
    return next();
  }

  try {
    const originHost  = new URL(origin).origin;
    const allowedHost = new URL(allowedOrigin).origin;
    if (originHost !== allowedHost) {
      return res.status(403).json({ error: 'CSRF check failed: origin mismatch' });
    }
  } catch {
    return res.status(403).json({ error: 'CSRF check failed: invalid origin' });
  }

  next();
};

module.exports = { verifyCsrfOrigin };
