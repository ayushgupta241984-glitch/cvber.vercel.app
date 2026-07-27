-- Notifications and investigations tables for agent monitoring

CREATE TABLE IF NOT EXISTS agent_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'copy_found',
    title TEXT NOT NULL,
    body TEXT,
    metadata JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_investigations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scan_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    match_count INTEGER DEFAULT 0,
    similar_count INTEGER DEFAULT 0,
    findings JSONB DEFAULT '[]',
    thinking_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON agent_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON agent_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
    ON agent_notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own investigations"
    ON agent_investigations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service can insert investigations"
    ON agent_investigations FOR INSERT
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON agent_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_user ON agent_investigations(user_id, created_at DESC);
