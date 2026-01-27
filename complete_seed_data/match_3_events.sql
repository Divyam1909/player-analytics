-- ============================================
-- COMPLETE SEED DATA - MATCH 3 EVENTS
-- Phoenix Athletic (3) vs Dragon Warriors (2)
-- Match ID: a3333333-3333-3333-3333-333333333333
-- ============================================

-- Phoenix Athletic = cccccccc, Dragon Warriors = dddddddd
-- Date: 2024-03-22

-- Pass Events for Match 3 (35 passes)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
-- Phoenix Athletic successful passes (they won 3-2)
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000013-0000-0000-0000-000000000013', 12, 25, 46.0, 50.0, 62.0, 42.0, true, 'c0000014-0000-0000-0000-000000000014', true, false, false, false, 1, 1),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000014-0000-0000-0000-000000000014', 12, 30, 62.0, 42.0, 78.0, 35.0, true, 'c0000021-0000-0000-0000-000000000021', true, true, false, false, 2, 1),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 12, 35, 78.0, 35.0, 90.0, 26.0, true, 'c0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0), -- Assist Goal 1
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000012-0000-0000-0000-000000000012', 28, 40, 52.0, 48.0, 68.0, 40.0, true, 'c0000013-0000-0000-0000-000000000013', true, false, false, false, 1, 0),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000013-0000-0000-0000-000000000013', 28, 45, 68.0, 40.0, 82.0, 32.0, true, 'c0000021-0000-0000-0000-000000000021', false, true, false, false, 2, 0),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 28, 50, 82.0, 32.0, 91.0, 22.0, true, 'c0000023-0000-0000-0000-000000000023', false, false, false, true, 0, 0), -- Assist Goal 2
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000014-0000-0000-0000-000000000014', 42, 15, 58.0, 45.0, 72.0, 36.0, true, 'c0000013-0000-0000-0000-000000000013', true, true, false, false, 1, 1),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000013-0000-0000-0000-000000000013', 42, 20, 72.0, 36.0, 86.0, 28.0, true, 'c0000022-0000-0000-0000-000000000022', false, false, true, false, 1, 0),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000022-0000-0000-0000-000000000022', 42, 24, 86.0, 28.0, 92.0, 20.0, true, 'c0000021-0000-0000-0000-000000000021', false, false, false, true, 0, 0); -- Assist Goal 3

-- Dragon Warriors successful passes
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 20, 10, 50.0, 52.0, 65.0, 45.0, true, 'd0000014-0000-0000-0000-000000000014', true, false, false, false, 1, 0),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000014-0000-0000-0000-000000000014', 20, 15, 65.0, 45.0, 80.0, 38.0, true, 'd0000021-0000-0000-0000-000000000021', true, true, false, false, 2, 1),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 20, 20, 80.0, 38.0, 90.0, 30.0, true, 'd0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0), -- Assist Goal 1
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000012-0000-0000-0000-000000000012', 38, 25, 55.0, 50.0, 70.0, 42.0, true, 'd0000013-0000-0000-0000-000000000013', false, true, false, false, 1, 0),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 38, 30, 70.0, 42.0, 85.0, 32.0, true, 'd0000023-0000-0000-0000-000000000023', false, false, false, true, 1, 0); -- Assist Goal 2

-- Shots on Target for Match 3
INSERT INTO shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty, is_saved) VALUES
-- Phoenix Athletic goals (3)
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000022-0000-0000-0000-000000000022', 12, 37, 91.0, 25.0, true, false, false), -- Goal 1
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000023-0000-0000-0000-000000000023', 28, 52, 92.0, 21.0, true, false, false), -- Goal 2
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 42, 26, 93.0, 19.0, true, false, false), -- Goal 3
-- Phoenix Athletic shots saved
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 18, 5, 88.0, 28.0, false, false, true),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000022-0000-0000-0000-000000000022', 35, 10, 89.0, 26.0, false, false, true),
-- Dragon Warriors goals (2)
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000022-0000-0000-0000-000000000022', 20, 22, 91.0, 29.0, true, false, false), -- Goal 1
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000023-0000-0000-0000-000000000023', 38, 32, 90.0, 31.0, true, false, false), -- Goal 2
-- Dragon Warriors shots saved
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 25, 15, 87.0, 32.0, false, false, true);

