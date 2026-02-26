-- ============================================
-- Migration 05: Update player_match_statistics Materialized View
-- ============================================
-- Adds missing columns needed by the frontend:
--   tackles, passes_in_box, ball_touches, shots_off_target
-- 
-- NOTE: Materialized views cannot be ALTERed. 
-- Must DROP and RECREATE with the new columns.
-- After running, you MUST refresh: REFRESH MATERIALIZED VIEW player_match_statistics;
-- ============================================

-- Drop existing indexes first
DROP INDEX IF EXISTS idx_player_match_stats_match;
DROP INDEX IF EXISTS idx_player_match_stats_player;
DROP INDEX IF EXISTS idx_player_match_stats_team;

-- Drop and recreate the materialized view
DROP MATERIALIZED VIEW IF EXISTS player_match_statistics;

CREATE MATERIALIZED VIEW player_match_statistics AS
WITH player_matches AS (
  -- Get distinct player-match combinations from all event tables
  SELECT DISTINCT match_id, player_id FROM pass_events
  UNION
  SELECT DISTINCT match_id, player_id FROM shots_on_target
  UNION
  SELECT DISTINCT match_id, player_id FROM duels
  UNION
  SELECT DISTINCT match_id, player_id FROM keeper_actions
  UNION
  SELECT DISTINCT match_id, player_id FROM set_pieces
  UNION
  SELECT DISTINCT match_id, player_id FROM final_third_chances
  UNION
  SELECT DISTINCT match_id, defending_player_id FROM pass_events WHERE defending_player_id IS NOT NULL
  UNION
  SELECT DISTINCT match_id, fouling_player_id FROM fouls
  UNION
  SELECT DISTINCT match_id, fouled_player_id FROM fouls
)
SELECT 
  pm.match_id,
  pm.player_id,
  p.first_name,
  p.last_name,
  p.position,
  p.team_id,
  
  -- ===================
  -- PASSING STATS
  -- ===================
  COUNT(CASE WHEN pe.is_successful = true THEN 1 END) AS successful_passes,
  COUNT(CASE WHEN pe.is_successful = false THEN 1 END) AS unsuccessful_passes,
  COUNT(pe.id) AS total_passes,
  COUNT(CASE WHEN pe.is_progressive_pass = true THEN 1 END) AS progressive_passes,
  COUNT(CASE WHEN pe.is_key_pass = true THEN 1 END) AS key_passes,
  COUNT(CASE WHEN pe.is_assist = true THEN 1 END) AS assists,
  COUNT(CASE WHEN pe.is_cross = true THEN 1 END) AS crosses,
  SUM(COALESCE(pe.outplays_players_count, 0)) AS total_players_outplayed_passing,
  SUM(COALESCE(pe.outplays_lines_count, 0)) AS total_lines_outplayed,
  COUNT(CASE WHEN pe.pass_length = 'long' THEN 1 END) AS long_passes,
  COUNT(CASE WHEN pe.pass_length = 'short' THEN 1 END) AS short_passes,
  
  -- NEW: Passes into the box (end_x >= 83.5 AND end_y BETWEEN 21.1 AND 78.9 — 18-yard box area)
  COUNT(CASE WHEN pe.end_x >= 83.5 AND pe.end_y BETWEEN 21.1 AND 78.9 THEN 1 END) AS passes_in_box,
  
  -- ===================
  -- DEFENSIVE STATS (as defending player)
  -- ===================
  COUNT(CASE WHEN pe_defense.failure_reason = 'interception' THEN 1 END) AS interceptions,
  COUNT(CASE WHEN pe_defense.failure_reason = 'block' THEN 1 END) AS blocks,
  COUNT(CASE WHEN pe_defense.failure_reason = 'clearance' THEN 1 END) AS clearances,
  COUNT(CASE WHEN pe_defense.is_ball_recovery = true THEN 1 END) AS ball_recoveries,
  COUNT(CASE WHEN pe_defense.is_high_press = true THEN 1 END) AS high_press_actions,
  
  -- NEW: Tackles (counted from failure_reason = 'tackle' where this player is the defender)
  COUNT(CASE WHEN pe_defense.failure_reason = 'tackle' OR pe_defense.failure_subtype = 'tackle' THEN 1 END) AS tackles,
  
  -- ===================
  -- SHOOTING STATS
  -- ===================
  COUNT(sot.id) AS shots_on_target,
  COUNT(CASE WHEN sot.is_goal = true THEN 1 END) AS goals,
  COUNT(CASE WHEN sot.is_penalty = true THEN 1 END) AS penalties_scored,
  -- NEW: Shots off target
  COUNT(CASE WHEN sot.shot_result = 'off_target' THEN 1 END) AS shots_off_target,
  
  -- ===================
  -- DUEL STATS
  -- ===================
  COUNT(CASE WHEN d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) AS aerial_duels_won,
  COUNT(CASE WHEN d.duel_type = 'aerial' THEN 1 END) AS aerial_duels_total,
  COUNT(CASE WHEN d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) AS successful_dribbles,
  COUNT(CASE WHEN d.duel_type = 'dribble' THEN 1 END) AS total_dribbles,
  COUNT(CASE WHEN d.is_progressive_carry = true THEN 1 END) AS progressive_carries,
  SUM(COALESCE(d.players_outplayed_count, 0)) AS total_players_outplayed_dribbling,
  
  -- ===================
  -- GOALKEEPER STATS
  -- ===================
  COUNT(CASE WHEN ka.action_type = 'save' THEN 1 END) AS saves,
  COUNT(CASE WHEN ka.action_type = 'save' AND ka.save_location = 'inside_box' THEN 1 END) AS saves_inside_box,
  COUNT(CASE WHEN ka.action_type = 'save' AND ka.save_location = 'outside_box' THEN 1 END) AS saves_outside_box,
  COUNT(CASE WHEN ka.action_type = 'goal_conceded' THEN 1 END) AS goals_conceded,
  COUNT(CASE WHEN ka.action_type = 'collection' THEN 1 END) AS ball_collections,
  
  -- ===================
  -- FOUL STATS
  -- ===================
  COUNT(CASE WHEN f_fouling.id IS NOT NULL THEN 1 END) AS fouls_committed,
  COUNT(CASE WHEN f_fouled.id IS NOT NULL THEN 1 END) AS fouls_won,
  COUNT(CASE WHEN f_fouling.card_given = 'yellow' THEN 1 END) AS yellow_cards,
  COUNT(CASE WHEN f_fouling.card_given = 'red' THEN 1 END) AS red_cards,
  
  -- ===================
  -- SET PIECE STATS
  -- ===================
  COUNT(CASE WHEN sp.set_piece_type = 'corner' THEN 1 END) AS corners_taken,
  COUNT(CASE WHEN sp.set_piece_type = 'free_kick' THEN 1 END) AS freekicks_taken,
  
  -- ===================
  -- FINAL THIRD STATS
  -- ===================
  COUNT(ftc.id) AS final_third_touches,
  
  -- ===================
  -- NEW: Ball Touches (total involvement across all event types)
  -- ===================
  (
    COUNT(pe.id) +                    -- passes
    COUNT(sot.id) +                   -- shots
    COUNT(d.id) +                     -- duels
    COUNT(sp.id) +                    -- set pieces
    COUNT(ftc.id)                     -- final third chances
  ) AS ball_touches,
  
  -- ===================
  -- PHYSICAL STATS (joined from physical_stats table)
  -- ===================
  ps.distance_covered_meters,
  ps.sprint_count,
  ps.high_intensity_runs,
  ps.minutes_played

