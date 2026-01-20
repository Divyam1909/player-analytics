-- ============================================
-- SEED DATA - PART 3: MATCHES & BASIC EVENTS
-- 4 matches (2 per league) with pass events, shots, duels
-- ============================================

-- ============================================
-- MATCHES (4 matches total)
-- ============================================

INSERT INTO matches (id, home_team_id, away_team_id, our_team_id, league_id, competition_name, match_date, home_score, away_score, home_jersey_color, away_jersey_color, video_url) VALUES
-- Premier Youth League Matches
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Premier Youth League - Round 5', '2024-03-15', 2, 1, 'Blue', 'Red', '/videos/match1.mp4'),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Premier Youth League - Round 8', '2024-04-02', 1, 3, 'Green', 'Blue', '/videos/match2.mp4'),
-- National Football Championship Matches
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'National Championship - Week 12', '2024-03-22', 3, 2, 'Orange', 'Black', '/videos/match3.mp4'),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'National Championship - Week 15', '2024-04-09', 2, 2, 'Black', 'White', '/videos/match4.mp4');

-- ============================================
-- MATCH 1 EVENTS: Thunder FC (2) vs Lightning United (1)
-- Thunder FC = aaaaaaaa, Lightning United = bbbbbbbb
-- ============================================

-- Pass Events (Sample - 50 passes distributed across both teams)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
-- Thunder FC successful passes
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 5, 20, 45.0, 50.0, 60.0, 45.0, true, 'a0000014-0000-0000-0000-000000000014', true, false, false, false, 2, 1),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000014-0000-0000-0000-000000000014', 5, 25, 60.0, 45.0, 70.0, 40.0, true, 'a0000021-0000-0000-0000-000000000021', false, true, false, false, 1, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 5, 28, 70.0, 40.0, 85.0, 30.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, true, false, 0, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000012-0000-0000-0000-000000000012', 12, 45, 55.0, 55.0, 75.0, 25.0, true, 'a0000013-0000-0000-0000-000000000013', true, true, false, false, 3, 2),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 12, 50, 75.0, 25.0, 90.0, 20.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0),  -- Assist
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000005-0000-0000-0000-000000000005', 28, 15, 25.0, 50.0, 40.0, 45.0, true, 'a0000011-0000-0000-0000-000000000011', false, false, false, false, 0, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000011-0000-0000-0000-000000000011', 28, 18, 40.0, 45.0, 50.0, 40.0, true, 'a0000013-0000-0000-0000-000000000013', false, false, false, false, 0, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 28, 22, 50.0, 40.0, 65.0, 30.0, true, 'a0000021-0000-0000-0000-000000000021', true, false, false, false, 1, 1),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 28, 26, 65.0, 30.0, 80.0, 20.0, true, 'a0000023-0000-0000-0000-000000000023', false, true, false, false, 2, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 28, 30, 80.0, 20.0, 92.0, 15.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0);  -- Assist for goal 2

-- Thunder FC unsuccessful passes (intercepted)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count, defending_player_id, failure_reason, is_high_press, is_ball_recovery) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000012-0000-0000-0000-000000000012', 18, 30, 55.0, 50.0, 70.0, 40.0, false, null, false, false, false, false, 0, 0, 'b0000012-0000-0000-0000-000000000012', 'interception', true, true);

-- Lightning United successful passes
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross,is_assist, outplays_players_count, outplays_lines_count) VALUES
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000013-0000-0000-0000-000000000013', 8, 10, 50.0, 55.0, 65.0, 50.0, true, 'b0000014-0000-0000-0000-000000000014', false, false, false, false, 1, 0),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000014-0000-0000-0000-000000000014', 8, 14, 65.0, 50.0, 75.0, 45.0, true, 'b0000021-0000-0000-0000-000000000021', true, false, false, false, 2, 1),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000021-0000-0000-0000-000000000021', 8, 18, 75.0, 45.0, 88.0, 35.0, true, 'b0000022-0000-0000-0000-000000000022', false, true, false, false, 1, 0),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000012-0000-0000-0000-000000000012', 18, 35, 60.0, 48.0, 78.0, 30.0, true, 'b0000013-0000-0000-0000-000000000013', true, true, false, false, 2, 1),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000013-0000-0000-0000-000000000013', 18, 40, 78.0, 30.0, 91.0, 22.0, true, 'b0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0),  -- Assist for their goal
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000005-0000-0000-0000-000000000005', 35, 20, 30.0, 50.0, 45.0, 48.0, true, 'b0000011-0000-0000-0000-000000000011', false, false, false, false, 0, 0),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000011-0000-0000-0000-000000000011', 35, 24, 45.0, 48.0, 58.0, 42.0, true, 'b0000012-0000-0000-0000-000000000012', false, false, false, false, 0, 0);

