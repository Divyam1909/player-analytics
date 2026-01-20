-- ============================================
-- SEED DATA PART 4: MATCHES & STATISTICS
-- 4 Matches: 2 per league
-- ============================================

-- ============================================
-- MATCHES (4 total)
-- League 1: Mumbai Warriors vs Pune Strikers (2 matches)
-- League 2: Delhi United vs Bangalore FC (2 matches)
-- ============================================

INSERT INTO public.matches (
  id, team_id_deprecated, is_home_team_deprecated, opponent_name_deprecated,
  team_score, opponent_score, competition_name, match_date,
  created_by, home_team_id, away_team_id, our_team_id, league_id,
  home_score, away_score, home_jersey_color, away_jersey_color
)
VALUES 
  -- League 1, Match 1: Mumbai Warriors (home) vs Pune Strikers (away)
  (
    'aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', true, 'Pune Strikers',
    3, 1, 'Premier Football League - Matchweek 1', '2024-09-15',
    NULL, 
    'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 
    'bbbb2222-2222-2222-2222-bbbbbbbbbbbb',
    'aaaa1111-1111-1111-1111-aaaaaaaaaaaa',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    3, 1, '#1E90FF', '#FF4500'
  ),
  -- League 1, Match 2: Pune Strikers (home) vs Mumbai Warriors (away)
  (
    'aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', true, 'Mumbai Warriors',
    2, 2, 'Premier Football League - Matchweek 10', '2024-11-24',
    NULL, 
    'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 
    'aaaa1111-1111-1111-1111-aaaaaaaaaaaa',
    'bbbb2222-2222-2222-2222-bbbbbbbbbbbb',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    2, 2, '#FF4500', '#1E90FF'
  ),
  -- League 2, Match 1: Delhi United (home) vs Bangalore FC (away)
  (
    'aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', true, 'Bangalore FC',
    4, 2, 'National Youth Championship - Quarterfinal', '2024-10-08',
    NULL, 
    'cccc3333-3333-3333-3333-cccccccccccc', 
    'dddd4444-4444-4444-4444-dddddddddddd',
    'cccc3333-3333-3333-3333-cccccccccccc',
    '22222222-bbbb-bbbb-bbbb-222222222222',
    4, 2, '#228B22', '#800080'
  ),
  -- League 2, Match 2: Bangalore FC (home) vs Delhi United (away)
  (
    'aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', true, 'Delhi United',
    1, 3, 'National Youth Championship - Semifinal', '2024-11-05',
    NULL, 
    'dddd4444-4444-4444-4444-dddddddddddd', 
    'cccc3333-3333-3333-3333-cccccccccccc',
    'dddd4444-4444-4444-4444-dddddddddddd',
    '22222222-bbbb-bbbb-bbbb-222222222222',
    1, 3, '#800080', '#228B22'
  )
ON CONFLICT (id) DO UPDATE SET match_date = EXCLUDED.match_date;

