-- CVBER AGENT SELF-IMPROVEMENT MIGRATIONS
-- Inspired by Hermes Agent (Nous Research) — skills from experience, adaptive memory

-- 1. AGENT SKILLS TABLE
-- Stores reusable search strategies extracted from successful runs
CREATE TABLE IF NOT EXISTS public.agent_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    image_type_hint TEXT, -- 'screenshot', 'artwork', 'photo', 'logo', 'text_heavy', 'unknown'
    trigger_keywords TEXT[] DEFAULT '{}', -- keywords that activate this skill
    strategy JSONB NOT NULL DEFAULT '{}'::jsonb, -- {engines, threshold, keyword_enabled, vision_prompt}
    success_count INT DEFAULT 1,
    failure_count INT DEFAULT 0,
    last_used TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SEARCH TRAJECTORIES TABLE
-- Logs every search run for analysis and learning
CREATE TABLE IF NOT EXISTS public.search_trajectories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    scan_id TEXT,
    file_name TEXT,
    image_type TEXT,
    vision_description TEXT,
    keywords_used TEXT,
    engines_used TEXT[] DEFAULT '{}',
    threshold_used FLOAT DEFAULT 0.75,
    result_count INT DEFAULT 0,
    match_count INT DEFAULT 0,
    similar_count INT DEFAULT 0,
    top_scores FLOAT[] DEFAULT '{}',
    was_successful BOOLEAN,
    user_feedback TEXT, -- 'correct', 'wrong', 'no_feedback'
    strategy_id UUID REFERENCES public.agent_skills(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AGENT MEMORY TABLE
-- Persistent key-value memory for agent self-improvement
CREATE TABLE IF NOT EXISTS public.agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'lesson', -- 'lesson', 'preference', 'fact', 'strategy_note'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, key)
);

-- RLS
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_trajectories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their skills" ON public.agent_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their trajectories" ON public.search_trajectories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their memory" ON public.agent_memory
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_search_trajectories_user_scan ON public.search_trajectories(user_id, scan_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_user_type ON public.agent_skills(user_id, image_type_hint);
