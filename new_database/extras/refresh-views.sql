-- ============================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================
-- Run this script after inserting or updating match event data
-- to update the cached statistics
-- ============================================

-- Refresh match statistics (fast - usually < 1 second per match)
REFRESH MATERIALIZED VIEW match_statistics_summary;

-- Refresh player statistics (slower - depends on number of players and matches)
REFRESH MATERIALIZED VIEW player_match_statistics;

-- ============================================
-- CONCURRENT REFRESH (allows reads during refresh)
-- ============================================
-- Use this if you want to refresh views without blocking queries
-- Note: Requires unique indexes to be created first

-- REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY player_match_statistics;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check when views were last refreshed:
SELECT 
  schemaname,
  matviewname,
  hasindexes,
  ispopulated,
  definition
FROM pg_matviews
WHERE schemaname = 'public'
  AND matviewname IN ('match_statistics_summary', 'player_match_statistics');

-- Count records in materialized views:
SELECT 
  'match_statistics_summary' as view_name,
  COUNT(*) as record_count
FROM match_statistics_summary
UNION ALL
SELECT 
  'player_match_statistics',
  COUNT(*)
FROM player_match_statistics;
