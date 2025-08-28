-- =====================================================
-- HIMGIRI NATURALS - SUPABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add missing column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}'::jsonb;

-- 2. Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('home', 'work', 'other')) DEFAULT 'home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- 4. Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view own addresses" ON user_addresses
  FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

CREATE POLICY "Users can update own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can delete own addresses" ON user_addresses
  FOR DELETE USING (auth.uid()::bigint = user_id);

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_addresses_updated_at 
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger for single default address
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- 9. Verify setup
SELECT 'Setup complete!' as status;