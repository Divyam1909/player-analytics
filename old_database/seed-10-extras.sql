-- ============================================
-- SEED DATA PART 10: KEEPER ACTIONS, FINAL THIRD CHANCES, HIGHLIGHTS
-- All 4 Matches
-- ============================================

-- ============================================
-- KEEPER ACTIONS
-- ============================================
INSERT INTO public.keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location)
VALUES
  -- Match 1: Mumbai Warriors GK (Arjun Sharma)
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 18, 30, 5, 50, 'save', 'inside_box'),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 45, 0, 8, 48, 'save', 'inside_box'),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 62, 15, 6, 52, 'collection', NULL),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 78, 30, 4, 50, 'save', 'inside_box'),
  -- Match 1: Pune Strikers GK (Aakash Jadhav)
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 12, 0, 95, 50, 'save', 'inside_box'),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 28, 15, 92, 48, 'save', 'inside_box'),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 48, 30, 94, 52, 'collection', NULL),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 65, 45, 93, 50, 'save', 'inside_box'),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 82, 0, 96, 48, 'save', 'outside_box'),
  
  -- Match 2: Pune Strikers GK
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 15, 30, 95, 50, 'save', 'inside_box'),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 38, 0, 92, 48, 'save', 'inside_box'),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 55, 15, 94, 52, 'collection', NULL),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000001-0000-0000-0000-000000000001', 68, 45, 93, 50, 'save', 'inside_box'),
  -- Match 2: Mumbai Warriors GK
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 8, 30, 5, 50, 'save', 'inside_box'),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 28, 0, 8, 48, 'save', 'inside_box'),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 52, 15, 6, 52, 'collection', NULL),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 75, 30, 4, 50, 'save', 'inside_box'),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000001-0000-0000-0000-000000000001', 85, 45, 7, 48, 'save', 'inside_box'),
  
  -- Match 3: Delhi United GK (Aarav Kapoor)
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 15, 30, 5, 50, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 38, 0, 8, 48, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 55, 15, 6, 52, 'collection', NULL),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 68, 45, 4, 50, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 82, 30, 7, 48, 'save', 'inside_box'),
  -- Match 3: Bangalore FC GK (Abhinav Rao)
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 8, 30, 95, 50, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 22, 0, 92, 48, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 45, 15, 94, 52, 'collection', NULL),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 62, 45, 93, 50, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 75, 30, 96, 48, 'save', 'inside_box'),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 85, 0, 94, 50, 'save', 'outside_box'),
  
  -- Match 4: Bangalore FC GK
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 5, 30, 95, 50, 'save', 'inside_box'),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 22, 0, 92, 48, 'collection', NULL),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000001-0000-0000-0000-000000000001', 48, 15, 94, 52, 'save', 'inside_box'),
  -- Match 4: Delhi United GK
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 18, 30, 5, 50, 'save', 'inside_box'),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 35, 0, 8, 48, 'save', 'inside_box'),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 58, 15, 6, 52, 'collection', NULL),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 72, 45, 4, 50, 'save', 'inside_box'),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000001-0000-0000-0000-000000000001', 85, 30, 7, 48, 'save', 'inside_box');

