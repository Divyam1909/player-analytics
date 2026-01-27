-- ============================================
-- PART 3: CREATE INDEXES AND REFRESH
-- Run this after Part 2
-- ============================================

CREATE INDEX IF NOT EXISTS idx_match_stats_summary_match ON match_statistics_summary(match_id);
CREATE INDEX IF NOT EXISTS idx_match_stats_summary_home_team ON match_statistics_summary(home_team_id);
CREATE INDEX IF NOT EXISTS idx_match_stats_summary_away_team ON match_statistics_summary(away_team_id);

-- Refresh player stats too
REFRESH MATERIALIZED VIEW player_match_statistics;

-- Verify
SELECT 
    match_id,
    home_possession_control_index as home_pci,
    home_chance_creation_index as home_cci,
    home_shooting_efficiency as home_se,
    home_defensive_solidity as home_ds,
    home_transition_progression as home_tp,
    home_recovery_pressing_efficiency as home_rpe
FROM match_statistics_summary;

SELECT 'Part 3 Complete: Indexes created and views refreshed!' as status;
