-- ============================================
-- DATABASE UPDATE: Stats Structure Alignment
-- ============================================
-- This migration aligns the database with stats_structure.md
-- Run in Supabase SQL Editor in ONE transaction
-- Created: 2026-02-07
-- ============================================

BEGIN;

-- ============================================
-- 1. PASS_EVENTS TABLE UPDATES
-- ============================================

-- Add pass length classification (SHORT/LONG)
ALTER TABLE public.pass_events 
ADD COLUMN IF NOT EXISTS pass_length text 
CHECK (pass_length = ANY (ARRAY['short'::text, 'long'::text]));

-- Add video timestamp tracking
ALTER TABLE public.pass_events 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.pass_events 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- Add failure subtype for secondary failure actions
ALTER TABLE public.pass_events 
ADD COLUMN IF NOT EXISTS failure_subtype text 
CHECK (failure_subtype = ANY (ARRAY['tackle'::text, 'unsuccessful_cross'::text, 'ball_collection'::text]));

-- Update failure_reason CHECK to include all needed values
-- First drop the existing constraint
ALTER TABLE public.pass_events 
DROP CONSTRAINT IF EXISTS pass_events_failure_reason_check;

-- Add updated constraint with all failure types
ALTER TABLE public.pass_events 
ADD CONSTRAINT pass_events_failure_reason_check 
CHECK (failure_reason = ANY (ARRAY['block'::text, 'clearance'::text, 'interception'::text, 'offside'::text, 'ball_collection'::text, 'unsuccessful_cross'::text, 'tackle'::text]));

-- Change is_ball_recovery to ball_recovery_result for more detail
ALTER TABLE public.pass_events 
ADD COLUMN IF NOT EXISTS ball_recovery_result text 
CHECK (ball_recovery_result = ANY (ARRAY['successful'::text, 'unsuccessful'::text]));

-- Migrate existing data
UPDATE public.pass_events 
SET ball_recovery_result = CASE 
    WHEN is_ball_recovery = true THEN 'successful' 
    ELSE NULL 
END
WHERE ball_recovery_result IS NULL AND is_ball_recovery IS NOT NULL;

-- ============================================
-- 2. FINAL_THIRD_CHANCES TABLE UPDATES (Chances Created)
-- ============================================

-- Add chance receiver (who received the created chance)
ALTER TABLE public.final_third_chances 
ADD COLUMN IF NOT EXISTS chance_receiver_id uuid REFERENCES public.players(id);

-- Add chance sub-type (CORNER vs NORMAL)
ALTER TABLE public.final_third_chances 
ADD COLUMN IF NOT EXISTS chance_sub_type text 
CHECK (chance_sub_type = ANY (ARRAY['corner'::text, 'normal'::text]));

-- Add video timestamp tracking
ALTER TABLE public.final_third_chances 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.final_third_chances 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- Update corner_side to chance_side with CENTRE option
ALTER TABLE public.final_third_chances 
DROP CONSTRAINT IF EXISTS final_third_chances_corner_side_check;

ALTER TABLE public.final_third_chances 
RENAME COLUMN corner_side TO chance_side;

ALTER TABLE public.final_third_chances 
ADD CONSTRAINT final_third_chances_chance_side_check 
CHECK (chance_side = ANY (ARRAY['left'::text, 'right'::text, 'centre'::text]));

-- ============================================
-- 3. SHOTS_ON_TARGET TABLE UPDATES
-- ============================================

-- Add shot end coordinates
ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS shot_end_x real 
CHECK (shot_end_x >= 0::double precision AND shot_end_x <= 100::double precision);

ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS shot_end_y real 
CHECK (shot_end_y >= 0::double precision AND shot_end_y <= 100::double precision);

-- Add explicit shot result (replaces boolean logic)
ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS shot_result text 
CHECK (shot_result = ANY (ARRAY['goal'::text, 'saved'::text, 'off_target'::text]));

-- Migrate existing data to shot_result
UPDATE public.shots_on_target 
SET shot_result = CASE 
    WHEN is_goal = true THEN 'goal'
    WHEN is_saved = true THEN 'saved'
    ELSE 'off_target'
