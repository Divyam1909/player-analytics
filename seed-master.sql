-- ============================================
-- MASTER SEED FILE
-- Player Analytics - Complete Database Seed
-- ============================================
-- This file combines all seed data into one executable script
-- Run this file to seed the complete database with:
--   - 2 Leagues
--   - 4 Teams (2 per league)
--   - 100 Players (25 per team)
--   - 4 Matches (2 per league)
--   - Complete statistics for all matches
-- ============================================
--
-- HOW TO RUN:
-- Option 1: Run each seed file in order (seed-1 through seed-10)
-- Option 2: Copy content from each file into Supabase SQL Editor
--
-- ORDER OF EXECUTION:
-- 1. seed-1-leagues-teams.sql    - Leagues & Teams
-- 2. seed-2-players-league1.sql  - Mumbai Warriors & Pune Strikers players
-- 3. seed-3-players-league2.sql  - Delhi United & Bangalore FC players
-- 4. seed-4-matches.sql          - Matches & Statistics
-- 5. seed-5-passes-match1.sql    - Pass events for Match 1
-- 6. seed-6-passes-match2.sql    - Pass events for Match 2
-- 7. seed-7-passes-league2.sql   - Pass events for Matches 3 & 4
-- 8. seed-8-shots.sql            - Shots on target for all matches
-- 9. seed-9-duels.sql            - Duels for all matches
-- 10. seed-10-extras.sql         - Keeper actions, chances, highlights, notes
-- ============================================

-- IMPORTANT: Include all files in order below

-- ============================================
-- FILE 1: LEAGUES & TEAMS
-- ============================================
\i 'seed-1-leagues-teams.sql'

-- ============================================
-- FILE 2: PLAYERS - LEAGUE 1
-- ============================================
\i 'seed-2-players-league1.sql'

-- ============================================
-- FILE 3: PLAYERS - LEAGUE 2
-- ============================================
\i 'seed-3-players-league2.sql'

-- ============================================
-- FILE 4: MATCHES & STATISTICS
-- ============================================
\i 'seed-4-matches.sql'

-- ============================================
-- FILE 5: PASS EVENTS - MATCH 1
-- ============================================
\i 'seed-5-passes-match1.sql'

-- ============================================
-- FILE 6: PASS EVENTS - MATCH 2
-- ============================================
\i 'seed-6-passes-match2.sql'

-- ============================================
-- FILE 7: PASS EVENTS - LEAGUE 2
-- ============================================
\i 'seed-7-passes-league2.sql'

-- ============================================
-- FILE 8: SHOTS ON TARGET
-- ============================================
\i 'seed-8-shots.sql'

-- ============================================
-- FILE 9: DUELS
-- ============================================
\i 'seed-9-duels.sql'

-- ============================================
-- FILE 10: EXTRAS (Keeper, Chances, Highlights)
-- ============================================
\i 'seed-10-extras.sql'

-- ============================================
-- VERIFICATION QUERIES
-- Uncomment and run to verify data was inserted
-- ============================================
/*
SELECT 'leagues' as table_name, COUNT(*) as count FROM public.leagues
UNION ALL SELECT 'teams', COUNT(*) FROM public.teams
UNION ALL SELECT 'players', COUNT(*) FROM public.players
UNION ALL SELECT 'matches', COUNT(*) FROM public.matches
UNION ALL SELECT 'match_statistics', COUNT(*) FROM public.match_statistics
UNION ALL SELECT 'pass_events', COUNT(*) FROM public.pass_events
UNION ALL SELECT 'shots_on_target', COUNT(*) FROM public.shots_on_target
UNION ALL SELECT 'duels', COUNT(*) FROM public.duels
UNION ALL SELECT 'keeper_actions', COUNT(*) FROM public.keeper_actions
UNION ALL SELECT 'final_third_chances', COUNT(*) FROM public.final_third_chances
UNION ALL SELECT 'match_highlights', COUNT(*) FROM public.match_highlights
UNION ALL SELECT 'match_video_notes', COUNT(*) FROM public.match_video_notes
UNION ALL SELECT 'team_leagues', COUNT(*) FROM public.team_leagues
UNION ALL SELECT 'match_possession', COUNT(*) FROM public.match_possession
UNION ALL SELECT 'match_performance', COUNT(*) FROM public.match_performance
UNION ALL SELECT 'match_analytical_maps', COUNT(*) FROM public.match_analytical_maps
ORDER BY table_name;
*/

-- ============================================
-- EXPECTED COUNTS AFTER SEEDING:
-- ============================================
-- leagues:              2
-- teams:                4
-- players:             100
-- team_leagues:         4
-- matches:              4
-- match_statistics:     4
-- match_possession:    28 (7 per match × 4)
-- match_performance:   28 (7 per match × 4)
-- match_analytical_maps: 4
-- pass_events:        ~100+
-- shots_on_target:    ~60
-- duels:              ~60
-- keeper_actions:     ~35
-- final_third_chances: ~35
-- match_highlights:   ~30
-- match_video_notes:   ~9
-- ============================================

-- ============================================
-- DATA STRUCTURE OVERVIEW:
-- ============================================
-- 
-- LEAGUE 1: Premier Football League (professional)
--   ├── Mumbai Warriors (Team ID: aaaa1111-1111-1111-1111-aaaaaaaaaaaa)
--   │   └── 25 players (p1-mw-01 through p1-mw-25)
--   │
--   └── Pune Strikers (Team ID: bbbb2222-2222-2222-2222-bbbbbbbbbbbb)
--       └── 25 players (p2-ps-01 through p2-ps-25)
--
--   Matches:
--   ├── Match 1: Mumbai Warriors 3-1 Pune Strikers (Home)
--   └── Match 2: Pune Strikers 2-2 Mumbai Warriors (Away)
--
-- LEAGUE 2: National Youth Championship (youth)
--   ├── Delhi United (Team ID: cccc3333-3333-3333-3333-cccccccccccc)
--   │   └── 25 players (p3-du-01 through p3-du-25)
--   │
--   └── Bangalore FC (Team ID: dddd4444-4444-4444-4444-dddddddddddd)
--       └── 25 players (p4-bf-01 through p4-bf-25)
--
--   Matches:
--   ├── Match 3: Delhi United 4-2 Bangalore FC (Home)
--   └── Match 4: Bangalore FC 1-3 Delhi United (Away)
--
-- ============================================

NOTIFY seed_complete;
