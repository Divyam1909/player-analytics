-- ============================================
-- COMPLETE SEED DATA - MATCH 2 EVENTS
-- Eagle Rangers (1) vs Thunder FC (3)
-- Match ID: a2222222-2222-2222-2222-222222222222
-- ============================================

-- Eagle Rangers = eeeeeeee, Thunder FC = aaaaaaaa
-- Date: 2024-04-02

-- Pass Events for Match 2 (30 passes)
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
-- Thunder FC successful passes (they won 3-1)
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 8, 15, 42.0, 48.0, 58.0, 42.0, true, 'a0000012-0000-0000-0000-000000000012', true, false, false, false, 1, 1),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000012-0000-0000-0000-000000000012', 8, 20, 58.0, 42.0, 73.0, 35.0, true, 'a0000021-0000-0000-0000-000000000021', true, true, false, false, 2, 1),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 8, 24, 73.0, 35.0, 88.0, 28.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0), -- Assist to Goal 1
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000014-0000-0000-0000-000000000014', 22, 10, 50.0, 50.0, 68.0, 38.0, true, 'a0000013-0000-0000-0000-000000000013', true, true, false, false, 2, 1),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 22, 15, 68.0, 38.0, 82.0, 30.0, true, 'a0000023-0000-0000-0000-000000000023', false, false, true, false, 1, 0),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 22, 18, 82.0, 30.0, 91.0, 25.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, false, true, 0, 0), -- Assist to Goal 2
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000011-0000-0000-0000-000000000011', 35, 30, 38.0, 52.0, 55.0, 45.0, true, 'a0000012-0000-0000-0000-000000000012', false, false, false, false, 0, 0),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000012-0000-0000-0000-000000000012', 35, 35, 55.0, 45.0, 70.0, 35.0, true, 'a0000021-0000-0000-0000-000000000021', true, false, false, false, 1, 1),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 35, 40, 70.0, 35.0, 85.0, 22.0, true, 'a0000023-0000-0000-0000-000000000023', false, true, false, false, 2, 0),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 35, 44, 85.0, 22.0, 92.0, 18.0, true, 'a0000022-0000-0000-0000-000000000022', false, false, false, true, 1, 0); -- Assist to Goal 3

-- Eagle Rangers successful passes
INSERT INTO pass_events (match_id, team_id, player_id, minute, second, start_x, start_y, end_x, end_y, is_successful, receiver_player_id, is_progressive_pass, is_key_pass, is_cross, is_assist, outplays_players_count, outplays_lines_count) VALUES
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000006-0000-0000-0000-000000000006', 15, 20, 48.0, 50.0, 62.0, 45.0, true, 'e0000007-0000-0000-0000-000000000007', false, false, false, false, 1, 0),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000007-0000-0000-0000-000000000007', 15, 24, 62.0, 45.0, 76.0, 38.0, true, 'e0000009-0000-0000-0000-000000000009', true, true, false, false, 1, 1),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000009-0000-0000-0000-000000000009', 15, 28, 76.0, 38.0, 89.0, 32.0, true, 'e0000010-0000-0000-0000-000000000010', false, false, false, true, 0, 0), -- Assist to their goal
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000007-0000-0000-0000-000000000007', 28, 15, 52.0, 48.0, 64.0, 42.0, true, 'e0000006-0000-0000-0000-000000000006', false, false, false, false, 0, 0),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000006-0000-0000-0000-000000000006', 28, 20, 64.0, 42.0, 75.0, 35.0, true, 'e0000009-0000-0000-0000-000000000009', true, false, false, false, 1, 0);

-- Shots on Target for Match 2
INSERT INTO shots_on_target (match_id, team_id, player_id, minute, second, shot_x, shot_y, is_goal, is_penalty, is_saved) VALUES
-- Thunder FC goals (3 goals)
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000022-0000-0000-0000-000000000022', 8, 26, 90.0, 27.0, true, false, false), -- Goal 1
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000022-0000-0000-0000-000000000022', 22, 20, 92.0, 24.0, true, false, false), -- Goal 2
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000022-0000-0000-0000-000000000022', 35, 46, 93.0, 19.0, true, false, false), -- Goal 3 (hat-trick!)
-- Thunder FC shots saved
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 12, 10, 87.0, 30.0, false, false, true),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 30, 5, 89.0, 26.0, false, false, true),
-- Eagle Rangers goal
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000010-0000-0000-0000-000000000010', 15, 30, 91.0, 31.0, true, false, false), -- Goal
-- Eagle Rangers shots saved
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000009-0000-0000-0000-000000000009', 20, 15, 88.0, 28.0, false, false, true);

