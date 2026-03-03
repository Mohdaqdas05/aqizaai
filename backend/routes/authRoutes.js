const express = require('express');
const passport = require('passport');
const router = express.Router();

const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { verifyCsrfOrigin } = require('../middleware/csrf');
const {
  register,
  login,
  googleCallback,
  refresh,
  logout,
  me,
  updateProfile,
} = require('../controllers/authController');

router.post('/register', verifyCsrfOrigin, authLimiter, validateRegister, register);
router.post('/login',    verifyCsrfOrigin, authLimiter, validateLogin,    login);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  googleCallback
);

router.post('/refresh', verifyCsrfOrigin, refresh);
router.post('/logout',  verifyCsrfOrigin, logout);
router.get('/me',           authenticateToken, me);
router.put('/profile',      verifyCsrfOrigin, authenticateToken, updateProfile);

module.exports = router;
