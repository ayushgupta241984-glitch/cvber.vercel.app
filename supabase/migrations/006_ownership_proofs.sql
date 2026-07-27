-- Add column to vault_files to track if ownership proof is required
ALTER TABLE vault_files ADD COLUMN IF NOT EXISTS proof_required BOOLEAN DEFAULT FALSE;
ALTER TABLE vault_files ADD COLUMN IF NOT EXISTS ownership_proof_status TEXT DEFAULT NULL;

-- Table to track ownership proofs for low-originality files
CREATE TABLE IF NOT EXISTS ownership_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proof_type TEXT NOT NULL,  -- 'declaration', 'document', 'source_file'
    proof_text TEXT,  -- Declaration text or description
    proof_url TEXT,  -- URL to source/original
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT
);

-- Enable RLS
ALTER TABLE ownership_proofs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create own ownership proofs"
    ON ownership_proofs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ownership proofs"
    ON ownership_proofs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ownership proofs"
    ON ownership_proofs FOR UPDATE
    USING (auth.uid() = user_id);