-- Migration 007: Missing tables for enforcement, licensing, style matching, and DNA analysis

-- 0. Add onboarding/artist tier fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS artist_tier TEXT DEFAULT 'emerging';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS art_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS platforms TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- 1. style_embeddings (CLIP embeddings for visual style matching)
CREATE TABLE IF NOT EXISTS style_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    asset_id UUID,
    artist_name TEXT,
    artist_username TEXT,
    artist_avatar_url TEXT,
    artist_portfolio_url TEXT,
    file_name TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    embedding FLOAT8[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    licensing_available BOOLEAN DEFAULT FALSE,
    licensing_contact_email TEXT,
    license_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_style_embeddings_user_id ON style_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_style_embeddings_asset_id ON style_embeddings(asset_id);
CREATE INDEX IF NOT EXISTS idx_style_embeddings_is_active ON style_embeddings(is_active);
ALTER TABLE style_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own style embeddings" ON style_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own style embeddings" ON style_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own style embeddings" ON style_embeddings FOR UPDATE USING (auth.uid() = user_id);

-- 2. monitored_assets (asset tracking for theft monitoring)
CREATE TABLE IF NOT EXISTS monitored_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL UNIQUE,
    asset_name TEXT NOT NULL,
    asset_hash TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    scan_frequency_hours INTEGER NOT NULL DEFAULT 72,
    last_scanned TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_monitored_assets_asset_id ON monitored_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_monitored_assets_priority ON monitored_assets(priority);
CREATE INDEX IF NOT EXISTS idx_monitored_assets_user_id ON monitored_assets(user_id);
ALTER TABLE monitored_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own monitored assets" ON monitored_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own monitored assets" ON monitored_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own monitored assets" ON monitored_assets FOR DELETE USING (auth.uid() = user_id);

-- 3. theft_alerts (alerts when stolen content is found)
CREATE TABLE IF NOT EXISTS theft_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alert_id TEXT NOT NULL UNIQUE,
    asset_id TEXT NOT NULL,
    found_url TEXT NOT NULL,
    platform TEXT NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.85,
    estimated_views INTEGER,
    estimated_revenue_loss NUMERIC,
    status TEXT NOT NULL DEFAULT 'new',
    detected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_theft_alerts_alert_id ON theft_alerts(alert_id);
CREATE INDEX IF NOT EXISTS idx_theft_alerts_asset_id ON theft_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_theft_alerts_status ON theft_alerts(status);
CREATE INDEX IF NOT EXISTS idx_theft_alerts_user_id ON theft_alerts(user_id);
ALTER TABLE theft_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own theft alerts" ON theft_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own theft alerts" ON theft_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own theft alerts" ON theft_alerts FOR UPDATE USING (auth.uid() = user_id);

-- 4. disputes (content dispute resolution with kill switch)
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id TEXT NOT NULL,
    asset_hash TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    kill_switch_active BOOLEAN NOT NULL DEFAULT TRUE,
    affected_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_disputes_asset_hash ON disputes(asset_hash);
CREATE INDEX IF NOT EXISTS idx_disputes_owner_id ON disputes(owner_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_kill_switch ON disputes(kill_switch_active);
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own disputes" ON disputes FOR SELECT USING (auth.uid()::text = owner_id);
CREATE POLICY IF NOT EXISTS "Users can insert own disputes" ON disputes FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

-- 5. licenses (asset licensing tracking)
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id TEXT NOT NULL UNIQUE,
    asset_hash TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    license_type TEXT NOT NULL,
    licensee_name TEXT NOT NULL,
    licensee_email TEXT NOT NULL,
    licensor_name TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_licenses_license_id ON licenses(license_id);
CREATE INDEX IF NOT EXISTS idx_licenses_asset_hash ON licenses(asset_hash);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_licensee_email ON licenses(licensee_email);
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own licenses" ON licenses FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert own licenses" ON licenses FOR INSERT WITH CHECK (true);

-- 6. dna_analysis_results (AI art DNA match results)
CREATE TABLE IF NOT EXISTS dna_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id TEXT UNIQUE NOT NULL,
    query_image_url TEXT,
    query_image_hash TEXT,
    matches JSONB NOT NULL,
    top_match_name TEXT,
    top_match_similarity FLOAT,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    share_count INT DEFAULT 0,
    analyzed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_dna_results_result_id ON dna_analysis_results(result_id);
ALTER TABLE dna_analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own dna results" ON dna_analysis_results FOR SELECT USING (auth.uid() = analyzed_by);
CREATE POLICY IF NOT EXISTS "Users can insert own dna results" ON dna_analysis_results FOR INSERT WITH CHECK (auth.uid() = analyzed_by);

-- 7. dna_notifications (notify artists when their style is matched)
CREATE TABLE IF NOT EXISTS dna_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dna_result_id TEXT REFERENCES dna_analysis_results(result_id),
    similarity_score FLOAT NOT NULL,
    matched_file_name TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dna_notifications_artist ON dna_notifications(artist_user_id);
ALTER TABLE dna_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own dna notifications" ON dna_notifications FOR SELECT USING (auth.uid() = artist_user_id);

-- pgvector extension for embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;
