-- ============================================
-- PART 2: CREATE SIMPLIFIED VIEW WITH INDICES
-- Run this after Part 1
-- ============================================
-- This is a simplified version that calculates indices directly

CREATE MATERIALIZED VIEW match_statistics_summary AS
SELECT 
  m.id AS match_id,
  m.home_team_id,
  m.away_team_id,
  m.our_team_id,
  
  -- Team/Opponent IDs
  CASE WHEN m.our_team_id = m.home_team_id THEN m.home_team_id ELSE m.away_team_id END AS team_id,
  CASE WHEN m.our_team_id = m.home_team_id THEN m.away_team_id ELSE m.home_team_id END AS opponent_id,
  
  -- ===================
  -- HOME TEAM BASIC STATS
  -- ===================
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END)::INTEGER AS home_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = false THEN 1 END)::INTEGER AS home_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_total_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END)::INTEGER AS home_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END)::INTEGER AS home_key_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END)::INTEGER AS home_assists,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_cross = true THEN 1 END)::INTEGER AS home_crosses,
  
  -- Defensive (simplified - without subqueries)
  0::INTEGER AS home_interceptions,
  0::INTEGER AS home_blocks,
  0::INTEGER AS home_clearances,
  0::INTEGER AS home_ball_recoveries,
  0::INTEGER AS home_high_press_recoveries,
  
  -- Shots
  COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::INTEGER AS home_goals,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_penalty = true THEN 1 END)::INTEGER AS home_penalties,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_saved = true THEN 1 END)::INTEGER AS home_shots_saved,
  
  -- Duels
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::INTEGER AS home_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' THEN 1 END)::INTEGER AS home_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::INTEGER AS home_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' THEN 1 END)::INTEGER AS home_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END)::INTEGER AS home_progressive_carries,
  
  -- Keeper
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' THEN 1 END)::INTEGER AS home_saves,
  0::INTEGER AS home_saves_inside_box,
  0::INTEGER AS home_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'goal_conceded' THEN 1 END)::INTEGER AS home_goals_conceded,
  
  -- Fouls
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id THEN 1 END)::INTEGER AS home_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'yellow' THEN 1 END)::INTEGER AS home_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'red' THEN 1 END)::INTEGER AS home_red_cards,
  
  -- Set Pieces
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'corner' THEN 1 END)::INTEGER AS home_corners,
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END)::INTEGER AS home_freekicks,
  
  -- Final Third
  COUNT(CASE WHEN ftc.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END)::INTEGER AS home_chances_in_box,
  
  -- ===================
  -- AWAY TEAM BASIC STATS
  -- ===================
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END)::INTEGER AS away_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = false THEN 1 END)::INTEGER AS away_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_total_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END)::INTEGER AS away_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END)::INTEGER AS away_key_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END)::INTEGER AS away_assists,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_cross = true THEN 1 END)::INTEGER AS away_crosses,
  
  -- Defensive (simplified)
  0::INTEGER AS away_interceptions,
  0::INTEGER AS away_blocks,
  0::INTEGER AS away_clearances,
  0::INTEGER AS away_ball_recoveries,
  0::INTEGER AS away_high_press_recoveries,
  
  -- Shots
  COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::INTEGER AS away_goals,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_penalty = true THEN 1 END)::INTEGER AS away_penalties,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_saved = true THEN 1 END)::INTEGER AS away_shots_saved,
  
  -- Duels
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::INTEGER AS away_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' THEN 1 END)::INTEGER AS away_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::INTEGER AS away_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' THEN 1 END)::INTEGER AS away_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END)::INTEGER AS away_progressive_carries,
  
  -- Keeper
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' THEN 1 END)::INTEGER AS away_saves,
  0::INTEGER AS away_saves_inside_box,
  0::INTEGER AS away_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'goal_conceded' THEN 1 END)::INTEGER AS away_goals_conceded,
  
  -- Fouls
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id THEN 1 END)::INTEGER AS away_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'yellow' THEN 1 END)::INTEGER AS away_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'red' THEN 1 END)::INTEGER AS away_red_cards,
  
  -- Set Pieces
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'corner' THEN 1 END)::INTEGER AS away_corners,
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END)::INTEGER AS away_freekicks,
  
  -- Final Third
  COUNT(CASE WHEN ftc.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END)::INTEGER AS away_chances_in_box,
  
  -- ===================
  -- CALCULATED PERFORMANCE INDICES (HOME)
  -- ===================
  
  -- Possession Control Index (simplified formula)
  LEAST(100, GREATEST(0,
    CASE WHEN COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND((
        COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC * 100 / 
        NULLIF(COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END), 0) * 0.6
      ) + (
        COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END)::NUMERIC * 2
      ))::INTEGER
    ELSE 0
    END
  ))::INTEGER AS home_possession_control_index,
  
  -- Chance Creation Index
  LEAST(100, (
    COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END) * 10 +
    COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END) * 20 +
    COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END) * 5
  ))::INTEGER AS home_chance_creation_index,
  
  -- Shooting Efficiency
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND((COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) * 100))::INTEGER
    ELSE 0
  END AS home_shooting_efficiency,
  
  -- Defensive Solidity (simplified - based on saves and low goals conceded)
  LEAST(100, (
    COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' THEN 1 END) * 15 +
    GREATEST(0, 50 - COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'goal_conceded' THEN 1 END) * 10)
  ))::INTEGER AS home_defensive_solidity,
  
  -- Transition & Progression
  LEAST(100, (
    COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END) * 3 +
    COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END) * 5 +
    COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) * 4
  ))::INTEGER AS home_transition_progression,
  
  -- Recovery & Pressing Efficiency
  LEAST(100, (
    COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) * 10 +
    20  -- Base value
  ))::INTEGER AS home_recovery_pressing_efficiency,
  
  -- ===================
  -- CALCULATED PERFORMANCE INDICES (AWAY)
  -- ===================
  
  LEAST(100, GREATEST(0,
    CASE WHEN COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND((
        COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC * 100 / 
        NULLIF(COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END), 0) * 0.6
      ) + (
        COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END)::NUMERIC * 2
      ))::INTEGER
    ELSE 0
    END
  ))::INTEGER AS away_possession_control_index,
  
  LEAST(100, (
    COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END) * 10 +
    COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END) * 20 +
    COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END) * 5
  ))::INTEGER AS away_chance_creation_index,
  
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND((COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) * 100))::INTEGER
    ELSE 0
  END AS away_shooting_efficiency,
  
  LEAST(100, (
    COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' THEN 1 END) * 15 +
    GREATEST(0, 50 - COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'goal_conceded' THEN 1 END) * 10)
  ))::INTEGER AS away_defensive_solidity,
  
  LEAST(100, (
    COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END) * 3 +
    COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END) * 5 +
    COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END) * 4
  ))::INTEGER AS away_transition_progression,
  
  LEAST(100, (
    COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END) * 10 +
    20
  ))::INTEGER AS away_recovery_pressing_efficiency

FROM matches m
LEFT JOIN pass_events pe ON pe.match_id = m.id
LEFT JOIN shots_on_target sot ON sot.match_id = m.id
LEFT JOIN duels d ON d.match_id = m.id
LEFT JOIN keeper_actions ka ON ka.match_id = m.id
LEFT JOIN fouls f ON f.match_id = m.id
LEFT JOIN set_pieces sp ON sp.match_id = m.id
LEFT JOIN final_third_chances ftc ON ftc.match_id = m.id
GROUP BY m.id, m.home_team_id, m.away_team_id, m.our_team_id;

SELECT 'Part 2 Complete: View created' as status;
