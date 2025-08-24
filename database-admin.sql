-- =====================================================
-- HIMGIRI NATURALS - ADMIN SCHEMA & ROLES MIGRATION
-- =====================================================

-- 1) Add role column to users (admin/user)
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user','admin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2) Inventory table for stock tracking
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);

-- 3) Trigger to sync products.in_stock based on inventory.stock
CREATE OR REPLACE FUNCTION sync_product_in_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
     SET in_stock = (NEW.stock > 0),
         updated_at = NOW()
   WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_sync_product ON inventory;
CREATE TRIGGER trg_inventory_sync_product
  AFTER INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION sync_product_in_stock();

-- Enable RLS for inventory (service role bypasses RLS for admin API)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- 4) View to surface low stock items
CREATE OR REPLACE VIEW low_stock_items AS
SELECT p.id as product_id,
       p.name,
       COALESCE(i.stock, 0) as stock,
       COALESCE(i.low_stock_threshold, 5) as low_stock_threshold
  FROM products p
  LEFT JOIN inventory i ON i.product_id = p.id
 WHERE COALESCE(i.stock, 0) <= COALESCE(i.low_stock_threshold, 5);

-- 5) Seed an initial admin role if you know the email
-- UPDATE users SET role = 'admin' WHERE email = 'you@himgirinaturals.com';