-- Fase 5: respuestas, reenvios, edicion, borrado, fijados y favoritos.
-- Aditiva e idempotente para que pueda ejecutarse en instalaciones existentes.

ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
ALTER TABLE group_messages ALTER COLUMN content DROP NOT NULL;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id INTEGER NULL REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from_username VARCHAR(50) NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS reply_to_id INTEGER NULL REFERENCES group_messages(id) ON DELETE SET NULL;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS forwarded_from_username VARCHAR(50) NULL;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP NULL;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS message_favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('direct', 'group')),
  message_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, message_type, message_id)
);

CREATE INDEX IF NOT EXISTS idx_message_favorites_user ON message_favorites (user_id, created_at DESC);