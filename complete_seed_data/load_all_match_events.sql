-- ============================================
-- COMPLETE SEED DATA - MASTER LOADER
-- Run this file to load ALL match events for all 4 matches
-- ============================================

-- Load Match 2 Events (Eagle Rangers 1 - Thunder FC 3)
\i complete_seed_data/match_2_events.sql

-- Load Match 3 Events (Phoenix Athletic 3 - Dragon Warriors 2)
\i complete_seed_data/match_3_events.sql

-- Load Match 4 Events (Dragon Warriors 2 - Falcon Stars 2)
\i complete_seed_data/match_4_events.sql

-- ============================================
-- POST-LOAD: REFRESH MATERIALIZED VIEWS
-- ============================================

-- Refresh views to populate statistics
REFRESH MATERIALIZED VIEW match_statistics_summary;
REFRESH MATERIALIZED VIEW player_match_statistics;

-- Calculate player attributes
SELECT update_all_player_attributes();

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all matches have data
SELECT 
    match_id,
    COUNT(*) as player_count,
    SUM(goals) as total_goals,
    SUM(assists) as total_assists,
    SUM(total_passes) as total_passes
FROM player_match_statistics
GROUP BY match_id
ORDER BY match_id;

-- Expected results:
-- - a1111111... : Already has data from original seed
-- - a2222222... : Should show Thunder FC 3 goals (Samuel Diaz hat-trick)
-- - a3333333... : Should show Phoenix 3 goals, Dragon 2 goals
-- - a4444444... : Should show Dragon 2 goals, Falcon 2 goals

-- Check player attributes calculated
SELECT COUNT(*) as players_with_attributes
FROM player_attributes
WHERE overall_rating IS NOT NULL;
-- Expected: 120 players

SELECT 'SUCCESS: All match events loaded and views refreshed!' as status;
