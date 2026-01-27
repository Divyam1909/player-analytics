-- ============================================
-- FINAL FIX: BALANCED PERFORMANCE INDICES
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS match_statistics_summary CASCADE;

CREATE MATERIALIZED VIEW match_statistics_summary AS
SELECT 
  m.id AS match_id,
  m.home_team_id,
  m.away_team_id,
  m.our_team_id,
  CASE WHEN m.our_team_id = m.home_team_id THEN m.home_team_id ELSE m.away_team_id END AS team_id,
  CASE WHEN m.our_team_id = m.home_team_id THEN m.away_team_id ELSE m.home_team_id END AS opponent_id,
  
  -- HOME BASIC STATS
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END)::INTEGER AS home_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = false THEN 1 END)::INTEGER AS home_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_total_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END)::INTEGER AS home_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END)::INTEGER AS home_key_passes,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END)::INTEGER AS home_assists,
  COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_cross = true THEN 1 END)::INTEGER AS home_crosses,
  0::INTEGER AS home_interceptions, 0::INTEGER AS home_blocks, 0::INTEGER AS home_clearances,
  0::INTEGER AS home_ball_recoveries, 0::INTEGER AS home_high_press_recoveries,
  COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::INTEGER AS home_goals,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_penalty = true THEN 1 END)::INTEGER AS home_penalties,
  COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_saved = true THEN 1 END)::INTEGER AS home_shots_saved,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::INTEGER AS home_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' THEN 1 END)::INTEGER AS home_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::INTEGER AS home_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'dribble' THEN 1 END)::INTEGER AS home_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END)::INTEGER AS home_progressive_carries,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'save' THEN 1 END)::INTEGER AS home_saves,
  0::INTEGER AS home_saves_inside_box, 0::INTEGER AS home_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.home_team_id AND ka.action_type = 'goal_conceded' THEN 1 END)::INTEGER AS home_goals_conceded,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id THEN 1 END)::INTEGER AS home_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'yellow' THEN 1 END)::INTEGER AS home_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.home_team_id AND f.card_given = 'red' THEN 1 END)::INTEGER AS home_red_cards,
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'corner' THEN 1 END)::INTEGER AS home_corners,
  COUNT(CASE WHEN sp.team_id = m.home_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END)::INTEGER AS home_freekicks,
  COUNT(CASE WHEN ftc.team_id = m.home_team_id THEN 1 END)::INTEGER AS home_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END)::INTEGER AS home_chances_in_box,

  -- AWAY BASIC STATS
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END)::INTEGER AS away_successful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = false THEN 1 END)::INTEGER AS away_unsuccessful_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_total_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END)::INTEGER AS away_progressive_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END)::INTEGER AS away_key_passes,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END)::INTEGER AS away_assists,
  COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_cross = true THEN 1 END)::INTEGER AS away_crosses,
  0::INTEGER AS away_interceptions, 0::INTEGER AS away_blocks, 0::INTEGER AS away_clearances,
  0::INTEGER AS away_ball_recoveries, 0::INTEGER AS away_high_press_recoveries,
  COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_shots_on_target,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::INTEGER AS away_goals,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_penalty = true THEN 1 END)::INTEGER AS away_penalties,
  COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_saved = true THEN 1 END)::INTEGER AS away_shots_saved,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::INTEGER AS away_aerial_duels_won,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' THEN 1 END)::INTEGER AS away_aerial_duels_total,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' AND d.is_successful = true THEN 1 END)::INTEGER AS away_successful_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'dribble' THEN 1 END)::INTEGER AS away_total_dribbles,
  COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END)::INTEGER AS away_progressive_carries,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'save' THEN 1 END)::INTEGER AS away_saves,
  0::INTEGER AS away_saves_inside_box, 0::INTEGER AS away_saves_outside_box,
  COUNT(CASE WHEN ka.team_id = m.away_team_id AND ka.action_type = 'goal_conceded' THEN 1 END)::INTEGER AS away_goals_conceded,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id THEN 1 END)::INTEGER AS away_fouls_committed,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'yellow' THEN 1 END)::INTEGER AS away_yellow_cards,
  COUNT(CASE WHEN f.fouling_team_id = m.away_team_id AND f.card_given = 'red' THEN 1 END)::INTEGER AS away_red_cards,
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'corner' THEN 1 END)::INTEGER AS away_corners,
  COUNT(CASE WHEN sp.team_id = m.away_team_id AND sp.set_piece_type = 'free_kick' THEN 1 END)::INTEGER AS away_freekicks,
  COUNT(CASE WHEN ftc.team_id = m.away_team_id THEN 1 END)::INTEGER AS away_final_third_entries,
  COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END)::INTEGER AS away_chances_in_box,

  -- ===============================================
  -- HOME PERFORMANCE INDICES (Balanced 0-100 scale)
  -- ===============================================
  
  -- PCI: Pass completion rate (capped naturally at 100)
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC * 100 / 
       COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END))::INTEGER
    ELSE 50
  END AS home_possession_control_index,
  
  -- CCI: Scaled to typical match values (max ~20 key passes, ~5 assists for top teams)
  LEAST(100, ROUND(
    (LEAST(COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_key_pass = true THEN 1 END), 20)::NUMERIC / 20 * 50) +
    (LEAST(COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_assist = true THEN 1 END), 5)::NUMERIC / 5 * 30) +
    (LEAST(COUNT(CASE WHEN ftc.team_id = m.home_team_id AND ftc.is_in_box = true THEN 1 END), 10)::NUMERIC / 10 * 20)
  ))::INTEGER AS home_chance_creation_index,
  
  -- SE: Goal conversion rate (naturally 0-100)
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) * 100)::INTEGER
    ELSE 0
  END AS home_shooting_efficiency,
  
  -- DS: Based on opponent's shooting (fewer opponent goals = higher DS)
  -- For home team, opponent is away team. DS = 100 - (away_goals / away_shots * 100) if shots > 0
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) > 0 THEN
      GREATEST(0, 100 - ROUND(COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) * 100))::INTEGER
    ELSE 70  -- Default when no shots against
  END AS home_defensive_solidity,
  
  -- T&P: Progressive pass percentage (capped at 100)
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END) > 0 THEN
      LEAST(100, ROUND(
        (COUNT(CASE WHEN pe.team_id = m.home_team_id AND pe.is_progressive_pass = true THEN 1 END) +
         COUNT(CASE WHEN d.team_id = m.home_team_id AND d.is_progressive_carry = true THEN 1 END))::NUMERIC * 100 /
        COUNT(CASE WHEN pe.team_id = m.home_team_id THEN 1 END)
      ))::INTEGER
    ELSE 30
  END AS home_transition_progression,
  
  -- RPE: Aerial duel win rate (naturally 0-100)
  CASE 
    WHEN COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::NUMERIC * 100 /
       COUNT(CASE WHEN d.team_id = m.home_team_id AND d.duel_type = 'aerial' THEN 1 END))::INTEGER
    ELSE 50  -- Default when no aerial duels
  END AS home_recovery_pressing_efficiency,

  -- ===============================================
  -- AWAY PERFORMANCE INDICES
  -- ===============================================
  
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_successful = true THEN 1 END)::NUMERIC * 100 / 
       COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END))::INTEGER
    ELSE 50
  END AS away_possession_control_index,
  
  LEAST(100, ROUND(
    (LEAST(COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_key_pass = true THEN 1 END), 20)::NUMERIC / 20 * 50) +
    (LEAST(COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_assist = true THEN 1 END), 5)::NUMERIC / 5 * 30) +
    (LEAST(COUNT(CASE WHEN ftc.team_id = m.away_team_id AND ftc.is_in_box = true THEN 1 END), 10)::NUMERIC / 10 * 20)
  ))::INTEGER AS away_chance_creation_index,
  
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN sot.team_id = m.away_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.away_team_id THEN 1 END) * 100)::INTEGER
    ELSE 0
  END AS away_shooting_efficiency,
  
  -- DS for away = 100 - home_conversion_rate
  CASE 
    WHEN COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) > 0 THEN
      GREATEST(0, 100 - ROUND(COUNT(CASE WHEN sot.team_id = m.home_team_id AND sot.is_goal = true THEN 1 END)::NUMERIC / 
       COUNT(CASE WHEN sot.team_id = m.home_team_id THEN 1 END) * 100))::INTEGER
    ELSE 70
  END AS away_defensive_solidity,
  
  CASE 
    WHEN COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END) > 0 THEN
      LEAST(100, ROUND(
        (COUNT(CASE WHEN pe.team_id = m.away_team_id AND pe.is_progressive_pass = true THEN 1 END) +
         COUNT(CASE WHEN d.team_id = m.away_team_id AND d.is_progressive_carry = true THEN 1 END))::NUMERIC * 100 /
        COUNT(CASE WHEN pe.team_id = m.away_team_id THEN 1 END)
      ))::INTEGER
    ELSE 30
  END AS away_transition_progression,
  
  CASE 
    WHEN COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' THEN 1 END) > 0 THEN
      ROUND(COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' AND d.is_successful = true THEN 1 END)::NUMERIC * 100 /
       COUNT(CASE WHEN d.team_id = m.away_team_id AND d.duel_type = 'aerial' THEN 1 END))::INTEGER
    ELSE 50
  END AS away_recovery_pressing_efficiency

FROM matches m
LEFT JOIN pass_events pe ON pe.match_id = m.id
LEFT JOIN shots_on_target sot ON sot.match_id = m.id
LEFT JOIN duels d ON d.match_id = m.id
LEFT JOIN keeper_actions ka ON ka.match_id = m.id
LEFT JOIN fouls f ON f.match_id = m.id
LEFT JOIN set_pieces sp ON sp.match_id = m.id
LEFT JOIN final_third_chances ftc ON ftc.match_id = m.id
GROUP BY m.id, m.home_team_id, m.away_team_id, m.our_team_id;

CREATE INDEX idx_match_stats_summary_match ON match_statistics_summary(match_id);

-- Verify
SELECT match_id,
  home_possession_control_index, away_possession_control_index,
  home_chance_creation_index, away_chance_creation_index,
  home_shooting_efficiency, away_shooting_efficiency,
  home_defensive_solidity, away_defensive_solidity,
  home_transition_progression, away_transition_progression,
  home_recovery_pressing_efficiency, away_recovery_pressing_efficiency
FROM match_statistics_summary;

SELECT 'FINAL: Balanced indices created!' as status;
