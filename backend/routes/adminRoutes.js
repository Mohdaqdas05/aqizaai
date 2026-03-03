const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

// All admin routes require valid JWT + admin role
router.use(authenticateToken, requireAdmin);

router.get('/stats',        getStats);
router.get('/users',        getUsers);
router.patch('/users/:id',  updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
