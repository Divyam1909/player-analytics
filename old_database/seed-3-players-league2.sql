-- ============================================
-- SEED DATA PART 3: PLAYERS (Delhi United - 25 players)
-- ============================================

INSERT INTO public.players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality)
VALUES 
  -- Delhi United (Team cccc3333) - 25 players
  ('c3000001-0000-0000-0000-000000000001', 'cccc3333-3333-3333-3333-cccccccccccc', 'Aarav', 'Kapoor', 1, 'GK', '2002-03-18', 'India'),
  ('c3000002-0000-0000-0000-000000000002', 'cccc3333-3333-3333-3333-cccccccccccc', 'Bodhi', 'Malhotra', 2, 'RB', '2003-06-25', 'India'),
  ('c3000003-0000-0000-0000-000000000003', 'cccc3333-3333-3333-3333-cccccccccccc', 'Chirag', 'Arora', 3, 'CB', '2002-09-12', 'India'),
  ('c3000004-0000-0000-0000-000000000004', 'cccc3333-3333-3333-3333-cccccccccccc', 'Dev', 'Saxena', 4, 'CB', '2003-01-28', 'India'),
  ('c3000005-0000-0000-0000-000000000005', 'cccc3333-3333-3333-3333-cccccccccccc', 'Eshan', 'Batra', 5, 'LB', '2002-11-05', 'India'),
  ('c3000006-0000-0000-0000-000000000006', 'cccc3333-3333-3333-3333-cccccccccccc', 'Farhan', 'Ansari', 6, 'CDM', '2003-04-17', 'India'),
  ('c3000007-0000-0000-0000-000000000007', 'cccc3333-3333-3333-3333-cccccccccccc', 'Gaurav', 'Tandon', 7, 'RW', '2002-07-30', 'India'),
  ('c3000008-0000-0000-0000-000000000008', 'cccc3333-3333-3333-3333-cccccccccccc', 'Hitesh', 'Chadha', 8, 'CM', '2003-10-14', 'India'),
  ('c3000009-0000-0000-0000-000000000009', 'cccc3333-3333-3333-3333-cccccccccccc', 'Ishwar', 'Bhardwaj', 9, 'ST', '2002-05-22', 'India'),
  ('c3000010-0000-0000-0000-000000000010', 'cccc3333-3333-3333-3333-cccccccccccc', 'Jai', 'Khanna', 10, 'CAM', '2003-08-08', 'India'),
  ('c3000011-0000-0000-0000-000000000011', 'cccc3333-3333-3333-3333-cccccccccccc', 'Kabir', 'Sinha', 11, 'LW', '2002-02-14', 'India'),
  ('c3000012-0000-0000-0000-000000000012', 'cccc3333-3333-3333-3333-cccccccccccc', 'Lakshay', 'Pandit', 12, 'GK', '2003-12-01', 'India'),
  ('c3000013-0000-0000-0000-000000000013', 'cccc3333-3333-3333-3333-cccccccccccc', 'Mayank', 'Luthra', 13, 'CB', '2002-04-27', 'India'),
  ('c3000014-0000-0000-0000-000000000014', 'cccc3333-3333-3333-3333-cccccccccccc', 'Nakul', 'Grover', 14, 'RWB', '2003-07-15', 'India'),
  ('c3000015-0000-0000-0000-000000000015', 'cccc3333-3333-3333-3333-cccccccccccc', 'Omkar', 'Dhawan', 15, 'LWB', '2002-10-09', 'India'),
  ('c3000016-0000-0000-0000-000000000016', 'cccc3333-3333-3333-3333-cccccccccccc', 'Praneet', 'Mehra', 16, 'CDM', '2003-03-23', 'India'),
  ('c3000017-0000-0000-0000-000000000017', 'cccc3333-3333-3333-3333-cccccccccccc', 'Qabil', 'Mirza', 17, 'CM', '2002-06-06', 'India'),
  ('c3000018-0000-0000-0000-000000000018', 'cccc3333-3333-3333-3333-cccccccccccc', 'Raghav', 'Sethi', 18, 'CAM', '2003-09-19', 'India'),
  ('c3000019-0000-0000-0000-000000000019', 'cccc3333-3333-3333-3333-cccccccccccc', 'Sahil', 'Oberoi', 19, 'RW', '2002-12-12', 'India'),
  ('c3000020-0000-0000-0000-000000000020', 'cccc3333-3333-3333-3333-cccccccccccc', 'Tarun', 'Ahuja', 20, 'LW', '2003-02-28', 'India'),
  ('c3000021-0000-0000-0000-000000000021', 'cccc3333-3333-3333-3333-cccccccccccc', 'Uday', 'Trehan', 21, 'ST', '2002-08-15', 'India'),
  ('c3000022-0000-0000-0000-000000000022', 'cccc3333-3333-3333-3333-cccccccccccc', 'Varun', 'Bedi', 22, 'CF', '2003-05-04', 'India'),
  ('c3000023-0000-0000-0000-000000000023', 'cccc3333-3333-3333-3333-cccccccccccc', 'Wahid', 'Rizvi', 23, 'CB', '2002-11-21', 'India'),
  ('c3000024-0000-0000-0000-000000000024', 'cccc3333-3333-3333-3333-cccccccccccc', 'Yuvraj', 'Bajaj', 24, 'RB', '2003-01-10', 'India'),
  ('c3000025-0000-0000-0000-000000000025', 'cccc3333-3333-3333-3333-cccccccccccc', 'Zubin', 'Sodhi', 25, 'LB', '2002-07-07', 'India')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;

