-- ============================================
-- COMPLETE SEED DATA - MATCH 4 EVENTS
-- Dragon Warriors (2) vs Falcon Stars (2) - DRAW
-- Match ID: a4444444-4444-4444-4444-444444444444
-- ============================================

-- Dragon Warriors = dddddddd, Falcon Stars = ffffffff
-- Date: 2024-04-09

-- Pass Events for Match 4 (28 passes)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
-- Dragon Warriors successful passes
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000012-0000-0000-0000-000000000012', 10, 20, 48.0, 50.0, 64.0, 44.0, true, 'd0000013-0000-0000-0000-000000000013', true, false, false, false, 1, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 10, 25, 64.0, 44.0, 76.0, 36.0, true, 'd0000021-0000-0000-0000-000000000021', true, true, false, false, 1, 1),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 10, 30, 76.0, 36.0, 89.0, 27.0, true, 'd0000022-0000-0000-0000-000000000022', false, false, false, true, 0, 0), -- Assist Goal 1
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000014-0000-0000-0000-000000000014', 38, 35, 56.0, 48.0, 70.0, 40.0, true, 'd0000013-0000-0000-0000-000000000013', true, true, false, false, 1, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 38, 40, 70.0, 40.0, 84.0, 30.0, true, 'd0000023-0000-0000-0000-000000000023', false, false, true, false, 1, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000023-0000-0000-0000-000000000023', 38, 44, 84.0, 30.0, 91.0, 24.0, true, 'd0000022-0000-0000-0000-000000000022', false, false, false, true, 0, 0), -- Assist Goal 2
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000011-0000-0000-0000-000000000011', 25, 15, 42.0, 52.0, 58.0, 46.0, true, 'd0000012-0000-0000-0000-000000000012', false, false, false, false, 0, 0);

-- Falcon Stars successful passes
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 18, 25, 52.0, 50.0, 66.0, 43.0, true, 'f0000007-0000-0000-0000-000000000007', true, false, false, false, 1, 0),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000007-0000-0000-0000-000000000007', 18, 30, 66.0, 43.0, 78.0, 35.0, true, 'f0000009-0000-0000-0000-000000000009', true, true, false, false, 2, 1),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000009-0000-0000-0000-000000000009', 18, 35, 78.0, 35.0, 90.0, 28.0, true, 'f0000010-0000-0000-0000-000000000010', false, false, false, true, 1, 0), -- Assist Goal 1
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000007-0000-0000-0000-000000000007', 44, 50, 60.0, 48.0, 74.0, 38.0, true, 'f0000006-0000-0000-0000-000000000006', true, true, false, false, 1, 1),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 44, 55, 74.0, 38.0, 87.0, 30.0, true, 'f0000008-0000-0000-0000-000000000008', false, false, true, false, 1, 0),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000008-0000-0000-0000-000000000008', 45, 0, 87.0, 30.0, 92.0, 26.0, true, 'f0000010-0000-0000-0000-000000000010', false, false, false, true, 0, 0); -- Assist Goal 2

-- Shots on Target for Match 4
INSERT INTO shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty, is_saved) VALUES
-- Dragon Warriors goals (2)
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000022-0000-0000-0000-000000000022', 10, 32, 90.0, 26.0, true, false, false), -- Goal 1
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000022-0000-0000-0000-000000000022', 38, 46, 92.0, 23.0, true, false, false), -- Goal 2
-- Dragon Warriors shots saved
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 22, 10, 88.0, 29.0, false, false, true),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000023-0000-0000-0000-000000000023', 32, 5, 87.0, 31.0, false, false, true),
-- Falcon Stars goals (2)
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000010-0000-0000-0000-000000000010', 18, 37, 91.0, 27.0, true, false, false), -- Goal 1
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000010-0000-0000-0000-000000000010', 45, 2, 92.0, 25.0, true, false, false), -- Goal 2
-- Falcon Stars shots saved
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000009-0000-0000-0000-000000000009', 28, 15, 89.0, 28.0, false, false, true);

-- Keeper Actions for Match 4
INSERT INTO keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location) VALUES
-- Dragon GK - conceded 2, made 1 save
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 18, 37, 9.0, 51.0, 'goal_conceded', null),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 28, 15, 11.0, 49.0, 'save', 'inside_box'),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 45, 2, 8.0, 52.0, 'goal_conceded', null),
-- Falcon GK - conceded 2, made 2 saves
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000001-0000-0000-0000-000000000001', 10, 32, 7.0, 50.0, 'goal_conceded', null),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000001-0000-0000-0000-000000000001', 22, 10, 10.0, 48.0, 'save', 'inside_box'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000001-0000-0000-0000-000000000001', 32, 5, 9.0, 51.0, 'save', 'outside_box'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000001-0000-0000-0000-000000000001', 38, 46, 8.0, 53.0, 'goal_conceded', null);

-- Duels for Match 4
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
-- Dragon duels
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000005-0000-0000-0000-000000000005', 14, 15, 46.0, 50.0, 'aerial', true, 'f0000010-0000-0000-0000-000000000010', false, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000006-0000-0000-0000-000000000006', 26, 20, 42.0, 52.0, 'aerial', true, 'f0000009-0000-0000-0000-000000000009', false, 0),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 34, 10, 66.0, 38.0, 'dribble', true, 'f0000003-0000-0000-0000-000000000003', true, 1),
-- Falcon duels
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000005-0000-0000-0000-000000000005', 20, 5, 44.0, 48.0, 'aerial', true, 'd0000022-0000-0000-0000-000000000022', false, 0),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000009-0000-0000-0000-000000000009', 42, 15, 70.0, 36.0, 'dribble', true, 'd0000004-0000-0000-0000-000000000004', true, 2);

-- Fouls for Match 4
INSERT INTO fouls (match_id, fouling_team_id, fouling_player_id, fouled_team_id, fouled_player_id, minute, second, foul_x, foul_y, card_given, resulted_in_freekick) VALUES
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 24, 30, 46.0, 46.0, 'yellow', true),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000015-0000-0000-0000-000000000015', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 40, 20, 44.0, 48.0, 'yellow', true);

-- Set Pieces for Match 4
INSERT INTO set_pieces (match_id, team_id, player_id, minute, second, set_piece_x, set_piece_y, set_piece_type, first_contact_made, first_contact_player_id, second_contact_made, second_contact_player_id, reached_opponent_box, corner_side) VALUES
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 6, 10, 34.0, 10.0, 'corner', true, 'd0000005-0000-0000-0000-000000000005', true, 'd0000006-0000-0000-0000-000000000006', true, 'right'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000006-0000-0000-0000-000000000006', 30, 5, 32.0, 9.0, 'corner', true, 'f0000005-0000-0000-0000-000000000005', false, null, false, 'left');

-- Final Third Chances for Match 4
INSERT INTO final_third_chances (match_id, team_id, player_id, minute, second, chance_x, chance_y, is_corner, corner_type, long_corner_success, is_in_box, location_in_box) VALUES
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 10, 28, 86.0, 28.0, false, null, null, true, 'centre'),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000023-0000-0000-0000-000000000023', 38, 42, 88.0, 26.0, false, null, null, true, 'right'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000009-0000-0000-0000-000000000009', 18, 33, 87.0, 29.0, false, null, null, true, 'left'),
('a4444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f0000008-0000-0000-0000-000000000008', 44, 58, 89.0, 27.0, false, null, null, true, 'centre');
