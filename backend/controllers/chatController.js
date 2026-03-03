const { query } = require('../config/db');
const { streamMessage } = require('../ai/ai-router');
const { models, defaultModel, plans } = require('../config/ai-models');

// ── Helpers ───────────────────────────────────────────────────────────────────

const TITLE_MAX_LEN = 60;

const generateTitle = (text) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= TITLE_MAX_LEN
    ? clean
    : clean.slice(0, TITLE_MAX_LEN - 1) + '…';
};

const allowedModel = (modelId, userPlan) => {
  const allowed = plans[userPlan] || plans.free;
  return allowed.includes(modelId);
};

// ── Controllers ───────────────────────────────────────────────────────────────

const getChats = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM chats c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('getChats error:', err);
    return res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

const createChat = async (req, res) => {
  try {
    const model = req.body.model || defaultModel;
    const result = await query(
      `INSERT INTO chats (user_id, title, model) VALUES ($1, 'New Chat', $2) RETURNING *`,
      [req.user.id, model]
    );
    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('createChat error:', err);
    return res.status(500).json({ error: 'Failed to create chat' });
  }
};

const getChat = async (req, res) => {
  try {
    const chatResult = await query(
      'SELECT * FROM chats WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messagesResult = await query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );

    return res.json({
      data: { ...chatResult.rows[0], messages: messagesResult.rows },
    });
  } catch (err) {
    console.error('getChat error:', err);
    return res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error('deleteChat error:', err);
    return res.status(500).json({ error: 'Failed to delete chat' });
  }
};

const updateChatTitle = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await query(
      `UPDATE chats SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [title.trim(), req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('updateChatTitle error:', err);
    return res.status(500).json({ error: 'Failed to update title' });
  }
};

const sendMessage = async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;
  const userPlan = req.user.plan || 'free';

  try {
    const { message } = req.body;
    let { model } = req.body;

    // Validate chat ownership
    const chatResult = await query(
      'SELECT * FROM chats WHERE id = $1 AND user_id = $2',
      [chatId, userId]
    );
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    const chat = chatResult.rows[0];

    // Resolve model: prefer request body, fallback to chat model, fallback to default
    model = model || chat.model || defaultModel;

    // Enforce plan-based model access
    if (!allowedModel(model, userPlan)) {
      return res.status(403).json({ error: `Model '${model}' is not available on your plan` });
    }

    // Persist user message
    await query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
      [chatId, 'user', message]
    );

    // Fetch full conversation history for context
    const historyResult = await query(
      'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId]
    );
    const messages = historyResult.rows;

    // ── SSE setup ───────────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    res.flushHeaders();

    let fullResponse = '';

    const onChunk = (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    };

    const onEnd = async () => {
      try {
        // Persist assistant message
        await query(
          'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
          [chatId, 'assistant', fullResponse]
        );

        // Auto-title on first exchange (title is still 'New Chat')
        if (chat.title === 'New Chat') {
          const newTitle = generateTitle(message);
          await query('UPDATE chats SET title = $1, model = $2 WHERE id = $3', [
            newTitle,
            model,
            chatId,
          ]);
        } else {
          // Keep model in sync
          await query('UPDATE chats SET model = $1 WHERE id = $2', [model, chatId]);
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (err) {
        console.error('onEnd save error:', err);
        res.write(`data: ${JSON.stringify({ error: 'Failed to save response' })}\n\n`);
        res.end();
      }
    };

    const onError = (err) => {
      console.error('AI stream error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message || 'AI error' })}\n\n`);
      res.end();
    };

    await streamMessage(messages, model, onChunk, onEnd, onError);
  } catch (err) {
    console.error('sendMessage error:', err);
    // If SSE headers already sent we can only write an error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
};

module.exports = { getChats, createChat, getChat, deleteChat, updateChatTitle, sendMessage };
