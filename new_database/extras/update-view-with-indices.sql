-- ============================================
-- UPDATED MATCH STATISTICS VIEW WITH PERFORMANCE INDICES
-- Run this in Supabase SQL Editor to update the view
-- ============================================

-- Drop the existing view (must drop dependent objects first if any)
DROP MATERIALIZED VIEW IF EXISTS match_statistics_summary CASCADE;

-- Recreate with calculated performance indices
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
  -- AWAY TEAM STATS
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
  COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END) AS away_chances_in_box,
  
  -- ===================
  -- CALCULATED PERFORMANCE INDICES (HOME)
  -- ===================
  
  -- Possession Control Index (PCI): Weighted combination of pass success, progressive passes, and ball control
  -- Formula: (Pass Completion % * 0.4) + (Progressive Pass % * 0.3) + (Dribble Success % * 0.3)
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND((
        (COALESCE(COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END), 0), 0) * 40) +
        (COALESCE(COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END), 0), 0) * 30) +
        (COALESCE(COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' THEN 1 END), 0), 0) * 30)
      )::INTEGER)
    ELSE 0
  END AS home_possession_control_index,
  
  -- Chance Creation Index (CCI): Key passes, assists, final third entries, chances in box
  -- Formula: (Key Passes * 10) + (Assists * 20) + (Final Third Entries * 2) + (Chances in Box * 5), capped at 100
  LEAST(100, (
    (COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END) * 10) +
    (COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END) * 20) +
    (COUNT(CASE WHEN ftc.team_id = m.home_team_id THEN 1 END) * 2) +
    (COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END) * 5)
  )) AS home_chance_creation_index,
  
  -- Shooting Efficiency (SE): Goals scored relative to shots
  -- Formula: (Goals / Shots on Target) * 100
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND((COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) * 100)::INTEGER)
    ELSE 0
  END AS home_shooting_efficiency,
  
  -- Defensive Solidity (DS): Interceptions, clearances, blocks, saves
  -- Formula: (Interceptions * 5) + (Clearances * 3) + (Blocks * 4) + (Saves * 10), capped at 100
  LEAST(100, (
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'interception' THEN 1 END) * 5) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'clearance' THEN 1 END) * 3) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.failure_reason = 'block' THEN 1 END) * 4) +
    (COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' THEN 1 END) * 10)
  )) AS home_defensive_solidity,
  
  -- Transition & Progression (T&P): Progressive passes, progressive carries, successful dribbles
  -- Formula: (Progressive Passes * 3) + (Progressive Carries * 5) + (Successful Dribbles * 4), capped at 100
  LEAST(100, (
    (COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END) * 3) +
    (COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END) * 5) +
    (COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) * 4)
  )) AS home_transition_progression,
  
  -- Recovery & Pressing Efficiency (RPE): Ball recoveries, high press actions, aerial duels won
  -- Formula: (Ball Recoveries * 5) + (High Press Actions * 8) + (Aerial Duels Won * 4), capped at 100
  LEAST(100, (
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.is_ball_recovery = true THEN 1 END) * 5) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.home_team_id) AND pe.is_high_press = true THEN 1 END) * 8) +
    (COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) * 4)
  )) AS home_recovery_pressing_efficiency,
  
  -- ===================
  -- CALCULATED PERFORMANCE INDICES (AWAY)
  -- ===================
  
  -- Possession Control Index
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND((
        (COALESCE(COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END), 0), 0) * 40) +
        (COALESCE(COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END), 0), 0) * 30) +
        (COALESCE(COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' THEN 1 END), 0), 0) * 30)
      )::INTEGER)
    ELSE 0
  END AS away_possession_control_index,
  
  -- Chance Creation Index
  LEAST(100, (
    (COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END) * 10) +
    (COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END) * 20) +
    (COUNT(CASE WHEN ftc.team_id = m.away_team_id THEN 1 END) * 2) +
    (COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END) * 5)
  )) AS away_chance_creation_index,
  
  -- Shooting Efficiency
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND((COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) * 100)::INTEGER)
    ELSE 0
  END AS away_shooting_efficiency,
  
  -- Defensive Solidity
  LEAST(100, (
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'interception' THEN 1 END) * 5) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'clearance' THEN 1 END) * 3) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.failure_reason = 'block' THEN 1 END) * 4) +
    (COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' THEN 1 END) * 10)
  )) AS away_defensive_solidity,
  
  -- Transition & Progression
  LEAST(100, (
    (COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END) * 3) +
    (COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END) * 5) +
    (COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) * 4)
  )) AS away_transition_progression,
  
  -- Recovery & Pressing Efficiency
  LEAST(100, (
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.is_ball_recovery = true THEN 1 END) * 5) +
    (COUNT(CASE WHEN pe.defending_player_id IN (SELECT id FROM players WHERE team_id = m.away_team_id) AND pe.is_high_press = true THEN 1 END) * 8) +
    (COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) * 4)
  )) AS away_recovery_pressing_efficiency

FROM matches m
LEFT JOIN pass_events pe ON pe.match_id = m.id
LEFT JOIN shots_on_target sot ON sot.match_id = m.id
LEFT JOIN duels d ON d.match_id = m.id
LEFT JOIN keeper_actions ka ON ka.match_id = m.id
LEFT JOIN fouls f ON f.match_id = m.id
LEFT JOIN set_pieces sp ON sp.match_id = m.id
LEFT JOIN final_third_chances ftc ON ftc.match_id = m.id
GROUP BY m.id, m.home_team_id, m.away_team_id, m.our_team_id;

-- Recreate indexes
CREATE INDEX idx_match_stats_summary_match ON match_statistics_summary(match_id);
CREATE INDEX idx_match_stats_summary_home_team ON match_statistics_summary(home_team_id);
CREATE INDEX idx_match_stats_summary_away_team ON match_statistics_summary(away_team_id);

-- Add comment
COMMENT ON MATERIALIZED VIEW match_statistics_summary IS 'Aggregated match statistics with calculated performance indices (cached)';

-- Refresh to populate data
REFRESH MATERIALIZED VIEW match_statistics_summary;

-- Also refresh player stats
REFRESH MATERIALIZED VIEW player_match_statistics;

-- Verification query
SELECT 
    match_id,
    home_possession_control_index as home_pci,
    home_chance_creation_index as home_cci,
    home_shooting_efficiency as home_se,
    home_defensive_solidity as home_ds,
    home_transition_progression as home_tp,
    home_recovery_pressing_efficiency as home_rpe,
    away_possession_control_index as away_pci,
    away_chance_creation_index as away_cci,
    away_shooting_efficiency as away_se
FROM match_statistics_summary;

SELECT 'SUCCESS: View updated with performance indices!' as status;
