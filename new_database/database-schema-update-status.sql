-- ============================================
-- DATABASE MIGRATION: ADD MATCH STATUS
-- ============================================
-- Adds a 'status' column to the matches table to track import progress.
-- This is used to trigger automatic statistics calculation.
-- ============================================

-- 1. Add the status column
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('scheduled', 'live', 'finished', 'importing')) DEFAULT 'scheduled';

-- 2. Backfill existing data
-- Assumption: If a match has a result (home_score/away_score are not null), it is likely finished.
-- However, for safety in this migration, we will mark ALL existing matches as 'finished' 
-- so they can trigger a refresh if updated, or at least be consistent.
UPDATE public.matches 
SET status = 'finished' 
WHERE status = 'scheduled';

-- 3. Add comment
COMMENT ON COLUMN public.matches.status IS 'Current state of the match. exact ''finished'' state triggers stats calculation.';

-- 4. Create Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
