-- ============================================
-- NEW DATABASE SCHEMA - EVENT-DRIVEN ARCHITECTURE
-- Player Analytics System
-- ============================================
-- This schema is designed for:
-- - Scalability: Easy to add new attributes
-- - Performance: Efficient queries with proper indexes
-- - Data Integrity: Strong foreign key relationships
-- - Football Logic: Reflects real match events
-- ============================================

-- ============================================
-- PART 1: CORE TABLES
-- ============================================

-- LEAGUES
-- Stores football league/competition information
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_name TEXT NOT NULL,
  tier INTEGER CHECK (tier >= 1 AND tier <= 5),
  custom_label TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  country TEXT,
  state TEXT,
  district TEXT,
  league_type TEXT CHECK (league_type IN ('professional', 'youth', 'friendly', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leagues_name ON leagues(league_name);
CREATE INDEX idx_leagues_country ON leagues(country);

-- TEAMS
-- Stores team information
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  team_email TEXT UNIQUE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  head_coach_name TEXT,
  logo_url TEXT,
  has_free_access BOOLEAN NOT NULL DEFAULT false,
  is_onboarded BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_name ON teams(team_name);
CREATE INDEX idx_teams_user_id ON teams(user_id);

-- TEAM_LEAGUES (Junction table for many-to-many relationship)
-- A team can participate in multiple leagues
CREATE TABLE public.team_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, league_id)
);

CREATE INDEX idx_team_leagues_team ON team_leagues(team_id);
CREATE INDEX idx_team_leagues_league ON team_leagues(league_id);

-- PLAYERS
-- Stores player information
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  jersey_number INTEGER CHECK (jersey_number >= 1 AND jersey_number <= 99),
  position TEXT CHECK (position IN ('GK', 'CB', 'RB', 'LB', 'RWB', 'LWB', 'CM', 'CDM', 'CAM', 'RW', 'LW', 'ST', 'CF')),
  date_of_birth DATE,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_name ON players(first_name, last_name);

-- PLAYER ATTRIBUTES
-- Stores player skill ratings (0-100) for radar charts
-- Can be auto-calculated from match performance or manually set by coaches
CREATE TABLE public.player_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  
  -- Skill ratings (0-100)
  passing INTEGER CHECK (passing >= 0 AND passing <= 100),
  shooting INTEGER CHECK (shooting >= 0 AND shooting <= 100),
  dribbling INTEGER CHECK (dribbling >= 0 AND dribbling <= 100),
  defending INTEGER CHECK (defending >= 0 AND defending <= 100),
  physical INTEGER CHECK (physical >= 0 AND physical <= 100),
  overall_rating INTEGER CHECK (overall_rating >= 0 AND overall_rating <= 100),
  
  -- Track if manually set or auto-calculated
  is_manual BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_attributes_player ON player_attributes(player_id);

-- MATCHES
-- Stores match information
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Teams involved
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  our_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,  -- Which team is "ours" in the system
  
  -- Match details
  league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
  competition_name TEXT NOT NULL,
  match_date DATE NOT NULL,
  
  -- Scores
  home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  
  -- Visual
  home_jersey_color VARCHAR,
  away_jersey_color VARCHAR,
  
  -- Media
  video_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id),
  CONSTRAINT our_team_valid CHECK (our_team_id IN (home_team_id, away_team_id))
);

CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_our_team ON matches(our_team_id);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_date ON matches(match_date);

-- ============================================
-- PART 2: EVENT TABLES (The Heart of the System)
-- ============================================

-- PASS EVENTS
-- Stores every pass attempt in a match
-- Follows the pass flow: successful → progressive/normal → key pass → outplays/cross/assist
--                        unsuccessful → tackle (block/clearance/interception) → high press → ball recovery
CREATE TABLE public.pass_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  start_x REAL CHECK (start_x >= 0 AND start_x <= 100),
  start_y REAL CHECK (start_y >= 0 AND start_y <= 100),
  end_x REAL CHECK (end_x >= 0 AND end_x <= 100),
  end_y REAL CHECK (end_y >= 0 AND end_y <= 100),
  
  -- Basic attributes
  is_successful BOOLEAN NOT NULL,
  
  -- SUCCESSFUL PASS ATTRIBUTES
  receiver_player_id UUID REFERENCES players(id) ON DELETE SET NULL,  -- Who received the pass (same team)
  
  -- Progressive vs Normal
  is_progressive_pass BOOLEAN DEFAULT false,
  
  -- Special pass types (for both progressive and normal)
  is_key_pass BOOLEAN DEFAULT false,
  is_cross BOOLEAN DEFAULT false,
  is_assist BOOLEAN DEFAULT false,
  
  -- Outplays (Note 2: track how many players and lines were bypassed)
  outplays_players_count INTEGER DEFAULT 0 CHECK (outplays_players_count >= 0),
  outplays_lines_count INTEGER DEFAULT 0 CHECK (outplays_lines_count >= 0),
  
  -- Assist/Cross types
  assist_pass_type TEXT CHECK (assist_pass_type IN ('normal', 'key', 'progressive')),
  cross_pass_type TEXT CHECK (cross_pass_type IN ('normal', 'key', 'progressive')),
  
  -- UNSUCCESSFUL PASS ATTRIBUTES
  defending_player_id UUID REFERENCES players(id) ON DELETE SET NULL,  -- Who intercepted/blocked (opponent team, NULL for offside)
  
  failure_reason TEXT CHECK (failure_reason IN ('block', 'clearance', 'interception', 'offside')),
  
  -- For interceptions (Note 3: track defensive context)
  is_high_press BOOLEAN DEFAULT false,
  is_ball_recovery BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT pass_successful_requires_receiver CHECK (
    (is_successful = false) OR (receiver_player_id IS NOT NULL)
  ),
  CONSTRAINT pass_unsuccessful_requires_reason CHECK (
    (is_successful = true) OR (failure_reason IS NOT NULL)
  ),
  CONSTRAINT pass_offside_no_defender CHECK (
    (failure_reason != 'offside') OR (defending_player_id IS NULL)
  )
);