-- ============================================
-- FINAL THIRD CHANCES
-- ============================================
INSERT INTO public.final_third_chances (match_id, team_id, player_id, minute, second, chance_x, chance_y, is_corner, corner_type, long_corner_success, is_in_box)
VALUES
  -- Match 1: Mumbai Warriors chances
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 20, 0, 85, 50, false, NULL, NULL, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 35, 30, 82, 48, false, NULL, NULL, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 48, 15, 88, 35, true, 'short', NULL, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 62, 0, 80, 68, true, 'long', true, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 75, 45, 86, 52, false, NULL, NULL, true),
  -- Match 1: Pune Strikers chances
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 28, 30, 85, 50, false, NULL, NULL, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 55, 0, 80, 48, false, NULL, NULL, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 72, 15, 88, 32, true, 'long', false, false),
  
  -- Match 2: Pune Strikers chances
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000009-0000-0000-0000-000000000009', 12, 0, 85, 50, false, NULL, NULL, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000010-0000-0000-0000-000000000010', 38, 30, 82, 48, false, NULL, NULL, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000007-0000-0000-0000-000000000007', 58, 15, 88, 35, true, 'short', NULL, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'b2000011-0000-0000-0000-000000000011', 78, 0, 80, 68, false, NULL, NULL, true),
  -- Match 2: Mumbai Warriors chances
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000009-0000-0000-0000-000000000009', 22, 0, 85, 50, false, NULL, NULL, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000010-0000-0000-0000-000000000010', 48, 30, 82, 48, false, NULL, NULL, true),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000011-0000-0000-0000-000000000011', 68, 15, 88, 65, true, 'long', true, false),
  ('aaaa0002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'a1000007-0000-0000-0000-000000000007', 85, 0, 80, 38, false, NULL, NULL, true),
  
  -- Match 3: Delhi United chances
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 15, 30, 88, 50, false, NULL, NULL, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 32, 0, 85, 48, false, NULL, NULL, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 48, 15, 82, 35, true, 'short', NULL, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 55, 30, 90, 52, false, NULL, NULL, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 68, 0, 80, 70, true, 'long', true, false),
  ('aaaa0003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 75, 45, 86, 38, false, NULL, NULL, true),
  -- Match 3: Bangalore FC chances
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 25, 0, 85, 50, false, NULL, NULL, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 62, 30, 82, 48, false, NULL, NULL, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 70, 15, 88, 52, false, NULL, NULL, true),
  
  -- Match 4: Bangalore FC chances
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000009-0000-0000-0000-000000000009', 22, 0, 85, 50, false, NULL, NULL, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000010-0000-0000-0000-000000000010', 48, 30, 82, 48, false, NULL, NULL, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'd4000007-0000-0000-0000-000000000007', 68, 15, 88, 35, true, 'long', false, false),
  -- Match 4: Delhi United chances
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 12, 0, 88, 50, false, NULL, NULL, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 35, 30, 85, 48, false, NULL, NULL, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000007-0000-0000-0000-000000000007', 52, 15, 82, 38, true, 'short', NULL, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000009-0000-0000-0000-000000000009', 65, 0, 90, 52, false, NULL, NULL, true),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000011-0000-0000-0000-000000000011', 78, 45, 80, 68, true, 'long', true, false),
  ('aaaa0004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'c3000010-0000-0000-0000-000000000010', 85, 30, 86, 45, false, NULL, NULL, true);

-- ============================================
-- MATCH HIGHLIGHTS
-- ============================================
INSERT INTO public.match_highlights (match_id, timestamp, highlight_type, description)
VALUES
  -- Match 1: Mumbai Warriors 3-1 Pune Strikers
  ('aaaa0001-0000-0000-0000-000000000001', '22:00', 'goal', 'Deepak Nair scores with a clinical finish from inside the box'),
  ('aaaa0001-0000-0000-0000-000000000001', '38:00', 'goal', 'Irfan Shaikh pulls one back for Pune with a powerful header'),
  ('aaaa0001-0000-0000-0000-000000000001', '55:30', 'goal', 'Sachin Joshi doubles the lead with a curling shot'),
  ('aaaa0001-0000-0000-0000-000000000001', '78:15', 'goal', 'Prashant Reddy seals the win with a spectacular volley'),
  ('aaaa0001-0000-0000-0000-000000000001', '10:00', 'shot_on_target', 'Deepak Nair forces an early save from the keeper'),
  ('aaaa0001-0000-0000-0000-000000000001', '35:00', 'corner', 'Mumbai Warriors win a corner after sustained pressure'),
  ('aaaa0001-0000-0000-0000-000000000001', '62:00', 'save', 'Arjun Sharma with a crucial save to deny Pune'),
  ('aaaa0001-0000-0000-0000-000000000001', '70:00', 'yellow_card', 'Tactical foul results in a booking'),
  
  -- Match 2: Pune Strikers 2-2 Mumbai Warriors
  ('aaaa0002-0000-0000-0000-000000000002', '15:00', 'goal', 'Irfan Shaikh opens the scoring with a tap-in'),
  ('aaaa0002-0000-0000-0000-000000000002', '25:00', 'goal', 'Deepak Nair equalizes with a brilliant solo effort'),
  ('aaaa0002-0000-0000-0000-000000000002', '62:30', 'goal', 'Jitendra More puts Pune ahead again with a header'),
  ('aaaa0002-0000-0000-0000-000000000002', '72:30', 'goal', 'Sachin Joshi scores a late equalizer for Mumbai'),
  ('aaaa0002-0000-0000-0000-000000000002', '38:00', 'shot_on_target', 'Close range effort saved by the keeper'),
  ('aaaa0002-0000-0000-0000-000000000002', '50:00', 'free_kick', 'Free kick in a dangerous position'),
  ('aaaa0002-0000-0000-0000-000000000002', '80:00', 'corner', 'Late corner leads to scramble in the box'),
  
  -- Match 3: Delhi United 4-2 Bangalore FC
  ('aaaa0003-0000-0000-0000-000000000003', '18:00', 'goal', 'Ishwar Bhardwaj opens the scoring with a placed shot'),
  ('aaaa0003-0000-0000-0000-000000000003', '28:00', 'goal', 'Imran Pasha equalizes for Bangalore with a header'),
  ('aaaa0003-0000-0000-0000-000000000003', '35:30', 'goal', 'Jai Khanna restores Delhi''s lead with a curler'),
  ('aaaa0003-0000-0000-0000-000000000003', '58:15', 'goal', 'Ishwar Bhardwaj scores his second to extend the lead'),
  ('aaaa0003-0000-0000-0000-000000000003', '72:30', 'goal', 'Imran Pasha pulls one back for Bangalore'),
  ('aaaa0003-0000-0000-0000-000000000003', '78:00', 'goal', 'Gaurav Tandon seals the victory with a long-range strike'),
  ('aaaa0003-0000-0000-0000-000000000003', '45:00', 'yellow_card', 'Heavy challenge results in a booking'),
  ('aaaa0003-0000-0000-0000-000000000003', '65:00', 'save', 'Brilliant double save by Delhi keeper'),
  
  -- Match 4: Bangalore FC 1-3 Delhi United
  ('aaaa0004-0000-0000-0000-000000000004', '15:00', 'goal', 'Ishwar Bhardwaj opens the scoring from close range'),
  ('aaaa0004-0000-0000-0000-000000000004', '25:00', 'goal', 'Imran Pasha equalizes with a powerful strike'),
  ('aaaa0004-0000-0000-0000-000000000004', '42:30', 'goal', 'Jai Khanna puts Delhi back in front with a tap-in'),
  ('aaaa0004-0000-0000-0000-000000000004', '68:15', 'goal', 'Ishwar Bhardwaj completes his brace to seal the win'),
  ('aaaa0004-0000-0000-0000-000000000004', '35:00', 'shot_on_target', 'Close effort saved by the keeper'),
  ('aaaa0004-0000-0000-0000-000000000004', '55:00', 'corner', 'Delhi corner leads to a goalmouth scramble'),
  ('aaaa0004-0000-0000-0000-000000000004', '75:00', 'yellow_card', 'Frustration leads to a booking');

-- ============================================
-- MATCH VIDEO NOTES
-- ============================================
INSERT INTO public.match_video_notes (match_id, timestamp, note_text, home_notes, away_notes)
VALUES
  -- Match 1
  ('aaaa0001-0000-0000-0000-000000000001', '15:00', 'Mumbai pressing high and winning the ball back quickly', 'Excellent high press', 'Struggling to build from the back'),
  ('aaaa0001-0000-0000-0000-000000000001', '40:00', 'Sachin Joshi finding space between the lines', 'Good movement in midfield', 'Need to mark tighter'),
  ('aaaa0001-0000-0000-0000-000000000001', '70:00', 'Prashant Reddy causing problems on the right flank', 'Wing play very effective', 'Left back needs support'),
  
  -- Match 2
  ('aaaa0002-0000-0000-0000-000000000002', '20:00', 'Pune controlling possession early', 'Good build-up play', 'Sitting too deep'),
  ('aaaa0002-0000-0000-0000-000000000002', '55:00', 'End-to-end action in the second half', 'Both teams going for it', 'Open game suits both'),
  
  -- Match 3
  ('aaaa0003-0000-0000-0000-000000000003', '25:00', 'Delhi dominating possession and territory', 'Total control of the game', 'Cannot get on the ball'),
  ('aaaa0003-0000-0000-0000-000000000003', '60:00', 'Jai Khanna orchestrating attacks from midfield', 'Excellent vision and passing', 'Need to close him down quicker'),
  
  -- Match 4
  ('aaaa0004-0000-0000-0000-000000000004', '30:00', 'Bangalore struggling to break down Delhi defense', 'Compact and organized', 'Lacking creativity'),
  ('aaaa0004-0000-0000-0000-000000000004', '70:00', 'Delhi counter-attacking with pace', 'Clinical on the break', 'Too open at the back');
