-- Add email verification columns to users table
-- Run this in your Supabase SQL editor

-- Add new columns for email verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMPTZ;

-- Update existing users to have verified emails (optional)
UPDATE users 
SET email_verified = true 
WHERE email_verified IS NULL;

-- Create index for verification code lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);

-- Add RLS policy for verification
CREATE POLICY "Users can update own verification status" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Example of how the verification flow works:
-- 1. User signs up -> verification_code and verification_expires are set
-- 2. User receives email with verification code
-- 3. User enters code -> email_verified is set to true
-- 4. User can now login