-- ============================================
-- MATCH STATISTICS (4 matches)
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
  -- Match 1: Mumbai Warriors 3-1 Pune Strikers
  (
    'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001',
    58, 42,     -- possession
    425, 320,   -- passes
    12, 5,      -- shots on target
    7, 4,       -- corners
    2, 3,       -- offsides
    8, 5,       -- aerial duels won
    11, 14,     -- fouls
    14, 8,      -- chances created
    4, 9,       -- saves
    18, 22,     -- clearances
    12, 9,      -- interceptions
    22, 15,     -- successful dribbles
    25.0, 20.0, -- conversion rate
    6, 8,       -- freekicks
    58, 42,     -- home/away possession
    12, 5,      -- home/away shots on target
    78, 52      -- performance
  ),
  -- Match 2: Pune Strikers 2-2 Mumbai Warriors
  (
    'bbbb0002-0000-0000-0000-000000000002', 'aaaa0002-0000-0000-0000-000000000002',
    52, 48,
    395, 380,
    8, 9,
    5, 6,
    1, 2,
    7, 8,
    13, 12,
    11, 12,
    7, 6,
    20, 19,
    10, 11,
    18, 20,
    25.0, 22.2,
    7, 6,
    52, 48,
    8, 9,
    65, 68
  ),
  -- Match 3: Delhi United 4-2 Bangalore FC
  (
    'bbbb0003-0000-0000-0000-000000000003', 'aaaa0003-0000-0000-0000-000000000003',
    62, 38,
    480, 290,
    15, 7,
    9, 3,
    3, 1,
    10, 6,
    9, 15,
    18, 9,
    5, 11,
    15, 25,
    14, 8,
    28, 12,
    26.7, 28.6,
    5, 9,
    62, 38,
    15, 7,
    82, 48
  ),
  -- Match 4: Bangalore FC 1-3 Delhi United
  (
    'bbbb0004-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004',
    45, 55,
    310, 440,
    6, 13,
    4, 8,
    2, 1,
    5, 9,
    16, 10,
    8, 16,
    10, 3,
    28, 16,
    7, 13,
    14, 25,
    16.7, 23.1,
    10, 6,
    45, 55,
    6, 13,
    45, 80
  )
ON CONFLICT (id) DO UPDATE SET team_possession = EXCLUDED.team_possession;

-- ============================================
-- MATCH POSSESSION (Minute-by-minute for all 4 matches)
-- ============================================
INSERT INTO public.match_possession (match_id, minute, team_a_possession, team_b_possession)
VALUES
  -- Match 1: Mumbai vs Pune
  ('aaaa0001-0000-0000-0000-000000000001', 0, 50, 50),
  ('aaaa0001-0000-0000-0000-000000000001', 15, 55, 45),
  ('aaaa0001-0000-0000-0000-000000000001', 30, 60, 40),
  ('aaaa0001-0000-0000-0000-000000000001', 45, 58, 42),
  ('aaaa0001-0000-0000-0000-000000000001', 60, 56, 44),
  ('aaaa0001-0000-0000-0000-000000000001', 75, 59, 41),
  ('aaaa0001-0000-0000-0000-000000000001', 90, 58, 42),
  
  -- Match 2: Pune vs Mumbai
  ('aaaa0002-0000-0000-0000-000000000002', 0, 50, 50),
  ('aaaa0002-0000-0000-0000-000000000002', 15, 52, 48),
  ('aaaa0002-0000-0000-0000-000000000002', 30, 48, 52),
  ('aaaa0002-0000-0000-0000-000000000002', 45, 54, 46),
  ('aaaa0002-0000-0000-0000-000000000002', 60, 50, 50),
  ('aaaa0002-0000-0000-0000-000000000002', 75, 53, 47),
  ('aaaa0002-0000-0000-0000-000000000002', 90, 52, 48),
  
  -- Match 3: Delhi vs Bangalore
  ('aaaa0003-0000-0000-0000-000000000003', 0, 50, 50),
  ('aaaa0003-0000-0000-0000-000000000003', 15, 58, 42),
  ('aaaa0003-0000-0000-0000-000000000003', 30, 65, 35),
  ('aaaa0003-0000-0000-0000-000000000003', 45, 62, 38),
  ('aaaa0003-0000-0000-0000-000000000003', 60, 60, 40),
  ('aaaa0003-0000-0000-0000-000000000003', 75, 63, 37),
  ('aaaa0003-0000-0000-0000-000000000003', 90, 62, 38),
  
  -- Match 4: Bangalore vs Delhi
  ('aaaa0004-0000-0000-0000-000000000004', 0, 50, 50),
  ('aaaa0004-0000-0000-0000-000000000004', 15, 48, 52),
  ('aaaa0004-0000-0000-0000-000000000004', 30, 42, 58),
  ('aaaa0004-0000-0000-0000-000000000004', 45, 46, 54),
  ('aaaa0004-0000-0000-0000-000000000004', 60, 44, 56),
  ('aaaa0004-0000-0000-0000-000000000004', 75, 45, 55),
  ('aaaa0004-0000-0000-0000-000000000004', 90, 45, 55);

