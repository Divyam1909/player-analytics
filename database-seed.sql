-- ============================================
-- DATABASE SEED DATA
-- Player Analytics - Supabase Database Population
-- ============================================
-- WARNING: Run this after the schema is created
-- This script populates all tables with sample data
-- matching the frontend JSON structure
-- ============================================

-- First, we need a user ID for created_by fields
-- In production, replace with actual Supabase auth user ID
-- For development, we allow NULL for seeding

-- ============================================
-- SCHEMA MODIFICATION (For seed data only)
-- ============================================
-- Make created_by nullable to allow seeding without auth user
ALTER TABLE public.matches ALTER COLUMN created_by DROP NOT NULL;

-- ============================================
-- LEAGUES
-- ============================================
INSERT INTO public.leagues (id, league_name, tier, is_default, country, state, league_type)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'MFA Men''s Premiere League', 1, true, 'India', 'Maharashtra', 'professional'),
  ('22222222-2222-2222-2222-222222222222', 'Blue Lock Project', 1, false, 'Japan', 'Tokyo', 'youth'),
  ('33333333-3333-3333-3333-333333333333', 'International Friendlies', 2, false, NULL, NULL, 'friendly');

-- ============================================
-- TEAMS
-- ============================================
INSERT INTO public.teams (id, team_name, team_email, head_coach_name, logo_url, has_free_access, is_onboarded, metadata)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Team Alpha', 'teamalpha@bluelock.jp', 'Jinpachi Ego', NULL, true, true, '{"formation": "4-3-3", "style": "attacking"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Team World Five', 'worldfive@football.org', 'World Coach', NULL, false, true, '{"formation": "4-4-2"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'England U-20', 'u20@theFA.com', 'England Youth Coach', NULL, false, true, '{"formation": "4-2-3-1"}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bombay Gymkhana Men', 'bombaygymkhanamen@post-match.org', 'Rudrashish', NULL, true, true, '{"formation": "4-3-3"}');

-- ============================================
-- PLAYERS
-- ============================================
INSERT INTO public.players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality)
VALUES 
  -- Team Alpha Players
  ('11111111-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yoichi', 'Isagi', 11, 'ST', '2003-04-01', 'Japan'),
  ('11111111-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Meguru', 'Bachira', 8, 'CAM', '2003-08-08', 'Japan'),
  ('11111111-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rensuke', 'Kunigami', 9, 'ST', '2003-01-15', 'Japan'),
  ('11111111-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Seishiro', 'Nagi', 10, 'CF', '2003-07-07', 'Japan'),
  ('11111111-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hyoma', 'Chigiri', 7, 'RW', '2003-03-03', 'Japan'),
  ('11111111-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reo', 'Mikage', 14, 'CAM', '2003-05-05', 'Japan'),
  ('11111111-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Shouei', 'Barou', 6, 'LW', '2003-02-20', 'Japan'),
  ('11111111-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gin', 'Gagamaru', 1, 'GK', '2003-06-15', 'Japan'),
  ('11111111-0000-0000-0000-000000000009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aoshi', 'Tokimitsu', 4, 'CB', '2003-09-10', 'Japan'),
  ('11111111-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ikki', 'Niko', 5, 'CDM', '2003-11-11', 'Japan');

-- ============================================
-- MATCHES
-- ============================================
INSERT INTO public.matches (
  id, team_id_deprecated, is_home_team_deprecated, opponent_name_deprecated,
  team_score, opponent_score, competition_name, match_date,
  created_by, home_team_id, away_team_id, our_team_id, league_id,
  home_score, away_score, home_jersey_color, away_jersey_color
)
VALUES 
  (
    '22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, 'Team World Five',
    9, 2, 'Blue Lock Project Match', '2024-03-15',
    NULL, 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    9, 2, '#0066FF', '#FF0000'
  ),
  (
    '22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, 'England U-20',
    7, 1, 'International Friendly', '2024-03-22',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    7, 1, '#0066FF', '#FFFFFF'
  );

