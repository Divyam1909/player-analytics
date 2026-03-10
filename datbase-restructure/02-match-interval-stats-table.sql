-- ============================================
-- 02: CREATE match_interval_stats2 TABLE
-- ============================================
-- Column-per-bucket design for fixed 10-min intervals.
-- One row per match for regular time (90 min).
--
-- This is the V2 version of match_interval_stats,
-- created alongside the original for comparison.
--
-- EXTRA TIME HANDLING:
--   Regular row:  is_extra_time = false, all bucket columns filled,
--                 interval_start / interval_end are NULL.
--   Extra time:   Additional row(s) with is_extra_time = true,
--                 bucket columns NULL, uses interval_start/interval_end
--                 + et_home_possession / et_away_possession / et_home_perf / et_away_perf.
--
-- Buckets (9 total, uniform 10-min):
--   0-10, 10-20, 20-30, 30-40, 40-50,
--   50-60, 60-70, 70-80, 80-90
-- ============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.match_interval_stats2 (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid NOT NULL,

    -- ============================================
    -- ROW TYPE FLAG
    -- ============================================
    -- false = regular time row (bucket columns used)
    -- true  = extra time row  (interval_start/end + et_ columns used)
    is_extra_time boolean NOT NULL DEFAULT false,

    -- ============================================
    -- FIXED BUCKET COLUMNS (9 × 10-min intervals)
    -- ============================================

    -- 0-10 min
    home_possession_0_10 integer NULL,
    away_possession_0_10 integer NULL,
    home_perf_0_10 numeric(5, 2) NULL,
    away_perf_0_10 numeric(5, 2) NULL,

    -- 10-20 min
    home_possession_10_20 integer NULL,
    away_possession_10_20 integer NULL,
    home_perf_10_20 numeric(5, 2) NULL,
    away_perf_10_20 numeric(5, 2) NULL,

    -- 20-30 min
    home_possession_20_30 integer NULL,
    away_possession_20_30 integer NULL,
    home_perf_20_30 numeric(5, 2) NULL,
    away_perf_20_30 numeric(5, 2) NULL,

    -- 30-40 min
    home_possession_30_40 integer NULL,
    away_possession_30_40 integer NULL,
    home_perf_30_40 numeric(5, 2) NULL,
    away_perf_30_40 numeric(5, 2) NULL,

    -- 40-50 min
    home_possession_40_50 integer NULL,
    away_possession_40_50 integer NULL,
    home_perf_40_50 numeric(5, 2) NULL,
    away_perf_40_50 numeric(5, 2) NULL,

    -- 50-60 min
    home_possession_50_60 integer NULL,
    away_possession_50_60 integer NULL,
    home_perf_50_60 numeric(5, 2) NULL,
    away_perf_50_60 numeric(5, 2) NULL,

    -- 60-70 min
    home_possession_60_70 integer NULL,
    away_possession_60_70 integer NULL,
    home_perf_60_70 numeric(5, 2) NULL,
    away_perf_60_70 numeric(5, 2) NULL,

    -- 70-80 min
    home_possession_70_80 integer NULL,
    away_possession_70_80 integer NULL,
    home_perf_70_80 numeric(5, 2) NULL,
    away_perf_70_80 numeric(5, 2) NULL,

    -- 80-90 min
    home_possession_80_90 integer NULL,
    away_possession_80_90 integer NULL,
    home_perf_80_90 numeric(5, 2) NULL,
    away_perf_80_90 numeric(5, 2) NULL,

    -- ============================================
    -- EXTRA TIME COLUMNS
    -- ============================================
    -- Used ONLY when is_extra_time = true.
    -- interval_start / interval_end define the ET period.
    -- e.g. 90-100, 100-110, 110-120

    interval_start integer NULL,
    interval_end integer NULL,

    et_home_possession integer NULL,
    et_away_possession integer NULL,
    et_home_performance numeric(5, 2) NULL,
    et_away_performance numeric(5, 2) NULL,

    -- ============================================
    -- TIMESTAMPS
    -- ============================================
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),

    -- ============================================
    -- CONSTRAINTS
    -- ============================================
    CONSTRAINT match_interval_stats2_pkey PRIMARY KEY (id),
    CONSTRAINT match_interval_stats2_match_id_fkey FOREIGN KEY (match_id)
        REFERENCES matches (id) ON DELETE CASCADE,

    -- One regular row per match; extra time rows are unique by interval_start
    CONSTRAINT match_interval_stats2_unique UNIQUE (match_id, is_extra_time, interval_start),

    -- Extra time rows must have interval boundaries
    CONSTRAINT check_et_has_interval2 CHECK (
        (is_extra_time = false)
        OR (is_extra_time = true AND interval_start IS NOT NULL AND interval_end IS NOT NULL)
    ),

    -- Extra time interval order
    CONSTRAINT check_et_interval_order2 CHECK (
        interval_start IS NULL OR interval_end > interval_start
    ),

    -- Possession range checks (0-100)
    CONSTRAINT check_possession_range2 CHECK (
        (home_possession_0_10  IS NULL OR (home_possession_0_10  BETWEEN 0 AND 100)) AND
        (away_possession_0_10  IS NULL OR (away_possession_0_10  BETWEEN 0 AND 100)) AND
        (home_possession_10_20 IS NULL OR (home_possession_10_20 BETWEEN 0 AND 100)) AND
        (away_possession_10_20 IS NULL OR (away_possession_10_20 BETWEEN 0 AND 100)) AND
        (home_possession_20_30 IS NULL OR (home_possession_20_30 BETWEEN 0 AND 100)) AND
        (away_possession_20_30 IS NULL OR (away_possession_20_30 BETWEEN 0 AND 100)) AND
        (home_possession_30_40 IS NULL OR (home_possession_30_40 BETWEEN 0 AND 100)) AND
        (away_possession_30_40 IS NULL OR (away_possession_30_40 BETWEEN 0 AND 100)) AND
        (home_possession_40_50 IS NULL OR (home_possession_40_50 BETWEEN 0 AND 100)) AND
        (away_possession_40_50 IS NULL OR (away_possession_40_50 BETWEEN 0 AND 100)) AND
        (home_possession_50_60 IS NULL OR (home_possession_50_60 BETWEEN 0 AND 100)) AND
        (away_possession_50_60 IS NULL OR (away_possession_50_60 BETWEEN 0 AND 100)) AND
        (home_possession_60_70 IS NULL OR (home_possession_60_70 BETWEEN 0 AND 100)) AND
        (away_possession_60_70 IS NULL OR (away_possession_60_70 BETWEEN 0 AND 100)) AND
        (home_possession_70_80 IS NULL OR (home_possession_70_80 BETWEEN 0 AND 100)) AND
        (away_possession_70_80 IS NULL OR (away_possession_70_80 BETWEEN 0 AND 100)) AND
        (home_possession_80_90 IS NULL OR (home_possession_80_90 BETWEEN 0 AND 100)) AND
        (away_possession_80_90 IS NULL OR (away_possession_80_90 BETWEEN 0 AND 100)) AND
        (et_home_possession    IS NULL OR (et_home_possession    BETWEEN 0 AND 100)) AND
        (et_away_possession    IS NULL OR (et_away_possession    BETWEEN 0 AND 100))
    ),

    -- Performance range checks (0-100)
    CONSTRAINT check_performance_range2 CHECK (
        (home_perf_0_10  IS NULL OR (home_perf_0_10  BETWEEN 0 AND 100)) AND
        (away_perf_0_10  IS NULL OR (away_perf_0_10  BETWEEN 0 AND 100)) AND
        (home_perf_10_20 IS NULL OR (home_perf_10_20 BETWEEN 0 AND 100)) AND
        (away_perf_10_20 IS NULL OR (away_perf_10_20 BETWEEN 0 AND 100)) AND
        (home_perf_20_30 IS NULL OR (home_perf_20_30 BETWEEN 0 AND 100)) AND
        (away_perf_20_30 IS NULL OR (away_perf_20_30 BETWEEN 0 AND 100)) AND
        (home_perf_30_40 IS NULL OR (home_perf_30_40 BETWEEN 0 AND 100)) AND
        (away_perf_30_40 IS NULL OR (away_perf_30_40 BETWEEN 0 AND 100)) AND
        (home_perf_40_50 IS NULL OR (home_perf_40_50 BETWEEN 0 AND 100)) AND
        (away_perf_40_50 IS NULL OR (away_perf_40_50 BETWEEN 0 AND 100)) AND
        (home_perf_50_60 IS NULL OR (home_perf_50_60 BETWEEN 0 AND 100)) AND
        (away_perf_50_60 IS NULL OR (away_perf_50_60 BETWEEN 0 AND 100)) AND
        (home_perf_60_70 IS NULL OR (home_perf_60_70 BETWEEN 0 AND 100)) AND
        (away_perf_60_70 IS NULL OR (away_perf_60_70 BETWEEN 0 AND 100)) AND
        (home_perf_70_80 IS NULL OR (home_perf_70_80 BETWEEN 0 AND 100)) AND
        (away_perf_70_80 IS NULL OR (away_perf_70_80 BETWEEN 0 AND 100)) AND
        (home_perf_80_90 IS NULL OR (home_perf_80_90 BETWEEN 0 AND 100)) AND
        (away_perf_80_90 IS NULL OR (away_perf_80_90 BETWEEN 0 AND 100)) AND
        (et_home_performance IS NULL OR (et_home_performance BETWEEN 0 AND 100)) AND
        (et_away_performance IS NULL OR (et_away_performance BETWEEN 0 AND 100))
    )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_match_interval_stats2_match_id
    ON public.match_interval_stats2 USING btree (match_id);

