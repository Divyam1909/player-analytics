-- ============================================
-- 06: ADD MISSING TEAM STATS COLUMNS
-- ============================================
-- Adds columns for stats that exist in the company
-- database but were missing from match_statistics.
-- All columns follow the home_/away_ naming convention.
-- ============================================

BEGIN;

-- ============================================
-- PASSING & DRIBBLING
-- ============================================

-- Pass accuracy percentage (0-100)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_passes_accuracy numeric(5, 2) NULL,
    ADD COLUMN IF NOT EXISTS away_passes_accuracy numeric(5, 2) NULL;

-- Unsuccessful dribbles count
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_unsuccessful_dribbles integer NULL,
    ADD COLUMN IF NOT EXISTS away_unsuccessful_dribbles integer NULL;

-- ============================================
-- SHOOTING & CHANCES
-- ============================================

-- Total shots (on target + off target + blocked)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_shots_total integer NULL,
    ADD COLUMN IF NOT EXISTS away_shots_total integer NULL;

-- Chances created inside the box
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_chances_in_box integer NULL,
    ADD COLUMN IF NOT EXISTS away_chances_in_box integer NULL;

-- Total chances (all zones combined)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_chances_total integer NULL,
    ADD COLUMN IF NOT EXISTS away_chances_total integer NULL;

-- ============================================
-- DEFENSIVE ACTIONS
-- ============================================

-- Tackles
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_tackles integer NULL,
    ADD COLUMN IF NOT EXISTS away_tackles integer NULL;

-- Forced offsides (offside traps triggered by defensive line)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_forced_offsides integer NULL,
    ADD COLUMN IF NOT EXISTS away_forced_offsides integer NULL;

-- Defensive collections (loose ball pickups in defensive zone)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_def_collections integer NULL,
    ADD COLUMN IF NOT EXISTS away_def_collections integer NULL;

-- ============================================
-- GOALKEEPING
-- ============================================

-- Goalkeeper collections (catches, claims, punches)
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_gk_collections integer NULL,
    ADD COLUMN IF NOT EXISTS away_gk_collections integer NULL;

-- ============================================
-- SET PIECES
-- ============================================

-- Throw-ins
ALTER TABLE public.match_statistics
    ADD COLUMN IF NOT EXISTS home_throw_ins integer NULL,
    ADD COLUMN IF NOT EXISTS away_throw_ins integer NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.match_statistics.home_passes_accuracy IS 'Home team pass accuracy percentage (0-100)';
COMMENT ON COLUMN public.match_statistics.away_passes_accuracy IS 'Away team pass accuracy percentage (0-100)';
COMMENT ON COLUMN public.match_statistics.home_unsuccessful_dribbles IS 'Home team unsuccessful dribble attempts';
COMMENT ON COLUMN public.match_statistics.away_unsuccessful_dribbles IS 'Away team unsuccessful dribble attempts';
COMMENT ON COLUMN public.match_statistics.home_shots_total IS 'Home team total shots (on + off target + blocked)';
COMMENT ON COLUMN public.match_statistics.away_shots_total IS 'Away team total shots (on + off target + blocked)';
COMMENT ON COLUMN public.match_statistics.home_chances_in_box IS 'Home team chances created inside the box';
COMMENT ON COLUMN public.match_statistics.away_chances_in_box IS 'Away team chances created inside the box';
COMMENT ON COLUMN public.match_statistics.home_chances_total IS 'Home team total chances (all zones)';
COMMENT ON COLUMN public.match_statistics.away_chances_total IS 'Away team total chances (all zones)';
COMMENT ON COLUMN public.match_statistics.home_tackles IS 'Home team tackles';
COMMENT ON COLUMN public.match_statistics.away_tackles IS 'Away team tackles';
COMMENT ON COLUMN public.match_statistics.home_forced_offsides IS 'Home team forced offsides (offside traps)';
COMMENT ON COLUMN public.match_statistics.away_forced_offsides IS 'Away team forced offsides (offside traps)';
COMMENT ON COLUMN public.match_statistics.home_def_collections IS 'Home team defensive collections (loose ball recoveries in defensive zone)';
COMMENT ON COLUMN public.match_statistics.away_def_collections IS 'Away team defensive collections (loose ball recoveries in defensive zone)';
COMMENT ON COLUMN public.match_statistics.home_gk_collections IS 'Home team goalkeeper collections (catches, claims, punches)';
COMMENT ON COLUMN public.match_statistics.away_gk_collections IS 'Away team goalkeeper collections (catches, claims, punches)';
COMMENT ON COLUMN public.match_statistics.home_throw_ins IS 'Home team throw-ins';
COMMENT ON COLUMN public.match_statistics.away_throw_ins IS 'Away team throw-ins';

COMMIT;
