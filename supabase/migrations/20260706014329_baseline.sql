-- From schema.sql 

-- Navneet Industries Invoice Management System
-- Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    gstin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sac_code TEXT,
    hsn_code TEXT,
    unit TEXT DEFAULT 'Pcs',
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Receiver details
    receiver_name TEXT,
    receiver_address TEXT,
    receiver_city TEXT,
    receiver_state TEXT,
    receiver_state_code TEXT,
    receiver_gstin TEXT,
    
    -- Consignee details
    consignee_name TEXT,
    consignee_address TEXT,
    consignee_city TEXT,
    consignee_state TEXT,
    consignee_state_code TEXT,
    consignee_gstin TEXT,
    
    -- Supplier
    supplier TEXT,
    
    -- Financial totals
    subtotal DECIMAL(10, 2) DEFAULT 0,
    transportation_charges DECIMAL(10, 2) DEFAULT 0,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    igst_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Additional info
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Item details
    description TEXT NOT NULL,
    sac_code TEXT,
    hsn_code TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Pcs',
    rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Tax calculations
    taxable_value DECIMAL(10, 2) DEFAULT 0,
    cgst_rate DECIMAL(5, 2) DEFAULT 0,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_rate DECIMAL(5, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    igst_rate DECIMAL(5, 2) DEFAULT 0,
    igst_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON invoice_items
    FOR ALL USING (auth.role() = 'authenticated');


-- From product_groups_schema.sql 

-- 1. Create product_groups table
CREATE TABLE IF NOT EXISTS public.product_groups (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    group_name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT product_groups_pkey PRIMARY KEY (id)
);

-- 2. Add group_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.product_groups(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.product_groups FOR ALL USING (auth.role() = 'authenticated');


-- From unique_constraint_migration.sql 

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


-- From master_schema_update.sql 

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


-- From transaction_rpc.sql 

-- RPC for Transactional Dispatch (Waterfall Allocation)
-- This function takes dispatch requests (product + qty), 
-- finds the oldest open POs (FIFO), allocates quantities, 
-- and creates an Invoice with Invoice Items in a single transaction.

create or replace function create_dispatch_invoice(
  p_client_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_receiver_details jsonb, -- {name, address, city, state, state_code, gstin}
  p_dispatch_items jsonb -- Array of {product_id, product_name, quantity, unit_price}
) returns jsonb as $$
declare
  v_invoice_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_remaining_qty numeric;
  v_po_line_record record;
  v_alloc_qty numeric;
  v_total_amount numeric := 0;
  v_subtotal numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  
  -- Tax vars
  v_taxable_val numeric;
  v_line_cgst numeric;
  v_line_sgst numeric;
  v_line_igst numeric;
  v_line_total numeric;
  
  v_client_state_code text;
begin
  -- 1. Get Client State Code for Tax Logic
  select state_code into v_client_state_code from clients where id = p_client_id;
  
  -- 2. Insert Invoice Header 'Draft'
  insert into invoices (
    invoice_number, 
    invoice_date, 
    client_id,
    receiver_name, receiver_address, receiver_city, receiver_state, receiver_state_code, receiver_gstin,
    status
  ) values (
    p_invoice_number, 
    p_invoice_date, 
    p_client_id,
    p_receiver_details->>'name', p_receiver_details->>'address', p_receiver_details->>'city', p_receiver_details->>'state', p_receiver_details->>'state_code', p_receiver_details->>'gstin',
    'draft'
  ) returning id into v_invoice_id;
  
  -- 3. Loop through requested dispatch items
  for v_item in select * from jsonb_array_elements(p_dispatch_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_remaining_qty := (v_item->>'quantity')::numeric;
    
    -- Waterfall Logic: Find Open PO Line Items for this Product and Client, Ordered by PO Date (FIFO)
    -- We join purchase_orders to get the created_at date and client_id
    -- We calculate 'shipped' by summing existing invoice_items for that line item
    for v_po_line_record in 
      select 
        pli.id as line_id,
        pli.qty_ordered,
        coalesce(sum(ii.quantity), 0) as qty_shipped
      from po_line_items pli
      join purchase_orders po on po.id = pli.po_id
      left join invoice_items ii on ii.po_line_item_id = pli.id
      where po.client_id = p_client_id 
        and pli.product_id = v_product_id
        and po.status = 'open'
      group by pli.id, pli.qty_ordered, po.created_at
      having (pli.qty_ordered - coalesce(sum(ii.quantity), 0)) > 0
      order by po.created_at asc
    loop
      exit when v_remaining_qty <= 0;
      
      -- Calculate how much we can take from this PO Line
      v_alloc_qty := least(v_remaining_qty, v_po_line_record.qty_ordered - v_po_line_record.qty_shipped);
      
      if v_alloc_qty > 0 then
        -- Calculate Tax for this chunk
        v_taxable_val := v_alloc_qty * (v_item->>'unit_price')::numeric;
        
        -- Tax Rule: If state_code is '20' (Jharkhand), assume intra-state (CSGT+SGST). Else Inter-state (IGST).
        if v_client_state_code = '20' then 
           v_line_cgst := v_taxable_val * 0.09;
           v_line_sgst := v_taxable_val * 0.09;
           v_line_igst := 0;
        else
           v_line_cgst := 0;
           v_line_sgst := 0;
           v_line_igst := v_taxable_val * 0.18;
        end if;
        
        v_line_total := v_taxable_val + v_line_cgst + v_line_sgst + v_line_igst;
        
        -- Insert Invoice Item linked to PO Line
        insert into invoice_items (
          invoice_id, product_id, po_line_item_id,
          description, quantity, unit, rate,
          taxable_value, cgst_amount, sgst_amount, igst_amount, total
        ) values (
          v_invoice_id, 
          v_product_id,
          v_po_line_record.line_id,
          v_item->>'product_name',
          v_alloc_qty,
          'Nos',
          (v_item->>'unit_price')::numeric,
          v_taxable_val,
          v_line_cgst,
          v_line_sgst,
          v_line_igst,
          v_line_total
        );
        
        -- Update Running Totals
        v_subtotal := v_subtotal + v_taxable_val;
        v_cgst := v_cgst + v_line_cgst;
        v_sgst := v_sgst + v_line_sgst;
        v_igst := v_igst + v_line_igst;
        v_total_amount := v_total_amount + v_line_total;
        
        v_remaining_qty := v_remaining_qty - v_alloc_qty;
      end if;
    end loop;
    
    -- Verification: Did we satisfy the requested quantity?
    if v_remaining_qty > 0 then
       raise exception 'Insufficient PO quantity for product: %. Requested: %, Found: %', 
          (v_item->>'product_name'), 
          (v_item->>'quantity'), 
          ((v_item->>'quantity')::numeric - v_remaining_qty);
    end if;
  end loop;
  
  -- 4. Final Update of Invoice Totals
  update invoices set
    subtotal = v_subtotal,
    cgst_amount = v_cgst,
    sgst_amount = v_sgst,
    igst_amount = v_igst,
    total_amount = v_total_amount
    -- Status remains 'draft' until finalized? Or set to finalized? User didn't specify, leaving as draft.
  where id = v_invoice_id;
  
  return jsonb_build_object('id', v_invoice_id, 'invoice_number', p_invoice_number);
end;
$$ language plpgsql;


