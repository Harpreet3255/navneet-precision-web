// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Client = {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    state_code: string | null;
    gstin: string | null;
    created_at: string;
    updated_at: string;
};

export type Product = {
    id: string;
    client_id?: string;
    name: string;
    description: string | null;
    sac_code: string | null;
    hsn_code: string | null;
    unit: string;
    unit_price: number;
    created_at: string;
    updated_at: string;
    client?: Client;
};

export type Invoice = {
    id: string;
    invoice_number: string;
    invoice_date: string;
    client_id: string | null;
    receiver_name: string | null;
    receiver_address: string | null;
    receiver_city: string | null;
    receiver_state: string | null;
    receiver_state_code: string | null;
    receiver_gstin: string | null;
    consignee_name: string | null;
    consignee_address: string | null;
    consignee_city: string | null;
    consignee_state: string | null;
    consignee_state_code: string | null;
    consignee_gstin: string | null;
    supplier: string | null;
    subtotal: number;
    transportation_charges: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_amount: number;
    notes: string | null;
    status: 'draft' | 'finalized';
    created_at: string;
    updated_at: string;
};

export type InvoiceItem = {
    id: string;
    invoice_id: string;
    product_id: string | null;
    description: string;
    sac_code: string | null;
    hsn_code: string | null;
    quantity: number;
    unit: string;
    rate: number;
    taxable_value: number;
    cgst_rate: number;
    cgst_amount: number;
    sgst_rate: number;
    sgst_amount: number;
    igst_rate: number;
    igst_amount: number;
    total: number;
    created_at: string;
};

export type InvoiceWithItems = Invoice & {
    invoice_items: InvoiceItem[];
    client?: Client;
};

export type PurchaseOrder = {
    id: string;
    po_number: string;
    client_id: string;
    po_date: string;
    status: 'open' | 'closed';
    created_at: string;
    updated_at: string;
};

export type POLineItem = {
    id: string;
    po_id: string;
    product_id: string;
    qty_ordered: number;
    unit_price: number;
    created_at: string;
};

export type POTrackingView = {
    po_id: string;
    po_number: string;
    client_id: string;
    client_name: string;
    po_line_item_id: string;
    product_id: string;
    product_name: string;
    qty_ordered: number;
    qty_shipped: number;
    qty_remaining: number;
};
