-- ============================================
-- SEED DATA PART 5: PASS EVENTS
-- Pass Events for Match 1: Mumbai Warriors 3-1 Pune Strikers
-- ============================================

-- Mumbai Warriors passes (Home Team - attacking players)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Deepak Nair - ST) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 5, 30, 55, 45, 70, 50, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 18, 15, 65, 48, 80, 52, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 32, 0, 72, 50, 85, 48, true, true, true, true, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 45, 30, 58, 42, 65, 45, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 67, 15, 70, 55, 78, 50, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 78, 45, 62, 40, 55, 48, true, false, false, false, false),

  -- Player 10 (Sachin Joshi - CAM) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 8, 20, 45, 50, 65, 45, true, true, true, true, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 22, 0, 52, 48, 70, 52, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 35, 45, 60, 42, 75, 35, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 48, 30, 48, 55, 55, 50, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 55, 15, 55, 45, 72, 48, true, true, true, true, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 72, 0, 50, 52, 62, 55, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 85, 30, 58, 48, 70, 45, true, true, true, false, false),

  -- Player 7 (Prashant Reddy - RW) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 12, 15, 60, 20, 82, 35, true, true, true, false, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 28, 30, 55, 25, 70, 30, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 40, 0, 72, 22, 88, 40, true, true, true, true, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 58, 45, 65, 28, 75, 35, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 75, 20, 70, 18, 85, 45, true, true, true, false, true),

  -- Player 11 (Manish Verma - LW) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 15, 0, 55, 75, 72, 68, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 30, 30, 68, 72, 85, 55, true, true, true, false, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 52, 15, 62, 78, 75, 70, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 68, 0, 58, 70, 70, 65, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 82, 45, 65, 75, 80, 60, true, true, true, false, true),

  -- Player 8 (Karan Mehta - CM) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 3, 15, 35, 50, 50, 45, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 20, 45, 42, 52, 58, 48, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 38, 30, 48, 48, 62, 52, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 55, 0, 45, 55, 55, 50, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 70, 30, 50, 45, 65, 40, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 88, 15, 40, 50, 48, 55, true, false, false, false, false),

  -- Player 6 (Suresh Yadav - CDM) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000006-0000-0000-0000-000000000006', 10, 0, 30, 50, 45, 48, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000006-0000-0000-0000-000000000006', 25, 30, 35, 52, 50, 55, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000006-0000-0000-0000-000000000006', 42, 15, 32, 48, 42, 45, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000006-0000-0000-0000-000000000006', 60, 45, 38, 50, 55, 52, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000006-0000-0000-0000-000000000006', 80, 0, 35, 55, 45, 50, true, false, false, false, false);

-- Pune Strikers passes (Away Team)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Irfan Shaikh - ST) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 14, 30, 52, 48, 65, 50, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 36, 0, 60, 52, 75, 48, true, true, true, true, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 58, 15, 55, 45, 68, 50, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 75, 45, 62, 50, 70, 55, true, false, false, false, false),

  -- Player 10 (Jitendra More - CAM) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 8, 0, 42, 50, 55, 45, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 28, 30, 48, 52, 62, 48, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 45, 15, 50, 48, 60, 52, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 65, 0, 45, 55, 58, 50, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 82, 45, 52, 45, 65, 42, true, true, true, false, false),

  -- Player 7 (Girish Joshi - RW) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 18, 15, 55, 25, 70, 30, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 42, 30, 62, 22, 78, 38, true, true, true, false, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 68, 0, 58, 28, 72, 35, true, false, true, false, false),

  -- Player 11 (Kiran Pawar - LW) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 25, 0, 52, 72, 68, 65, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 50, 30, 60, 75, 75, 60, true, true, true, false, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 78, 15, 55, 70, 65, 68, true, false, false, false, false),

  -- Player 8 (Hemant Kulkarni - CM) passes
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 12, 0, 38, 50, 52, 48, true, false, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 32, 45, 42, 52, 55, 55, true, false, false, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 55, 30, 45, 48, 58, 45, true, true, true, false, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 72, 15, 40, 55, 50, 52, true, false, false, false, false);
