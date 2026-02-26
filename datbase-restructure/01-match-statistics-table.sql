-- ============================================
-- 01: CREATE match_statistics TABLE
-- ============================================
-- Replaces the old match_statistics_summary materialized view
-- with a regular table aligned to the company database.
-- Data is now manually entered, not auto-aggregated.
-- ============================================

BEGIN;

-- Drop old materialized view (and its indexes/dependencies)
DROP MATERIALIZED VIEW IF EXISTS public.match_statistics_summary CASCADE;

-- ============================================
-- CREATE THE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.match_statistics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid NOT NULL,

    -- ============================================
    -- TEAM / OPPONENT COLUMNS (our-team perspective)
    -- These are relative: "team" = our team, "opponent" = the other
    -- ============================================
    team_possession integer NULL,
    opponent_possession integer NULL,
    team_passes integer NULL,
    opponent_passes integer NULL,
    team_shots_on_target integer NULL,
    opponent_shots_on_target integer NULL,
    team_corners integer NULL,
    opponent_corners integer NULL,
    team_offsides integer NULL,
    opponent_offsides integer NULL,
    team_aerial_duels_won integer NULL DEFAULT 0,
    opponent_aerial_duels_won integer NULL DEFAULT 0,
    team_fouls integer NULL DEFAULT 0,
    opponent_fouls integer NULL DEFAULT 0,
    team_chances_created integer NULL DEFAULT 0,
    opponent_chances_created integer NULL DEFAULT 0,
    team_saves integer NULL DEFAULT 0,
    opponent_saves integer NULL DEFAULT 0,
    team_chances_final_third integer NULL DEFAULT 0,
    opponent_chances_final_third integer NULL DEFAULT 0,
    team_performance integer NULL DEFAULT 50,
    opponent_performance integer NULL DEFAULT 50,
    team_clearances integer NULL,
    opponent_clearances integer NULL,
    team_interceptions integer NULL,
    opponent_interceptions integer NULL,
    team_successful_dribbles integer NULL,
    opponent_successful_dribbles integer NULL,
    team_conversion_rate numeric(5, 2) NULL,
    opponent_conversion_rate numeric(5, 2) NULL,
    team_freekicks integer NULL,
    opponent_freekicks integer NULL,

    -- ============================================
    -- HOME / AWAY COLUMNS (absolute perspective)
    -- These are fixed: home is always home, away is always away
    -- ============================================

    -- Possession & Passes
    home_possession integer NULL,
    away_possession integer NULL,
    home_passes integer NULL,
    away_passes integer NULL,
    home_successful_passes integer NULL,
    away_successful_passes integer NULL,
    home_unsuccessful_passes integer NULL,
    away_unsuccessful_passes integer NULL,
    home_total_passes integer NULL,
    away_total_passes integer NULL,
    home_progressive_passes integer NULL,
    away_progressive_passes integer NULL,
    home_key_passes integer NULL,
    away_key_passes integer NULL,
    home_long_passes integer NULL,
    away_long_passes integer NULL,
    home_short_passes integer NULL,
    away_short_passes integer NULL,

    -- Attacking
    home_assists integer NULL,
    away_assists integer NULL,
    home_crosses integer NULL,
    away_crosses integer NULL,
    home_shots_on_target integer NULL,
    away_shots_on_target integer NULL,
    home_shots_saved integer NULL,
    away_shots_saved integer NULL,
    home_shots_off_target integer NULL,
    away_shots_off_target integer NULL,
    home_goals integer NULL,
    away_goals integer NULL,
    home_penalties integer NULL,
    away_penalties integer NULL,

    -- Corners, Offsides, Set Pieces
    home_corners integer NULL,
    away_corners integer NULL,
    home_offsides integer NULL,
    away_offsides integer NULL,
    home_freekicks integer NULL,
    away_freekicks integer NULL,

    -- Chances
    home_chances_created integer NULL,
    away_chances_created integer NULL,
    home_chances_final_third integer NULL,
    away_chances_final_third integer NULL,

    -- Defensive
    home_clearances integer NULL,
    away_clearances integer NULL,
    home_interceptions integer NULL,
    away_interceptions integer NULL,
    home_blocks integer NULL,
    away_blocks integer NULL,
    home_ball_recoveries integer NULL,
    away_ball_recoveries integer NULL,
    home_high_press_recoveries integer NULL,
    away_high_press_recoveries integer NULL,

    -- Duels
    home_successful_dribbles integer NULL,
    away_successful_dribbles integer NULL,
    home_total_dribbles integer NULL,
    away_total_dribbles integer NULL,
    home_aerial_duels_won integer NULL,
    away_aerial_duels_won integer NULL,
    home_aerial_duels_total integer NULL,
    away_aerial_duels_total integer NULL,
    home_progressive_carries integer NULL,
    away_progressive_carries integer NULL,

    -- Fouls & Cards
    home_fouls integer NULL,
    away_fouls integer NULL,
    home_fouls_committed integer NULL,
    away_fouls_committed integer NULL,
    home_yellow_cards integer NULL,
    away_yellow_cards integer NULL,
    home_red_cards integer NULL,
    away_red_cards integer NULL,

    -- Goalkeeper
    home_saves integer NULL,
    away_saves integer NULL,
    home_saves_inside_box integer NULL,
    away_saves_inside_box integer NULL,
    home_saves_outside_box integer NULL,
    away_saves_outside_box integer NULL,
    home_goals_conceded integer NULL,
    away_goals_conceded integer NULL,

    -- Conversion Rates
    home_conversion_rate numeric(5, 2) NULL,
    away_conversion_rate numeric(5, 2) NULL,

    -- ============================================
    -- PERFORMANCE INDICES (numeric 0-100 scale)
    -- ============================================
    home_possession_control_index numeric(5, 2) NULL,
    away_possession_control_index numeric(5, 2) NULL,
    home_chance_creation_index numeric(5, 2) NULL,
    away_chance_creation_index numeric(5, 2) NULL,
    home_shooting_efficiency numeric(5, 2) NULL,
    away_shooting_efficiency numeric(5, 2) NULL,
    home_defensive_solidity numeric(5, 2) NULL,
    away_defensive_solidity numeric(5, 2) NULL,
    home_transition_progression numeric(5, 2) NULL,
    away_transition_progression numeric(5, 2) NULL,
    home_recovery_pressing_efficiency numeric(5, 2) NULL,
    away_recovery_pressing_efficiency numeric(5, 2) NULL,

    -- Overall performance
    home_performance integer NULL,
    away_performance integer NULL,

    -- Timestamps
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),

    -- ============================================
    -- CONSTRAINTS
    -- ============================================
    CONSTRAINT match_statistics_pkey PRIMARY KEY (id),
    CONSTRAINT match_statistics_match_id_key UNIQUE (match_id),
    CONSTRAINT match_statistics_match_id_fkey FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,

    -- Possession bounds
    CONSTRAINT match_statistics_team_possession_check CHECK (
        (team_possession >= 0) AND (team_possession <= 100)
    ),
    CONSTRAINT match_statistics_opponent_possession_check CHECK (
        (opponent_possession >= 0) AND (opponent_possession <= 100)
    ),

    -- Non-negative checks (team/opponent)
    CONSTRAINT match_statistics_team_passes_check CHECK (team_passes >= 0),
    CONSTRAINT match_statistics_opponent_passes_check CHECK (opponent_passes >= 0),
    CONSTRAINT match_statistics_team_shots_on_target_check CHECK (team_shots_on_target >= 0),
    CONSTRAINT match_statistics_opponent_shots_on_target_check CHECK (opponent_shots_on_target >= 0),
    CONSTRAINT match_statistics_team_corners_check CHECK (team_corners >= 0),
    CONSTRAINT match_statistics_opponent_corners_check CHECK (opponent_corners >= 0),
    CONSTRAINT match_statistics_team_offsides_check CHECK (team_offsides >= 0),
    CONSTRAINT match_statistics_opponent_offsides_check CHECK (opponent_offsides >= 0),
    CONSTRAINT check_aerial_duels_positive CHECK (
        (team_aerial_duels_won >= 0) AND (opponent_aerial_duels_won >= 0)
    ),
    CONSTRAINT check_fouls_positive CHECK (
        (team_fouls >= 0) AND (opponent_fouls >= 0)
    ),
    CONSTRAINT check_chances_positive CHECK (
        (team_chances_created >= 0) AND (opponent_chances_created >= 0)
    ),
    CONSTRAINT check_saves_positive CHECK (
        (team_saves >= 0) AND (opponent_saves >= 0)
    )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id
    ON public.match_statistics USING btree (match_id);

