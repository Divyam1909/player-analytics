-- ============================================
-- AUTO-REFRESH TRIGGERS FOR MATERIALIZED VIEWS
-- ============================================
-- Run this AFTER the main database_updates_stats_structure.sql
-- This will automatically refresh views when data changes
-- ============================================

BEGIN;

-- ============================================
-- 1. CREATE UNIQUE INDEXES FOR CONCURRENT REFRESH
-- ============================================
-- CONCURRENTLY refresh requires unique indexes (already created in main migration)
-- These are here as safety net if they don't exist

CREATE UNIQUE INDEX IF NOT EXISTS idx_match_stats_summary_match 
ON public.match_statistics_summary(match_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_match_stats_unique 
ON public.player_match_statistics(player_id, match_id);

-- ============================================
-- 2. REFRESH FUNCTION WITH DEBOUNCING
-- ============================================
-- Uses a flag table to prevent multiple refreshes in quick succession

CREATE TABLE IF NOT EXISTS public.refresh_queue (
    id integer PRIMARY KEY DEFAULT 1,
    needs_refresh boolean DEFAULT false,
    last_refresh timestamp with time zone DEFAULT now(),
    CHECK (id = 1) -- Only one row allowed
);

INSERT INTO public.refresh_queue (id, needs_refresh) 
VALUES (1, false) 
ON CONFLICT (id) DO NOTHING;

-- Function to mark views as needing refresh
CREATE OR REPLACE FUNCTION mark_views_for_refresh()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.refresh_queue 
    SET needs_refresh = true 
    WHERE id = 1;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to actually refresh the views (call this periodically or on-demand)
CREATE OR REPLACE FUNCTION do_refresh_statistics_views()
RETURNS void AS $$
DECLARE
    should_refresh boolean;
    last_refresh_time timestamp with time zone;
BEGIN
    -- Check if refresh is needed and get last refresh time
    SELECT needs_refresh, last_refresh 
    INTO should_refresh, last_refresh_time
    FROM public.refresh_queue 
    WHERE id = 1;
    
    -- Only refresh if marked and at least 5 seconds since last refresh
    IF should_refresh AND (now() - last_refresh_time) > interval '5 seconds' THEN
        -- Refresh views concurrently (non-blocking)
        REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
        REFRESH MATERIALIZED VIEW CONCURRENTLY player_match_statistics;
        
        -- Reset the flag and update timestamp
        UPDATE public.refresh_queue 
        SET needs_refresh = false, last_refresh = now() 
        WHERE id = 1;
        
        RAISE NOTICE 'Statistics views refreshed at %', now();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE TRIGGERS ON ALL EVENT TABLES
-- ============================================

-- Pass Events
DROP TRIGGER IF EXISTS trigger_refresh_on_pass_events ON pass_events;
CREATE TRIGGER trigger_refresh_on_pass_events
AFTER INSERT OR UPDATE OR DELETE ON pass_events
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Shots
DROP TRIGGER IF EXISTS trigger_refresh_on_shots ON shots_on_target;
CREATE TRIGGER trigger_refresh_on_shots
AFTER INSERT OR UPDATE OR DELETE ON shots_on_target
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Duels
DROP TRIGGER IF EXISTS trigger_refresh_on_duels ON duels;
CREATE TRIGGER trigger_refresh_on_duels
AFTER INSERT OR UPDATE OR DELETE ON duels
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Keeper Actions
DROP TRIGGER IF EXISTS trigger_refresh_on_keeper_actions ON keeper_actions;
CREATE TRIGGER trigger_refresh_on_keeper_actions
AFTER INSERT OR UPDATE OR DELETE ON keeper_actions
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Fouls
DROP TRIGGER IF EXISTS trigger_refresh_on_fouls ON fouls;
CREATE TRIGGER trigger_refresh_on_fouls
AFTER INSERT OR UPDATE OR DELETE ON fouls
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Set Pieces
DROP TRIGGER IF EXISTS trigger_refresh_on_set_pieces ON set_pieces;
CREATE TRIGGER trigger_refresh_on_set_pieces
AFTER INSERT OR UPDATE OR DELETE ON set_pieces
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Final Third Chances
DROP TRIGGER IF EXISTS trigger_refresh_on_chances ON final_third_chances;
CREATE TRIGGER trigger_refresh_on_chances
AFTER INSERT OR UPDATE OR DELETE ON final_third_chances
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- Physical Stats (new table)
DROP TRIGGER IF EXISTS trigger_refresh_on_physical_stats ON physical_stats;
CREATE TRIGGER trigger_refresh_on_physical_stats
AFTER INSERT OR UPDATE OR DELETE ON physical_stats
FOR EACH STATEMENT EXECUTE FUNCTION mark_views_for_refresh();

-- ============================================
-- 4. IMMEDIATE REFRESH FUNCTION (Alternative)
-- ============================================
-- Use this if you want immediate refresh without debouncing

CREATE OR REPLACE FUNCTION refresh_statistics_views_now()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY player_match_statistics;
    RAISE NOTICE 'Statistics views refreshed at %', now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. OPTIONAL: SCHEDULED REFRESH VIA PG_CRON
-- ============================================
-- Uncomment if you have pg_cron extension enabled in Supabase
-- This refreshes every minute if needed

-- SELECT cron.schedule(
--     'refresh-stats-views-cron',
--     '* * * * *',  -- Every minute
--     $$SELECT do_refresh_statistics_views()$$
-- );

COMMIT;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 
-- After running this script, views will be marked for refresh
-- automatically when data changes.
--
-- Option A: Call refresh manually after data entry session:
--   SELECT do_refresh_statistics_views();
--
-- Option B: Call immediate refresh (no debounce):
--   SELECT refresh_statistics_views_now();
--
-- Option C: Enable pg_cron (uncomment above) for auto-refresh every minute
--
-- To check if refresh is pending:
--   SELECT * FROM refresh_queue;
--
