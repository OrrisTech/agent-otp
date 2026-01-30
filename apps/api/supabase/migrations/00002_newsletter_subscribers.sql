-- Newsletter Subscribers Table
-- Stores email addresses of newsletter subscribers

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    unsubscribed_at TIMESTAMPTZ,
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Index for active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(subscribed_at)
    WHERE unsubscribed_at IS NULL;

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Comment for documentation
COMMENT ON TABLE newsletter_subscribers IS 'Email addresses of newsletter subscribers';
