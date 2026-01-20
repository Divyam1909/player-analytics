-- ============================================
-- SEED DATA PART 7: PASS EVENTS
-- Pass Events for Matches 3 & 4 (League 2)
-- ============================================

-- Match 3: Delhi United 4-2 Bangalore FC
-- Delhi United passes (Home Team)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Ishwar Bhardwaj - ST)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 10, 30, 60, 50, 78, 48, true, true, true, true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 28, 0, 65, 45, 82, 52, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 52, 15, 58, 52, 75, 48, true, true, true, true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 72, 30, 62, 48, 78, 55, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 85, 45, 55, 50, 68, 52, true, false, false, false, false),

  -- Player 10 (Jai Khanna - CAM)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 5, 15, 48, 52, 65, 48, true, true, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 22, 0, 55, 45, 72, 50, true, true, true, true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 40, 30, 50, 55, 68, 52, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 58, 15, 52, 48, 70, 45, true, true, true, true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 75, 0, 48, 52, 62, 55, true, false, false, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 88, 45, 55, 48, 72, 50, true, true, true, false, false),

  -- Player 7 (Gaurav Tandon - RW)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 15, 30, 62, 22, 82, 38, true, true, true, false, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 35, 0, 58, 25, 78, 40, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 55, 45, 65, 20, 85, 45, true, true, true, true, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 78, 15, 60, 28, 75, 35, true, false, true, false, false),

  -- Player 11 (Kabir Sinha - LW)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 18, 0, 58, 75, 78, 68, true, true, true, false, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 42, 30, 62, 72, 82, 55, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 65, 15, 55, 78, 72, 70, true, true, true, false, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 82, 0, 60, 70, 75, 62, true, false, false, false, false),

  -- Player 8 (Hitesh Chadha - CM)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000008-0000-0000-0000-000000000008', 8, 45, 45, 50, 62, 48, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000008-0000-0000-0000-000000000008', 32, 15, 48, 52, 65, 50, true, true, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000008-0000-0000-0000-000000000008', 50, 30, 42, 48, 58, 45, true, false, false, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000008-0000-0000-0000-000000000008', 68, 0, 50, 55, 68, 52, true, false, true, false, false);

-- Bangalore FC passes (Away Team - Match 3)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Imran Pasha - ST)
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 25, 30, 55, 48, 72, 52, true, true, true, true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 48, 0, 60, 50, 75, 48, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 70, 15, 58, 45, 72, 50, true, true, true, true, false),

  -- Player 10 (Jeevith Acharya - CAM)
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 12, 0, 45, 52, 60, 48, true, false, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 38, 30, 50, 48, 65, 52, true, true, true, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 62, 15, 48, 55, 62, 50, true, false, false, false, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 80, 0, 52, 45, 68, 48, true, true, true, false, false);

-- Match 4: Bangalore FC 1-3 Delhi United
-- Bangalore FC passes (Home Team)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Imran Pasha - ST)
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 18, 30, 55, 50, 70, 48, true, true, true, true, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 42, 0, 60, 45, 75, 52, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 68, 15, 58, 52, 72, 48, true, false, false, false, false),

  -- Player 10 (Jeevith Acharya - CAM)
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 8, 0, 48, 52, 62, 48, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 32, 45, 52, 48, 68, 52, true, true, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 55, 30, 45, 55, 58, 50, true, false, false, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 75, 15, 50, 45, 65, 48, true, true, true, false, false),

  -- Player 7 (Girija Prasad - RW)
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000007-0000-0000-0000-000000000007', 22, 30, 58, 25, 75, 38, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000007-0000-0000-0000-000000000007', 48, 0, 62, 22, 80, 42, true, true, true, false, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000007-0000-0000-0000-000000000007', 72, 15, 55, 28, 70, 35, true, false, true, false, false);

-- Delhi United passes (Away Team - Match 4)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Ishwar Bhardwaj - ST)
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 12, 30, 62, 48, 80, 52, true, true, true, true, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 35, 0, 65, 50, 82, 48, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 58, 15, 58, 52, 75, 55, true, true, true, true, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 78, 30, 60, 45, 72, 50, true, false, false, false, false),

  -- Player 10 (Jai Khanna - CAM)
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 5, 15, 50, 52, 68, 48, true, true, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 28, 0, 55, 45, 72, 50, true, true, true, true, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 48, 30, 48, 55, 65, 52, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 68, 15, 52, 48, 70, 45, true, true, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 85, 0, 55, 52, 72, 55, true, false, true, false, false),

  -- Player 7 (Gaurav Tandon - RW)
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 18, 30, 60, 22, 80, 35, true, true, true, false, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 42, 0, 65, 25, 85, 42, true, true, true, true, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 65, 45, 55, 28, 72, 38, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 82, 15, 62, 20, 78, 32, true, false, true, false, false),

  -- Player 11 (Kabir Sinha - LW)
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 25, 0, 55, 78, 75, 68, true, true, true, false, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 52, 30, 60, 72, 80, 55, true, false, true, false, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 72, 15, 58, 75, 75, 70, true, true, true, false, true);
