CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    category TEXT DEFAULT 'general',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can read all feedback"
    ON feedback FOR SELECT
    USING (true);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    code TEXT UNIQUE NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral"
    ON referrals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral"
    ON referrals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read referral by code"
    ON referrals FOR SELECT
    USING (true);
