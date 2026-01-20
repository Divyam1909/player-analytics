-- ============================================
-- SEED DATA - PART 2: PLAYERS CONTINUED
-- Lightning United (25), Phoenix Athletic (25), Dragon Warriors (25)
-- Eagle Rangers (10), Falcon Stars (10)
-- ============================================

-- ============================================
-- PLAYERS - Lightning United (25 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
-- Goalkeepers (2)
('b0000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'David', 'Kumar', 1, 'GK', '2005-04-20', 'India'),
('b0000002-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mohammed', 'Ali', 13, 'GK', '2006-09-15', 'Egypt'),
-- Defenders (8)
('b0000003-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ahmed', 'Hassan', 2, 'RB', '2005-02-28', 'Morocco'),
('b0000004-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kai', 'Nakamura', 3, 'LB', '2005-11-12', 'Japan'),
('b0000005-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Marcus', 'Johnson', 4, 'CB', '2004-08-07', 'USA'),
('b0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Andre', 'Silva', 5, 'CB', '2005-06-24', 'Brazil'),
('b0000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Paulo', 'Santos', 12, 'RWB', '2005-10-09', 'Portugal'),
('b0000008-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hiroshi', 'Tanaka', 15, 'LWB', '2006-03-17', 'Japan'),
('b0000009-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Luca', 'Romano', 23, 'CB', '2005-12-05', 'Italy'),
('b0000010-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Omar', 'Mansour', 25, 'RB', '2006-07-21', 'Tunisia'),
-- Midfielders (10)
('b0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mateo', 'Fernandez', 6, 'CDM', '2005-01-15', 'Spain'),
('b0000012-0000-0000-0000-000000000012', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rafael', 'Costa', 8, 'CM', '2005-09-30', 'Brazil'),
('b0000013-0000-0000-0000-000000000013', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Yuki', 'Yamamoto', 10, 'CAM', '2004-05-12', 'Japan'),
('b0000014-0000-0000-0000-000000000014', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Diego', 'Martinez', 14, 'CM', '2005-04-18', 'Uruguay'),
('b0000015-0000-0000-0000-000000000015', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Carlos', 'Ruiz', 16, 'CDM', '2006-02-03', 'Mexico'),
('b0000016-0000-0000-0000-000000000016', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Luis', 'Mendoza', 18, 'CM', '2005-08-14', 'Colombia'),
('b0000017-0000-0000-0000-000000000017', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Miguel', 'Alvarez', 19, 'CAM', '2005-10-27', 'Argentina'),
('b0000018-0000-0000-0000-000000000018', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hassan', 'Ibrahim', 20, 'CM', '2006-06-08', 'Nigeria'),
('b0000019-0000-0000-0000-000000000019', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Xavier', 'Dupont', 21, 'CDM', '2005-11-19', 'France'),
('b0000020-0000-0000-0000-000000000020', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Leonardo', 'Rossi', 22, 'CM', '2006-09-02', 'Italy'),
-- Forwards (5)
('b0000021-0000-0000-0000-000000000021', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sergio', 'Garcia', 7, 'RW', '2004-10-25', 'Spain'),
('b0000022-0000-0000-0000-000000000022', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Antonio', 'Rodrigues', 9, 'ST', '2005-03-06', 'Portugal'),
('b0000023-0000-0000-0000-000000000023', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gabriel', 'Neves', 11, 'LW', '2005-07-18', 'Brazil'),
('b0000024-0000-0000-0000-000000000024', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ibrahim', 'Diallo', 17, 'CF', '2006-12-11', 'Senegal'),
('b0000025-0000-0000-0000-000000000025', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Yuki', 'Sato', 24, 'ST', '2005-08-29', 'Japan');

-- ============================================
-- PLAYERS - Phoenix Athletic (25 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
-- Goalkeepers (2)
('c0000001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Adam', 'Wright', 1, 'GK', '2005-05-10', 'England'),
('c0000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ryan', 'Murphy', 13, 'GK', '2006-11-22', 'Ireland'),
-- Defenders (8)
('c0000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Connor', 'Kelly', 2, 'RB', '2005-03-08', 'Scotland'),
('c0000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dylan', 'Hughes', 3, 'LB', '2005-12-14', 'Wales'),
('c0000005-0000-0000-0000-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Jake', 'Foster', 4, 'CB', '2004-09-21', 'England'),
('c0000006-0000-0000-0000-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Nathan', 'Bell', 5, 'CB', '2005-07-03', 'England'),
('c0000007-0000-0000-0000-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tyler', 'Ward', 12, 'RWB', '2005-11-28', 'USA'),
('c0000008-0000-0000-0000-000000000008', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kyle', 'Barnes', 15, 'LWB', '2006-04-15', 'Canada'),
('c0000009-0000-0000-0000-000000000009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Brandon', 'Ross', 23, 'CB', '2005-10-06', 'Australia'),
('c0000010-0000-0000-0000-000000000010', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Jordan', 'Powell', 25, 'RB', '2006-08-17', 'England'),
-- Midfielders (10)
('c0000011-0000-0000-0000-000000000011', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Zach', 'Price', 6, 'CDM', '2005-02-19', 'England'),
('c0000012-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Austin', 'Morgan', 8, 'CM', '2005-06-11', 'USA'),
('c0000013-0000-0000-0000-000000000013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Blake', 'Reed', 10, 'CAM', '2004-11-04', 'England'),
('c0000014-0000-0000-0000-000000000014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cole', 'Cooper', 14, 'CM', '2005-09-26', 'England'),
('c0000015-0000-0000-0000-000000000015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Hunter', 'Bailey', 16, 'CDM', '2006-01-18', 'Ireland'),
('c0000016-0000-0000-0000-000000000016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Parker', 'Richardson', 18, 'CM', '2005-12-08', 'England'),
('c0000017-0000-0000-0000-000000000017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Carter', 'Cox', 19, 'CAM', '2005-10-13', 'USA'),
('c0000018-0000-0000-0000-000000000018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Evan', 'Howard', 20, 'CM', '2006-05-29', 'Canada'),
('c0000019-0000-0000-0000-000000000019', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Owen', 'Peterson', 21, 'CDM', '2005-07-22', 'England'),
('c0000020-0000-0000-0000-000000000020', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Luke', 'Simmons', 22, 'CM', '2006-10-07', 'Scotland'),
-- Forwards (5)
('c0000021-0000-0000-0000-000000000021', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Caleb', 'Jenkins', 7, 'RW', '2004-12-21', 'England'),
('c0000022-0000-0000-0000-000000000022', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Isaac', 'Perry', 9, 'ST', '2005-04-02', 'Wales'),
('c0000023-0000-0000-0000-000000000023', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gavin', 'Coleman', 11, 'LW', '2005-08-16', 'England'),
('c0000024-0000-0000-0000-000000000024', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Wyatt', 'Butler', 17, 'CF', '2006-11-09', 'Australia'),
('c0000025-0000-0000-0000-000000000025', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tristan', 'Sanders', 24, 'ST', '2005-09-25', 'New Zealand');

-- ============================================
-- PLAYERS - Dragon Warriors (25 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
-- Goalkeepers (2)
('d0000001-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Felix', 'Schmidt', 1, 'GK', '2005-06-18', 'Germany'),
('d0000002-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Emil', 'Larsen', 13, 'GK', '2006-10-24', 'Denmark'),
-- Defenders (8)
('d0000003-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lars', 'Andersen', 2, 'RB', '2005-04-09', 'Norway'),
('d0000004-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Viktor', 'Novak', 3, 'LB', '2005-11-15', 'Czech Republic'),
('d0000005-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Dimitri', 'Popov', 4, 'CB', '2004-10-28', 'Russia'),
('d0000006-0000-0000-0000-000000000006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Stefan', 'Muller', 5, 'CB', '2005-08-05', 'Germany'),
('d0000007-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mikel', 'Jansen', 12, 'RWB', '2005-12-20', 'Netherlands'),
('d0000008-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Anders', 'Berg', 15, 'LWB', '2006-05-13', 'Sweden'),
('d0000009-0000-0000-0000-000000000009', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Krzysztof', 'Kowalski', 23, 'CB', '2005-09-07', 'Poland'),
('d0000010-0000-0000-0000-000000000010', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Nikola', 'Jovic', 25, 'RB', '2006-07-19', 'Serbia'),
-- Midfielders (10)
('d0000011-0000-0000-0000-000000000011', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Marco', 'Bianchi', 6, 'CDM', '2005-03-23', 'Italy'),
('d0000012-0000-0000-0000-000000000012', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pierre', 'Laurent', 8, 'CM', '2005-11-07', 'France'),
('d0000013-0000-0000-0000-000000000013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Jan', 'Kowalczyk', 10, 'CAM', '2004-06-14', 'Poland'),
('d0000014-0000-0000-0000-000000000014', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tomas', 'Novotny', 14, 'CM', '2005-05-20', 'Slovakia'),
('d0000015-0000-0000-0000-000000000015', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sven', 'Hansen', 16, 'CDM', '2006-03-01', 'Denmark'),
('d0000016-0000-0000-0000-000000000016', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Klaus', 'Werner', 18, 'CM', '2005-10-12', 'Austria'),
('d0000017-0000-0000-0000-000000000017', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Gustav', 'Eriksson', 19, 'CAM', '2005-12-05', 'Sweden'),
('d0000018-0000-0000-0000-000000000018', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Joao', 'Ferreira', 20, 'CM', '2006-08-24', 'Portugal'),
('d0000019-0000-0000-0000-000000000019', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Anton', 'Volkov', 21, 'CDM', '2005-07-17', 'Russia'),
('d0000020-0000-0000-0000-000000000020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hugo', 'Bernard', 22, 'CM', '2006-09-30', 'Belgium'),
-- Forwards (5)
('d0000021-0000-0000-0000-000000000021', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Adrian', 'Kozlov', 7, 'RW', '2004-11-26', 'Ukraine'),
('d0000022-0000-0000-0000-000000000022', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Henri', 'Dubois', 9, 'ST', '2005-01-08', 'France'),
('d0000023-0000-0000-0000-000000000023', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Matteo', 'Conti', 11, 'LW', '2005-06-22', 'Italy'),
('d0000024-0000-0000-0000-000000000024', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lukas', 'Fischer', 17, 'CF', '2006-12-15', 'Germany'),
('d0000025-0000-0000-0000-000000000025', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Erik', 'Johansen', 24, 'ST', '2005-10-11', 'Finland');

-- ============================================
-- PLAYERS - Eagle Rangers (10 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
('e0000001-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Max', 'Robinson', 1, 'GK', '2005-07-12', 'England'),
('e0000002-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sam', 'Mitchell', 4, 'CB', '2005-03-18', 'England'),
('e0000003-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Tom', 'Edwards', 5, 'CB', '2005-09-25', 'Wales'),
('e0000004-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ben', 'Carter', 2, 'RB', '2006-01-30', 'England'),
('e0000005-0000-0000-0000-000000000005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Alex', 'Phillips', 3, 'LB', '2006-05-07', 'Scotland'),
('e0000006-0000-0000-0000-000000000006', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ryan', 'Bennett', 6, 'CDM', '2005-11-14', 'England'),
('e0000007-0000-0000-0000-000000000007', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Josh', 'Gray', 8, 'CM', '2005-08-21', 'Ireland'),
('e0000008-0000-0000-0000-000000000008', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Matt', 'Clarke', 10, 'CAM', '2005-04-16', 'England'),
('e0000009-0000-0000-0000-000000000009', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Joe', 'Watson', 11, 'LW', '2005-12-03', 'England'),
('e0000010-0000-0000-0000-000000000010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Dan', 'Brooks', 9, 'ST', '2005-10-28', 'England');

-- ============================================
-- PLAYERS - Falcon Stars (10 players)
-- ============================================

INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality) VALUES
('f0000001-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Chris', 'Walker', 1, 'GK', '2005-08-19', 'England'),
('f0000002-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Paul', 'Harris', 4, 'CB', '2005-04-22', 'England'),
('f0000003-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Steve', 'Lewis', 5, 'CB', '2005-10-09', 'Wales'),
('f0000004-0000-0000-0000-000000000004', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Andy', 'Scott', 2, 'RB', '2006-02-14', 'Scotland'),
('f0000005-0000-0000-0000-000000000005', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mark', 'Adams', 3, 'LB', '2006-06-27', 'England'),
('f0000006-0000-0000-0000-000000000006', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Rob', 'Green', 6, 'CDM', '2005-12-11', 'Ireland'),
('f0000007-0000-0000-0000-000000000007', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Nick', 'Young', 8, 'CM', '2005-09-18', 'England'),
('f0000008-0000-0000-0000-000000000008', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Carl', 'King', 10, 'CAM', '2005-05-05', 'USA'),
('f0000009-0000-0000-0000-000000000009', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mike', 'Hill', 7, 'RW', '2005-11-29', 'Canada'),
('f0000010-0000-0000-0000-000000000010', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Tony', 'Moore', 9, 'ST', '2005-07-24', 'England');
