-- 1. Clients table updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_client_name') THEN
        ALTER TABLE clients ADD CONSTRAINT unique_client_name UNIQUE (name);
    END IF;
END $$;

-- 2. Products table updates
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_product_sku') THEN
        ALTER TABLE products ADD CONSTRAINT unique_product_sku UNIQUE (sku);
    END IF;
END $$;

-- Note: In a real system you'd handle duplicates or drop old constraints if necessary, e.g.:
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS unique_product_per_client;

-- 3. Client Pricing table
CREATE TABLE IF NOT EXISTS client_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    custom_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_client_product_pricing UNIQUE (client_id, product_id)
);

-- Add updated_at trigger for client_pricing
DROP TRIGGER IF EXISTS update_client_pricing_updated_at ON client_pricing;
CREATE TRIGGER update_client_pricing_updated_at BEFORE UPDATE ON client_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE client_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON client_pricing FOR ALL USING (true);
