"""
Create all database tables in Supabase
"""
from supabase import create_client
from app.config import settings

print('Connecting to Supabase...')
client = create_client(settings.supabase_url, settings.supabase_service_role_key)
print('[OK] Connected to Supabase')

# SQL statements to execute
sql_statements = [
    'CREATE TABLE IF NOT EXISTS public.blockchain_proofs (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, proof_id TEXT NOT NULL UNIQUE, asset_name TEXT NOT NULL, asset_hash TEXT NOT NULL, blockchain TEXT NOT NULL DEFAULT "bitcoin", status TEXT NOT NULL DEFAULT "pending", ots_proof TEXT, verification_url TEXT NOT NULL, bitcoin_block INTEGER, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), metadata JSONB);',
    'CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_user_id ON public.blockchain_proofs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_proof_id ON public.blockchain_proofs(proof_id);',
    'CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_asset_hash ON public.blockchain_proofs(asset_hash);',
    'CREATE INDEX IF NOT EXISTS idx_blockchain_proofs_status ON public.blockchain_proofs(status);',
    'CREATE TABLE IF NOT EXISTS public.audit_logs (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, event_type TEXT NOT NULL, file_name TEXT, risk_score NUMERIC, metadata JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);',
    'CREATE TABLE IF NOT EXISTS public.verification_meta (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, file_id TEXT NOT NULL, original_hash TEXT NOT NULL, signed_hash TEXT NOT NULL, c2pa_manifest JSONB, kms_key_version TEXT, verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_verification_meta_user_id ON public.verification_meta(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_verification_meta_file_id ON public.verification_meta(file_id);',
    'CREATE INDEX IF NOT EXISTS idx_verification_meta_original_hash ON public.verification_meta(original_hash);',
    'CREATE TABLE IF NOT EXISTS public.disputes (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, asset_id TEXT NOT NULL, asset_hash TEXT NOT NULL, owner_id TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT "pending", kill_switch_active BOOLEAN NOT NULL DEFAULT TRUE, affected_urls TEXT[], created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), resolved_at TIMESTAMP WITH TIME ZONE);',
    'CREATE INDEX IF NOT EXISTS idx_disputes_asset_hash ON public.disputes(asset_hash);',
    'CREATE INDEX IF NOT EXISTS idx_disputes_owner_id ON public.disputes(owner_id);',
    'CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);',
    'CREATE INDEX IF NOT EXISTS idx_disputes_kill_switch ON public.disputes(kill_switch_active);',
    'CREATE TABLE IF NOT EXISTS public.licenses (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, license_id TEXT NOT NULL UNIQUE, asset_hash TEXT NOT NULL, asset_name TEXT NOT NULL, license_type TEXT NOT NULL, licensee_name TEXT NOT NULL, licensee_email TEXT NOT NULL, licensor_name TEXT NOT NULL, issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), expires_at TIMESTAMP WITH TIME ZONE, status TEXT NOT NULL DEFAULT "active", metadata JSONB);',
    'CREATE INDEX IF NOT EXISTS idx_licenses_license_id ON public.licenses(license_id);',
    'CREATE INDEX IF NOT EXISTS idx_licenses_asset_hash ON public.licenses(asset_hash);',
    'CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);',
    'CREATE INDEX IF NOT EXISTS idx_licenses_licensee_email ON public.licenses(licensee_email);',
    'CREATE TABLE IF NOT EXISTS public.registered_assets (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, asset_id TEXT NOT NULL UNIQUE, asset_name TEXT NOT NULL, asset_hash TEXT NOT NULL, file_size BIGINT NOT NULL, status TEXT NOT NULL DEFAULT "pending", originality_score NUMERIC, is_screenshot BOOLEAN DEFAULT FALSE, forensic_summary TEXT, ai_provider TEXT, ai_model TEXT, uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_registered_assets_user_id ON public.registered_assets(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_registered_assets_asset_id ON public.registered_assets(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_registered_assets_asset_hash ON public.registered_assets(asset_hash);',
    'CREATE INDEX IF NOT EXISTS idx_registered_assets_status ON public.registered_assets(status);',
    'CREATE TABLE IF NOT EXISTS public.hash_history (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, asset_id TEXT NOT NULL, file_hash TEXT NOT NULL, file_size BIGINT NOT NULL, user_id TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_hash_history_asset_id ON public.hash_history(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_hash_history_file_hash ON public.hash_history(file_hash);',
    'CREATE INDEX IF NOT EXISTS idx_hash_history_user_id ON public.hash_history(user_id);',
    'CREATE TABLE IF NOT EXISTS public.monitored_assets (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, asset_id TEXT NOT NULL UNIQUE, asset_name TEXT NOT NULL, asset_hash TEXT NOT NULL, priority TEXT NOT NULL DEFAULT "medium", scan_frequency_hours INTEGER NOT NULL DEFAULT 72, last_scanned TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_monitored_assets_asset_id ON public.monitored_assets(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_monitored_assets_priority ON public.monitored_assets(priority);',
    'CREATE TABLE IF NOT EXISTS public.theft_alerts (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, alert_id TEXT NOT NULL UNIQUE, asset_id TEXT NOT NULL, found_url TEXT NOT NULL, platform TEXT NOT NULL, confidence NUMERIC NOT NULL DEFAULT 0.85, estimated_views INTEGER, estimated_revenue_loss NUMERIC, status TEXT NOT NULL DEFAULT "new", detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_theft_alerts_alert_id ON public.theft_alerts(alert_id);',
    'CREATE INDEX IF NOT EXISTS idx_theft_alerts_asset_id ON public.theft_alerts(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_theft_alerts_status ON public.theft_alerts(status);',
    'CREATE TABLE IF NOT EXISTS public.profiles (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, email TEXT NOT NULL UNIQUE, full_name TEXT, avatar_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);',
    'CREATE TABLE IF NOT EXISTS public.audit_trail (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, event_id TEXT NOT NULL UNIQUE, event_type TEXT NOT NULL, actor_id TEXT NOT NULL, actor_type TEXT NOT NULL DEFAULT "user", asset_id TEXT, details JSONB, previous_hash TEXT, event_hash TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_audit_trail_event_id ON public.audit_trail(event_id);',
    'CREATE INDEX IF NOT EXISTS idx_audit_trail_event_type ON public.audit_trail(event_type);',
    'CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_id ON public.audit_trail(actor_id);',
    'CREATE INDEX IF NOT EXISTS idx_audit_trail_asset_id ON public.audit_trail(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_audit_trail_previous_hash ON public.audit_trail(previous_hash);',
    'CREATE TABLE IF NOT EXISTS public.style_embeddings (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, asset_id TEXT, artist_name TEXT, artist_username TEXT, artist_avatar_url TEXT, file_name TEXT, thumbnail_url TEXT, embedding FLOAT8[], is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
    'CREATE INDEX IF NOT EXISTS idx_style_embeddings_user_id ON public.style_embeddings(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_style_embeddings_asset_id ON public.style_embeddings(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_style_embeddings_is_active ON public.style_embeddings(is_active);'
]

# Execute all SQL statements
for i, sql in enumerate(sql_statements, 1):
    try:
        result = client.sql(sql).execute()
        print(f'[OK] Statement {i}/12 executed successfully')
    except Exception as e:
        print(f'[FAIL] Statement {i}/12 failed: {e}')

print()
print('All database tables created successfully!')