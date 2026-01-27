-- ============================================
-- PART 1: DROP EXISTING VIEW
-- Run this first
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS match_statistics_summary CASCADE;

SELECT 'Part 1 Complete: View dropped' as status;
