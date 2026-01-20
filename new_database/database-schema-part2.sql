-- ============================================
-- NEW DATABASE SCHEMA - PART 2
-- Event Tables Continued + Supporting Tables
-- ============================================

-- FINAL THIRD CHANCES
-- Stores chances created in the final third
-- Flow: in box (corner [left/right] OR normal [left/centre/right])
--       not in box → goes to passing flow
CREATE TABLE public.final_third_chances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  chance_x REAL CHECK (chance_x >= 0 AND chance_x <= 100),
  chance_y REAL CHECK (chance_y >= 0 AND chance_y <= 100),
  
  -- In box or not
  is_in_box BOOLEAN NOT NULL,
  
  -- IF IN BOX: Corner or Normal
  is_corner BOOLEAN DEFAULT false,
  
  -- For corners
  corner_side TEXT CHECK (corner_side IN ('left', 'right')),
  corner_type TEXT CHECK (corner_type IN ('short', 'long')),  -- Keep for additional info
  long_corner_success BOOLEAN,
  
  -- For normal chances in box
  location_in_box TEXT CHECK (location_in_box IN ('left', 'centre', 'right')),
  
  -- If NOT in box, this should ideally be recorded as a pass event
  -- But we keep the record here for tracking purposes
  related_pass_event_id UUID REFERENCES pass_events(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT corner_has_side CHECK (
    (is_corner = false) OR (corner_side IS NOT NULL)
  ),
  CONSTRAINT normal_in_box_has_location CHECK (
    (is_corner = true) OR (is_in_box = false) OR (location_in_box IS NOT NULL)
  )
);

CREATE INDEX idx_final_third_match ON final_third_chances(match_id);
CREATE INDEX idx_final_third_player ON final_third_chances(player_id);
CREATE INDEX idx_final_third_team ON final_third_chances(team_id);
CREATE INDEX idx_final_third_match_team ON final_third_chances(match_id, team_id);

-- SET PIECES
-- Stores set piece events (goal kicks, free kicks, corners)
-- Flow: set piece type → first contact (yes/no) → second contact (yes/no) → reached opponent box (yes/no)
-- NOTE: This table is defined BEFORE fouls to avoid circular reference
CREATE TABLE public.set_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,  -- Who took the set piece
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  set_piece_x REAL CHECK (set_piece_x >= 0 AND set_piece_x <= 100),
  set_piece_y REAL CHECK (set_piece_y >= 0 AND set_piece_y <= 100),
  
  -- Type
  set_piece_type TEXT NOT NULL CHECK (set_piece_type IN ('goal_kick', 'free_kick', 'corner')),
  
  -- First contact
  first_contact_made BOOLEAN DEFAULT false,
  first_contact_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- Second contact
  second_contact_made BOOLEAN DEFAULT false,
  second_contact_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- Outcome
  reached_opponent_box BOOLEAN DEFAULT false,
  
  -- For corners - additional info
  corner_side TEXT CHECK (corner_side IN ('left', 'right')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT corner_has_side CHECK (
    (set_piece_type != 'corner') OR (corner_side IS NOT NULL)
  ),
  CONSTRAINT first_contact_requires_player CHECK (
    (first_contact_made = false) OR (first_contact_player_id IS NOT NULL)
  ),
  CONSTRAINT second_contact_requires_player CHECK (
    (second_contact_made = false) OR (second_contact_player_id IS NOT NULL)
  )
);

CREATE INDEX idx_set_pieces_match ON set_pieces(match_id);
CREATE INDEX idx_set_pieces_player ON set_pieces(player_id);
CREATE INDEX idx_set_pieces_team ON set_pieces(team_id);
CREATE INDEX idx_set_pieces_match_team ON set_pieces(match_id, team_id);
CREATE INDEX idx_set_pieces_type ON set_pieces(set_piece_type);

-- FOULS
-- Stores individual foul events
-- Flow: foul → yellow/red/no card → results in freekick
CREATE TABLE public.fouls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- Players involved
  fouling_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  fouling_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  fouled_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  fouled_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  foul_x REAL CHECK (foul_x >= 0 AND foul_x <= 100),
  foul_y REAL CHECK (foul_y >= 0 AND foul_y <= 100),
  
  -- Card given
  card_given TEXT NOT NULL CHECK (card_given IN ('yellow', 'red', 'none')),
  
  -- Result (Note 6: fouls = No. of freekicks, but some fouls might not result in freekick)
  resulted_in_freekick BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT foul_different_teams CHECK (fouling_team_id != fouled_team_id)
);

CREATE INDEX idx_fouls_match ON fouls(match_id);
CREATE INDEX idx_fouls_fouling_player ON fouls(fouling_player_id);
CREATE INDEX idx_fouls_fouled_player ON fouls(fouled_player_id);
CREATE INDEX idx_fouls_match_team ON fouls(match_id, fouling_team_id);

-- Add foul_id to set_pieces for free kicks (circular reference handled)
-- This links a free kick back to the foul that caused it
ALTER TABLE set_pieces ADD COLUMN foul_id UUID REFERENCES fouls(id) ON DELETE SET NULL;
ALTER TABLE set_pieces ADD CONSTRAINT freekick_has_foul CHECK (
  (set_piece_type != 'free_kick') OR (foul_id IS NOT NULL)
);

-- ============================================
-- SUPPORTING TABLES
-- ============================================

-- MATCH POSSESSION (Minute-by-minute tracking)
CREATE TABLE public.match_possession (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 90),
  home_possession INTEGER NOT NULL CHECK (home_possession >= 0 AND home_possession <= 100),
  away_possession INTEGER NOT NULL CHECK (away_possession >= 0 AND away_possession <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT possession_sums_to_100 CHECK (home_possession + away_possession = 100),
  UNIQUE(match_id, minute)
);

