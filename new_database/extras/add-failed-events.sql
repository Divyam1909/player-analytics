-- ============================================
-- ADD REALISTIC FAILED EVENTS
-- Run this to add some failed passes and duels
-- ============================================

-- Add failed passes for Dragon Warriors (to reduce their PCI from 100%)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count, failure_reason) VALUES
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000012-0000-0000-0000-000000000012', 5, 10, 35.0, 45.0, 50.0, 40.0, false, null, false, false, false, false, 0, 0, 'interception'),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 15, 30, 55.0, 50.0, 70.0, 45.0, false, null, true, false, false, false, 0, 0, 'block'),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000014-0000-0000-0000-000000000014', 30, 20, 40.0, 48.0, 55.0, 42.0, false, null, false, false, false, false, 0, 0, 'interception');

-- Add failed passes for Falcon Stars
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count, failure_reason) VALUES
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 8, 15, 38.0, 52.0, 52.0, 46.0, false, null, false, false, false, false, 0, 0, 'interception'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000007-0000-0000-0000-000000000007', 23, 40, 58.0, 48.0, 72.0, 40.0, false, null, true, false, false, false, 0, 0, 'block');

-- Add failed aerial duels for Dragon Warriors
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000005-0000-0000-0000-000000000005', 12, 45, 48.0, 52.0, 'aerial', false, 'f0000009-0000-0000-0000-000000000009', false, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000006-0000-0000-0000-000000000006', 35, 10, 44.0, 48.0, 'aerial', false, 'f0000010-0000-0000-0000-000000000010', false, 0);

-- Add failed aerial duels for Falcon Stars
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000005-0000-0000-0000-000000000005', 16, 20, 46.0, 50.0, 'aerial', false, 'd0000005-0000-0000-0000-000000000005', false, 0);

-- Refresh the view to recalculate
REFRESH MATERIALIZED VIEW match_statistics_summary;

-- Verify
SELECT match_id,
  home_possession_control_index as home_pci,
  away_possession_control_index as away_pci,
  home_recovery_pressing_efficiency as home_rpe,
  away_recovery_pressing_efficiency as away_rpe
FROM match_statistics_summary
WHERE match_id = 'a4444444-4444-4444-4444-444444444444';

SELECT 'Added failed events - metrics should now show variation!' as status;
