-- ============================================
-- PLAYER ATTRIBUTES AUTO-CALCULATION
-- Functions to calculate player ratings from match performance
-- ============================================
-- This file contains algorithms to automatically calculate
-- player skill ratings (0-100) based on their match statistics
-- ============================================

-- Function: Calculate Passing Rating
-- Based on: pass completion %, progressive passes, key passes, assists
CREATE OR REPLACE FUNCTION calculate_passing_rating(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating INTEGER;
  v_completion_rate NUMERIC;
  v_progressive_rate NUMERIC;
  v_key_pass_rate NUMERIC;
  v_assist_count INTEGER;
  v_total_passes INTEGER;
BEGIN
  -- Get passing stats from player_match_statistics view
  SELECT 
    CASE 
      WHEN SUM(total_passes) = 0 THEN 0
      ELSE (SUM(successful_passes)::NUMERIC / SUM(total_passes)::NUMERIC) * 100
    END,
    CASE 
      WHEN SUM(total_passes) = 0 THEN 0
      ELSE (SUM(progressive_passes)::NUMERIC / SUM(total_passes)::NUMERIC) * 100
    END,
    CASE 
      WHEN SUM(total_passes) = 0 THEN 0
      ELSE (SUM(key_passes)::NUMERIC / SUM(total_passes)::NUMERIC) * 100
    END,
    SUM(assists),
    SUM(total_passes)
  INTO v_completion_rate, v_progressive_rate, v_key_pass_rate, v_assist_count, v_total_passes
  FROM player_match_statistics
  WHERE player_id = p_player_id;

  -- If no data, return 50 (neutral)
  IF v_total_passes IS NULL OR v_total_passes = 0 THEN
    RETURN 50;
  END IF;

  -- Calculate rating (weighted average)
  -- 40% completion rate, 25% progressive passes, 20% key passes, 15% assists
  v_rating := LEAST(100, GREATEST(0,
    (v_completion_rate * 0.4) +
    (v_progressive_rate * 2.5) + -- Scale up progressive passes
    (v_key_pass_rate * 5) + -- Scale up key passes
    (LEAST(v_assist_count * 2, 30)) -- Cap assist bonus at 30
  ));

  RETURN v_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Shooting Rating
-- Based on: shots on target, goals, conversion rate
CREATE OR REPLACE FUNCTION calculate_shooting_rating(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating INTEGER;
  v_goals INTEGER;
  v_shots INTEGER;
  v_conversion_rate NUMERIC;
  v_shots_per_90 NUMERIC;
BEGIN
  SELECT 
    SUM(goals),
    SUM(shots_on_target),
    CASE 
      WHEN SUM(shots_on_target) = 0 THEN 0
      ELSE (SUM(goals)::NUMERIC / SUM(shots_on_target)::NUMERIC) * 100
    END
  INTO v_goals, v_shots, v_conversion_rate
  FROM player_match_statistics
  WHERE player_id = p_player_id;

  IF v_shots IS NULL OR v_shots = 0 THEN
    RETURN 40; -- Lower default for shooters
  END IF;

  -- Calculate shots per 90 (assuming ~90 min per match)
  v_shots_per_90 := v_shots::NUMERIC / NULLIF((SELECT COUNT(*) FROM player_match_statistics WHERE player_id = p_player_id), 0);

  -- Rating based on conversion rate (50%), goals (30%), shot frequency (20%)
  v_rating := LEAST(100, GREATEST(0,
    (v_conversion_rate * 0.5) +
    (LEAST(v_goals * 3, 40)) + -- Cap goal bonus at 40
    (LEAST(v_shots_per_90 * 10, 20)) -- Cap shot frequency bonus at 20
  ));

  RETURN v_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Dribbling Rating
-- Based on: successful dribbles %, progressive carries
CREATE OR REPLACE FUNCTION calculate_dribbling_rating(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating INTEGER;
  v_success_rate NUMERIC;
  v_progressive_carries INTEGER;
  v_total_dribbles INTEGER;
BEGIN
  SELECT 
    CASE 
      WHEN SUM(total_dribbles) = 0 THEN 0
      ELSE (SUM(successful_dribbles)::NUMERIC / SUM(total_dribbles)::NUMERIC) * 100
    END,
    SUM(progressive_carries),
    SUM(total_dribbles)
  INTO v_success_rate, v_progressive_carries, v_total_dribbles
  FROM player_match_statistics
  WHERE player_id = p_player_id;

  IF v_total_dribbles IS NULL OR v_total_dribbles = 0 THEN
    RETURN 50;
  END IF;

  -- Rating based on success rate (60%) and progressive carries (40%)
  v_rating := LEAST(100, GREATEST(0,
    (v_success_rate * 0.6) +
    (LEAST(v_progressive_carries * 2, 40)) -- Cap progressive carry bonus at 40
  ));

  RETURN v_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Defending Rating
-- Based on: interceptions, blocks, clearances, tackles, aerial duels won
CREATE OR REPLACE FUNCTION calculate_defending_rating(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating INTEGER;
  v_interceptions INTEGER;
  v_blocks INTEGER;
  v_clearances INTEGER;
  v_aerial_win_rate NUMERIC;
  v_total_actions INTEGER;
BEGIN
  SELECT 
    SUM(interceptions),
    SUM(blocks),
    SUM(clearances),
    CASE 
      WHEN SUM(aerial_duels_total) = 0 THEN 0
      ELSE (SUM(aerial_duels_won)::NUMERIC / SUM(aerial_duels_total)::NUMERIC) * 100
    END
  INTO v_interceptions, v_blocks, v_clearances, v_aerial_win_rate
  FROM player_match_statistics
  WHERE player_id = p_player_id;

  v_total_actions := COALESCE(v_interceptions, 0) + COALESCE(v_blocks, 0) + COALESCE(v_clearances, 0);

  IF v_total_actions = 0 THEN
    RETURN 50;
  END IF;

  -- Rating based on defensive actions and aerial ability
  v_rating := LEAST(100, GREATEST(0,
    (LEAST(v_total_actions, 50)) + -- Cap defensive actions at 50
    (v_aerial_win_rate * 0.5) -- Aerial ability worth up to 50
  ));

  RETURN v_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Physical Rating
-- Based on: aerial duels, distance covered (if available), sprints
-- Note: Since we don't have distance/sprints data, we use aerial duels and dribbles as proxy
CREATE OR REPLACE FUNCTION calculate_physical_rating(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating INTEGER;
  v_aerial_total INTEGER;
  v_aerial_won INTEGER;
  v_total_duels INTEGER;
  v_duels_won INTEGER;
BEGIN
  SELECT 
    SUM(aerial_duels_total),
    SUM(aerial_duels_won),
    SUM(aerial_duels_total) + SUM(total_dribbles),
    SUM(aerial_duels_won) + SUM(successful_dribbles)
  INTO v_aerial_total, v_aerial_won, v_total_duels, v_duels_won
  FROM player_match_statistics
  WHERE player_id = p_player_id;

  IF v_total_duels IS NULL OR v_total_duels = 0 THEN
    RETURN 50;
  END IF;

  -- Rating based on duel success (physical strength/stamina indicator)
  v_rating := LEAST(100, GREATEST(0,
    (v_duels_won::NUMERIC / v_total_duels::NUMERIC) * 100
  ));

  RETURN v_rating;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Overall Rating
-- Weighted average based on position
CREATE OR REPLACE FUNCTION calculate_overall_rating(
  p_player_id UUID,
  p_passing INTEGER,
  p_shooting INTEGER,
  p_dribbling INTEGER,
  p_defending INTEGER,
  p_physical INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_position TEXT;
  v_overall INTEGER;
BEGIN
  -- Get player position
  SELECT position INTO v_position FROM players WHERE id = p_player_id;

  -- Calculate weighted average based on position
  CASE v_position
    WHEN 'GK' THEN
      v_overall := (p_defending * 0.4 + p_physical * 0.4 + p_passing * 0.2);
    WHEN 'CB', 'RB', 'LB', 'RWB', 'LWB' THEN
      v_overall := (p_defending * 0.4 + p_physical * 0.25 + p_passing * 0.25 + p_dribbling * 0.1);
    WHEN 'CDM' THEN
      v_overall := (p_defending * 0.3 + p_passing * 0.3 + p_physical * 0.25 + p_dribbling * 0.15);
    WHEN 'CM' THEN
      v_overall := (p_passing * 0.35 + p_dribbling * 0.25 + p_defending * 0.2 + p_physical * 0.2);
    WHEN 'CAM' THEN
      v_overall := (p_passing * 0.35 + p_shooting * 0.25 + p_dribbling * 0.25 + p_defending * 0.15);
    WHEN 'RW', 'LW' THEN
      v_overall := (p_dribbling * 0.35 + p_shooting * 0.3 + p_passing * 0.25 + p_physical * 0.1);
    WHEN 'ST', 'CF' THEN
      v_overall := (p_shooting * 0.4 + p_dribbling * 0.25 + p_physical * 0.2 + p_passing * 0.15);
    ELSE
      -- Default: balanced
      v_overall := (p_passing + p_shooting + p_dribbling + p_defending + p_physical) / 5;
  END CASE;

  RETURN LEAST(100, GREATEST(0, v_overall));
END;
$$ LANGUAGE plpgsql;

-- Main Function: Update Player Attributes
-- Call this to recalculate all attributes for a player
CREATE OR REPLACE FUNCTION update_player_attributes(p_player_id UUID)
RETURNS VOID AS $$
DECLARE
  v_passing INTEGER;
  v_shooting INTEGER;
  v_dribbling INTEGER;
  v_defending INTEGER;
  v_physical INTEGER;
  v_overall INTEGER;
BEGIN
  -- Calculate all ratings
  v_passing := calculate_passing_rating(p_player_id);
  v_shooting := calculate_shooting_rating(p_player_id);
  v_dribbling := calculate_dribbling_rating(p_player_id);
  v_defending := calculate_defending_rating(p_player_id);
  v_physical := calculate_physical_rating(p_player_id);
  v_overall := calculate_overall_rating(p_player_id, v_passing, v_shooting, v_dribbling, v_defending, v_physical);

  -- Insert or update player attributes
  INSERT INTO player_attributes (
    player_id, passing, shooting, dribbling, defending, physical, overall_rating,
    is_manual, last_calculated_at
  ) VALUES (
    p_player_id, v_passing, v_shooting, v_dribbling, v_defending, v_physical, v_overall,
    false, NOW()
  )
  ON CONFLICT (player_id) DO UPDATE SET
    passing = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.passing ELSE player_attributes.passing END,
    shooting = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.shooting ELSE player_attributes.shooting END,
    dribbling = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.dribbling ELSE player_attributes.dribbling END,
    defending = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.defending ELSE player_attributes.defending END,
    physical = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.physical ELSE player_attributes.physical END,
    overall_rating = CASE WHEN player_attributes.is_manual = false THEN EXCLUDED.overall_rating ELSE player_attributes.overall_rating END,
    last_calculated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Batch Function: Update All Player Attributes
-- Call this to recalculate ratings for all players
CREATE OR REPLACE FUNCTION update_all_player_attributes()
RETURNS INTEGER AS $$
DECLARE
  v_player RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_player IN SELECT id FROM players LOOP
    PERFORM update_player_attributes(v_player.id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Update attributes for a single player:
-- SELECT update_player_attributes('player-uuid-here');

-- Update attributes for ALL players:
-- SELECT update_all_player_attributes();

-- Manual override (for coach adjustments):
-- UPDATE player_attributes 
-- SET passing = 85, shooting = 92, is_manual = true 
-- WHERE player_id = 'player-uuid-here';

-- Reset to auto-calculation:
-- UPDATE player_attributes 
-- SET is_manual = false 
-- WHERE player_id = 'player-uuid-here';
-- SELECT update_player_attributes('player-uuid-here');