-- ============================================
-- MATCH STATISTICS
-- ============================================
INSERT INTO public.match_statistics (
  id, match_id,
  team_possession, opponent_possession,
  team_passes, opponent_passes,
  team_shots_on_target, opponent_shots_on_target,
  team_corners, opponent_corners,
  team_offsides, opponent_offsides,
  team_aerial_duels_won, opponent_aerial_duels_won,
  team_fouls, opponent_fouls,
  team_chances_created, opponent_chances_created,
  team_saves, opponent_saves,
  team_clearances, opponent_clearances,
  team_interceptions, opponent_interceptions,
  team_successful_dribbles, opponent_successful_dribbles,
  team_conversion_rate, opponent_conversion_rate,
  team_freekicks, opponent_freekicks,
  home_possession, away_possession,
  home_shots_on_target, away_shots_on_target,
  home_performance, away_performance
)
VALUES 
  (
    '33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    62, 38,
    175, 120,
    17, 4,
    8, 3,
    2, 1,
    9, 6,
    8, 12,
    15, 5,
    2, 9,
    6, 8,
    8, 5,
    39, 15,
    52.9, 50.0,
    4, 6,
    62, 38,
    17, 4,
    85, 45
  ),
  (
    '33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002',
    58, 42,
    194, 145,
    14, 3,
    6, 4,
    1, 2,
    10, 4,
    10, 14,
    18, 6,
    3, 7,
    7, 9,
    10, 6,
    30, 12,
    50.0, 33.3,
    5, 7,
    58, 42,
    14, 3,
    82, 48
  );

-- ============================================
-- PASS EVENTS - Match 1 (Team Alpha vs Team World Five)
-- ============================================

-- Player 1 (Isagi) - Match 1 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 12, 30, 45, 30, 65, 25, true, true, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 45, 0, 70, 35, 85, 50, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 20, 15, 35, 45, 50, 40, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 32, 45, 55, 50, 65, 55, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 58, 20, 40, 35, 45, 30, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 75, 10, 60, 45, 72, 50, true, false, true, false, true);

-- Player 2 (Bachira) - Match 1 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 33, 15, 75, 40, 88, 50, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 15, 30, 45, 55, 60, 45, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 28, 0, 50, 40, 65, 35, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 42, 45, 55, 50, 58, 48, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 55, 20, 62, 42, 75, 50, true, true, true, true, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 70, 30, 48, 55, 55, 60, true, false, false, false, false);

-- Player 3 (Kunigami) - Match 1 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 82, 0, 60, 40, 75, 50, true, true, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 25, 15, 55, 55, 60, 50, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 40, 30, 65, 45, 70, 42, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 10, 45, 30, 50, 35, 45, false, false, false, false, false);

-- Player 4 (Nagi) - Match 1 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 58, 0, 80, 50, 90, 55, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 18, 30, 60, 45, 70, 50, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 35, 15, 72, 52, 80, 48, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 50, 45, 55, 40, 62, 42, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 75, 20, 68, 55, 75, 50, true, false, true, false, false);

-- Player 5 (Chigiri) - Match 1 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 24, 0, 60, 25, 85, 50, true, true, true, true, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 12, 30, 35, 20, 50, 25, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 38, 15, 55, 30, 68, 35, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 65, 45, 70, 25, 85, 45, true, true, true, true, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 80, 30, 45, 22, 52, 28, true, false, false, false, false);

-- ============================================
-- PASS EVENTS - Match 2 (Team Alpha vs England U-20)
-- ============================================

-- Player 1 (Isagi) - Match 2 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 8, 0, 35, 50, 55, 40, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 22, 30, 60, 38, 80, 55, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 35, 15, 55, 45, 65, 50, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 48, 45, 40, 52, 50, 48, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 60, 20, 62, 40, 75, 45, true, true, true, false, false);

