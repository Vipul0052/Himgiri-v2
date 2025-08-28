-- Create product_meta table to store extended product details
-- Safe to run multiple times

create table if not exists product_meta (
  product_id bigint primary key references products(id) on delete cascade,
  price numeric(12,2),
  image text,
  category text,
  description text,
  updated_at timestamp with time zone default now()
);

create index if not exists idx_product_meta_category on product_meta(category);

-- Upsert helper example:
-- insert into product_meta (product_id, price, image, category, description)
-- values (123, 499.00, 'https://example.com/img.jpg', 'nuts', 'Premium pistachios')
-- on conflict (product_id) do update set
--   price = excluded.price,
--   image = excluded.image,
--   category = excluded.category,
--   description = excluded.description,
--   updated_at = now();

