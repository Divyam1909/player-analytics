-- ============================================
-- SECURE LOGIN FUNCTION (RPC) - UPDATED
-- ============================================
-- Enables frontend to verify passwords without fetching hashes.
-- Requires pgcrypto extension.
-- ============================================

-- 1. Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the login function
-- Returns the user record if valid, or NULL if invalid
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_user_password(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  first_name TEXT,
  last_name TEXT,
  team_id UUID,
  team_name TEXT,
  player_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.team_id,
    t.team_name,
    u.player_id
  FROM users u
  LEFT JOIN teams t ON u.team_id = t.id
  WHERE u.email = p_email
    -- Verify password hash using crypt() from pgcrypto
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to anon/authenticated roles
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO service_role;
