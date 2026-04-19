-- CVBER SECURITY HARDENING MIGRATIONS
-- Run this in your Supabase SQL Editor to create the necessary tables for persistent state.

-- 1. LICENSES TABLE
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id TEXT UNIQUE NOT NULL,
    asset_hash TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    license_type TEXT NOT NULL,
    licensee_name TEXT NOT NULL,
    licensee_email TEXT NOT NULL,
    licensor_name TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id TEXT UNIQUE NOT NULL,
    asset_id TEXT NOT NULL,
    asset_hash TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    claimant_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    kill_switch_active BOOLEAN DEFAULT false,
    affected_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. MONITORED ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.monitored_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id TEXT UNIQUE NOT NULL,
    asset_name TEXT NOT NULL,
    asset_hash TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    priority TEXT DEFAULT 'medium',
    last_scanned TIMESTAMPTZ,
    scan_frequency_hours INTEGER DEFAULT 72,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. THEFT ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.theft_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id TEXT UNIQUE NOT NULL,
    asset_id TEXT REFERENCES public.monitored_assets(asset_id),
    found_url TEXT NOT NULL,
    platform TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    estimated_views INTEGER,
    estimated_revenue_loss FLOAT,
    status TEXT DEFAULT 'new',
    detected_at TIMESTAMPTZ DEFAULT now()
);

-- 5. IMMUTABLE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_type TEXT DEFAULT 'user',
    asset_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    previous_hash TEXT NOT NULL,
    event_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES (Example: Restrict assets to owners)
ALTER TABLE public.monitored_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own monitored assets" 
ON public.monitored_assets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only register their own monitored assets" 
ON public.monitored_assets FOR INSERT 
WITH CHECK (auth.uid() = user_id);
