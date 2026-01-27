-- ============================================
-- AUTO-REFRESH TRIGGERS FOR MATERIALIZED VIEWS
-- Run this once to set up automatic refresh
-- ============================================

-- First, we need a unique index for CONCURRENTLY refresh to work
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_stats_unique 
ON match_statistics_summary(match_id);

-- Create the refresh function
CREATE OR REPLACE FUNCTION refresh_match_stats() 
RETURNS TRIGGER AS $$
BEGIN
  -- Use CONCURRENTLY so reads aren't blocked during refresh
  REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on all event tables
-- These fire AFTER INSERT/UPDATE/DELETE on each table

-- Trigger on pass_events
DROP TRIGGER IF EXISTS trg_refresh_stats_pass ON pass_events;
CREATE TRIGGER trg_refresh_stats_pass
AFTER INSERT OR UPDATE OR DELETE ON pass_events
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on shots_on_target
DROP TRIGGER IF EXISTS trg_refresh_stats_shots ON shots_on_target;
CREATE TRIGGER trg_refresh_stats_shots
AFTER INSERT OR UPDATE OR DELETE ON shots_on_target
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on duels
DROP TRIGGER IF EXISTS trg_refresh_stats_duels ON duels;
CREATE TRIGGER trg_refresh_stats_duels
AFTER INSERT OR UPDATE OR DELETE ON duels
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on keeper_actions
DROP TRIGGER IF EXISTS trg_refresh_stats_keeper ON keeper_actions;
CREATE TRIGGER trg_refresh_stats_keeper
AFTER INSERT OR UPDATE OR DELETE ON keeper_actions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on fouls
DROP TRIGGER IF EXISTS trg_refresh_stats_fouls ON fouls;
CREATE TRIGGER trg_refresh_stats_fouls
AFTER INSERT OR UPDATE OR DELETE ON fouls
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on set_pieces
DROP TRIGGER IF EXISTS trg_refresh_stats_setpieces ON set_pieces;
CREATE TRIGGER trg_refresh_stats_setpieces
AFTER INSERT OR UPDATE OR DELETE ON set_pieces
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Trigger on final_third_chances
DROP TRIGGER IF EXISTS trg_refresh_stats_finalthird ON final_third_chances;
CREATE TRIGGER trg_refresh_stats_finalthird
AFTER INSERT OR UPDATE OR DELETE ON final_third_chances
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_match_stats();

-- Verify triggers are created
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE 'trg_refresh_stats%';

SELECT 'SUCCESS: Auto-refresh triggers created! Views will now update automatically.' as status;