-- Player 2 (Bachira) - Match 2 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 44, 0, 50, 45, 70, 40, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 15, 30, 40, 50, 55, 45, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 55, 15, 65, 42, 78, 50, true, true, true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 68, 45, 52, 55, 58, 52, true, false, false, false, false);

-- Player 3 (Kunigami) - Match 2 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 53, 0, 55, 35, 70, 45, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 20, 15, 45, 50, 55, 48, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 38, 30, 60, 42, 68, 50, true, false, true, false, false);

-- Player 4 (Nagi) - Match 2 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 25, 0, 70, 48, 82, 52, true, true, true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 55, 30, 65, 50, 75, 48, true, false, true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 75, 15, 58, 42, 70, 45, true, true, true, false, false);

-- Player 5 (Chigiri) - Match 2 passes
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 31, 0, 55, 22, 80, 45, true, true, true, true, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 59, 30, 70, 30, 88, 50, true, true, true, true, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 72, 15, 45, 25, 55, 30, true, false, false, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 82, 45, 62, 28, 75, 42, true, true, true, true, true);

-- ============================================
-- SHOTS ON TARGET - Match 1
-- ============================================
INSERT INTO public.shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty)
VALUES
  -- Isagi goals and shots - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 23, 0, 82, 45, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 67, 30, 88, 52, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 35, 15, 75, 48, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 78, 45, 80, 50, false, false),
  
  -- Bachira goals and shots - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 52, 0, 70, 55, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 85, 30, 78, 48, true, false),
  
  -- Kunigami goals and shots - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 15, 0, 85, 50, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 38, 30, 78, 45, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 61, 0, 90, 55, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 72, 15, 82, 52, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 88, 45, 86, 48, false, false),
  
  -- Nagi goals and shots - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 21, 0, 88, 50, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 84, 30, 85, 48, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 45, 15, 80, 52, false, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 60, 45, 76, 50, false, false),
  
  -- Chigiri goals and shots - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 49, 0, 75, 35, true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 70, 30, 78, 42, false, false);

-- ============================================
-- SHOTS ON TARGET - Match 2
-- ============================================
INSERT INTO public.shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty)
VALUES
  -- Isagi goals and shots - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 41, 0, 78, 48, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 65, 30, 82, 50, false, false),
  
  -- Bachira goals and shots - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 29, 0, 80, 48, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 77, 30, 75, 42, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 55, 15, 72, 55, false, false),
  
  -- Kunigami goals and shots - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 27, 0, 82, 48, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 62, 30, 78, 52, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 80, 15, 85, 50, false, false),
  
  -- Nagi goals and shots - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 16, 0, 90, 52, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 42, 30, 82, 45, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 69, 0, 78, 55, true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 85, 15, 80, 48, false, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 90, 45, 76, 50, false, false),
  
  -- Chigiri shots - Match 2 (no goals)
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 38, 0, 75, 32, false, false);

-- ============================================
-- DUELS - Match 1
-- ============================================
INSERT INTO public.duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful)
VALUES
  -- Isagi duels - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 34, 0, 55, 40, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 55, 30, 65, 52, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 70, 15, 48, 45, 'aerial', true),
  
  -- Bachira duels - Match 1 (dribbling specialist)
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 5, 0, 40, 50, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 18, 30, 60, 45, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 68, 0, 55, 35, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 42, 15, 50, 48, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 80, 45, 62, 55, 'dribble', true),
  
  -- Kunigami duels - Match 1 (aerial specialist)
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 12, 0, 70, 50, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 28, 30, 65, 55, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 48, 15, 72, 48, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 65, 45, 68, 52, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 82, 0, 75, 50, 'aerial', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 55, 30, 60, 45, 'dribble', false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 70, 15, 58, 48, 'dribble', true),
  
  -- Nagi duels - Match 1
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 35, 0, 65, 45, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 50, 30, 70, 50, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 78, 15, 62, 48, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 25, 45, 68, 52, 'aerial', true),
  
  -- Chigiri duels - Match 1 (speed dribbling)
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 7, 0, 30, 20, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 73, 30, 45, 15, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 40, 15, 55, 25, 'dribble', true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 85, 45, 48, 22, 'dribble', false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 62, 0, 60, 28, 'aerial', true);