END
WHERE shot_result IS NULL;

-- Add save location (for shots that were saved)
ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS save_location text 
CHECK (save_location = ANY (ARRAY['inside_box'::text, 'outside_box'::text]));

-- Add opponent (goalkeeper) reference
ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS shot_opponent_id uuid REFERENCES public.players(id);

-- Add video timestamp tracking
ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.shots_on_target 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- ============================================
-- 4. DUELS TABLE UPDATES
-- ============================================

-- Add explicit duel outcome text
ALTER TABLE public.duels 
ADD COLUMN IF NOT EXISTS duel_outcome text 
CHECK (duel_outcome = ANY (ARRAY['won'::text, 'lost'::text, 'successful'::text, 'unsuccessful'::text]));

-- Migrate existing data
UPDATE public.duels 
SET duel_outcome = CASE 
    WHEN duel_type = 'aerial' AND is_successful = true THEN 'won'
    WHEN duel_type = 'aerial' AND is_successful = false THEN 'lost'
    WHEN duel_type = 'dribble' AND is_successful = true THEN 'successful'
    WHEN duel_type = 'dribble' AND is_successful = false THEN 'unsuccessful'
END
WHERE duel_outcome IS NULL;

-- Add video timestamp tracking
ALTER TABLE public.duels 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.duels 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- ============================================
-- 5. SET_PIECES TABLE UPDATES
-- ============================================

-- Update set_piece_type to include THROW_IN
ALTER TABLE public.set_pieces 
DROP CONSTRAINT IF EXISTS set_pieces_set_piece_type_check;

ALTER TABLE public.set_pieces 
ADD CONSTRAINT set_pieces_set_piece_type_check 
CHECK (set_piece_type = ANY (ARRAY['goal_kick'::text, 'free_kick'::text, 'corner'::text, 'throw_in'::text]));

-- Add card tracking for set pieces
ALTER TABLE public.set_pieces 
ADD COLUMN IF NOT EXISTS set_piece_card text 
CHECK (set_piece_card = ANY (ARRAY['yellow'::text, 'red'::text, 'none'::text]));

-- Add direct opponent reference (fouler for free kicks)
ALTER TABLE public.set_pieces 
ADD COLUMN IF NOT EXISTS opponent_player_id uuid REFERENCES public.players(id);

-- Add video timestamp tracking
ALTER TABLE public.set_pieces 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.set_pieces 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- ============================================
-- 6. KEEPER_ACTIONS TABLE UPDATES
-- ============================================

-- Add video timestamp tracking
ALTER TABLE public.keeper_actions 
ADD COLUMN IF NOT EXISTS video_time_sec real;

ALTER TABLE public.keeper_actions 
ADD COLUMN IF NOT EXISTS formatted_time text;

-- ============================================
-- 7. NEW TABLE: PLAYER_HEATMAPS
-- ============================================

CREATE TABLE IF NOT EXISTS public.player_heatmaps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    heatmap_image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT player_heatmaps_pkey PRIMARY KEY (id),
    CONSTRAINT player_heatmaps_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE,
    CONSTRAINT player_heatmaps_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Unique constraint: one heatmap per player per match
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_heatmaps_unique 
ON public.player_heatmaps(match_id, player_id);

-- Enable RLS
ALTER TABLE public.player_heatmaps ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. NEW TABLE: PHYSICAL_STATS
-- ============================================