CREATE INDEX idx_pass_events_match ON pass_events(match_id);
CREATE INDEX idx_pass_events_player ON pass_events(player_id);
CREATE INDEX idx_pass_events_team ON pass_events(team_id);
CREATE INDEX idx_pass_events_match_team ON pass_events(match_id, team_id);
CREATE INDEX idx_pass_events_receiver ON pass_events(receiver_player_id);
CREATE INDEX idx_pass_events_defender ON pass_events(defending_player_id);

-- KEEPER ACTIONS
-- Stores goalkeeper actions
-- Flow: ball collection, saved (from inside/outside box), goals conceded
-- NOTE: This table is defined BEFORE shots_on_target to avoid circular reference
CREATE TABLE public.keeper_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  action_x REAL CHECK (action_x >= 0 AND action_x <= 100),
  action_y REAL CHECK (action_y >= 0 AND action_y <= 100),
  
  -- Action type
  action_type TEXT NOT NULL CHECK (action_type IN ('save', 'collection', 'goal_conceded')),
  save_location TEXT CHECK (save_location IN ('inside_box', 'outside_box')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT keeper_save_has_location CHECK (
    (action_type != 'save') OR (save_location IS NOT NULL)
  )
);

CREATE INDEX idx_keeper_actions_match ON keeper_actions(match_id);
CREATE INDEX idx_keeper_actions_player ON keeper_actions(player_id);
CREATE INDEX idx_keeper_actions_team ON keeper_actions(team_id);
CREATE INDEX idx_keeper_actions_match_team ON keeper_actions(match_id, team_id);

-- SHOTS ON TARGET
-- Stores every shot on target in a match
-- Flow: shot → goal (penalty/not penalty) OR saved (by keeper)
CREATE TABLE public.shots_on_target (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  shot_x REAL CHECK (shot_x >= 0 AND shot_x <= 100),
  shot_y REAL CHECK (shot_y >= 0 AND shot_y <= 100),
  
  -- Outcome
  is_goal BOOLEAN NOT NULL,
  is_penalty BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT false,
  
  -- Link to keeper action (if saved) - now keeper_actions exists
  keeper_action_id UUID REFERENCES keeper_actions(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT shot_goal_or_saved CHECK (
    (is_goal = true AND is_saved = false) OR
    (is_goal = false)
  )
);

CREATE INDEX idx_shots_match ON shots_on_target(match_id);
CREATE INDEX idx_shots_player ON shots_on_target(player_id);
CREATE INDEX idx_shots_team ON shots_on_target(team_id);
CREATE INDEX idx_shots_match_team ON shots_on_target(match_id, team_id);

-- DUELS
-- Stores player duels (aerial and dribble)
-- Flow: aerial/dribble → successful/unsuccessful
--       successful dribble → progressive carry (yes/no) → inside/outside box + players outplayed
CREATE TABLE public.duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,  -- Player who attempted the duel
  
  -- Timing
  minute INTEGER CHECK (minute >= 0 AND minute <= 130),
  second INTEGER CHECK (second >= 0 AND second <= 59),
  
  -- Location
  duel_x REAL CHECK (duel_x >= 0 AND duel_x <= 100),
  duel_y REAL CHECK (duel_y >= 0 AND duel_y <= 100),
  
  -- Duel type and outcome
  duel_type TEXT NOT NULL CHECK (duel_type IN ('aerial', 'dribble')),
  is_successful BOOLEAN NOT NULL,
  
  -- Opponent (Note 4: track who lost the duel)
  opponent_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- SUCCESSFUL DRIBBLE ATTRIBUTES (Note 5: progressive carry tracking)
  is_progressive_carry BOOLEAN DEFAULT false,
  progressive_carry_location TEXT CHECK (progressive_carry_location IN ('inside_box', 'outside_box')),
  players_outplayed_count INTEGER DEFAULT 0 CHECK (players_outplayed_count >= 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT duel_progressive_only_dribble CHECK (
    (duel_type = 'dribble') OR (is_progressive_carry = false)
  ),
  CONSTRAINT duel_progressive_requires_success CHECK (
    (is_progressive_carry = false) OR (is_successful = true)
  )
);

CREATE INDEX idx_duels_match ON duels(match_id);
CREATE INDEX idx_duels_player ON duels(player_id);
CREATE INDEX idx_duels_team ON duels(team_id);
CREATE INDEX idx_duels_match_team ON duels(match_id, team_id);
CREATE INDEX idx_duels_opponent ON duels(opponent_player_id);
CREATE INDEX idx_duels_type ON duels(duel_type);