-- ============================================
-- DUELS - Match 2
-- ============================================
INSERT INTO public.duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful)
VALUES
  -- Isagi duels - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 56, 0, 50, 45, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 35, 30, 55, 50, 'aerial', true),
  
  -- Bachira duels - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 11, 0, 35, 55, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 35, 30, 48, 50, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 60, 15, 55, 48, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 72, 45, 62, 52, 'dribble', false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 82, 0, 58, 45, 'aerial', true),
  
  -- Kunigami duels - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 15, 0, 68, 52, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 32, 30, 72, 48, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 50, 15, 70, 55, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 68, 45, 65, 50, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 78, 0, 74, 52, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 85, 30, 76, 48, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 40, 15, 60, 45, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 58, 45, 55, 50, 'dribble', true),
  
  -- Nagi duels - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 88, 0, 60, 50, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 35, 30, 65, 48, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 52, 15, 70, 52, 'aerial', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 75, 45, 68, 50, 'aerial', true),
  
  -- Chigiri duels - Match 2
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 13, 0, 25, 18, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 45, 30, 50, 25, 'dribble', true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 70, 15, 55, 30, 'dribble', false);

-- ============================================
-- KEEPER ACTIONS
-- ============================================
INSERT INTO public.keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location)
VALUES
  -- Match 1 - Gagamaru (GK)
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 20, 0, 5, 50, 'save', 'inside_box'),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 55, 30, 8, 45, 'save', 'inside_box'),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 75, 15, 3, 52, 'collection', NULL),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 82, 45, 12, 48, 'save', 'outside_box'),
  
  -- Match 2 - Gagamaru (GK)
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 18, 0, 6, 50, 'save', 'inside_box'),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 40, 30, 4, 48, 'save', 'inside_box'),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 65, 15, 5, 55, 'collection', NULL),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000008', 88, 45, 7, 50, 'save', 'inside_box');

-- ============================================
-- FINAL THIRD CHANCES
-- ============================================
INSERT INTO public.final_third_chances (match_id, team_id, player_id, minute, second, chance_x, chance_y, is_corner, corner_type, long_corner_success, is_in_box)
VALUES
  -- Match 1 chances
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 22, 0, 82, 45, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 32, 30, 78, 50, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 45, 15, 85, 48, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 10, 0, 70, 25, true, 'short', NULL, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 55, 45, 72, 75, true, 'long', true, false),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 60, 0, 88, 52, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 72, 30, 80, 48, false, NULL, NULL, true),
  
  -- Match 2 chances
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 15, 0, 88, 50, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000001', 28, 30, 80, 48, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000002', 40, 15, 82, 52, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 25, 0, 68, 22, true, 'long', true, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000005', 50, 45, 70, 78, true, 'short', NULL, false),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000004', 62, 0, 85, 50, false, NULL, NULL, true),
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-0000-0000-0000-000000000003', 75, 30, 78, 55, false, NULL, NULL, true);

