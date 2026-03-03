const { query } = require('../config/db');

const getStats = async (_req, res) => {
  try {
    const [users, chats, messages, activeToday] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM chats'),
      query('SELECT COUNT(*) FROM messages'),
      query(
        `SELECT COUNT(DISTINCT user_id) FROM chats
         WHERE updated_at >= NOW() - INTERVAL '24 hours'`
      ),
    ]);

    return res.json({
      data: {
        totalUsers:    parseInt(users.rows[0].count, 10),
        totalChats:    parseInt(chats.rows[0].count, 10),
        totalMessages: parseInt(messages.rows[0].count, 10),
        activeToday:   parseInt(activeToday.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit   = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const offset  = (page - 1) * limit;
    const search  = req.query.search ? `%${req.query.search}%` : null;

    let baseQuery = 'FROM users';
    const params  = [];

    if (search) {
      params.push(search);
      baseQuery += ` WHERE (email ILIKE $1 OR name ILIKE $1)`;
    }

    const countResult = await query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT id, email, name, avatar_url, role, plan, is_active, created_at, updated_at
       ${baseQuery}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return res.json({
      data: {
        users:      dataResult.rows,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { role, plan, is_active } = req.body;
    const updates = [];
    const values  = [];
    let idx = 1;

    if (role      !== undefined) { updates.push(`role = $${idx++}`);      values.push(role); }
    if (plan      !== undefined) { updates.push(`plan = $${idx++}`);      values.push(plan); }
    if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name, role, plan, is_active`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User updated', data: result.rows[0] });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

// Soft delete — keeps data for audit purposes
const deleteUser = async (req, res) => {
  try {
    const result = await query(
      `UPDATE users SET is_active = false WHERE id = $1
       RETURNING id, email, name, is_active`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User deactivated', data: result.rows[0] });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser };
