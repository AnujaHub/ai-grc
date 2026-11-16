ALTER TABLE utilisateurs
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE utilisateurs
    ALTER COLUMN email_verified SET DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    sent_at TIMESTAMPTZ NOT NULL,
    send_count INTEGER NOT NULL DEFAULT 0 CHECK (send_count >= 0),
    window_started_at TIMESTAMPTZ NOT NULL,
    request_ip VARCHAR(45),
    CONSTRAINT uq_verification_tokens_user_purpose UNIQUE (user_id, purpose)
);

CREATE INDEX IF NOT EXISTS ix_verification_tokens_ip_sent_at
    ON verification_tokens (request_ip, sent_at);
