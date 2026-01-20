-- ============================================
-- SEED DATA PART 1: LEAGUES & TEAMS
-- Player Analytics - Comprehensive Database Seed
-- ============================================
-- Structure: 2 leagues, 4 teams (2 teams per league)
-- Each team has 25 players, 2 matches per league
-- ============================================

-- Schema modification (if not already done)
ALTER TABLE public.matches ALTER COLUMN created_by DROP NOT NULL;

-- ============================================
-- LEAGUES (2 leagues)
-- ============================================
INSERT INTO public.leagues (id, league_name, tier, is_default, country, state, league_type)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Premier Football League', 1, true, 'India', 'Maharashtra', 'professional'),
  ('22222222-bbbb-bbbb-bbbb-222222222222', 'National Youth Championship', 2, false, 'India', 'Delhi', 'youth')
ON CONFLICT (id) DO UPDATE SET league_name = EXCLUDED.league_name;

-- ============================================
-- TEAMS (4 teams - 2 per league)
-- ============================================
-- League 1 Teams: Mumbai Warriors, Pune Strikers
-- League 2 Teams: Delhi United, Bangalore FC

INSERT INTO public.teams (id, team_name, team_email, head_coach_name, logo_url, has_free_access, is_onboarded, metadata)
VALUES 
  -- League 1: Premier Football League
  ('aaaa1111-1111-1111-1111-aaaaaaaaaaaa', 'Mumbai Warriors', 'mumbaiwarriors@football.in', 'Coach Rajesh Kumar', NULL, true, true, '{"formation": "4-3-3", "style": "attacking"}'),
  ('bbbb2222-2222-2222-2222-bbbbbbbbbbbb', 'Pune Strikers', 'punestrikers@football.in', 'Coach Vikram Singh', NULL, true, true, '{"formation": "4-4-2", "style": "balanced"}'),
  
  -- League 2: National Youth Championship  
  ('cccc3333-3333-3333-3333-cccccccccccc', 'Delhi United', 'delhiunited@football.in', 'Coach Amit Sharma', NULL, true, true, '{"formation": "4-2-3-1", "style": "possession"}'),
  ('dddd4444-4444-4444-4444-dddddddddddd', 'Bangalore FC', 'bangalorefc@football.in', 'Coach Suresh Menon', NULL, true, true, '{"formation": "3-5-2", "style": "counter-attack"}')
ON CONFLICT (id) DO UPDATE SET team_name = EXCLUDED.team_name;

-- ============================================
-- TEAM LEAGUES (Junction table)
-- ============================================
INSERT INTO public.team_leagues (id, team_id, league_id, is_primary)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', true),
  ('b2222222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-bbbbbbbbbbbb', '11111111-aaaa-aaaa-aaaa-111111111111', true),
  ('c3333333-3333-3333-3333-333333333333', 'cccc3333-3333-3333-3333-cccccccccccc', '22222222-bbbb-bbbb-bbbb-222222222222', true),
  ('d4444444-4444-4444-4444-444444444444', 'dddd4444-4444-4444-4444-dddddddddddd', '22222222-bbbb-bbbb-bbbb-222222222222', true)
ON CONFLICT (id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
