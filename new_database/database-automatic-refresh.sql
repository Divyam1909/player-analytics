-- ============================================
-- AUTOMATIC DATABASE REFRESH
-- ============================================
-- Triggers automatic calculation of statistics and player attributes
-- when a match status changes to 'finished'.
-- ============================================

-- 1. Master Refresh Function
-- Refreshes all materialized views and recalculates player attributes
CREATE OR REPLACE FUNCTION refresh_all_stats()
RETURNS VOID AS $$
BEGIN
  -- A. Refresh Materialized Views
  -- We use CONCURRENTLY to avoid locking the table for reads
  -- Note: This requires the views to have unique indexes (which they do)
  
  -- Refresh Match Stats Summary
  REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
  
  -- Refresh Player Match Stats
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_match_statistics;
  
  -- B. Recalculate Player Attributes
  -- This depends on player_match_statistics being up to date
  PERFORM update_all_player_attributes();
  
  -- Log the refresh (optional, printed to Postgres logs)
  RAISE NOTICE 'Statistics and attributes refreshed successfully at %', NOW();
END;
$$ LANGUAGE plpgsql;


-- 2. Trigger Function
-- Checks if the match status has changed to 'finished'
CREATE OR REPLACE FUNCTION trigger_refresh_on_match_finish()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed TO 'finished' FROM something else
  IF (NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status != 'finished')) THEN
    PERFORM refresh_all_stats();
  END IF;
  return NEW;
END;
$$ LANGUAGE plpgsql;


-- 3. Create Trigger
-- Attach the trigger to the matches table
DROP TRIGGER IF EXISTS after_match_status_update ON matches;

CREATE TRIGGER after_match_status_update
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_refresh_on_match_finish();

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. When importing a new match, set status = 'importing'.
-- 2. Insert all match events (passes, shots, etc.).
-- 3. Finally, update the match status to 'finished':
--    UPDATE matches SET status = 'finished' WHERE id = '...';
-- 4. This will automatically trigger the refresh.