-- ============================================
-- MATCH HIGHLIGHTS
-- ============================================
INSERT INTO public.match_highlights (match_id, timestamp, highlight_type, description)
VALUES
  -- Match 1 Highlights
  ('22222222-0000-0000-0000-000000000001', '15:00', 'goal', 'Kunigami scores with a powerful header from Chigiri''s cross'),
  ('22222222-0000-0000-0000-000000000001', '21:00', 'goal', 'Nagi with a spectacular bicycle kick to double the lead'),
  ('22222222-0000-0000-0000-000000000001', '23:00', 'goal', 'Isagi finds the corner with a clinical finish'),
  ('22222222-0000-0000-0000-000000000001', '38:00', 'goal', 'Kunigami with his second, smashing it into the top corner'),
  ('22222222-0000-0000-0000-000000000001', '45:00', 'assist', 'Isagi provides a brilliant through ball for the assist'),
  ('22222222-0000-0000-0000-000000000001', '49:00', 'goal', 'Chigiri beats the offside trap and slots home'),
  ('22222222-0000-0000-0000-000000000001', '61:00', 'goal', 'Kunigami completes his hat-trick'),
  ('22222222-0000-0000-0000-000000000001', '67:00', 'goal', 'Isagi''s second goal of the match'),
  ('22222222-0000-0000-0000-000000000001', '84:00', 'goal', 'Nagi seals the victory with a delicate chip'),
  ('22222222-0000-0000-0000-000000000001', '85:00', 'goal', 'Bachira scores a late goal'),
  
  -- Match 2 Highlights
  ('22222222-0000-0000-0000-000000000002', '16:00', 'goal', 'Nagi opens the scoring with a first-time finish'),
  ('22222222-0000-0000-0000-000000000002', '27:00', 'goal', 'Kunigami powers home a header'),
  ('22222222-0000-0000-0000-000000000002', '29:00', 'goal', 'Bachira dribbles past three defenders and scores'),
  ('22222222-0000-0000-0000-000000000002', '41:00', 'goal', 'Isagi scores from the edge of the box'),
  ('22222222-0000-0000-0000-000000000002', '42:00', 'goal', 'Nagi with his second'),
  ('22222222-0000-0000-0000-000000000002', '69:00', 'goal', 'Nagi completes his hat-trick'),
  ('22222222-0000-0000-0000-000000000002', '77:00', 'goal', 'Bachira with his brace');

-- ============================================
-- MATCH VIDEO NOTES (Sample)
-- ============================================
INSERT INTO public.match_video_notes (match_id, timestamp, note_text, home_notes, away_notes)
VALUES
  ('22222222-0000-0000-0000-000000000001', '10:00', 'Team Alpha pressing high and winning the ball back quickly', 'Good pressing intensity', 'Struggling to build out from the back'),
  ('22222222-0000-0000-0000-000000000001', '30:00', 'Bachira finding lots of space between the lines', 'Excellent movement off the ball', 'Need to mark tighter in midfield'),
  ('22222222-0000-0000-0000-000000000001', '60:00', 'Kunigami dominating in aerial duels', 'Strong physical presence', 'Getting outmuscled at set pieces'),
  ('22222222-0000-0000-0000-000000000002', '20:00', 'Nagi showing incredible first touch control', 'Technical quality on display', 'Defenders too slow to react'),
  ('22222222-0000-0000-0000-000000000002', '45:00', 'Chigiri exploiting space on the right flank', 'Pace causing problems', 'Left back needs more support'),
  ('22222222-0000-0000-0000-000000000002', '80:00', 'Team Alpha controlling possession well', 'Managing the game professionally', 'Running out of ideas');

-- ============================================
-- TEAM LEAGUES (Junction table)
-- ============================================
INSERT INTO public.team_leagues (team_id, league_id, is_primary)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', true);

-- ============================================
-- MATCH POSSESSION (Minute-by-minute)
-- ============================================
INSERT INTO public.match_possession (match_id, minute, team_a_possession, team_b_possession)
VALUES
  -- Match 1 possession timeline
  ('22222222-0000-0000-0000-000000000001', 0, 50, 50),
  ('22222222-0000-0000-0000-000000000001', 15, 58, 42),
  ('22222222-0000-0000-0000-000000000001', 30, 62, 38),
  ('22222222-0000-0000-0000-000000000001', 45, 65, 35),
  ('22222222-0000-0000-0000-000000000001', 60, 60, 40),
  ('22222222-0000-0000-0000-000000000001', 75, 63, 37),
  ('22222222-0000-0000-0000-000000000001', 90, 62, 38),
  
  -- Match 2 possession timeline
  ('22222222-0000-0000-0000-000000000002', 0, 50, 50),
  ('22222222-0000-0000-0000-000000000002', 15, 55, 45),
  ('22222222-0000-0000-0000-000000000002', 30, 58, 42),
  ('22222222-0000-0000-0000-000000000002', 45, 60, 40),
  ('22222222-0000-0000-0000-000000000002', 60, 56, 44),
  ('22222222-0000-0000-0000-000000000002', 75, 58, 42),
  ('22222222-0000-0000-0000-000000000002', 90, 58, 42);