CREATE TABLE IF NOT EXISTS public.physical_stats (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid NOT NULL,
    player_id uuid NOT NULL,
    distance_covered_meters real CHECK (distance_covered_meters >= 0),
    sprint_count integer DEFAULT 0 CHECK (sprint_count >= 0),
    high_intensity_runs integer DEFAULT 0 CHECK (high_intensity_runs >= 0),
    top_speed_kmh real CHECK (top_speed_kmh >= 0),
    average_speed_kmh real CHECK (average_speed_kmh >= 0),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT physical_stats_pkey PRIMARY KEY (id),
    CONSTRAINT physical_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE,
    CONSTRAINT physical_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Unique constraint: one entry per player per match
CREATE UNIQUE INDEX IF NOT EXISTS idx_physical_stats_unique 
ON public.physical_stats(match_id, player_id);

-- Enable RLS
ALTER TABLE public.physical_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. CREATE INDEXES FOR NEW COLUMNS
-- ============================================

-- Pass events indexes
CREATE INDEX IF NOT EXISTS idx_pass_events_pass_length ON public.pass_events(pass_length);
CREATE INDEX IF NOT EXISTS idx_pass_events_failure_subtype ON public.pass_events(failure_subtype);

-- Shots indexes
CREATE INDEX IF NOT EXISTS idx_shots_shot_result ON public.shots_on_target(shot_result);
CREATE INDEX IF NOT EXISTS idx_shots_opponent ON public.shots_on_target(shot_opponent_id);

-- Duels indexes
CREATE INDEX IF NOT EXISTS idx_duels_outcome ON public.duels(duel_outcome);

-- Set pieces indexes
CREATE INDEX IF NOT EXISTS idx_set_pieces_card ON public.set_pieces(set_piece_card);

-- Heatmaps indexes
CREATE INDEX IF NOT EXISTS idx_player_heatmaps_match ON public.player_heatmaps(match_id);
CREATE INDEX IF NOT EXISTS idx_player_heatmaps_player ON public.player_heatmaps(player_id);

-- Physical stats indexes
CREATE INDEX IF NOT EXISTS idx_physical_stats_match ON public.physical_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_physical_stats_player ON public.physical_stats(player_id);

-- ============================================
-- 10. UPDATE MATERIALIZED VIEWS
-- ============================================

-- Drop existing views to recreate with new columns
DROP MATERIALIZED VIEW IF EXISTS public.player_match_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.match_statistics_summary CASCADE;

-- Recreate match_statistics_summary with updated aggregations
CREATE MATERIALIZED VIEW public.match_statistics_summary AS
WITH pass_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) FILTER (WHERE is_successful) as successful_passes,
        COUNT(*) FILTER (WHERE NOT is_successful) as unsuccessful_passes,
        COUNT(*) as total_passes,
        COUNT(*) FILTER (WHERE is_progressive_pass) as progressive_passes,
        COUNT(*) FILTER (WHERE is_key_pass) as key_passes,
        COUNT(*) FILTER (WHERE is_assist) as assists,
        COUNT(*) FILTER (WHERE is_cross) as crosses,
        COUNT(*) FILTER (WHERE failure_reason = 'interception') as interceptions,
        COUNT(*) FILTER (WHERE failure_reason = 'block') as blocks,
        COUNT(*) FILTER (WHERE failure_reason = 'clearance') as clearances,
        COUNT(*) FILTER (WHERE ball_recovery_result = 'successful') as ball_recoveries,
        COUNT(*) FILTER (WHERE is_high_press AND ball_recovery_result = 'successful') as high_press_recoveries,
        COUNT(*) FILTER (WHERE pass_length = 'long') as long_passes,
        COUNT(*) FILTER (WHERE pass_length = 'short') as short_passes
    FROM pass_events
    GROUP BY match_id, team_id
),
shot_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) as shots_on_target,
        COUNT(*) FILTER (WHERE is_goal) as goals,
        COUNT(*) FILTER (WHERE is_penalty) as penalties,
        COUNT(*) FILTER (WHERE is_saved) as shots_saved,
        COUNT(*) FILTER (WHERE shot_result = 'off_target') as shots_off_target
    FROM shots_on_target
    GROUP BY match_id, team_id
),
duel_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) FILTER (WHERE duel_type = 'aerial' AND is_successful) as aerial_duels_won,
        COUNT(*) FILTER (WHERE duel_type = 'aerial') as aerial_duels_total,
        COUNT(*) FILTER (WHERE duel_type = 'dribble' AND is_successful) as successful_dribbles,
        COUNT(*) FILTER (WHERE duel_type = 'dribble') as total_dribbles,
        COUNT(*) FILTER (WHERE is_progressive_carry) as progressive_carries
    FROM duels
    GROUP BY match_id, team_id
),
keeper_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) FILTER (WHERE action_type = 'save') as saves,
        COUNT(*) FILTER (WHERE action_type = 'save' AND save_location = 'inside_box') as saves_inside_box,
        COUNT(*) FILTER (WHERE action_type = 'save' AND save_location = 'outside_box') as saves_outside_box,
        COUNT(*) FILTER (WHERE action_type = 'goal_conceded') as goals_conceded
    FROM keeper_actions
    GROUP BY match_id, team_id
),
foul_stats AS (
    SELECT 
        match_id,
        fouling_team_id as team_id,
        COUNT(*) as fouls_committed,
        COUNT(*) FILTER (WHERE card_given = 'yellow') as yellow_cards,
        COUNT(*) FILTER (WHERE card_given = 'red') as red_cards
    FROM fouls
    GROUP BY match_id, fouling_team_id
),
set_piece_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) FILTER (WHERE set_piece_type = 'corner') as corners,
        COUNT(*) FILTER (WHERE set_piece_type = 'free_kick') as freekicks,
        COUNT(*) FILTER (WHERE set_piece_type = 'throw_in') as throw_ins
    FROM set_pieces
    GROUP BY match_id, team_id
),
chance_stats AS (
    SELECT 
        match_id,
        team_id,
        COUNT(*) as final_third_entries,
        COUNT(*) FILTER (WHERE is_in_box) as chances_in_box
    FROM final_third_chances
    GROUP BY match_id, team_id
)
SELECT 
    m.id as match_id,
    m.home_team_id,
    m.away_team_id,
    m.our_team_id,
    m.home_team_id as team_id,
    m.away_team_id as opponent_id,
    
    -- Home Stats
    COALESCE(hp.successful_passes, 0) as home_successful_passes,
    COALESCE(hp.unsuccessful_passes, 0) as home_unsuccessful_passes,
    COALESCE(hp.total_passes, 0) as home_total_passes,
    COALESCE(hp.progressive_passes, 0) as home_progressive_passes,
    COALESCE(hp.key_passes, 0) as home_key_passes,
    COALESCE(hp.assists, 0) as home_assists,
    COALESCE(hp.crosses, 0) as home_crosses,
    COALESCE(hp.interceptions, 0) as home_interceptions,
    COALESCE(hp.blocks, 0) as home_blocks,
    COALESCE(hp.clearances, 0) as home_clearances,
    COALESCE(hp.ball_recoveries, 0) as home_ball_recoveries,
    COALESCE(hp.high_press_recoveries, 0) as home_high_press_recoveries,
    COALESCE(hp.long_passes, 0) as home_long_passes,
    COALESCE(hp.short_passes, 0) as home_short_passes,
    COALESCE(hs.shots_on_target, 0) as home_shots_on_target,
    COALESCE(hs.goals, 0) as home_goals,
    COALESCE(hs.penalties, 0) as home_penalties,
    COALESCE(hs.shots_saved, 0) as home_shots_saved,
    COALESCE(hs.shots_off_target, 0) as home_shots_off_target,
    COALESCE(hd.aerial_duels_won, 0) as home_aerial_duels_won,
    COALESCE(hd.aerial_duels_total, 0) as home_aerial_duels_total,
    COALESCE(hd.successful_dribbles, 0) as home_successful_dribbles,
    COALESCE(hd.total_dribbles, 0) as home_total_dribbles,
    COALESCE(hd.progressive_carries, 0) as home_progressive_carries,
    COALESCE(hk.saves, 0) as home_saves,
    COALESCE(hk.saves_inside_box, 0) as home_saves_inside_box,
    COALESCE(hk.saves_outside_box, 0) as home_saves_outside_box,
    COALESCE(hk.goals_conceded, 0) as home_goals_conceded,
    COALESCE(hf.fouls_committed, 0) as home_fouls_committed,
    COALESCE(hf.yellow_cards, 0) as home_yellow_cards,
    COALESCE(hf.red_cards, 0) as home_red_cards,
    COALESCE(hsp.corners, 0) as home_corners,
    COALESCE(hsp.freekicks, 0) as home_freekicks,
    COALESCE(hsp.throw_ins, 0) as home_throw_ins,
    COALESCE(hc.final_third_entries, 0) as home_final_third_entries,
    COALESCE(hc.chances_in_box, 0) as home_chances_in_box,
    
    -- Away Stats
    COALESCE(ap.successful_passes, 0) as away_successful_passes,
    COALESCE(ap.unsuccessful_passes, 0) as away_unsuccessful_passes,
    COALESCE(ap.total_passes, 0) as away_total_passes,
    COALESCE(ap.progressive_passes, 0) as away_progressive_passes,
    COALESCE(ap.key_passes, 0) as away_key_passes,
    COALESCE(ap.assists, 0) as away_assists,
    COALESCE(ap.crosses, 0) as away_crosses,
    COALESCE(ap.interceptions, 0) as away_interceptions,
    COALESCE(ap.blocks, 0) as away_blocks,
    COALESCE(ap.clearances, 0) as away_clearances,
    COALESCE(ap.ball_recoveries, 0) as away_ball_recoveries,
    COALESCE(ap.high_press_recoveries, 0) as away_high_press_recoveries,
    COALESCE(ap.long_passes, 0) as away_long_passes,
    COALESCE(ap.short_passes, 0) as away_short_passes,
    COALESCE(as_stats.shots_on_target, 0) as away_shots_on_target,
    COALESCE(as_stats.goals, 0) as away_goals,
    COALESCE(as_stats.penalties, 0) as away_penalties,
    COALESCE(as_stats.shots_saved, 0) as away_shots_saved,
    COALESCE(as_stats.shots_off_target, 0) as away_shots_off_target,
    COALESCE(ad.aerial_duels_won, 0) as away_aerial_duels_won,
    COALESCE(ad.aerial_duels_total, 0) as away_aerial_duels_total,
    COALESCE(ad.successful_dribbles, 0) as away_successful_dribbles,
    COALESCE(ad.total_dribbles, 0) as away_total_dribbles,
    COALESCE(ad.progressive_carries, 0) as away_progressive_carries,
    COALESCE(ak.saves, 0) as away_saves,
    COALESCE(ak.saves_inside_box, 0) as away_saves_inside_box,
    COALESCE(ak.saves_outside_box, 0) as away_saves_outside_box,
    COALESCE(ak.goals_conceded, 0) as away_goals_conceded,
    COALESCE(af.fouls_committed, 0) as away_fouls_committed,
    COALESCE(af.yellow_cards, 0) as away_yellow_cards,
    COALESCE(af.red_cards, 0) as away_red_cards,
    COALESCE(asp.corners, 0) as away_corners,
    COALESCE(asp.freekicks, 0) as away_freekicks,
    COALESCE(asp.throw_ins, 0) as away_throw_ins,
    COALESCE(ac.final_third_entries, 0) as away_final_third_entries,
    COALESCE(ac.chances_in_box, 0) as away_chances_in_box

