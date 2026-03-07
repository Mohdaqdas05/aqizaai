const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validateChat } = require('../middleware/validate');
const {
  getChats,
  createChat,
  getChat,
  deleteChat,
  updateChatTitle,
  sendMessage,
  deleteAllChats,
} = require('../controllers/chatController');

// All chat routes require authentication
router.use(authenticateToken);

router.get('/',                getChats);
router.post('/',               createChat);
router.delete('/all',          deleteAllChats);
router.get('/:id',             getChat);
router.delete('/:id',          deleteChat);
router.patch('/:id/title',     updateChatTitle);
router.post('/:id/messages',   chatLimiter, validateChat, sendMessage);

module.exports = router;
