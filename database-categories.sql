-- Categories schema and seed
-- Safe to run multiple times

create table if not exists categories (
  id bigserial primary key,
  name text not null,
  description text,
  image text,
  sort int default 0,
  updated_at timestamp with time zone default now()
);

create index if not exists idx_categories_sort on categories(sort);
create index if not exists idx_categories_name on categories(name);

-- Seed initial categories
insert into categories (id, name, description, image, sort) values
  (1, 'Premium Nuts', 'Almonds, Cashews, Walnuts & More', 'https://images.unsplash.com/photo-1653046058018-626c37d645db?w=1080', 10),
  (2, 'Healthy Seeds', 'Sunflower, Pumpkin, Chia Seeds', 'https://images.unsplash.com/photo-1634582872934-be411573f235?w=1080', 20),
  (3, 'Dried Berries', 'Cranberries, Blueberries, Goji Berries', 'https://images.unsplash.com/photo-1569654972109-6648a47920ce?w=1080', 30),
  (4, 'Special Combos', 'Curated Mix Packs & Gift Sets', 'https://images.unsplash.com/photo-1733337336596-c8e9c0dfa944?w=1080', 40)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  sort = excluded.sort,
  updated_at = now();

