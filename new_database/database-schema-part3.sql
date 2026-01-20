-- ============================================
-- NEW DATABASE SCHEMA - PART 3
-- MATERIALIZED VIEWS for Aggregated Statistics
-- ============================================
-- These materialized views replace the old match_statistics table
-- They compute statistics from event data and CACHE the results
-- Much faster than regular views, but need manual refresh after data changes
-- ============================================

-- MATERIALIZED VIEW: Match Statistics Summary
-- Aggregates all basic match statistics from event tables
-- CACHED for fast access - refresh after importing match data
CREATE MATERIALIZED VIEW match_statistics_summary AS
SELECT 
  m.id AS match_id,
  m.home_team_id,
  m.away_team_id,
  m.our_team_id,
  
  -- Determine which team is "team" and which is "opponent" based on our_team_id
  CASE WHEN m.our_team_id = m.home_team_id THEN m.home_team_id ELSE m.away_team_id END AS team_id,
  CASE WHEN m.our_team_id = m.home_team_id THEN m.away_team_id ELSE m.home_team_id END AS opponent_id,
  
  -- ===================
  -- HOME TEAM STATS
  -- ===================
  
  -- Passes
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END) AS home_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = false THEN 1 END) AS home_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END) AS home_total_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END) AS home_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END) AS home_key_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END) AS home_assists,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_cross = true THEN 1 END) AS home_crosses,
  
  -- Interceptions & Defensive Actions
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'interception' THEN 1 END) AS home_interceptions,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'block' THEN 1 END) AS home_blocks,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'clearance' THEN 1 END) AS home_clearances,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.is_ball_recovery = true THEN 1 END) AS home_ball_recoveries,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.is_high_press = true THEN 1 END) AS home_high_press_recoveries,
  
  -- Shots
  COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) AS home_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END) AS home_goals,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_penalty = true THEN 1 END) AS home_penalties,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_saved = true THEN 1 END) AS home_shots_saved,
  
  -- Duels
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) AS home_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' THEN 1 END) AS home_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) AS home_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' THEN 1 END) AS home_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END) AS home_progressive_carries,
  
  -- Keeper Actions
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' THEN 1 END) AS home_saves,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' AND ka.save_location = 'inside_box' THEN 1 END) AS home_saves_inside_box,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' AND ka.save_location = 'outside_box' THEN 1 END) AS home_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'goal_conceded' THEN 1 END) AS home_goals_conceded,
  
  -- Fouls
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id THEN 1 END) AS home_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'yellow' THEN 1 END) AS home_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'red' THEN 1 END) AS home_red_cards,
  
  -- Set Pieces
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'corner' THEN 1 END) AS home_corners,
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END) AS home_freekicks,
  
  -- Final Third
  COUNT(CASE WHEN ftc.team_id = m.home_team_id THEN 1 END) AS home_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END) AS home_chances_in_box,
  
  -- ===================
  -- AWAY TEAM STATS (same as above but for away team)
  -- ===================
  
  -- Passes
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END) AS away_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = false THEN 1 END) AS away_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END) AS away_total_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END) AS away_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END) AS away_key_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END) AS away_assists,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_cross = true THEN 1 END) AS away_crosses,
  
  -- Interceptions & Defensive Actions
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'interception' THEN 1 END) AS away_interceptions,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'block' THEN 1 END) AS away_blocks,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'clearance' THEN 1 END) AS away_clearances,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.is_ball_recovery = true THEN 1 END) AS away_ball_recoveries,
  COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.is_high_press = true THEN 1 END) AS away_high_press_recoveries,
  
  -- Shots
  COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) AS away_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END) AS away_goals,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_penalty = true THEN 1 END) AS away_penalties,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_saved = true THEN 1 END) AS away_shots_saved,
  
  -- Duels
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) AS away_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' THEN 1 END) AS away_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) AS away_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' THEN 1 END) AS away_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END) AS away_progressive_carries,
  
  -- Keeper Actions
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' THEN 1 END) AS away_saves,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' AND ka.save_location = 'inside_box' THEN 1 END) AS away_saves_inside_box,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' AND ka.save_location = 'outside_box' THEN 1 END) AS away_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'goal_conceded' THEN 1 END) AS away_goals_conceded,
  
  -- Fouls
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id THEN 1 END) AS away_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'yellow' THEN 1 END) AS away_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'red' THEN 1 END) AS away_red_cards,
  
  -- Set Pieces
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'corner' THEN 1 END) AS away_corners,
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END) AS away_freekicks,
  
  -- Final Third
  COUNT(CASE WHEN ftc.team_id = m.away_team_id THEN 1 END) AS away_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END) AS away_chances_in_box

FROM matches m
LEFT JOIN pass_events pe ON pe.match_id = m.id
LEFT JOIN shots_on_target sot ON sot.match_id = m.id
LEFT JOIN duels d ON d.match_id = m.id
LEFT JOIN keeper_actions ka ON ka.match_id = m.id
LEFT JOIN fouls f ON f.match_id = m.id
LEFT JOIN set_pieces sp ON sp.match_id = m.id
LEFT JOIN final_third_chances ftc ON ftc.match_id = m.id
GROUP BY m.id, m.home_team_id, m.away_team_id, m.our_team_id;

COMMENT ON MATERIALIZED VIEW match_statistics_summary IS 'Aggregated match statistics computed from all event tables (cached)';

CREATE INDEX idx_match_stats_summary_match ON match_statistics_summary(match_id);
CREATE INDEX idx_match_stats_summary_home_team ON match_statistics_summary(home_team_id);
CREATE INDEX idx_match_stats_summary_away_team ON match_statistics_summary(away_team_id);

