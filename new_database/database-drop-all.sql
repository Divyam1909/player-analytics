-- ============================================
-- DROP ALL TABLES - COMPLETE DATABASE RESET
-- ============================================
-- WARNING: This will permanently delete ALL data
-- Use with extreme caution!
-- ============================================

-- Drop all tables in reverse dependency order
-- (drop dependent tables before referenced tables)

-- Drop event tables first
DROP TABLE IF EXISTS public.fouls CASCADE;
DROP TABLE IF EXISTS public.set_pieces CASCADE;
DROP TABLE IF EXISTS public.final_third_chances CASCADE;
DROP TABLE IF EXISTS public.keeper_actions CASCADE;
DROP TABLE IF EXISTS public.duels CASCADE;
DROP TABLE IF EXISTS public.shots_on_target CASCADE;
DROP TABLE IF EXISTS public.pass_events CASCADE;

-- Drop match-related tables
DROP TABLE IF EXISTS public.match_captured_frames CASCADE;
DROP TABLE IF EXISTS public.match_video_notes CASCADE;
DROP TABLE IF EXISTS public.match_highlights CASCADE;
DROP TABLE IF EXISTS public.match_analytical_maps CASCADE;
DROP TABLE IF EXISTS public.match_performance CASCADE;
DROP TABLE IF EXISTS public.match_possession CASCADE;
DROP TABLE IF EXISTS public.match_statistics CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;

-- Drop player/team related tables
DROP TABLE IF EXISTS public.player_int_notes CASCADE;
DROP TABLE IF EXISTS public.player_int CASCADE;
DROP TABLE IF EXISTS public.team_leagues CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.team_profile CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.leagues CASCADE;

-- Drop other tables
DROP TABLE IF EXISTS public.knowledge CASCADE;
DROP TABLE IF EXISTS public.frame_cache CASCADE;
DROP TABLE IF EXISTS public.schema_baseline CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify all tables are dropped:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
