-- ============================================
-- MASTER SEED FILE
-- Run this file to load ALL seed data in correct order
-- ============================================

-- EXECUTION ORDER:
-- 1. Run database schema files first (part1, part2, part3)
-- 2. Run this master seed file
-- 3. Run extras folder files (refresh views, calculate attributes)

-- Load seed data in order
\i 1-core-data.sql
\i 2-players.sql
\i 3-matches-and-events.sql
\i 4-supporting-data.sql
\i 5-users.sql

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check data loaded
SELECT 'Leagues' as table_name, COUNT(*) as row_count FROM leagues
UNION ALL
SELECT 'Teams', COUNT(*) FROM teams
UNION ALL
SELECT 'Players', COUNT(*) FROM players
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches
UNION ALL
SELECT 'Pass Events', COUNT(*) FROM pass_events
UNION ALL
SELECT 'Shots', COUNT(*) FROM shots_on_target
UNION ALL
SELECT 'Keeper Actions', COUNT(*) FROM keeper_actions
UNION ALL
SELECT 'Duels', COUNT(*) FROM duels
UNION ALL
SELECT 'Fouls', COUNT(*) FROM fouls
UNION ALL
SELECT 'Set Pieces', COUNT(*) FROM set_pieces
UNION ALL
SELECT 'Possession Rows', COUNT(*) FROM match_possession
UNION ALL
SELECT 'Performance Rows', COUNT(*) FROM match_performance
UNION ALL
SELECT 'Highlights', COUNT(*) FROM match_highlights
UNION ALL
SELECT 'Final Third Chances', COUNT(*) FROM final_third_chances
UNION ALL
SELECT 'Users', COUNT(*) FROM users;

-- Expected counts:
-- Leagues: 2
-- Teams: 6
-- Players: 120 (25+25+25+25+10+10)
-- Matches: 4
-- Pass Events: ~20
-- Shots: ~14
-- Keeper Actions: ~10
-- Duels: ~6
-- Fouls: ~3
-- Set Pieces: ~3
-- Possession Rows: ~60
-- Performance Rows: ~28
-- Highlights: ~17
-- Final Third Chances: ~6
-- Users: 7

-- ============================================
-- NEXT STEPS
-- ============================================

-- After running this file:
-- 1. Run: \i ../extras/refresh-views.sql
-- 2. Run: \i ../extras/calculate-player-attributes.sql
-- 3. Verify views: SELECT * FROM match_statistics_summary LIMIT 5;
-- 4. Verify attributes: SELECT * FROM player_attributes LIMIT 10;
