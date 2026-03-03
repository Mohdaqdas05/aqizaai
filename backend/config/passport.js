const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { query } = require('./db');

// ── Local Strategy ────────────────────────────────────────────────────────────
passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );
      const user = result.rows[0];

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.password_hash) {
        return done(null, false, { message: 'Please sign in with Google' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// ── Google OAuth Strategy ─────────────────────────────────────────────────────
// Only register when credentials are configured (avoids startup crash in dev)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email returned from Google'));
      }

      // Check if user already exists (by google_id or email)
      let result = await query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [profile.id, email.toLowerCase()]
      );
      let user = result.rows[0];

      if (user) {
        // Link Google ID if signing in via email account for the first time
        if (!user.google_id) {
          await query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [
            profile.id,
            user.id,
          ]);
          user.google_id = profile.id;
        }
        return done(null, user);
      }

      // Create new user
      const name = profile.displayName || email.split('@')[0];
      const avatarUrl = profile.photos?.[0]?.value || null;

      result = await query(
        `INSERT INTO users (email, name, avatar_url, google_id, role, plan, is_active)
         VALUES ($1, $2, $3, $4, 'user', 'free', true)
         RETURNING *`,
        [email.toLowerCase(), name, avatarUrl, profile.id]
      );
      user = result.rows[0];

      // Create default settings
      await query(
        'INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [user.id]
      );

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));
} // end Google strategy guard

// ── Session serialization ─────────────────────────────────────────────────────
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
    done(null, result.rows[0] || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
