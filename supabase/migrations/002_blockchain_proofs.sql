-- Create blockchain_proofs table for persistent blockchain timestamp storage
CREATE TABLE IF NOT EXISTS blockchain_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    proof_id TEXT NOT NULL UNIQUE,
    asset_name TEXT NOT NULL,
    asset_hash TEXT NOT NULL UNIQUE,
    blockchain TEXT NOT NULL DEFAULT 'bitcoin',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'local_only', 'failed')),
    ots_proof TEXT,
    verification_url TEXT NOT NULL,
    bitcoin_block INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_user_id ON blockchain_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_asset_hash ON blockchain_proofs(asset_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_status ON blockchain_proofs(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_created_at ON blockchain_proofs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE blockchain_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blockchain_proofs
CREATE POLICY IF NOT EXISTS "Users can view own blockchain proofs"
    ON blockchain_proofs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own blockchain proofs"
    ON blockchain_proofs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own blockchain proofs"
    ON blockchain_proofs FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update confirmed_at timestamp
CREATE OR REPLACE FUNCTION update_confirmed_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        NEW.confirmed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update confirmed_at when status changes to confirmed
CREATE TRIGGER IF NOT EXISTS update_blockchain_proofs_confirmed_at
    BEFORE UPDATE OF status ON blockchain_proofs
    FOR EACH ROW
    EXECUTE FUNCTION update_confirmed_at_column();