FROM matches m
LEFT JOIN pass_stats hp ON m.id = hp.match_id AND m.home_team_id = hp.team_id
LEFT JOIN pass_stats ap ON m.id = ap.match_id AND m.away_team_id = ap.team_id
LEFT JOIN shot_stats hs ON m.id = hs.match_id AND m.home_team_id = hs.team_id
LEFT JOIN shot_stats as_stats ON m.id = as_stats.match_id AND m.away_team_id = as_stats.team_id
LEFT JOIN duel_stats hd ON m.id = hd.match_id AND m.home_team_id = hd.team_id
LEFT JOIN duel_stats ad ON m.id = ad.match_id AND m.away_team_id = ad.team_id
LEFT JOIN keeper_stats hk ON m.id = hk.match_id AND m.home_team_id = hk.team_id
LEFT JOIN keeper_stats ak ON m.id = ak.match_id AND m.away_team_id = ak.team_id
LEFT JOIN foul_stats hf ON m.id = hf.match_id AND m.home_team_id = hf.team_id
LEFT JOIN foul_stats af ON m.id = af.match_id AND m.away_team_id = af.team_id
LEFT JOIN set_piece_stats hsp ON m.id = hsp.match_id AND m.home_team_id = hsp.team_id
LEFT JOIN set_piece_stats asp ON m.id = asp.match_id AND m.away_team_id = asp.team_id
LEFT JOIN chance_stats hc ON m.id = hc.match_id AND m.home_team_id = hc.team_id
LEFT JOIN chance_stats ac ON m.id = ac.match_id AND m.away_team_id = ac.team_id;

