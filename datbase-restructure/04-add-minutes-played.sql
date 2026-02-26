-- ============================================
-- Migration 04: Add minutes_played to physical_stats
-- ============================================
-- The physical_stats table already stores per-match per-player
-- physical data (distance, sprints, etc). Adding minutes_played
-- here keeps all physical/tracking data in one place.
-- ============================================

-- Add minutes_played column
ALTER TABLE public.physical_stats
ADD COLUMN IF NOT EXISTS minutes_played integer DEFAULT 0
CHECK (minutes_played >= 0 AND minutes_played <= 130);

-- Add comment
COMMENT ON COLUMN public.physical_stats.minutes_played IS 'Minutes played by the player in this match';

-- ============================================
-- DONE
-- ============================================
