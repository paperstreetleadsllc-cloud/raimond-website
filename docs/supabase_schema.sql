-- RAimond Signup Flow - Supabase Schema
-- This schema is idempotent - safe to run multiple times

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Table: leads
-- Stores initial email signups (Step 1)
-- ========================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  consent_given BOOLEAN NOT NULL DEFAULT false,

  -- UTM & Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,

  -- Privacy & Compliance
  ip_hash TEXT, -- SHA-256 hash of IP + salt (16 chars)

  -- Timestamps
  client_timestamp TIMESTAMPTZ, -- When user submitted on their end
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Index for created_at for analytics
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Index for UTM tracking
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);

-- ========================================
-- Table: lead_profiles
-- Stores progressive profiling data (Step 2)
-- ========================================
CREATE TABLE IF NOT EXISTS lead_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Profile Data
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  challenge TEXT, -- max 120 chars, validated client-side
  trading_style TEXT CHECK (trading_style IN ('day', 'swing', 'longterm')),
  asset_classes TEXT[], -- e.g., ['stocks', 'options', 'futures']
  phone TEXT, -- E.164 format
  tools TEXT[], -- e.g., ['tos', 'tradingview', 'sierra']
  portfolio_range TEXT,
  monthly_volume TEXT,
  region TEXT,

  -- Segmentation Tags (JSONB for flexibility)
  tags JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one profile per lead
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_profiles_lead_id ON lead_profiles(lead_id);

-- Index for tag queries
CREATE INDEX IF NOT EXISTS idx_lead_profiles_tags ON lead_profiles USING GIN (tags);

-- Index for experience level filtering
CREATE INDEX IF NOT EXISTS idx_lead_profiles_experience ON lead_profiles(experience_level);

-- Index for trading style filtering
CREATE INDEX IF NOT EXISTS idx_lead_profiles_style ON lead_profiles(trading_style);

-- ========================================
-- Triggers for updated_at timestamps
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_profiles_updated_at ON lead_profiles;
CREATE TRIGGER update_lead_profiles_updated_at
  BEFORE UPDATE ON lead_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Row Level Security (RLS) - Optional
-- ========================================
-- Uncomment if you want to enable RLS

-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lead_profiles ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow service role to do everything
-- CREATE POLICY "Service role has full access to leads"
--   ON leads
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role has full access to lead_profiles"
--   ON lead_profiles
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- ========================================
-- Sample Queries for Analytics
-- ========================================

-- Count leads by UTM source
-- SELECT utm_source, COUNT(*) as count
-- FROM leads
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY utm_source
-- ORDER BY count DESC;

-- Count profiles by experience level
-- SELECT experience_level, COUNT(*) as count
-- FROM lead_profiles
-- WHERE experience_level IS NOT NULL
-- GROUP BY experience_level
-- ORDER BY count DESC;

-- Find leads with phone numbers
-- SELECT l.email, lp.phone
-- FROM leads l
-- JOIN lead_profiles lp ON l.id = lp.lead_id
-- WHERE lp.phone IS NOT NULL;

-- Tag analysis
-- SELECT tags->>'exp:beginner' as is_beginner, COUNT(*)
-- FROM lead_profiles
-- GROUP BY is_beginner;
