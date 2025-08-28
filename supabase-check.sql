-- =====================================================
-- HIMGIRI NATURALS - DATABASE STATUS CHECK
-- Run this in Supabase SQL Editor to see current state
-- =====================================================

-- Check users table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if user_addresses table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_addresses';

-- Check if communication_preferences column exists in users
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'communication_preferences';

-- Check current user count
SELECT COUNT(*) as user_count FROM users;

-- Check if any addresses exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_addresses') 
    THEN (SELECT COUNT(*) FROM user_addresses)
    ELSE 'Table does not exist'
  END as address_count;