-- Keeper Actions for Match 3
INSERT INTO keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location) VALUES
-- Phoenix GK - conceded 2, made 1 save
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000001-0000-0000-0000-000000000001', 20, 22, 9.0, 51.0, 'goal_conceded', null),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000001-0000-0000-0000-000000000001', 25, 15, 11.0, 48.0, 'save', 'outside_box'),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000001-0000-0000-0000-000000000001', 38, 32, 8.0, 50.0, 'goal_conceded', null),
-- Dragon GK - conceded 3, made 2 saves
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 12, 37, 7.0, 52.0, 'goal_conceded', null),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 18, 5, 10.0, 49.0, 'save', 'inside_box'),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 28, 52, 8.0, 54.0, 'goal_conceded', null),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 35, 10, 9.0, 51.0, 'save', 'inside_box'),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000001-0000-0000-0000-000000000001', 42, 26, 8.0, 53.0, 'goal_conceded', null);

-- Duels for Match 3
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
-- Phoenix duels
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000005-0000-0000-0000-000000000005', 15, 10, 48.0, 50.0, 'aerial', true, 'd0000022-0000-0000-0000-000000000022', false, 0),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000006-0000-0000-0000-000000000006', 25, 20, 40.0, 52.0, 'aerial', true, 'd0000021-0000-0000-0000-000000000021', false, 0),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 30, 15, 65.0, 38.0, 'dribble', true, 'd0000003-0000-0000-0000-000000000003', true, 2),
-- Dragon Warriors duels
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000005-0000-0000-0000-000000000005', 22, 5, 45.0, 48.0, 'aerial', true, 'c0000022-0000-0000-0000-000000000022', false, 0),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 32, 10, 68.0, 40.0, 'dribble', true, 'c0000004-0000-0000-0000-000000000004', true, 1);

-- Fouls for Match 3
INSERT INTO fouls (match_id, fouling_team_id, fouling_player_id, fouled_team_id, fouled_player_id, minute, second, foul_x, foul_y, card_given, resulted_in_freekick) VALUES
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000011-0000-0000-0000-000000000011', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 24, 30, 48.0, 45.0, 'yellow', true),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000015-0000-0000-0000-000000000015', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 36, 15, 42.0, 50.0, 'none', true);

-- Set Pieces for Match 3
INSERT INTO set_pieces (match_id, team_id, player_id, minute, second, set_piece_x, set_piece_y, set_piece_type, first_contact_made, first_contact_player_id, second_contact_made, second_contact_player_id, reached_opponent_box, corner_side) VALUES
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000013-0000-0000-0000-000000000013', 8, 15, 33.0, 9.0, 'corner', true, 'c0000005-0000-0000-0000-000000000005', true, 'c0000006-0000-0000-0000-000000000006', true, 'left'),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000013-0000-0000-0000-000000000013', 32, 5, 34.0, 11.0, 'corner', true, 'd0000005-0000-0000-0000-000000000005', false, null, false, 'right');

-- Final Third Chances for Match 3
INSERT INTO final_third_chances (match_id, team_id, player_id, minute, second, chance_x, chance_y, is_corner, corner_type, long_corner_success, is_in_box, location_in_box) VALUES
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000021-0000-0000-0000-000000000021', 12, 33, 87.0, 28.0, false, null, null, true, 'centre'),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c0000023-0000-0000-0000-000000000023', 28, 48, 89.0, 23.0, false, null, null, true, 'right'),
('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd0000021-0000-0000-0000-000000000021', 20, 18, 85.0, 30.0, false, null, null, true, 'left');
