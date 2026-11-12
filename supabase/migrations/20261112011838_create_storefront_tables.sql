/*
# Storefront tables: products, maintenance inquiries, shop owners

1. New Tables
- `shop_owners`: lists the auth accounts allowed to manage the shop (owner page).
- `products`: phones, screens, cases and accessories shown in the public catalog.
- `maintenance_inquiries`: repair and part-price requests sent by customers, read and answered by the owner.

2. Security
- RLS enabled on all three tables.
- Anyone (anon + signed-in) can read active products and submit inquiries.
- Only shop owners (rows in `shop_owners`) can add, edit or delete products and read, answer or delete inquiries.
- Owners can only update the `status` and `owner_reply` columns of an inquiry; customer details stay unchanged.
- `shop_owners` is readable only by its own account and cannot be changed from the browser.

3. Notes
- Owner accounts are added manually in `shop_owners` after the owner signs up.
- Text lengths are limited by CHECK constraints to keep submissions reasonable.
*/

CREATE TABLE IF NOT EXISTS shop_owners (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON shop_owners TO authenticated;

DROP POLICY IF EXISTS "owner_select_own_row" ON shop_owners;
CREATE POLICY "owner_select_own_row" ON shop_owners FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  category text NOT NULL CHECK (category IN ('phone', 'screen', 'case', 'accessory')),
  brand text NOT NULL DEFAULT '' CHECK (char_length(brand) <= 80),
  compatible_models text NOT NULL DEFAULT '' CHECK (char_length(compatible_models) <= 500),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url text NOT NULL DEFAULT '' CHECK (char_length(image_url) <= 2000),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

DROP POLICY IF EXISTS "public_select_active_products" ON products;
CREATE POLICY "public_select_active_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active OR EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "owner_insert_products" ON products;
CREATE POLICY "owner_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "owner_update_products" ON products;
CREATE POLICY "owner_update_products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()));

DROP POLICY IF EXISTS "owner_delete_products" ON products;
CREATE POLICY "owner_delete_products" ON products FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));

CREATE TABLE IF NOT EXISTS maintenance_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  customer_phone text NOT NULL CHECK (char_length(customer_phone) BETWEEN 5 AND 30),
  device_model text NOT NULL DEFAULT '' CHECK (char_length(device_model) <= 160),
  request_type text NOT NULL CHECK (request_type IN ('repair', 'price', 'part', 'other')),
  part_requested text NOT NULL DEFAULT '' CHECK (char_length(part_requested) <= 160),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'answered', 'closed')),
  owner_reply text NOT NULL DEFAULT '' CHECK (char_length(owner_reply) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS maintenance_inquiries_created_idx ON maintenance_inquiries (created_at DESC);

ALTER TABLE maintenance_inquiries ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON maintenance_inquiries TO anon, authenticated;
GRANT SELECT, DELETE ON maintenance_inquiries TO authenticated;
GRANT UPDATE (status, owner_reply) ON maintenance_inquiries TO authenticated;

DROP POLICY IF EXISTS "public_insert_inquiries" ON maintenance_inquiries;
CREATE POLICY "public_insert_inquiries" ON maintenance_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'new' AND owner_reply = '');

DROP POLICY IF EXISTS "owner_select_inquiries" ON maintenance_inquiries;
CREATE POLICY "owner_select_inquiries" ON maintenance_inquiries FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "owner_update_inquiries" ON maintenance_inquiries;
CREATE POLICY "owner_update_inquiries" ON maintenance_inquiries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()));

DROP POLICY IF EXISTS "owner_delete_inquiries" ON maintenance_inquiries;
CREATE POLICY "owner_delete_inquiries" ON maintenance_inquiries FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));
