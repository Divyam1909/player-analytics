-- ============================================
-- SEED DATA PART 2: PLAYERS (Mumbai Warriors - 25 players)
-- ============================================

INSERT INTO public.players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality)
VALUES 
  -- Mumbai Warriors (Team aaaa1111) - 25 players
  ('a1000001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Arjun', 'Sharma', 1, 'GK', '1995-03-15', 'India'),
  ('a1000002-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Rahul', 'Patel', 2, 'RB', '1997-07-22', 'India'),
  ('a1000003-0000-0000-0000-000000000003', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Vikram', 'Singh', 3, 'CB', '1996-11-08', 'India'),
  ('a1000004-0000-0000-0000-000000000004', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Rohan', 'Desai', 4, 'CB', '1998-02-14', 'India'),
  ('a1000005-0000-0000-0000-000000000005', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Amit', 'Kumar', 5, 'LB', '1997-09-30', 'India'),
  ('a1000006-0000-0000-0000-000000000006', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Suresh', 'Yadav', 6, 'CDM', '1996-05-18', 'India'),
  ('a1000007-0000-0000-0000-000000000007', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Prashant', 'Reddy', 7, 'RW', '1999-01-25', 'India'),
  ('a1000008-0000-0000-0000-000000000008', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Karan', 'Mehta', 8, 'CM', '1998-06-12', 'India'),
  ('a1000009-0000-0000-0000-000000000009', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Deepak', 'Nair', 9, 'ST', '1997-04-05', 'India'),
  ('a1000010-0000-0000-0000-000000000010', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Sachin', 'Joshi', 10, 'CAM', '1996-08-20', 'India'),
  ('a1000011-0000-0000-0000-000000000011', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Manish', 'Verma', 11, 'LW', '1999-12-03', 'India'),
  ('a1000012-0000-0000-0000-000000000012', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Rajesh', 'Chauhan', 12, 'GK', '1995-10-17', 'India'),
  ('a1000013-0000-0000-0000-000000000013', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Anil', 'Gupta', 13, 'CB', '1998-03-28', 'India'),
  ('a1000014-0000-0000-0000-000000000014', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Sunil', 'Rao', 14, 'RWB', '1997-07-09', 'India'),
  ('a1000015-0000-0000-0000-000000000015', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Vivek', 'Iyer', 15, 'LWB', '1999-05-14', 'India'),
  ('a1000016-0000-0000-0000-000000000016', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Nikhil', 'Das', 16, 'CDM', '1996-09-22', 'India'),
  ('a1000017-0000-0000-0000-000000000017', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Ajay', 'Pillai', 17, 'CM', '1998-01-07', 'India'),
  ('a1000018-0000-0000-0000-000000000018', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Ganesh', 'Menon', 18, 'CAM', '1997-11-29', 'India'),
  ('a1000019-0000-0000-0000-000000000019', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Harish', 'Nayar', 19, 'RW', '1999-08-16', 'India'),
  ('a1000020-0000-0000-0000-000000000020', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Ishaan', 'Bhat', 20, 'LW', '1998-04-11', 'India'),
  ('a1000021-0000-0000-0000-000000000021', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Jayant', 'Kulkarni', 21, 'ST', '1996-12-25', 'India'),
  ('a1000022-0000-0000-0000-000000000022', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Kunal', 'Shetty', 22, 'CF', '1997-02-08', 'India'),
  ('a1000023-0000-0000-0000-000000000023', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Lakshman', 'Pai', 23, 'CB', '1999-06-30', 'India'),
  ('a1000024-0000-0000-0000-000000000024', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Mahesh', 'Hegde', 24, 'RB', '1998-10-19', 'India'),
  ('a1000025-0000-0000-0000-000000000025', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Naveen', 'Kamath', 25, 'LB', '1996-07-04', 'India')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;

-- ============================================
-- PLAYERS (Pune Strikers - 25 players)
-- ============================================
INSERT INTO public.players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality)
VALUES 
  -- Pune Strikers (Team bbbb2222) - 25 players
  ('b2000001-0000-0000-0000-000000000001', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Aakash', 'Jadhav', 1, 'GK', '1996-04-12', 'India'),
  ('b2000002-0000-0000-0000-000000000002', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Bharat', 'Patil', 2, 'RB', '1997-08-25', 'India'),
  ('b2000003-0000-0000-0000-000000000003', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Chetan', 'Gaikwad', 3, 'CB', '1995-12-10', 'India'),
  ('b2000004-0000-0000-0000-000000000004', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Dinesh', 'Bhosale', 4, 'CB', '1998-05-17', 'India'),
  ('b2000005-0000-0000-0000-000000000005', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Eknath', 'Shinde', 5, 'LB', '1996-10-03', 'India'),
  ('b2000006-0000-0000-0000-000000000006', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Farhan', 'Khan', 6, 'CDM', '1997-03-21', 'India'),
  ('b2000007-0000-0000-0000-000000000007', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Girish', 'Joshi', 7, 'RW', '1999-07-08', 'India'),
  ('b2000008-0000-0000-0000-000000000008', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Hemant', 'Kulkarni', 8, 'CM', '1998-11-14', 'India'),
  ('b2000009-0000-0000-0000-000000000009', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Irfan', 'Shaikh', 9, 'ST', '1996-06-29', 'India'),
  ('b2000010-0000-0000-0000-000000000010', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Jitendra', 'More', 10, 'CAM', '1997-01-16', 'India'),
  ('b2000011-0000-0000-0000-000000000011', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Kiran', 'Pawar', 11, 'LW', '1999-09-22', 'India'),
  ('b2000012-0000-0000-0000-000000000012', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Lalit', 'Deshmukh', 12, 'GK', '1995-02-07', 'India'),
  ('b2000013-0000-0000-0000-000000000013', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Mohan', 'Salunke', 13, 'CB', '1998-08-31', 'India'),
  ('b2000014-0000-0000-0000-000000000014', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Nitin', 'Kale', 14, 'RWB', '1997-04-18', 'India'),
  ('b2000015-0000-0000-0000-000000000015', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Om', 'Thakur', 15, 'LWB', '1999-12-05', 'India'),
  ('b2000016-0000-0000-0000-000000000016', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Pranav', 'Suryawanshi', 16, 'CDM', '1996-03-14', 'India'),
  ('b2000017-0000-0000-0000-000000000017', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Qasim', 'Ahmed', 17, 'CM', '1998-07-27', 'India'),
  ('b2000018-0000-0000-0000-000000000018', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Ravi', 'Marathe', 18, 'CAM', '1997-05-09', 'India'),
  ('b2000019-0000-0000-0000-000000000019', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Sagar', 'Wagh', 19, 'RW', '1999-10-23', 'India'),
  ('b2000020-0000-0000-0000-000000000020', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Tushar', 'Kamble', 20, 'LW', '1998-01-31', 'India'),
  ('b2000021-0000-0000-0000-000000000021', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Umesh', 'Chavan', 21, 'ST', '1996-09-08', 'India'),
  ('b2000022-0000-0000-0000-000000000022', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Vijay', 'Sawant', 22, 'CF', '1997-11-20', 'India'),
  ('b2000023-0000-0000-0000-000000000023', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Wasim', 'Syed', 23, 'CB', '1999-02-15', 'India'),
  ('b2000024-0000-0000-0000-000000000024', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Xavier', 'Fernandes', 24, 'RB', '1998-06-04', 'India'),
  ('b2000025-0000-0000-0000-000000000025', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Yash', 'Deshpande', 25, 'LB', '1996-12-11', 'India')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;