-- ============================================
-- MATERIALIZED VIEW: Player Match Statistics
-- Per-player statistics for a specific match
-- CACHED for fast access - refresh after importing match data
-- ============================================

CREATE MATERIALIZED VIEW player_match_statistics AS
WITH player_matches AS (
  -- Get distinct player-match combinations from all event tables
  -- Only include players who actually participated in the match
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
  
  -- Passing stats
  COUNT(CASE WHEN pe.is_successful = true THEN 1 END) AS successful_passes,
  COUNT(CASE WHEN pe.is_successful = false THEN 1 END) AS unsuccessful_passes,
  COUNT(pe.id) AS total_passes,
  COUNT(CASE WHEN pe.is_progressive_pass = true THEN 1 END) AS progressive_passes,
  COUNT(CASE WHEN pe.is_key_pass = true THEN 1 END) AS key_passes,
  COUNT(CASE WHEN pe.is_assist = true THEN 1 END) AS assists,
  COUNT(CASE WHEN pe.is_cross = true THEN 1 END) AS crosses,
  SUM(COALESCE(pe.outplays_players_count, 0)) AS total_players_outplayed_passing,
  SUM(COALESCE(pe.outplays_lines_count, 0)) AS total_lines_outplayed,
  
  -- Defensive stats (as defending player)
  COUNT(CASE WHEN pe_defense.failure_reason = 'interception' THEN 1 END) AS interceptions,
  COUNT(CASE WHEN pe_defense.failure_reason = 'block' THEN 1 END) AS blocks,
  COUNT(CASE WHEN pe_defense.failure_reason = 'clearance' THEN 1 END) AS clearances,
  COUNT(CASE WHEN pe_defense.is_ball_recovery = true THEN 1 END) AS ball_recoveries,
  COUNT(CASE WHEN pe_defense.is_high_press = true THEN 1 END) AS high_press_actions,
  
  -- Shooting stats
  COUNT(sot.id) AS shots_on_target,
  COUNT(CASE WHEN sot.is_goal = true THEN 1 END) AS goals,
  COUNT(CASE WHEN sot.is_penalty = true THEN 1 END) AS penalties_scored,
  
  -- Duel stats
  COUNT(CASE WHEN d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) AS aerial_duels_won,
  COUNT(CASE WHEN d.duel_type = 'aerial' THEN 1 END) AS aerial_duels_total,
  COUNT(CASE WHEN d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) AS successful_dribbles,
  COUNT(CASE WHEN d.duel_type = 'dribble' THEN 1 END) AS total_dribbles,
  COUNT(CASE WHEN d.is_progressive_carry = true THEN 1 END) AS progressive_carries,
  SUM(COALESCE(d.players_outplayed_count, 0)) AS total_players_outplayed_dribbling,
  
  -- Goalkeeper stats
  COUNT(CASE WHEN ka.action_type = 'save' THEN 1 END) AS saves,
  COUNT(CASE WHEN ka.action_type = 'save' AND ka.save_location = 'inside_box' THEN 1 END) AS saves_inside_box,
  COUNT(CASE WHEN ka.action_type = 'save' AND ka.save_location = 'outside_box' THEN 1 END) AS saves_outside_box,
  COUNT(CASE WHEN ka.action_type = 'goal_conceded' THEN 1 END) AS goals_conceded,
  COUNT(CASE WHEN ka.action_type = 'collection' THEN 1 END) AS ball_collections,
  
  -- Foul stats
  COUNT(CASE WHEN f_fouling.id IS NOT NULL THEN 1 END) AS fouls_committed,
  COUNT(CASE WHEN f_fouled.id IS NOT NULL THEN 1 END) AS fouls_won,
  COUNT(CASE WHEN f_fouling.card_given = 'yellow' THEN 1 END) AS yellow_cards,
  COUNT(CASE WHEN f_fouling.card_given = 'red' THEN 1 END) AS red_cards,
  
  -- Set piece stats
  COUNT(CASE WHEN sp.set_piece_type = 'corner' THEN 1 END) AS corners_taken,
  COUNT(CASE WHEN sp.set_piece_type = 'free_kick' THEN 1 END) AS freekicks_taken,
  
  -- Final third stats
  COUNT(ftc.id) AS final_third_touches

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
GROUP BY pm.match_id, pm.player_id, p.first_name, p.last_name, p.position, p.team_id;

COMMENT ON MATERIALIZED VIEW player_match_statistics IS 'Per-player statistics aggregated per match (cached)';

CREATE INDEX idx_player_match_stats_match ON player_match_statistics(match_id);
CREATE INDEX idx_player_match_stats_player ON player_match_statistics(player_id);
CREATE INDEX idx_player_match_stats_team ON player_match_statistics(team_id);

-- ============================================
-- HOW TO REFRESH MATERIALIZED VIEWS
-- ============================================
-- After inserting or updating match event data, refresh the views:

-- REFRESH MATERIALIZED VIEW match_statistics_summary;
-- REFRESH MATERIALIZED VIEW player_match_statistics;

-- You can also refresh concurrently (allows reads during refresh):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY match_statistics_summary;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY player_match_statistics;

-- To refresh both at once:
-- REFRESH MATERIALIZED VIEW match_statistics_summary;
-- REFRESH MATERIALIZED VIEW player_match_statistics;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate conversion rate
CREATE OR REPLACE FUNCTION calculate_conversion_rate(goals INTEGER, shots INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  IF shots = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((goals::NUMERIC / shots::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate pass completion rate
CREATE OR REPLACE FUNCTION calculate_pass_completion_rate(successful INTEGER, total INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  IF total = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((successful::NUMERIC / total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