-- Create indexes on the view
CREATE UNIQUE INDEX idx_match_stats_summary_match ON public.match_statistics_summary(match_id);
CREATE INDEX idx_match_stats_summary_home_team ON public.match_statistics_summary(home_team_id);
CREATE INDEX idx_match_stats_summary_away_team ON public.match_statistics_summary(away_team_id);

-- ============================================
-- 11. PLAYER MATCH STATISTICS VIEW
-- ============================================

CREATE MATERIALIZED VIEW public.player_match_statistics AS
WITH player_pass_stats AS (
    SELECT 
        match_id,
        player_id,
        team_id,
        COUNT(*) FILTER (WHERE is_successful) as successful_passes,
        COUNT(*) FILTER (WHERE NOT is_successful) as unsuccessful_passes,
        COUNT(*) as total_passes,
        COUNT(*) FILTER (WHERE is_progressive_pass) as progressive_passes,
        COUNT(*) FILTER (WHERE is_key_pass) as key_passes,
        COUNT(*) FILTER (WHERE is_assist) as assists,
        COUNT(*) FILTER (WHERE is_cross) as crosses,
        SUM(COALESCE(outplays_players_count, 0)) as total_players_outplayed_passing,
        SUM(COALESCE(outplays_lines_count, 0)) as total_lines_outplayed,
        COUNT(*) FILTER (WHERE pass_length = 'long') as long_passes,
        COUNT(*) FILTER (WHERE pass_length = 'short') as short_passes
    FROM pass_events
    GROUP BY match_id, player_id, team_id
),
player_defensive_stats AS (
    SELECT 
        match_id,
        defending_player_id as player_id,
        COUNT(*) FILTER (WHERE failure_reason = 'interception') as interceptions,
        COUNT(*) FILTER (WHERE failure_reason = 'block') as blocks,
        COUNT(*) FILTER (WHERE failure_reason = 'clearance') as clearances,
        COUNT(*) FILTER (WHERE ball_recovery_result = 'successful') as ball_recoveries,
        COUNT(*) FILTER (WHERE is_high_press) as high_press_actions
    FROM pass_events
    WHERE defending_player_id IS NOT NULL
    GROUP BY match_id, defending_player_id
),
player_shot_stats AS (
    SELECT 
        match_id,
        player_id,
        COUNT(*) as shots_on_target,
        COUNT(*) FILTER (WHERE is_goal) as goals,
        COUNT(*) FILTER (WHERE is_penalty AND is_goal) as penalties_scored,
        COUNT(*) FILTER (WHERE shot_result = 'off_target') as shots_off_target
    FROM shots_on_target
    GROUP BY match_id, player_id
),
player_duel_stats AS (
    SELECT 
        match_id,
        player_id,
        COUNT(*) FILTER (WHERE duel_type = 'aerial' AND is_successful) as aerial_duels_won,
        COUNT(*) FILTER (WHERE duel_type = 'aerial') as aerial_duels_total,
        COUNT(*) FILTER (WHERE duel_type = 'dribble' AND is_successful) as successful_dribbles,
        COUNT(*) FILTER (WHERE duel_type = 'dribble') as total_dribbles,
        COUNT(*) FILTER (WHERE is_progressive_carry) as progressive_carries,
        SUM(COALESCE(players_outplayed_count, 0)) as total_players_outplayed_dribbling
    FROM duels
    GROUP BY match_id, player_id
),
player_keeper_stats AS (
    SELECT 
        match_id,
        player_id,
        COUNT(*) FILTER (WHERE action_type = 'save') as saves,
        COUNT(*) FILTER (WHERE action_type = 'save' AND save_location = 'inside_box') as saves_inside_box,
        COUNT(*) FILTER (WHERE action_type = 'save' AND save_location = 'outside_box') as saves_outside_box,
        COUNT(*) FILTER (WHERE action_type = 'goal_conceded') as goals_conceded,
        COUNT(*) FILTER (WHERE action_type = 'collection') as ball_collections
    FROM keeper_actions
    GROUP BY match_id, player_id
),
player_foul_stats AS (
    SELECT 
        match_id,
        fouling_player_id as player_id,
        COUNT(*) as fouls_committed,
        COUNT(*) FILTER (WHERE card_given = 'yellow') as yellow_cards,
        COUNT(*) FILTER (WHERE card_given = 'red') as red_cards
    FROM fouls
    GROUP BY match_id, fouling_player_id
),
player_fouled_stats AS (
    SELECT 
        match_id,
        fouled_player_id as player_id,
        COUNT(*) as fouls_won
    FROM fouls
    GROUP BY match_id, fouled_player_id
),
player_set_piece_stats AS (
    SELECT 
        match_id,
        player_id,
        COUNT(*) FILTER (WHERE set_piece_type = 'corner') as corners_taken,
        COUNT(*) FILTER (WHERE set_piece_type = 'free_kick') as freekicks_taken
    FROM set_pieces
    GROUP BY match_id, player_id
),
player_chance_stats AS (
    SELECT 
        match_id,
        player_id,
        COUNT(*) as final_third_touches
    FROM final_third_chances
    GROUP BY match_id, player_id
),
player_physical_stats AS (
    SELECT 
        match_id,
        player_id,
        distance_covered_meters,
        sprint_count,
        high_intensity_runs
    FROM physical_stats
)
SELECT 
    p.id as player_id,
    p.first_name,
    p.last_name,
    p.position,
    p.team_id,
    m.id as match_id,
    
    -- Passing
    COALESCE(pps.successful_passes, 0) as successful_passes,
    COALESCE(pps.unsuccessful_passes, 0) as unsuccessful_passes,
    COALESCE(pps.total_passes, 0) as total_passes,
    COALESCE(pps.progressive_passes, 0) as progressive_passes,
    COALESCE(pps.key_passes, 0) as key_passes,
    COALESCE(pps.assists, 0) as assists,
    COALESCE(pps.crosses, 0) as crosses,
    COALESCE(pps.total_players_outplayed_passing, 0) as total_players_outplayed_passing,
    COALESCE(pps.total_lines_outplayed, 0) as total_lines_outplayed,
    COALESCE(pps.long_passes, 0) as long_passes,
    COALESCE(pps.short_passes, 0) as short_passes,
    
    -- Defensive
    COALESCE(pds.interceptions, 0) as interceptions,
    COALESCE(pds.blocks, 0) as blocks,
    COALESCE(pds.clearances, 0) as clearances,
    COALESCE(pds.ball_recoveries, 0) as ball_recoveries,
    COALESCE(pds.high_press_actions, 0) as high_press_actions,
    
    -- Shooting
    COALESCE(pss.shots_on_target, 0) as shots_on_target,
    COALESCE(pss.goals, 0) as goals,
    COALESCE(pss.penalties_scored, 0) as penalties_scored,
    COALESCE(pss.shots_off_target, 0) as shots_off_target,
    
    -- Duels
    COALESCE(pdus.aerial_duels_won, 0) as aerial_duels_won,
    COALESCE(pdus.aerial_duels_total, 0) as aerial_duels_total,
    COALESCE(pdus.successful_dribbles, 0) as successful_dribbles,
    COALESCE(pdus.total_dribbles, 0) as total_dribbles,
    COALESCE(pdus.progressive_carries, 0) as progressive_carries,
    COALESCE(pdus.total_players_outplayed_dribbling, 0) as total_players_outplayed_dribbling,
    
    -- Goalkeeper
    COALESCE(pks.saves, 0) as saves,
    COALESCE(pks.saves_inside_box, 0) as saves_inside_box,
    COALESCE(pks.saves_outside_box, 0) as saves_outside_box,
    COALESCE(pks.goals_conceded, 0) as goals_conceded,
    COALESCE(pks.ball_collections, 0) as ball_collections,
    
    -- Fouls
    COALESCE(pfs.fouls_committed, 0) as fouls_committed,
    COALESCE(pfds.fouls_won, 0) as fouls_won,
    COALESCE(pfs.yellow_cards, 0) as yellow_cards,
    COALESCE(pfs.red_cards, 0) as red_cards,
    
    -- Set Pieces
    COALESCE(psps.corners_taken, 0) as corners_taken,
    COALESCE(psps.freekicks_taken, 0) as freekicks_taken,
    
    -- Final Third
    COALESCE(pcs.final_third_touches, 0) as final_third_touches,
    
    -- Physical Stats
    COALESCE(pphy.distance_covered_meters, 0) as distance_covered_meters,
    COALESCE(pphy.sprint_count, 0) as sprint_count,
    COALESCE(pphy.high_intensity_runs, 0) as high_intensity_runs

