-- Add unique constraint to products table to prevent duplicate products per client
-- This ensures that each client can only have one product with a given name

-- First, check if there are any existing duplicates that would violate this constraint
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT client_id, name, COUNT(*)
        FROM products
        WHERE client_id IS NOT NULL
        GROUP BY client_id, name
        HAVING COUNT(*) > 1
    ) as duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE WARNING 'Found % duplicate product entries. These will need to be resolved before adding the constraint.', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicates found. Safe to add constraint.';
    END IF;
END $$;

-- Add the unique constraint
-- If duplicates exist, this will fail and you'll need to clean them up first
ALTER TABLE products 
ADD CONSTRAINT unique_product_per_client 
UNIQUE (client_id, name);

-- Create an index to improve query performance for product lookups by client
CREATE INDEX IF NOT EXISTS idx_products_client_name ON products(client_id, name);
