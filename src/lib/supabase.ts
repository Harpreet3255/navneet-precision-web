// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables exist and if the URL is actually a valid HTTP format
const isValidUrl = rawUrl && rawUrl.startsWith('http');
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-key';

if (!rawUrl || !rawKey || !isValidUrl) {
    console.error(
        "⚠️ Supabase environment variables are missing or invalid! " +
        `Current URL value: "${rawUrl}". ` +
        "Please ensure VITE_SUPABASE_URL (must start with http/https) and VITE_SUPABASE_ANON_KEY are set correctly in Vercel."
    );
}

// We provide a fallback valid URL format to prevent the application from white-screening immediately on load.
// API calls will fail, but the UI will render.
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

export type ProductGroup = {
    id: string;
    group_name: string;
    created_at: string;
};

export type Product = {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    sac_code: string | null;
    hsn_code: string | null;
    unit: string;
    group_id?: string | null;
    created_at: string;
    updated_at: string;
    group?: ProductGroup;
};

export type ClientPricing = {
    id: string;
    client_id: string;
    product_id: string;
    custom_rate: number;
    created_at: string;
    updated_at: string;
    client?: Client;
    product?: Product;
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
