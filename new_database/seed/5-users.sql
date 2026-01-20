-- ============================================
-- SEED DATA - PART 5: USERS
-- Test user accounts for authentication
-- ============================================
-- All passwords are: "password123" (bcrypt hashed)
-- Hash generated using bcrypt with 10 rounds
-- ============================================

-- Note: This file should be run AFTER all other seed files
-- Dependencies: teams table, players table

-- ============================================
-- 1 ADMIN USER
-- ============================================

INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
('99999999-9999-9999-9999-999999999999', 'admin@postmatch.org', '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa', 'admin', 'Admin', 'User');

-- ============================================
-- 1 COACH USER (Thunder FC)
-- ============================================

INSERT INTO users (id, email, password_hash, role, first_name, last_name, team_id) VALUES
('88888888-8888-8888-8888-888888888888', 
 'coach@thunderfc.org', 
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa', 
 'coach', 
 'Rudrashish', 
 'Sharma',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'); -- Thunder FC team_id

-- ============================================
-- 5 PLAYER USERS (Thunder FC roster)
-- ============================================

INSERT INTO users (id, email, password_hash, role, first_name, last_name, team_id, player_id) VALUES
-- Player 1: Oliver Smith (GK #1)
('77777771-7777-7777-7777-777777777777',
 'player1@thunderfc.org',
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa',
 'player',
 'Oliver',
 'Smith',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Thunder FC
 'a0000001-0000-0000-0000-000000000001'), -- Oliver Smith player_id

-- Player 2: Harry Johnson (RB #2)
('77777772-7777-7777-7777-777777777777',
 'player2@thunderfc.org',
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa',
 'player',
 'Harry',
 'Johnson',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Thunder FC
 'a0000003-0000-0000-0000-000000000003'), -- Harry Johnson player_id

-- Player 3: Lucas Lopez (CAM #10)
('77777773-7777-7777-7777-777777777777',
 'player3@thunderfc.org',
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa',
 'player',
 'Lucas',
 'Lopez',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Thunder FC
 'a0000013-0000-0000-0000-000000000013'), -- Lucas Lopez player_id

-- Player 4: Samuel Diaz (ST #9)
('77777774-7777-7777-7777-777777777777',
 'player4@thunderfc.org',
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa',
 'player',
 'Samuel',
 'Diaz',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Thunder FC
 'a0000022-0000-0000-0000-000000000022'), -- Samuel Diaz player_id

-- Player 5: Henry Gomez (RW #7)
('77777775-7777-7777-7777-777777777777',
 'player5@thunderfc.org',
 '$2a$10$rqEv5z1YqVvBqFP8YgXC5.5P3X2JYXHGKqR9YZ6qQ7xGJZ6qQ7xGJa',
 'player',
 'Henry',
 'Gomez',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Thunder FC
 'a0000021-0000-0000-0000-000000000021'); -- Henry Gomez player_id

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all users
SELECT email, role, first_name, last_name FROM users ORDER BY role, email;

-- Check coach team linkage
SELECT u.email, u.role, t.team_name 
FROM users u 
LEFT JOIN teams t ON u.team_id = t.id 
WHERE u.role = 'coach';

-- Check player linkages
SELECT u.email, u.role, p.first_name, p.last_name, p.position, p.jersey_number
FROM users u 
LEFT JOIN players p ON u.player_id = p.id 
WHERE u.role = 'player'
ORDER BY p.jersey_number;

-- ============================================
-- LOGIN CREDENTIALS (For Testing)
-- ============================================
-- 
-- Admin:
--   Email: admin@postmatch.org
--   Password: password123
--
-- Coach (Thunder FC):
--   Email: coach@thunderfc.org
--   Password: password123
--
-- Players (Thunder FC):
--   Email: player1@thunderfc.org (Oliver Smith, GK #1)
--   Email: player2@thunderfc.org (Harry Johnson, RB #2)
--   Email: player3@thunderfc.org (Lucas Lopez, CAM #10)
--   Email: player4@thunderfc.org (Samuel Diaz, ST #9)
--   Email: player5@thunderfc.org (Henry Gomez, RW #7)
--   Password (all): password123
-- ============================================
