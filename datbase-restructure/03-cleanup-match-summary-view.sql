-- ============================================
-- 03: CLEANUP - Remove match_statistics_summary artifacts
-- ============================================
-- Removes the old materialized view triggers, refresh queue,
-- and any leftover auto-refresh logic related to
-- match_statistics_summary.
-- player_match_statistics view is LEFT UNTOUCHED.
-- ============================================

BEGIN;

-- ============================================
-- 1. DROP AUTO-REFRESH TRIGGERS ON EVENT TABLES
-- ============================================
-- These triggers queued view refreshes when event data changed.
-- Since match_statistics is now a regular table, they're no longer needed.

-- Pass events trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_pass_events ON public.pass_events;

-- Shots trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_shots ON public.shots_on_target;

-- Duels trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_duels ON public.duels;

-- Keeper actions trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_keeper_actions ON public.keeper_actions;

-- Fouls trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_fouls ON public.fouls;

-- Set pieces trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_set_pieces ON public.set_pieces;

-- Final third chances trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_final_third ON public.final_third_chances;

-- Physical stats trigger
DROP TRIGGER IF EXISTS trigger_queue_refresh_physical_stats ON public.physical_stats;

-- ============================================
-- 2. DROP REFRESH QUEUE TABLE (if exists)
-- ============================================

DROP TABLE IF EXISTS public.refresh_queue CASCADE;

-- ============================================
-- 3. DROP TRIGGER FUNCTIONS FOR AUTO-REFRESH
-- ============================================
-- These functions were used to debounce/queue materialized view refreshes

DROP FUNCTION IF EXISTS public.queue_view_refresh() CASCADE;
DROP FUNCTION IF EXISTS public.process_refresh_queue() CASCADE;
DROP FUNCTION IF EXISTS public.debounced_refresh_views() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_match_statistics() CASCADE;

-- ============================================
-- 4. VERIFY - match_statistics_summary should already be gone
-- ============================================
-- (It was dropped in 01-match-statistics-table.sql, but just in case)

DROP MATERIALIZED VIEW IF EXISTS public.match_statistics_summary CASCADE;

-- ============================================
-- NOTE: player_match_statistics materialized view is KEPT
-- ============================================
-- The player_match_statistics view and its triggers/refresh
-- logic are intentionally preserved per user decision.

COMMIT;