-- Keeper Actions for Match 2
INSERT INTO keeper_actions (match_id, team_id, player_id, minute, second, action_x, action_y, action_type, save_location) VALUES
-- Thunder GK (Oliver Smith) - conceded 1, made 1 save
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 15, 30, 9.0, 50.0, 'goal_conceded', null),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 20, 15, 11.0, 52.0, 'save', 'inside_box'),
-- Eagle GK - conceded 3, made 2 saves
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000001-0000-0000-0000-000000000001', 8, 26, 8.0, 51.0, 'goal_conceded', null),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000001-0000-0000-0000-000000000001', 12, 10, 10.0, 48.0, 'save', 'outside_box'),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000001-0000-0000-0000-000000000001', 22, 20, 7.0, 52.0, 'goal_conceded', null),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000001-0000-0000-0000-000000000001', 30, 5, 9.0, 49.0, 'save', 'inside_box'),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000001-0000-0000-0000-000000000001', 35, 46, 8.0, 54.0, 'goal_conceded', null);

-- Duels for Match 2
INSERT INTO duels (match_id, team_id, player_id, minute, second, duel_x, duel_y, duel_type, is_successful, opponent_player_id, is_progressive_carry, players_outplayed_count) VALUES
-- Thunder FC duels
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000005-0000-0000-0000-000000000005', 10, 20, 42.0, 50.0, 'aerial', true, 'e0000010-0000-0000-0000-000000000010', false, 0),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 18, 30, 60.0, 42.0, 'dribble', true, 'e0000007-0000-0000-0000-000000000007', true, 1),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 25, 10, 68.0, 35.0, 'dribble', true, 'e0000003-0000-0000-0000-000000000003', true, 2),
-- Eagle Rangers duels
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000005-0000-0000-0000-000000000005', 16, 5, 45.0, 48.0, 'aerial', true, 'a0000022-0000-0000-0000-000000000022', false, 0),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000009-0000-0000-0000-000000000009', 24, 20, 65.0, 40.0, 'dribble', true, 'a0000004-0000-0000-0000-000000000004', true, 1);

-- Fouls for Match 2
INSERT INTO fouls (match_id, fouling_team_id, fouling_player_id, fouled_team_id, fouled_player_id, minute, second, foul_x, foul_y, card_given, resulted_in_freekick) VALUES
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000006-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 18, 10, 45.0, 48.0, 'yellow', true),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000015-0000-0000-0000-000000000015', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000009-0000-0000-0000-000000000009', 32, 25, 40.0, 45.0, 'none', true);

-- Set Pieces - Corners for Match 2
INSERT INTO set_pieces (match_id, team_id, player_id, minute, second, set_piece_x, set_piece_y, set_piece_type, first_contact_made, first_contact_player_id, second_contact_made, second_contact_player_id, reached_opponent_box, corner_side) VALUES
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000013-0000-0000-0000-000000000013', 6, 5, 32.0, 8.0, 'corner', true, 'a0000005-0000-0000-0000-000000000005', true, 'a0000006-0000-0000-0000-000000000006', true, 'right'),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000006-0000-0000-0000-000000000006', 26, 10, 35.0, 10.0, 'corner', true, 'e0000005-0000-0000-0000-000000000005', false, null, false, 'left');

-- Final Third Chances for Match 2
INSERT INTO final_third_chances (match_id, team_id, player_id, minute, second, chance_x, chance_y, is_corner, corner_type, long_corner_success, is_in_box, location_in_box) VALUES
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000021-0000-0000-0000-000000000021', 8, 22, 85.0, 30.0, false, null, null, true, 'centre'),
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000023-0000-0000-0000-000000000023', 22, 16, 88.0, 25.0, false, null, null, true, 'right'),
('a2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e0000009-0000-0000-0000-000000000009', 15, 26, 86.0, 32.0, false, null, null, true, 'left');