CREATE INDEX idx_match_possession_match ON match_possession(match_id);

-- MATCH PERFORMANCE (Minute-by-minute performance ratings)
CREATE TABLE public.match_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 90),
  home_performance INTEGER NOT NULL CHECK (home_performance >= 0 AND home_performance <= 100),
  away_performance INTEGER NOT NULL CHECK (away_performance >= 0 AND away_performance <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, minute)
);

CREATE INDEX idx_match_performance_match ON match_performance(match_id);

-- MATCH HIGHLIGHTS
CREATE TABLE public.match_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  highlight_type TEXT NOT NULL CHECK (highlight_type IN (
    'goal', 'assist', 'shot_on_target', 'save', 'penalty',
    'yellow_card', 'red_card', 'offside', 'corner', 'free_kick',
    'substitution', 'chances_created', 'cross', 'other'
  )),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_highlights_match ON match_highlights(match_id);

-- MATCH VIDEO NOTES
CREATE TABLE public.match_video_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  note_text TEXT NOT NULL,
  home_notes TEXT,
  away_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_video_notes_match ON match_video_notes(match_id);

-- MATCH ANALYTICAL MAPS (URLs to generated heatmaps, etc.)
CREATE TABLE public.match_analytical_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  heatmap_url TEXT,
  touchmap_url TEXT,
  chances_created_final_third_team_url TEXT,
  chances_created_final_third_opponent_url TEXT,
  team_final_third_left TEXT,
  team_final_third_center TEXT,
  team_final_third_right TEXT,
  opponent_final_third_left TEXT,
  opponent_final_third_center TEXT,
  opponent_final_third_right TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_analytical_maps_match ON match_analytical_maps(match_id);

-- MATCH CAPTURED FRAMES (Video frame captures)
CREATE TABLE public.match_captured_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp_seconds DOUBLE PRECISION NOT NULL,
  formatted_time TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  annotated_image_url TEXT,
  is_exact_frame BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_captured_frames_match ON match_captured_frames(match_id);
CREATE INDEX idx_match_captured_frames_user ON match_captured_frames(user_id);

-- FRAME CACHE (For video processing)
CREATE TABLE public.frame_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  video_id TEXT NOT NULL,
  timestamp_seconds REAL NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_frame_cache_key ON frame_cache(cache_key);
CREATE INDEX idx_frame_cache_video ON frame_cache(video_id);

-- ============================================
-- OPTIONAL TABLES (For future features)
-- ============================================

-- KNOWLEDGE BASE (Coach's knowledge repository)
CREATE TABLE public.knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  summarize BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_user ON knowledge(user_id);
CREATE INDEX idx_knowledge_type ON knowledge(type);

-- TEAM PROFILE (Additional team information)
CREATE TABLE public.team_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  league_name TEXT NOT NULL,
  team_tier INTEGER NOT NULL CHECK (team_tier IN (1, 2, 3)),
  head_coach_name TEXT NOT NULL,
  team_email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_profile_user ON team_profile(user_id);

-- PLAYER INTERVIEWS (For player development tracking)
CREATE TABLE public.player_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL,
  score TEXT,
  youtube_link TEXT,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  home_team_first_half TEXT,
  home_team_second_half TEXT,
  away_team_first_half TEXT,
  away_team_second_half TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_interviews_team ON player_interviews(team_id);

-- PLAYER INTERVIEW NOTES
CREATE TABLE public.player_interview_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_interview_id UUID NOT NULL REFERENCES player_interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp_seconds REAL NOT NULL CHECK (timestamp_seconds >= 0),
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_interview_notes_interview ON player_interview_notes(player_interview_id);
CREATE INDEX idx_player_interview_notes_user ON player_interview_notes(user_id);

-- SCHEMA BASELINE (For tracking schema changes)
CREATE TABLE public.schema_baseline (
  table_name TEXT PRIMARY KEY,
  created_via TEXT NOT NULL CHECK (created_via IN ('migration', 'dashboard', 'unknown')),
  first_migration TEXT,
  rls_enabled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  documented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMMENTS ON TABLES
-- ============================================

COMMENT ON TABLE leagues IS 'Stores football leagues and competitions';
COMMENT ON TABLE teams IS 'Stores team information';
COMMENT ON TABLE team_leagues IS 'Junction table for team-league many-to-many relationship';
COMMENT ON TABLE players IS 'Stores player information';
COMMENT ON TABLE matches IS 'Stores match information with home/away teams and scores';
COMMENT ON TABLE pass_events IS 'Stores every pass attempt with full flow tracking (successful/unsuccessful, progressive, key pass, outplays, etc.)';
COMMENT ON TABLE shots_on_target IS 'Stores every shot on target (goal or saved)';
COMMENT ON TABLE keeper_actions IS 'Stores goalkeeper actions (saves, collections, goals conceded)';
COMMENT ON TABLE duels IS 'Stores player duels (aerial and dribble) with progressive carry tracking';
COMMENT ON TABLE final_third_chances IS 'Stores chances created in final third (corners, in-box chances)';
COMMENT ON TABLE fouls IS 'Stores individual foul events with cards and links to freekicks';
COMMENT ON TABLE set_pieces IS 'Stores set piece events (goal kicks, free kicks, corners) with contact tracking';
COMMENT ON TABLE match_possession IS 'Minute-by-minute possession tracking';
COMMENT ON TABLE match_performance IS 'Minute-by-minute performance ratings';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Next step: Create database views for aggregated statistics
-- See database-schema-part3.sql for views
