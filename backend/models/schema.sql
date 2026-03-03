-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name          VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  google_id     VARCHAR(255) UNIQUE,
  role          VARCHAR(50)  NOT NULL DEFAULT 'user',
  plan          VARCHAR(50)  NOT NULL DEFAULT 'free',
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Refresh tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(500) NOT NULL,
  device_info TEXT,
  ip_address  VARCHAR(45),
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Chats ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(500) NOT NULL DEFAULT 'New Chat',
  model      VARCHAR(255) NOT NULL DEFAULT 'meta-llama/llama-3.1-8b-instruct:free',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role        VARCHAR(50) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content     TEXT        NOT NULL,
  tokens_used INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme                  VARCHAR(50) NOT NULL DEFAULT 'dark',
  language               VARCHAR(10) NOT NULL DEFAULT 'en',
  notifications_enabled  BOOLEAN     NOT NULL DEFAULT true,
  memory_enabled         BOOLEAN     NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chats_user_id          ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id       ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens(token);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