FROM players p
CROSS JOIN matches m
LEFT JOIN player_pass_stats pps ON p.id = pps.player_id AND m.id = pps.match_id
LEFT JOIN player_defensive_stats pds ON p.id = pds.player_id AND m.id = pds.match_id
LEFT JOIN player_shot_stats pss ON p.id = pss.player_id AND m.id = pss.match_id
LEFT JOIN player_duel_stats pdus ON p.id = pdus.player_id AND m.id = pdus.match_id
LEFT JOIN player_keeper_stats pks ON p.id = pks.player_id AND m.id = pks.match_id
LEFT JOIN player_foul_stats pfs ON p.id = pfs.player_id AND m.id = pfs.match_id
LEFT JOIN player_fouled_stats pfds ON p.id = pfds.player_id AND m.id = pfds.match_id
LEFT JOIN player_set_piece_stats psps ON p.id = psps.player_id AND m.id = psps.match_id
LEFT JOIN player_chance_stats pcs ON p.id = pcs.player_id AND m.id = pcs.match_id
LEFT JOIN player_physical_stats pphy ON p.id = pphy.player_id AND m.id = pphy.match_id
WHERE (
    pps.player_id IS NOT NULL OR
    pds.player_id IS NOT NULL OR
    pss.player_id IS NOT NULL OR
    pdus.player_id IS NOT NULL OR
    pks.player_id IS NOT NULL OR
    pfs.player_id IS NOT NULL OR
    pfds.player_id IS NOT NULL OR
    psps.player_id IS NOT NULL OR
    pcs.player_id IS NOT NULL OR
    pphy.player_id IS NOT NULL
);