CREATE INDEX IF NOT EXISTS idx_match_interval_stats2_et
    ON public.match_interval_stats2 USING btree (match_id, is_extra_time);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.match_interval_stats2 ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_match_interval_stats2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_interval_stats2_updated_at
    BEFORE UPDATE ON public.match_interval_stats2
    FOR EACH ROW
    EXECUTE FUNCTION update_match_interval_stats2_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.match_interval_stats2 IS
    'V2 hybrid interval stats table. Regular time uses 9 fixed 10-min bucket columns (one row per match). Extra time uses interval_start/end + et_ columns (additional rows).';

COMMENT ON COLUMN public.match_interval_stats2.is_extra_time IS
    'false = regular 90-min row (bucket columns), true = extra time row (et_ columns + interval boundaries)';

COMMENT ON COLUMN public.match_interval_stats2.interval_start IS
    'Extra time only: start minute of the ET period (e.g. 90, 100, 110)';

COMMENT ON COLUMN public.match_interval_stats2.interval_end IS
    'Extra time only: end minute of the ET period (e.g. 100, 110, 120)';

-- ============================================
-- EXAMPLE USAGE
-- ============================================
--
-- Regular match (no extra time) — single row:
--   INSERT INTO match_interval_stats2 (match_id, is_extra_time,
--     home_possession_0_10, away_possession_0_10, home_perf_0_10, away_perf_0_10,
--     home_possession_10_20, away_possession_10_20, home_perf_10_20, away_perf_10_20,
--     ... (all 9 buckets)
--   ) VALUES ('match-uuid', false, 55, 45, 62.5, 48.3, ...);
--
-- Match WITH extra time — additional rows:
--   -- Row 1: regular time (same as above)
--   -- Row 2: ET 90-100
--   INSERT INTO match_interval_stats2 (match_id, is_extra_time,
--     interval_start, interval_end,
--     et_home_possession, et_away_possession, et_home_performance, et_away_performance
--   ) VALUES ('match-uuid', true, 90, 100, 52, 48, 55.0, 45.0);
--   -- Row 3: ET 100-110
--   INSERT INTO match_interval_stats2 (match_id, is_extra_time,
--     interval_start, interval_end,
--     et_home_possession, et_away_possession, et_home_performance, et_away_performance
--   ) VALUES ('match-uuid', true, 100, 110, 48, 52, 50.0, 50.0);

COMMIT;