-- ============================================
-- MATCH PERFORMANCE (Minute-by-minute ratings)
-- ============================================
INSERT INTO public.match_performance (match_id, minute, team_a_performance, team_b_performance)
VALUES
  -- Match 1 performance timeline
  ('22222222-0000-0000-0000-000000000001', 0, 50, 50),
  ('22222222-0000-0000-0000-000000000001', 15, 70, 45),
  ('22222222-0000-0000-0000-000000000001', 30, 78, 40),
  ('22222222-0000-0000-0000-000000000001', 45, 82, 38),
  ('22222222-0000-0000-0000-000000000001', 60, 85, 42),
  ('22222222-0000-0000-0000-000000000001', 75, 88, 40),
  ('22222222-0000-0000-0000-000000000001', 90, 85, 45),
  
  -- Match 2 performance timeline
  ('22222222-0000-0000-0000-000000000002', 0, 50, 50),
  ('22222222-0000-0000-0000-000000000002', 15, 65, 48),
  ('22222222-0000-0000-0000-000000000002', 30, 72, 45),
  ('22222222-0000-0000-0000-000000000002', 45, 78, 42),
  ('22222222-0000-0000-0000-000000000002', 60, 80, 50),
  ('22222222-0000-0000-0000-000000000002', 75, 82, 48),
  ('22222222-0000-0000-0000-000000000002', 90, 82, 48);

-- ============================================
-- MATCH ANALYTICAL MAPS
-- ============================================
INSERT INTO public.match_analytical_maps (
  match_id, 
  heatmap_url, 
  touchmap_url,
  team_final_third_left,
  team_final_third_center,
  team_final_third_right,
  opponent_final_third_left,
  opponent_final_third_center,
  opponent_final_third_right
)
VALUES
  ('22222222-0000-0000-0000-000000000001', NULL, NULL, '25', '45', '30', '15', '50', '35'),
  ('22222222-0000-0000-0000-000000000002', NULL, NULL, '28', '42', '30', '20', '48', '32');

-- ============================================
-- Done! Verify data was inserted:
-- ============================================
-- SELECT 'leagues' as table_name, COUNT(*) as count FROM public.leagues
-- UNION ALL SELECT 'teams', COUNT(*) FROM public.teams
-- UNION ALL SELECT 'players', COUNT(*) FROM public.players
-- UNION ALL SELECT 'matches', COUNT(*) FROM public.matches
-- UNION ALL SELECT 'match_statistics', COUNT(*) FROM public.match_statistics
-- UNION ALL SELECT 'pass_events', COUNT(*) FROM public.pass_events
-- UNION ALL SELECT 'shots_on_target', COUNT(*) FROM public.shots_on_target
-- UNION ALL SELECT 'duels', COUNT(*) FROM public.duels
-- UNION ALL SELECT 'keeper_actions', COUNT(*) FROM public.keeper_actions
-- UNION ALL SELECT 'final_third_chances', COUNT(*) FROM public.final_third_chances
-- UNION ALL SELECT 'match_highlights', COUNT(*) FROM public.match_highlights
-- UNION ALL SELECT 'match_video_notes', COUNT(*) FROM public.match_video_notes
-- UNION ALL SELECT 'team_leagues', COUNT(*) FROM public.team_leagues
-- UNION ALL SELECT 'match_possession', COUNT(*) FROM public.match_possession
-- UNION ALL SELECT 'match_performance', COUNT(*) FROM public.match_performance
-- UNION ALL SELECT 'match_analytical_maps', COUNT(*) FROM public.match_analytical_maps;