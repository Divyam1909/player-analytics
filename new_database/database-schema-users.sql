-- ============================================
-- USERS TABLE SCHEMA
-- Authentication and user management
-- ============================================

-- USERS
-- Stores user accounts for authentication
-- Links to teams (for coaches) and players (for player accounts)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- bcrypt hashed password
  
  -- Role-based access control
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'player')),
  
  -- Profile Information
  first_name TEXT,
  last_name TEXT,
  
  -- Relations (depends on role)
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- Session tracking
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_coach_has_team CHECK (
    (role != 'coach') OR (team_id IS NOT NULL)
  ),
  CONSTRAINT users_player_has_player_id CHECK (
    (role != 'player') OR (player_id IS NOT NULL)
  )
);

-- Indexes for fast lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_player ON users(player_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();
