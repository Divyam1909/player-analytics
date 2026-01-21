-- ============================================
-- FIX PASSWORDS SCRIPT
-- ============================================
-- The seed data password hashes might not match the specific salt/algo 
-- expected by your database's pgcrypto extension.
-- This script updates ALL users' passwords to 'password123'
-- using the database's own crypt() function to ensure compatibility.
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update all users to have password "password123"
UPDATE users 
SET password_hash = crypt('password123', gen_salt('bf'));

-- Verify the update
SELECT email, role, password_hash FROM users;
