-- ===================================================
-- Migration 003: Production Hardening
-- Adds foreign keys, indexes, RLS policies, partitioning
-- ===================================================

-- Add missing foreign key on blockchain_proofs
ALTER TABLE blockchain_proofs
    DROP CONSTRAINT IF EXISTS blockchain_proofs_user_id_fkey,
    ADD CONSTRAINT blockchain_proofs_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add missing foreign key on verification_meta
ALTER TABLE verification_meta
    DROP CONSTRAINT IF EXISTS verification_meta_user_id_fkey,
    ADD CONSTRAINT verification_meta_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Additional indexes for query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event ON audit_logs(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_score ON audit_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_verification_meta_verified_at ON verification_meta(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_meta_original_hash ON verification_meta(original_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_meta_user_created
    ON verification_meta(user_id, created_at DESC);

-- Prepare for partitioning: create a shadow table for audit_logs (time-based)
-- This is a no-op now but documents the intended partitioning scheme
COMMENT ON TABLE audit_logs IS 'Audit trail logs. Consider partitioning by created_at monthly for large-scale deployments.';

-- Enhanced RLS policies

-- Profiles: full access control
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admin can view all profiles (requires admin role)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'service_role' OR auth.role() = 'admin');

-- Audit logs: user-level isolation
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;
CREATE POLICY "Users can insert own audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Verification meta: user-level isolation
DROP POLICY IF EXISTS "Users can view own verification records" ON verification_meta;
CREATE POLICY "Users can view own verification records"
    ON verification_meta FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verification records" ON verification_meta;
CREATE POLICY "Users can insert own verification records"
    ON verification_meta FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Blockchain proofs: user-level isolation
DROP POLICY IF EXISTS "Users can view own blockchain proofs" ON blockchain_proofs;
CREATE POLICY "Users can view own blockchain proofs"
    ON blockchain_proofs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own blockchain proofs" ON blockchain_proofs;
CREATE POLICY "Users can insert own blockchain proofs"
    ON blockchain_proofs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own blockchain proofs" ON blockchain_proofs;
CREATE POLICY "Users can update own blockchain proofs"
    ON blockchain_proofs FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to enforce storage limits per user
CREATE OR REPLACE FUNCTION check_user_storage_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_storage_mb NUMERIC;
BEGIN
    -- Approximate storage from file metadata
    SELECT COALESCE(SUM((metadata->>'file_size')::numeric / 1048576), 0)
    INTO user_storage_mb
    FROM audit_logs
    WHERE user_id = NEW.user_id
      AND event_type = 'scan'
      AND created_at > NOW() - INTERVAL '30 days';

    IF user_storage_mb > 500 THEN
        RAISE EXCEPTION 'Storage limit exceeded: % MB used (max 500 MB per 30 days)', user_storage_mb;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for storage enforcement
DROP TRIGGER IF EXISTS enforce_storage_limit ON audit_logs;
CREATE TRIGGER enforce_storage_limit
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    WHEN (NEW.event_type = 'scan')
    EXECUTE FUNCTION check_user_storage_limit();
