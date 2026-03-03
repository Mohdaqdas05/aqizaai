const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { models, plans } = require('../config/ai-models');

/**
 * Decode the Bearer JWT without throwing — returns the payload or null.
 */
const tryDecodeToken = (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    }
  } catch {
    // unauthenticated or expired token — fall through
  }
  return null;
};

/**
 * GET /api/models
 * Returns the list of AI models available for the authenticated user's plan.
 * Falls back to the 'free' plan for unauthenticated requests.
 */
router.get('/', (req, res) => {
  const decoded = tryDecodeToken(req);
  const userPlan = decoded?.plan || 'free';

  const allowed = plans[userPlan] || plans.free;
  const available = models.filter((m) => allowed.includes(m.id));

  return res.json({ models: available, plan: userPlan });
});

module.exports = router;
