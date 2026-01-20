-- ============================================
-- SEED DATA - PART 1: CORE DATA
-- Leagues, Teams, and Players
-- ============================================

-- Clean existing data (optional - if you want fresh start)
-- TRUNCATE leagues, teams, team_leagues, players, player_attributes CASCADE;

-- ============================================
-- LEAGUES (2 leagues)
-- ============================================

INSERT INTO leagues (id, league_name, tier, custom_label, is_default, country, state, district, league_type) VALUES
('11111111-1111-1111-1111-111111111111', 'Premier Youth League', 1, 'U-19 Elite', true, 'England', 'London', 'Westminster', 'youth'),
('22222222-2222-2222-2222-222222222222', 'National Football Championship', 2, 'Division A', false, 'England', 'Manchester', 'Greater Manchester', 'professional');

-- ============================================
-- TEAMS (6 teams: 4 with 25 players, 2 with 10 players)
-- ============================================

INSERT INTO teams (id, team_name, team_email, head_coach_name, logo_url, has_free_access, is_onboarded) VALUES
-- First 4 teams (25 players each)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thunder FC', 'thunder@fc.com', 'Coach Michael Stone', '/logos/thunder.png', true, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lightning United', 'lightning@united.com', 'Coach Sarah Martinez', '/logos/lightning.png', true, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Phoenix Athletic', 'phoenix@athletic.com', 'Coach David Chen', '/logos/phoenix.png', true, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Dragon Warriors', 'dragon@warriors.com', 'Coach Emma Johnson', '/logos/dragon.png', true, true),
-- Additional 2 teams (10 players each)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Eagle Rangers', 'eagle@rangers.com', 'Coach James Wilson', '/logos/eagle.png', false, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Falcon Stars', 'falcon@stars.com', 'Coach Lisa Anderson', '/logos/falcon.png', false, true);

-- ============================================
-- TEAM-LEAGUE RELATIONSHIPS
-- ============================================

INSERT INTO team_leagues (team_id, league_id, is_primary) VALUES
-- Thunder FC & Lightning United in Premier Youth League
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', true),
-- Phoenix & Dragon in National Championship
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', true),
-- Eagle & Falcon in both leagues
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', false),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', true);

-- ============================================
-- PLAYERS - Thunder FC (25 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
-- Goalkeepers (2)
('a0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oliver', 'Smith', 1, 'GK', '2005-03-15', 'England'),
('a0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'James', 'Wilson', 13, 'GK', '2006-07-22', 'Scotland'),
-- Defenders (8)
('a0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Harry', 'Johnson', 2, 'RB', '2005-01-10', 'England'),
('a0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jack', 'Brown', 3, 'LB', '2005-09-05', 'Wales'),
('a0000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Charlie', 'Davis', 4, 'CB', '2004-11-20', 'England'),
('a0000006-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thomas', 'Miller', 5, 'CB', '2005-04-12', 'England'),
('a0000007-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'George', 'Taylor', 12, 'RWB', '2005-06-18', 'Ireland'),
('a0000008-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oscar', 'Anderson', 15, 'LWB', '2006-02-28', 'England'),
('a0000009-0000-0000-0000-000000000009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Leo', 'Martinez', 23, 'CB', '2005-08-14', 'Spain'),
('a0000010-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Noah', 'Garcia', 25, 'RB', '2006-05-09', 'Portugal'),
-- Midfielders (10)
('a0000011-0000-0000-0000-000000000011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'William', 'Rodriguez', 6, 'CDM', '2005-12-03', 'England'),
('a0000012-0000-0000-0000-000000000012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Liam', 'Hernandez', 8, 'CM', '2005-10-25', 'Mexico'),
('a0000013-0000-0000-0000-000000000013', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lucas', 'Lopez', 10, 'CAM', '2004-07-17', 'Argentina'),
('a0000014-0000-0000-0000-000000000014', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mason', 'Gonzalez', 14, 'CM', '2005-03-22', 'England'),
('a0000015-0000-0000-0000-000000000015', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ethan', 'Perez', 16, 'CDM', '2006-01-08', 'England'),
('a0000016-0000-0000-0000-000000000016', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Logan', 'Sanchez', 18, 'CM', '2005-11-30', 'Colombia'),
('a0000017-0000-0000-0000-000000000017', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jacob', 'Ramirez', 19, 'CAM', '2005-09-12', 'England'),
('a0000018-0000-0000-0000-000000000018', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alexander', 'Torres', 20, 'CM', '2006-04-19', 'Spain'),
('a0000019-0000-0000-0000-000000000019', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sebastian', 'Flores', 21, 'CDM', '2005-06-07', 'England'),
('a0000020-0000-0000-0000-000000000020', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Benjamin', 'Rivera', 22, 'CM', '2006-08-24', 'Brazil'),
-- Forwards (5)
('a0000021-0000-0000-0000-000000000021', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Henry', 'Gomez', 7, 'RW', '2004-12-11', 'England'),
('a0000022-0000-0000-0000-000000000022', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Samuel', 'Diaz', 9, 'ST', '2005-02-16', 'France'),
('a0000023-0000-0000-0000-000000000023', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Daniel', 'Morales', 11, 'LW', '2005-05-29', 'England'),
('a0000024-0000-0000-0000-000000000024', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Matthew', 'Reyes', 17, 'CF', '2006-10-03', 'England'),
('a0000025-0000-0000-0000-000000000025', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jackson', 'Cruz', 24, 'ST', '2005-07-14', 'Uruguay');

-- Continue in next file...
