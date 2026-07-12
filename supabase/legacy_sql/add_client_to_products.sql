-- Add client_id to products table to make products client-specific
ALTER TABLE products ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_products_client_id ON products(client_id);

-- Update the policy to ensure proper access
DROP POLICY IF EXISTS "Allow all operations" ON products;
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
