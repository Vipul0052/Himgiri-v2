-- Himgiri Naturals Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE id = wishlist.user_id));

CREATE POLICY "Users can add to own wishlist" ON wishlist
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE id = wishlist.user_id));

CREATE POLICY "Users can remove from own wishlist" ON wishlist
  FOR DELETE USING (user_id = (SELECT id FROM users WHERE id = wishlist.user_id));

-- 2. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can add own reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE id = reviews.user_id));

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE id = reviews.user_id));

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (user_id = (SELECT id FROM users WHERE id = reviews.user_id));

-- 3. Update Orders Table (if not already done)
-- Add tracking and shipping update fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_updates JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 5. Sample data for testing (optional)
-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment, user_name) VALUES
(1, 'premium-almonds', 5, 'Excellent quality almonds! Very fresh and tasty.', 'John Doe'),
(1, 'organic-walnuts', 4, 'Good walnuts, slightly smaller than expected but good taste.', 'John Doe'),
(2, 'premium-cashews', 5, 'Best cashews I have ever tasted! Highly recommended.', 'Jane Smith')
ON CONFLICT (user_id, product_id) DO NOTHING;

-- 6. Functions for common operations
-- Function to get average rating for a product
CREATE OR REPLACE FUNCTION get_product_rating(product_id_param TEXT)
RETURNS TABLE(avg_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(r.rating)::NUMERIC, 2) as avg_rating,
    COUNT(*) as total_reviews
  FROM reviews r
  WHERE r.product_id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's order summary
CREATE OR REPLACE FUNCTION get_user_order_summary(user_id_param BIGINT)
RETURNS TABLE(
  total_orders BIGINT,
  total_spent NUMERIC,
  last_order_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(amount), 0) as total_spent,
    MAX(created_at) as last_order_date
  FROM orders
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- 7. Views for easier data access
-- View for product ratings
CREATE OR REPLACE VIEW product_ratings AS
SELECT 
  product_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating
FROM reviews
GROUP BY product_id;

-- View for user dashboard data
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at as member_since,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.amount), 0) as total_spent,
  COUNT(DISTINCT w.id) as wishlist_items,
  COUNT(DISTINCT r.id) as total_reviews
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN wishlist w ON u.id = w.user_id
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- 8. Triggers for automatic updates
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Comments for documentation
COMMENT ON TABLE wishlist IS 'User wishlist items with product data';
COMMENT ON TABLE reviews IS 'Product reviews and ratings from users';
COMMENT ON TABLE orders IS 'Customer orders with shipping and payment details';
COMMENT ON FUNCTION get_product_rating(TEXT) IS 'Get average rating and review count for a product';
COMMENT ON FUNCTION get_user_order_summary(BIGINT) IS 'Get summary statistics for a user';
COMMENT ON VIEW product_ratings IS 'Aggregated product ratings and review counts';
COMMENT ON VIEW user_dashboard IS 'Comprehensive user dashboard data';

-- 10. Grant permissions (if using custom roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON wishlist TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
-- GRANT SELECT ON product_ratings TO authenticated;
-- GRANT SELECT ON user_dashboard TO authenticated;