-- Create indexes on the player view
CREATE UNIQUE INDEX idx_player_match_stats_unique ON public.player_match_statistics(player_id, match_id);
CREATE INDEX idx_player_match_stats_match ON public.player_match_statistics(match_id);
CREATE INDEX idx_player_match_stats_player ON public.player_match_statistics(player_id);
CREATE INDEX idx_player_match_stats_team ON public.player_match_statistics(team_id);

-- ============================================
-- 12. REFRESH VIEWS
-- ============================================

REFRESH MATERIALIZED VIEW public.match_statistics_summary;
REFRESH MATERIALIZED VIEW public.player_match_statistics;

-- ============================================
-- 13. ADD COMMENTS
-- ============================================

COMMENT ON TABLE public.player_heatmaps IS 'Stores heatmap image URLs for each player per match';
COMMENT ON TABLE public.physical_stats IS 'Physical performance metrics like distance covered and sprints';
COMMENT ON COLUMN public.pass_events.pass_length IS 'Classification of pass distance: short or long';
COMMENT ON COLUMN public.pass_events.video_time_sec IS 'Raw video timestamp in seconds for this event';
COMMENT ON COLUMN public.shots_on_target.shot_result IS 'Explicit shot outcome: goal, saved, or off_target';
COMMENT ON COLUMN public.shots_on_target.shot_end_x IS 'X coordinate where the shot ended (0-100)';
COMMENT ON COLUMN public.shots_on_target.shot_end_y IS 'Y coordinate where the shot ended (0-100)';

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================
-- SELECT COUNT(*) FROM match_statistics_summary;
-- SELECT COUNT(*) FROM player_match_statistics;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'pass_events' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'shots_on_target' ORDER BY ordinal_position;
