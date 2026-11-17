DO $$
BEGIN
    IF to_regclass('public.users') IS NULL THEN
        RAISE EXCEPTION 'Migration blocked: public.users does not exist. Run 002_english_schema.sql first.';
    END IF;
END $$;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;

-- Existing accounts remain usable. Newly inserted accounts use FALSE.
UPDATE public.users
SET email_verified = TRUE
WHERE email_verified IS NULL;

ALTER TABLE public.users
    ALTER COLUMN email_verified SET DEFAULT FALSE,
    ALTER COLUMN email_verified SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    ON public.verification_tokens (request_ip, sent_at);
