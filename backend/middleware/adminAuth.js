/**
 * Middleware: ensure the authenticated user has the 'admin' role.
 * Must be used after authenticateToken.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireAdmin };
