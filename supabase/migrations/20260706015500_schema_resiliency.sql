-- Phase 2.2: Schema Resiliency & Data Integrity

-- 0. Ensure PO tables exist (since they were missing from the raw SQL dumps)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.po_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    qty_ordered DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Soft Deletes
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.po_line_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.client_pricing ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Audit & Idempotency
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- 3. Sequential Numbering (Using Postgres Sequences)
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS po_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    year_prefix TEXT;
    start_year INT;
    month INT;
BEGIN
    -- Only generate if not provided
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        -- Determine financial year (April to March)
        month := EXTRACT(MONTH FROM CURRENT_DATE);
        IF month >= 4 THEN
            start_year := EXTRACT(YEAR FROM CURRENT_DATE);
        ELSE
            start_year := EXTRACT(YEAR FROM CURRENT_DATE) - 1;
        END IF;
        
        -- e.g. 24-25
        year_prefix := MOD(start_year, 100)::TEXT || '-' || MOD(start_year + 1, 100)::TEXT;
        
        seq_val := nextval('invoice_seq');
        NEW.invoice_number := 'NI/' || year_prefix || '/' || lpad(seq_val::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();


CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    year_prefix TEXT;
    start_year INT;
    month INT;
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        month := EXTRACT(MONTH FROM CURRENT_DATE);
        IF month >= 4 THEN
            start_year := EXTRACT(YEAR FROM CURRENT_DATE);
        ELSE
            start_year := EXTRACT(YEAR FROM CURRENT_DATE) - 1;
        END IF;
        
        year_prefix := MOD(start_year, 100)::TEXT || '-' || MOD(start_year + 1, 100)::TEXT;
        seq_val := nextval('po_seq');
        NEW.po_number := 'PO/' || year_prefix || '/' || lpad(seq_val::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_po_number ON purchase_orders;
CREATE TRIGGER trigger_generate_po_number
BEFORE INSERT ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION generate_po_number();

-- 4. Versioned Pricing
-- Migrate client_pricing to support valid_from and valid_to
ALTER TABLE public.client_pricing ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.client_pricing ADD COLUMN IF NOT EXISTS valid_to TIMESTAMP WITH TIME ZONE;

-- Drop unique constraint that prevents multiple price rows for the same client/product
ALTER TABLE public.client_pricing DROP CONSTRAINT IF EXISTS unique_client_product_pricing;

-- Add a partial unique constraint: only one active price per client-product pair
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_client_product_pricing 
ON public.client_pricing (client_id, product_id) 
WHERE valid_to IS NULL AND deleted_at IS NULL;