-- ============================================
-- MATCH PERFORMANCE (Minute-by-minute ratings)
-- ============================================
INSERT INTO public.match_performance (match_id, minute, team_a_performance, team_b_performance)
VALUES
  -- Match 1
  ('aaaa0001-0000-0000-0000-000000000001', 0, 50, 50),
  ('aaaa0001-0000-0000-0000-000000000001', 15, 60, 48),
  ('aaaa0001-0000-0000-0000-000000000001', 30, 72, 45),
  ('aaaa0001-0000-0000-0000-000000000001', 45, 75, 50),
  ('aaaa0001-0000-0000-0000-000000000001', 60, 78, 52),
  ('aaaa0001-0000-0000-0000-000000000001', 75, 80, 48),
  ('aaaa0001-0000-0000-0000-000000000001', 90, 78, 52),
  
  -- Match 2
  ('aaaa0002-0000-0000-0000-000000000002', 0, 50, 50),
  ('aaaa0002-0000-0000-0000-000000000002', 15, 55, 58),
  ('aaaa0002-0000-0000-0000-000000000002', 30, 62, 60),
  ('aaaa0002-0000-0000-0000-000000000002', 45, 68, 65),
  ('aaaa0002-0000-0000-0000-000000000002', 60, 65, 68),
  ('aaaa0002-0000-0000-0000-000000000002', 75, 66, 67),
  ('aaaa0002-0000-0000-0000-000000000002', 90, 65, 68),
  
  -- Match 3
  ('aaaa0003-0000-0000-0000-000000000003', 0, 50, 50),
  ('aaaa0003-0000-0000-0000-000000000003', 15, 65, 45),
  ('aaaa0003-0000-0000-0000-000000000003', 30, 75, 40),
  ('aaaa0003-0000-0000-0000-000000000003', 45, 78, 48),
  ('aaaa0003-0000-0000-0000-000000000003', 60, 82, 50),
  ('aaaa0003-0000-0000-0000-000000000003', 75, 85, 45),
  ('aaaa0003-0000-0000-0000-000000000003', 90, 82, 48),
  
  -- Match 4
  ('aaaa0004-0000-0000-0000-000000000004', 0, 50, 50),
  ('aaaa0004-0000-0000-0000-000000000004', 15, 48, 60),
  ('aaaa0004-0000-0000-0000-000000000004', 30, 42, 72),
  ('aaaa0004-0000-0000-0000-000000000004', 45, 50, 75),
  ('aaaa0004-0000-0000-0000-000000000004', 60, 45, 80),
  ('aaaa0004-0000-0000-0000-000000000004', 75, 48, 78),
  ('aaaa0004-0000-0000-0000-000000000004', 90, 45, 80);

-- ============================================
-- MATCH ANALYTICAL MAPS
-- ============================================
INSERT INTO public.match_analytical_maps (
  match_id, 
  heatmap_url, touchmap_url,
  team_final_third_left, team_final_third_center, team_final_third_right,
  opponent_final_third_left, opponent_final_third_center, opponent_final_third_right
)
VALUES
  ('aaaa0001-0000-0000-0000-000000000001', NULL, NULL, '30', '45', '25', '20', '50', '30'),
  ('aaaa0002-0000-0000-0000-000000000002', NULL, NULL, '28', '40', '32', '25', '45', '30'),
  ('aaaa0003-0000-0000-0000-000000000003', NULL, NULL, '35', '40', '25', '18', '52', '30'),
  ('aaaa0004-0000-0000-0000-000000000004', NULL, NULL, '22', '48', '30', '32', '42', '26');
