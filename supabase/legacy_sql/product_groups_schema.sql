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