-- Shots on Target
INSERT INTO shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty, is_saved) VALUES
-- Thunder FC goals
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000022-0000-0000-0000-000000000022', 12, 52, 92.0, 18.0, true, false, false),  -- Goal 1
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000022-0000-0000-0000-000000000022', 28, 32, 93.0, 15.0, true, false, false),  -- Goal 2
-- Thunder FC shots saved
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 6, 15, 88.0, 25.0, false, false, true),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 22, 40, 90.0, 20.0, false, false, true),
-- Lightning United goal
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000022-0000-0000-0000-000000000022', 18, 42, 91.0, 22.0, true, false, false),  -- Goal
-- Lightning United shots saved
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000021-0000-0000-0000-000000000021', 11, 20, 87.0, 28.0, false, false, true),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000023-0000-0000-0000-000000000023', 42, 10, 89.0, 24.0, false, false, true);

-- Keeper Actions (saves and goals conceded)
INSERT INTO keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location) VALUES
-- Thunder GK (Oliver Smith) - conceded 1 goal, made 2 saves
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 11, 20, 10.0, 50.0, 'save', 'inside_box'),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 18, 42, 8.0, 55.0, 'goal_conceded', null),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 42, 10, 12.0, 48.0, 'save', 'inside_box'),
-- Lightning GK (David Kumar) - conceded 2 goals, made 2 saves
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 6, 15, 9.0, 52.0, 'save', 'outside_box'),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 12, 52, 7.0, 51.0, 'goal_conceded', null),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 22, 40, 11.0, 49.0, 'save', 'inside_box'),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 28, 32, 8.0, 53.0, 'goal_conceded', null);

-- Duels
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
-- Thunder FC aerial duels
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000006-0000-0000-0000-000000000006', 10, 5, 50.0, 45.0, 'aerial', true, 'b0000022-0000-0000-0000-000000000022', false, 0),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000005-0000-0000-0000-000000000005', 22, 10, 35.0, 52.0, 'aerial', true, 'b0000021-0000-0000-0000-000000000021', false, 0),
-- Thunder FC dribbles with progressive carries
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 7, 20, 60.0, 35.0, 'dribble', true, 'b0000003-0000-0000-0000-000000000003', true, 2),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 14, 30, 55.0, 45.0, 'dribble', true, 'b0000012-0000-0000-0000-000000000012', true, 1),
-- Lightning United duels
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000005-0000-0000-0000-000000000005', 15, 15, 45.0, 48.0, 'aerial', true, 'a0000022-0000-0000-0000-000000000022', false, 0),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000021-0000-0000-0000-000000000021', 19, 25, 65.0, 38.0, 'dribble', true, 'a0000004-0000-0000-0000-000000000004', true, 1);

-- Fouls
INSERT INTO fouls (match_id, fouling_team_id, fouling_player_id, fouled_team_id, fouled_player_id, minute, second, foul_x, foul_y, card_given, resulted_in_freekick) VALUES
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000011-0000-0000-0000-000000000011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000014-0000-0000-0000-000000000014', 20, 15, 42.0, 50.0, 'yellow', true),
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000013-0000-0000-0000-000000000013', 32, 40, 38.0, 45.0, 'none', true),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 45, 20, 65.0, 30.0, 'yellow', true);

-- Set Pieces - Corners (no foul_id needed)
INSERT INTO set_pieces (match_id, team_id, player_id, minute, second, set_piece_x, set_piece_y, set_piece_type, first_contact_made, first_contact_player_id, second_contact_made, second_contact_player_id, reached_opponent_box, corner_side) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 3, 10, 35.0, 10.0, 'corner', true, 'a0000005-0000-0000-0000-000000000005', true, 'a0000006-0000-0000-0000-000000000006', true, 'left'),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000013-0000-0000-0000-000000000013', 25, 5, 30.0, 12.0, 'corner', true, 'b0000005-0000-0000-0000-000000000005', false, null, false, 'right');

-- Set Pieces - Free Kicks (with foul_id from fouls table)
INSERT INTO set_pieces (match_id, team_id, player_id, minute, second, set_piece_x, set_piece_y, set_piece_type, first_contact_made, first_contact_player_id, second_contact_made, second_contact_player_id, reached_opponent_box, corner_side, foul_id)
SELECT 
  'a1111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a0000013-0000-0000-0000-000000000013',
  20, 16, 42.0, 50.0,
  'free_kick',
  true,
  'a0000012-0000-0000-0000-000000000012',
  true,
  'a0000014-0000-0000-0000-000000000014',
  true,
  null,
  f.id
FROM fouls f
WHERE f.match_id = 'a1111111-1111-1111-1111-111111111111'
  AND f.minute = 20
  AND f.fouling_team_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
LIMIT 1;

-- Continue in next file for remaining matches...
