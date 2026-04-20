-- Step 1: Enable pgvector extension (free, built into Supabase)
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create style_embeddings table
CREATE TABLE style_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to existing CVBER data
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID, -- REFERENCES audit_logs(id) ON DELETE SET NULL (ignoring if audit_logs doesn't exist yet)
  
  -- Artist profile info (denormalized for fast retrieval)
  artist_name TEXT NOT NULL,
  artist_username TEXT,
  artist_avatar_url TEXT,
  artist_portfolio_url TEXT,
  
  -- The file this embedding was generated from
  file_name TEXT NOT NULL,
  file_url TEXT,  -- Supabase storage URL
  thumbnail_url TEXT,  -- 200x200 thumbnail for display
  
  -- The CLIP embedding (512 dimensions)
  embedding vector(512) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Licensing
  licensing_available BOOLEAN DEFAULT false,
  licensing_contact_email TEXT,
  license_price DECIMAL(10,2)
);

-- HNSW index for fast approximate nearest neighbor search
-- Use cosine distance since embeddings are normalized
CREATE INDEX style_embeddings_hnsw_idx 
ON style_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index for user lookups
CREATE INDEX idx_style_embeddings_user ON style_embeddings(user_id);
CREATE INDEX idx_style_embeddings_active ON style_embeddings(is_active);

-- Step 3: Create match function
-- Function to find visually similar artists for a given embedding
CREATE OR REPLACE FUNCTION match_artist_styles(
  query_embedding vector(512),
  match_threshold FLOAT DEFAULT 0.70,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  artist_name TEXT,
  artist_username TEXT,
  artist_avatar_url TEXT,
  artist_portfolio_url TEXT,
  file_name TEXT,
  thumbnail_url TEXT,
  licensing_available BOOLEAN,
  license_price DECIMAL,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.user_id,
    se.artist_name,
    se.artist_username,
    se.artist_avatar_url,
    se.artist_portfolio_url,
    se.file_name,
    se.thumbnail_url,
    se.licensing_available,
    se.license_price,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM style_embeddings se
  WHERE 
    se.is_active = true
    AND 1 - (se.embedding <=> query_embedding) >= match_threshold
  ORDER BY se.embedding <=> query_embedding  -- Order by cosine distance (ascending)
  LIMIT match_count;
END;
$$;

-- Step 4: Create dna_analysis_results table (for storing and sharing results)
CREATE TABLE dna_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id TEXT UNIQUE NOT NULL,  -- e.g., "dna_abc123" for shareable URL
  
  -- The query image
  query_image_url TEXT,  -- Temporary storage URL for the uploaded image
  query_image_hash TEXT,  -- SHA256 of image for deduplication
  
  -- Results (stored as JSONB)
  matches JSONB NOT NULL,  -- Array of {artist_name, similarity, thumbnail_url, etc.}
  top_match_name TEXT,  -- Denormalized for easy display
  top_match_similarity FLOAT,
  
  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  share_count INT DEFAULT 0,
  
  -- Optional: who ran the analysis (null for anonymous)
  analyzed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for fast shareable URL lookups
CREATE INDEX idx_dna_results_result_id ON dna_analysis_results(result_id);

-- Step 5: Create dna_notifications table
CREATE TABLE dna_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dna_result_id TEXT REFERENCES dna_analysis_results(result_id),
  similarity_score FLOAT NOT NULL,
  matched_file_name TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