-- ============================================
-- PLAYERS (Bangalore FC - 25 players)
-- ============================================
INSERT INTO public.players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality)
VALUES 
  -- Bangalore FC (Team dddd4444) - 25 players
  ('d4000001-0000-0000-0000-000000000001', 'dddd4444-4444-4444-4444-dddddddddddd', 'Abhinav', 'Rao', 1, 'GK', '2002-04-20', 'India'),
  ('d4000002-0000-0000-0000-000000000002', 'dddd4444-4444-4444-4444-dddddddddddd', 'Bhavesh', 'Gowda', 2, 'RB', '2003-08-03', 'India'),
  ('d4000003-0000-0000-0000-000000000003', 'dddd4444-4444-4444-4444-dddddddddddd', 'Chandan', 'Shetty', 3, 'CB', '2002-11-16', 'India'),
  ('d4000004-0000-0000-0000-000000000004', 'dddd4444-4444-4444-4444-dddddddddddd', 'Darshan', 'Naik', 4, 'CB', '2003-02-09', 'India'),
  ('d4000005-0000-0000-0000-000000000005', 'dddd4444-4444-4444-4444-dddddddddddd', 'Eshwar', 'Hegde', 5, 'LB', '2002-06-24', 'India'),
  ('d4000006-0000-0000-0000-000000000006', 'dddd4444-4444-4444-4444-dddddddddddd', 'Firoz', 'Ahmed', 6, 'CDM', '2003-09-11', 'India'),
  ('d4000007-0000-0000-0000-000000000007', 'dddd4444-4444-4444-4444-dddddddddddd', 'Girija', 'Prasad', 7, 'RW', '2002-12-28', 'India'),
  ('d4000008-0000-0000-0000-000000000008', 'dddd4444-4444-4444-4444-dddddddddddd', 'Harsha', 'Kumar', 8, 'CM', '2003-05-15', 'India'),
  ('d4000009-0000-0000-0000-000000000009', 'dddd4444-4444-4444-4444-dddddddddddd', 'Imran', 'Pasha', 9, 'ST', '2002-08-02', 'India'),
  ('d4000010-0000-0000-0000-000000000010', 'dddd4444-4444-4444-4444-dddddddddddd', 'Jeevith', 'Acharya', 10, 'CAM', '2003-11-19', 'India'),
  ('d4000011-0000-0000-0000-000000000011', 'dddd4444-4444-4444-4444-dddddddddddd', 'Karthik', 'Ballal', 11, 'LW', '2002-03-06', 'India'),
  ('d4000012-0000-0000-0000-000000000012', 'dddd4444-4444-4444-4444-dddddddddddd', 'Lokesh', 'Devadiga', 12, 'GK', '2003-06-23', 'India'),
  ('d4000013-0000-0000-0000-000000000013', 'dddd4444-4444-4444-4444-dddddddddddd', 'Mahendra', 'Bhat', 13, 'CB', '2002-09-30', 'India'),
  ('d4000014-0000-0000-0000-000000000014', 'dddd4444-4444-4444-4444-dddddddddddd', 'Nagesh', 'Karanth', 14, 'RWB', '2003-12-17', 'India'),
  ('d4000015-0000-0000-0000-000000000015', 'dddd4444-4444-4444-4444-dddddddddddd', 'Om', 'Shenoy', 15, 'LWB', '2002-02-04', 'India'),
  ('d4000016-0000-0000-0000-000000000016', 'dddd4444-4444-4444-4444-dddddddddddd', 'Prasanna', 'Nayak', 16, 'CDM', '2003-07-21', 'India'),
  ('d4000017-0000-0000-0000-000000000017', 'dddd4444-4444-4444-4444-dddddddddddd', 'Raghu', 'Adiga', 17, 'CM', '2002-10-08', 'India'),
  ('d4000018-0000-0000-0000-000000000018', 'dddd4444-4444-4444-4444-dddddddddddd', 'Sanjay', 'Poojary', 18, 'CAM', '2003-01-25', 'India'),
  ('d4000019-0000-0000-0000-000000000019', 'dddd4444-4444-4444-4444-dddddddddddd', 'Tejas', 'Kamath', 19, 'RW', '2002-04-12', 'India'),
  ('d4000020-0000-0000-0000-000000000020', 'dddd4444-4444-4444-4444-dddddddddddd', 'Uday', 'Suvarna', 20, 'LW', '2003-08-29', 'India'),
  ('d4000021-0000-0000-0000-000000000021', 'dddd4444-4444-4444-4444-dddddddddddd', 'Vinay', 'Tantri', 21, 'ST', '2002-05-16', 'India'),
  ('d4000022-0000-0000-0000-000000000022', 'dddd4444-4444-4444-4444-dddddddddddd', 'Waqar', 'Khan', 22, 'CF', '2003-10-03', 'India'),
  ('d4000023-0000-0000-0000-000000000023', 'dddd4444-4444-4444-4444-dddddddddddd', 'Yashwanth', 'Pai', 23, 'CB', '2002-01-20', 'India'),
  ('d4000024-0000-0000-0000-000000000024', 'dddd4444-4444-4444-4444-dddddddddddd', 'Zuhaib', 'Patel', 24, 'RB', '2003-04-07', 'India'),
  ('d4000025-0000-0000-0000-000000000025', 'dddd4444-4444-4444-4444-dddddddddddd', 'Akash', 'Udupa', 25, 'LB', '2002-11-24', 'India')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;
