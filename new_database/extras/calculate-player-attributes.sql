-- ============================================
-- RUN AFTER SEED DATA IS LOADED
-- Calculate initial player attributes from match data
-- ============================================

-- Step 1: Load the calculation functions
-- Run: database-player-attributes-calculation.sql

-- Step 2: Calculate attributes for all players
SELECT update_all_player_attributes();

-- Step 3: Verify results
SELECT 
  p.first_name || ' ' || COALESCE(p.last_name, '') as player_name,
  p.position,
  pa.passing,
  pa.shooting,
  pa.dribbling,
  pa.defending,
  pa.physical,
  pa.overall_rating,
  pa.is_manual,
  pa.last_calculated_at
FROM players p
JOIN player_attributes pa ON pa.player_id = p.id
ORDER BY pa.overall_rating DESC;

-- ============================================
-- REFRESH AFTER NEW MATCHES
-- ============================================
-- After adding new match data, recalculate player ratings:

-- Option 1: Update all players
-- SELECT update_all_player_attributes();

-- Option 2: Update specific player
-- SELECT update_player_attributes('player-uuid-here');

-- ============================================
-- MANUAL OVERRIDES
-- ============================================
-- Coaches can manually adjust ratings if needed:

-- UPDATE player_attributes 
-- SET 
--   passing = 88,
--   shooting = 75,
--   dribbling = 82,
--   defending = 45,
--   physical = 78,
--   overall_rating = 74,
--   is_manual = true
-- WHERE player_id = 'player-uuid-here';

-- To revert to auto-calculation:
-- UPDATE player_attributes SET is_manual = false WHERE player_id = 'player-uuid-here';
-- SELECT update_player_attributes('player-uuid-here');
