/*
# Split product read policy so anonymous visitors never touch shop_owners

1. Modified Tables
- `products`: the read policy is split into two permissive policies.

2. Security
- Visitors (anon and signed-in) can read active products only.
- Shop owners (rows in `shop_owners`) can additionally read inactive products.
- Anonymous requests no longer evaluate the owner lookup, which they have no privilege to run.
*/

DROP POLICY IF EXISTS "public_select_active_products" ON products;
CREATE POLICY "public_select_active_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "owner_select_all_products" ON products;
CREATE POLICY "owner_select_all_products" ON products FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM shop_owners WHERE shop_owners.user_id = auth.uid()
  ));
