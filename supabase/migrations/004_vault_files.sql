-- ===================================================
-- Migration 004: Vault Files & Storage Integration
-- Tracks uploaded files so SafeVault can retrieve them
-- ===================================================

-- Create vault_files table to track stored files
CREATE TABLE IF NOT EXISTS vault_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    bucket TEXT NOT NULL DEFAULT 'safe-vault',
    content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    original_hash TEXT,
    risk_score NUMERIC(5,2),
    originality_score NUMERIC(5,2) DEFAULT 100.0,
    is_screenshot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for vault_files
CREATE INDEX IF NOT EXISTS idx_vault_files_user_id ON vault_files(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_user_created ON vault_files(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_files_scan_id ON vault_files(scan_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_storage_path ON vault_files(storage_path);

-- Enable Row Level Security
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;

-- RLS for vault_files
CREATE POLICY IF NOT EXISTS "Users can view own vault files"
    ON vault_files FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own vault files"
    ON vault_files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own vault files"
    ON vault_files FOR DELETE
    USING (auth.uid() = user_id);

-- Add storage_path to blockchain_proofs to link proofs to stored files
ALTER TABLE blockchain_proofs
    ADD COLUMN IF NOT EXISTS vault_file_id UUID REFERENCES vault_files(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_vault_file
    ON blockchain_proofs(vault_file_id);

-- Add storage_path to audit_logs for tracking
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS storage_path TEXT,
    ADD COLUMN IF NOT EXISTS bucket TEXT DEFAULT 'safe-vault';

-- Function to auto-clean old unlinked files (keeps vault_files in sync)
CREATE OR REPLACE FUNCTION cleanup_orphaned_vault_files()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM vault_files WHERE scan_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Ensure thumbnails bucket tracking
COMMENT ON TABLE vault_files IS 'Tracks files stored in Supabase Storage buckets (safe-vault, thumbnails)';
