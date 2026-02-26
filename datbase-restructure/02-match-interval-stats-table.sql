-- ============================================
-- 02: CREATE match_interval_stats TABLE
-- ============================================
-- 10-minute interval stats for each match.
-- Stores possession and performance index per interval
-- for both home and away teams.
-- Intervals: 0-10, 10-20, 20-30, 30-40, 40-45+,
--            45-55, 55-65, 65-75, 75-85, 85-90+
-- Extra time intervals are supported (90-100, 100-110, etc.)
-- ============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.match_interval_stats (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid NOT NULL,

    -- Interval boundaries (in minutes)
    interval_start integer NOT NULL,
    interval_end integer NOT NULL,

    -- Possession percentages for this interval
    home_possession integer NULL,
    away_possession integer NULL,

    -- Performance index for this interval
    home_performance_index numeric(5, 2) NULL,
    away_performance_index numeric(5, 2) NULL,

    -- Timestamps
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT match_interval_stats_pkey PRIMARY KEY (id),
    CONSTRAINT match_interval_stats_match_id_fkey FOREIGN KEY (match_id)
        REFERENCES matches (id) ON DELETE CASCADE,
    CONSTRAINT match_interval_stats_unique UNIQUE (match_id, interval_start),

    -- Validation
    CONSTRAINT check_interval_order CHECK (interval_end > interval_start),
    CONSTRAINT check_interval_start_positive CHECK (interval_start >= 0),
    CONSTRAINT check_home_possession_range CHECK (
        home_possession >= 0 AND home_possession <= 100
    ),
    CONSTRAINT check_away_possession_range CHECK (
        away_possession >= 0 AND away_possession <= 100
    ),
    CONSTRAINT check_home_performance_range CHECK (
        home_performance_index >= 0 AND home_performance_index <= 100
    ),
    CONSTRAINT check_away_performance_range CHECK (
        away_performance_index >= 0 AND away_performance_index <= 100
    )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_match_interval_stats_match_id
    ON public.match_interval_stats USING btree (match_id);

CREATE INDEX IF NOT EXISTS idx_match_interval_stats_interval
    ON public.match_interval_stats USING btree (match_id, interval_start);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.match_interval_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_match_interval_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_interval_stats_updated_at
    BEFORE UPDATE ON public.match_interval_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_match_interval_stats_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.match_interval_stats IS '10-minute interval stats per match. Tracks possession and performance for home/away teams across time buckets.';
COMMENT ON COLUMN public.match_interval_stats.interval_start IS 'Start minute of the interval (0, 10, 20, ...)';
COMMENT ON COLUMN public.match_interval_stats.interval_end IS 'End minute of the interval (10, 20, 30, ...)';
COMMENT ON COLUMN public.match_interval_stats.home_possession IS 'Home team possession percentage for this interval (0-100)';
COMMENT ON COLUMN public.match_interval_stats.away_possession IS 'Away team possession percentage for this interval (0-100)';
COMMENT ON COLUMN public.match_interval_stats.home_performance_index IS 'Home team performance rating for this interval (0-100)';
COMMENT ON COLUMN public.match_interval_stats.away_performance_index IS 'Away team performance rating for this interval (0-100)';

COMMIT;
