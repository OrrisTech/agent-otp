-- Agent OTP Initial Schema Migration
-- Creates all core tables for the Agent OTP system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users Table
-- Account owners who manage agents and policies
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    telegram_chat_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);
-- Index for Telegram chat ID lookups
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;

-- ============================================================================
-- Agents Table
-- Registered AI agents that can request permissions
-- ============================================================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key_hash VARCHAR(255) NOT NULL,  -- Argon2 hashed API key
    api_key_prefix VARCHAR(8) NOT NULL,   -- First 8 chars for identification (e.g., "ak_xxxxx")
    metadata JSONB DEFAULT '{}' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user's agents lookups
CREATE INDEX idx_agents_user_id ON agents(user_id);
-- Index for API key prefix lookups (for quick identification)
CREATE INDEX idx_agents_api_key_prefix ON agents(api_key_prefix);
-- Index for active agents
CREATE INDEX idx_agents_active ON agents(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- Policies Table
-- Permission rules that determine how requests are handled
-- ============================================================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,  -- NULL = applies to all agents
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0 NOT NULL,  -- Higher = evaluated first
    conditions JSONB NOT NULL,  -- Rule conditions in JSON format
    action VARCHAR(50) NOT NULL CHECK (action IN ('auto_approve', 'require_approval', 'deny')),
    scope_template JSONB,  -- Default scope restrictions to apply
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user's policies lookups
CREATE INDEX idx_policies_user_id ON policies(user_id);
-- Index for agent-specific policies
CREATE INDEX idx_policies_agent_id ON policies(agent_id) WHERE agent_id IS NOT NULL;
-- Index for active policies sorted by priority
CREATE INDEX idx_policies_active_priority ON policies(user_id, is_active, priority DESC) WHERE is_active = true;

-- ============================================================================
-- Permission Requests Table
-- Records of permission requests from agents
-- ============================================================================
CREATE TABLE permission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(255) NOT NULL,  -- e.g., 'gmail.send', 'bank.transfer'
    resource VARCHAR(255),  -- e.g., 'email:xxx@gmail.com'
    scope JSONB NOT NULL,  -- Requested scope
    context JSONB DEFAULT '{}' NOT NULL,  -- Additional context from agent
    status VARCHAR(50) DEFAULT 'pending' NOT NULL
        CHECK (status IN ('pending', 'approved', 'denied', 'expired', 'used')),
    policy_id UUID REFERENCES policies(id),  -- Which policy matched
    decision_reason TEXT,
    decided_by VARCHAR(50) CHECK (decided_by IN ('auto', 'user', 'timeout')),
    decided_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for agent's permission requests
CREATE INDEX idx_permission_requests_agent_id ON permission_requests(agent_id);
-- Index for status lookups
CREATE INDEX idx_permission_requests_status ON permission_requests(status);
-- Index for pending requests by expiration
CREATE INDEX idx_permission_requests_pending_expires ON permission_requests(expires_at)
    WHERE status = 'pending';
-- Index for recent requests
CREATE INDEX idx_permission_requests_created ON permission_requests(created_at DESC);

-- ============================================================================
-- Tokens Table
-- Issued OTP tokens for approved permissions
-- ============================================================================
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_request_id UUID REFERENCES permission_requests(id) ON DELETE CASCADE NOT NULL,
    token_hash VARCHAR(255) NOT NULL,  -- Hashed token for verification
    scope JSONB NOT NULL,  -- Granted scope (may be more restrictive than requested)
    uses_remaining INT DEFAULT 1 NOT NULL,  -- -1 for unlimited within TTL
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for token expiration cleanup
CREATE INDEX idx_tokens_expires_at ON tokens(expires_at);
-- Index for valid tokens
CREATE INDEX idx_tokens_valid ON tokens(expires_at)
    WHERE revoked_at IS NULL AND (uses_remaining > 0 OR uses_remaining = -1);
-- Index for permission request lookups
CREATE INDEX idx_tokens_permission_request ON tokens(permission_request_id);

-- ============================================================================
-- Audit Logs Table
-- Immutable record of all system events
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    permission_request_id UUID REFERENCES permission_requests(id),
    event_type VARCHAR(50) NOT NULL,  -- 'request', 'approve', 'deny', 'use', 'revoke', etc.
    details JSONB DEFAULT '{}' NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user's audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
-- Index for agent's audit logs
CREATE INDEX idx_audit_logs_agent_id ON audit_logs(agent_id) WHERE agent_id IS NOT NULL;
-- Index for permission request's audit trail
CREATE INDEX idx_audit_logs_permission_request ON audit_logs(permission_request_id)
    WHERE permission_request_id IS NOT NULL;
-- Index for chronological queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
-- Index for event type filtering
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to expire pending permission requests
CREATE OR REPLACE FUNCTION expire_pending_requests()
RETURNS void AS $$
BEGIN
    UPDATE permission_requests
    SET
        status = 'expired',
        decided_by = 'timeout',
        decided_at = NOW()
    WHERE
        status = 'pending'
        AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Enable RLS for multi-tenant security
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on authentication strategy
-- For now, we'll rely on application-level access control

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE users IS 'Account owners who manage AI agents and permission policies';
COMMENT ON TABLE agents IS 'Registered AI agents that can request one-time permissions';
COMMENT ON TABLE policies IS 'Permission rules that determine how requests are handled';
COMMENT ON TABLE permission_requests IS 'Records of permission requests from agents';
COMMENT ON TABLE tokens IS 'Issued OTP tokens for approved permissions';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all system events';

COMMENT ON COLUMN agents.api_key_hash IS 'Argon2-hashed API key for authentication';
COMMENT ON COLUMN agents.api_key_prefix IS 'First 8 characters of API key for identification';
COMMENT ON COLUMN policies.priority IS 'Higher priority policies are evaluated first';
COMMENT ON COLUMN policies.conditions IS 'JSON object defining rule matching conditions';
COMMENT ON COLUMN tokens.uses_remaining IS '-1 indicates unlimited uses within TTL';
