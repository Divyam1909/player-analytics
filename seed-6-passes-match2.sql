-- ============================================
-- SEED DATA PART 6: PASS EVENTS
-- Pass Events for Match 2: Pune Strikers 2-2 Mumbai Warriors
-- ============================================

-- Pune Strikers passes (Home Team)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Irfan Shaikh - ST) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 8, 30, 55, 50, 72, 48, true, true, true, true, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 25, 0, 62, 45, 78, 52, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 45, 15, 58, 52, 70, 48, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 68, 30, 65, 48, 80, 55, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 82, 15, 60, 50, 72, 52, true, false, false, false, false),

  -- Player 10 (Jitendra More - CAM) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 12, 0, 48, 52, 65, 48, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 30, 45, 52, 48, 68, 52, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 55, 30, 45, 55, 60, 50, true, true, true, true, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 72, 0, 50, 45, 65, 42, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 85, 15, 55, 50, 68, 55, true, true, true, false, false),

  -- Player 7 (Girish Joshi - RW) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 18, 30, 58, 22, 75, 35, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 38, 15, 62, 25, 80, 40, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 60, 0, 55, 28, 72, 38, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 78, 45, 65, 20, 82, 45, true, false, true, false, false),

  -- Player 11 (Kiran Pawar - LW) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 22, 15, 55, 75, 72, 68, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 42, 30, 62, 72, 80, 55, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 65, 0, 58, 78, 72, 72, true, false, false, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 80, 45, 60, 70, 75, 62, true, true, true, false, true),

  -- Player 8 (Hemant Kulkarni - CM) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 5, 45, 40, 50, 55, 48, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 28, 30, 45, 52, 60, 50, true, false, false, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 52, 15, 42, 48, 58, 45, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000008-0000-0000-0000-000000000008', 75, 0, 48, 55, 62, 52, true, false, true, false, false);

-- Mumbai Warriors passes (Away Team)
INSERT INTO public.pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, is_key_pass, is_progressive_pass, is_assist, is_cross)
VALUES
  -- Player 9 (Deepak Nair - ST) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 15, 30, 58, 48, 75, 52, true, true, true, true, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 35, 0, 65, 50, 80, 48, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 58, 45, 62, 45, 78, 50, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 78, 15, 55, 52, 68, 55, true, false, false, false, false),

  -- Player 10 (Sachin Joshi - CAM) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 10, 0, 50, 52, 68, 48, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 32, 45, 55, 45, 72, 50, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 50, 30, 48, 55, 62, 50, true, true, true, true, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 70, 15, 52, 48, 68, 45, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 88, 0, 58, 52, 72, 55, true, true, true, false, false),

  -- Player 7 (Prashant Reddy - RW) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 20, 15, 62, 25, 80, 38, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 42, 30, 58, 22, 75, 35, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 62, 0, 65, 28, 82, 42, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 82, 45, 55, 20, 72, 30, true, false, true, false, false),

  -- Player 11 (Manish Verma - LW) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 25, 0, 58, 78, 75, 70, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 48, 30, 62, 72, 80, 58, true, true, true, false, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 68, 15, 55, 75, 70, 68, true, false, false, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 85, 0, 60, 70, 78, 62, true, true, true, false, true),

  -- Player 8 (Karan Mehta - CM) passes
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 8, 45, 42, 50, 58, 48, true, false, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 30, 15, 48, 52, 62, 50, true, false, false, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 55, 0, 45, 48, 60, 45, true, true, true, false, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000008-0000-0000-0000-000000000008', 75, 30, 50, 55, 65, 52, true, false, true, false, false);
