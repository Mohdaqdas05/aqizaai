const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// ── Helpers ───────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

const safeUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

const storeRefreshToken = async (userId, token, req) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      userId,
      token,
      req.headers['user-agent'] || null,
      req.ip || null,
      expiresAt,
    ]
  );
};

// ── Controllers ───────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, plan, is_active)
       VALUES ($1, $2, $3, 'user', 'free', true)
       RETURNING *`,
      [email.toLowerCase(), passwordHash, name.trim()]
    );
    const user = result.rows[0];

    await query(
      'INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user.id]
    );

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeRefreshToken(user.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      message: 'Registration successful',
      data: { user: safeUser(user), accessToken },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeRefreshToken(user.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);

    return res.json({
      message: 'Login successful',
      data: { user: safeUser(user), accessToken },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeRefreshToken(user.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);

    // Redirect to frontend with access token in query string
    // (frontend should immediately store it in memory and drop the URL param)
    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${accessToken}`
    );
  } catch (err) {
    console.error('googleCallback error:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const stored = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (stored.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token revoked or expired' });
    }

    const userResult = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    // Token rotation — delete old, issue new
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await storeRefreshToken(user.id, newRefreshToken, req);
    setRefreshCookie(res, newRefreshToken);

    return res.json({
      message: 'Token refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

const me = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*, s.theme, s.language, s.notifications_enabled, s.memory_enabled
       FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ data: safeUser(user) });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar_url, currentPassword, newPassword } = req.body;
    const updates = [];
    const values  = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name.trim());
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }

    // Password change: verify current password, then hash new one
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const userRow = userResult.rows[0];
      if (!userRow || !userRow.password_hash) {
        return res.status(400).json({ error: 'Password change not available for this account' });
      }
      const isValid = await bcrypt.compare(currentPassword, userRow.password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      updates.push(`password_hash = $${idx++}`);
      values.push(newHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return res.json({
      message: 'Profile updated',
      data: safeUser(result.rows[0]),
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { theme, language, notifications_enabled, memory_enabled } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (theme !== undefined)                  { updates.push(`theme = $${idx++}`);                  values.push(theme); }
    if (language !== undefined)               { updates.push(`language = $${idx++}`);               values.push(language); }
    if (notifications_enabled !== undefined)  { updates.push(`notifications_enabled = $${idx++}`);  values.push(notifications_enabled); }
    if (memory_enabled !== undefined)         { updates.push(`memory_enabled = $${idx++}`);         values.push(memory_enabled); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No settings to update' });
    }

    values.push(req.user.id);
    await query(
      `INSERT INTO user_settings (user_id, ${updates.map((u) => u.split(' ')[0]).join(', ')})
       VALUES ($${idx}, ${values.slice(0, -1).map((_, i) => `$${i + 1}`).join(', ')})
       ON CONFLICT (user_id) DO UPDATE SET ${updates.join(', ')}, updated_at = NOW()`,
      values
    );

    const result = await query(
      `SELECT u.*, s.theme, s.language, s.notifications_enabled, s.memory_enabled
       FROM users u LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    return res.json({ message: 'Settings updated', data: safeUser(result.rows[0]) });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
};

module.exports = { register, login, googleCallback, refresh, logout, me, updateProfile, updateSettings, deleteAccount };