CREATE INDEX IF NOT EXISTS idx_match_stats_possession
    ON public.match_statistics USING btree (home_possession, away_possession);

CREATE INDEX IF NOT EXISTS idx_match_stats_created_at
    ON public.match_statistics USING btree (created_at DESC);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_match_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_statistics_updated_at
    BEFORE UPDATE ON public.match_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_match_statistics_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.match_statistics IS 'Team-level match statistics. Replaces the old match_statistics_summary materialized view. Data is now manually entered.';
COMMENT ON COLUMN public.match_statistics.team_possession IS 'Our team possession percentage (0-100)';
COMMENT ON COLUMN public.match_statistics.home_possession_control_index IS 'PCI: Ball retention quality index (0-100)';
COMMENT ON COLUMN public.match_statistics.home_chance_creation_index IS 'CCI: Opportunity generation index (0-100)';
COMMENT ON COLUMN public.match_statistics.home_shooting_efficiency IS 'Shot conversion rate index (0-100)';
COMMENT ON COLUMN public.match_statistics.home_defensive_solidity IS 'Defensive strength index (0-100)';
COMMENT ON COLUMN public.match_statistics.home_transition_progression IS 'Counter-attack effectiveness index (0-100)';
COMMENT ON COLUMN public.match_statistics.home_recovery_pressing_efficiency IS 'Press and recovery quality index (0-100)';

COMMIT;