FROM player_matches pm
JOIN players p ON p.id = pm.player_id
LEFT JOIN pass_events pe ON pe.match_id = pm.match_id AND pe.player_id = pm.player_id
LEFT JOIN pass_events pe_defense ON pe_defense.match_id = pm.match_id AND pe_defense.defending_player_id = pm.player_id
LEFT JOIN shots_on_target sot ON sot.match_id = pm.match_id AND sot.player_id = pm.player_id
LEFT JOIN duels d ON d.match_id = pm.match_id AND d.player_id = pm.player_id
LEFT JOIN keeper_actions ka ON ka.match_id = pm.match_id AND ka.player_id = pm.player_id
LEFT JOIN fouls f_fouling ON f_fouling.match_id = pm.match_id AND f_fouling.fouling_player_id = pm.player_id
LEFT JOIN fouls f_fouled ON f_fouled.match_id = pm.match_id AND f_fouled.fouled_player_id = pm.player_id
LEFT JOIN set_pieces sp ON sp.match_id = pm.match_id AND sp.player_id = pm.player_id
LEFT JOIN final_third_chances ftc ON ftc.match_id = pm.match_id AND ftc.player_id = pm.player_id
LEFT JOIN physical_stats ps ON ps.match_id = pm.match_id AND ps.player_id = pm.player_id
GROUP BY pm.match_id, pm.player_id, p.first_name, p.last_name, p.position, p.team_id,
         ps.distance_covered_meters, ps.sprint_count, ps.high_intensity_runs, ps.minutes_played;

COMMENT ON MATERIALIZED VIEW player_match_statistics IS 'Per-player statistics aggregated per match (cached). Includes tackles, passes_in_box, ball_touches, shots_off_target.';

-- Recreate indexes
CREATE INDEX idx_player_match_stats_match ON player_match_statistics(match_id);
CREATE INDEX idx_player_match_stats_player ON player_match_statistics(player_id);
CREATE INDEX idx_player_match_stats_team ON player_match_statistics(team_id);

-- Initial refresh
-- REFRESH MATERIALIZED VIEW player_match_statistics;

-- ============================================
-- DONE
-- ============================================
