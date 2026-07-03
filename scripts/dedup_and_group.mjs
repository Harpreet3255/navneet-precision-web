import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Normalization routine
function normalizeString(str) {
    if (!str) return '';
    let normalized = str.toUpperCase();
    
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Fix spacing around fractions: "3 / 4" -> "3/4"
    normalized = normalized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2');
    
    // Clean spaces around hyphens and "X" (for dimensions)
    normalized = normalized.replace(/\s*X\s*/g, 'X');
    normalized = normalized.replace(/\s*-\s*/g, '-');
    
    // Remove trailing/leading spaces
    return normalized.trim();
}

function determineGroupName(desc) {
    const d = desc.toUpperCase();
    if (d.includes('CAP') || d.includes('BACKCOVER')) return 'PLASTIC & INDUSTRIAL CAPS';
    if (d.includes('LANCE') || d.includes('PIPE')) return 'LANCES & EXTENSIONS';
    if (d.includes('WASHER')) return 'THRUST WASHERS';
    if (d.includes('MOTOR END COVER') || d.includes('REPAIRING')) return 'MOTOR REPAIR & MAINTENANCE';
    return 'GENERAL COMPONENTS';
}

async function runMigration() {
    console.log('🚀 Starting Product Deduplication & Grouping Migration...\n');

    const groups = [
        'PLASTIC & INDUSTRIAL CAPS',
        'LANCES & EXTENSIONS',
        'THRUST WASHERS',
        'MOTOR REPAIR & MAINTENANCE',
        'GENERAL COMPONENTS'
    ];

    // 1. Ensure groups exist
    const groupMap = new Map();
    for (const g of groups) {
        let { data, error } = await supabase
            .from('product_groups')
            .select('id')
            .eq('group_name', g)
            .maybeSingle();

        if (error) throw error;
        
        if (!data) {
            const res = await supabase.from('product_groups').insert({ group_name: g }).select('id').single();
            if (res.error) throw res.error;
            data = res.data;
            console.log(`Created group: ${g}`);
        }
        groupMap.set(g, data.id);
    }

    // 2. Fetch all products
    console.log('Fetching products...');
    const { data: products, error: prodError } = await supabase.from('products').select('*');
    if (prodError) throw prodError;

    // 3. Group products by normalized signature
    const signatureMap = new Map();
    for (const p of products) {
        const sig = normalizeString(p.name);
        if (!signatureMap.has(sig)) {
            signatureMap.set(sig, []);
        }
        signatureMap.get(sig).push(p);
    }

    console.log(`Found ${products.length} total products. Distinct normalized signatures: ${signatureMap.size}`);

    let mergedCount = 0;
    let groupedCount = 0;

    for (const [signature, prods] of signatureMap) {
        // Pick canonical (prefer one with quotes or longer, just sort by length descending to preserve formats)
        prods.sort((a, b) => b.name.length - a.name.length);
        const canonical = prods[0];
        const duplicates = prods.slice(1);

        // Assign Group
        const groupName = determineGroupName(canonical.name);
        const groupId = groupMap.get(groupName);

        // Update canonical product with group_id
        await supabase.from('products').update({ group_id: groupId }).eq('id', canonical.id);
        groupedCount++;

        // Process duplicates
        for (const dup of duplicates) {
            console.log(`\nMerging duplicate [${dup.sku}] "${dup.name}" -> into Canonical [${canonical.sku}] "${canonical.name}"`);
            
            // Re-point client_pricing
            // Note: client_pricing has UNIQUE(client_id, product_id). If canonical already has pricing for that client, ignore or update.
            const { data: dupPricing } = await supabase.from('client_pricing').select('*').eq('product_id', dup.id);
            for (const pricing of (dupPricing || [])) {
                const { error: updatePricingError } = await supabase.from('client_pricing')
                    .update({ product_id: canonical.id })
                    .eq('id', pricing.id);
                // If collision (error 23505), just delete the duplicate pricing row
                if (updatePricingError && updatePricingError.code === '23505') {
                    await supabase.from('client_pricing').delete().eq('id', pricing.id);
                }
            }

            // Re-point po_line_items
            await supabase.from('po_line_items').update({ product_id: canonical.id }).eq('product_id', dup.id);

            // Re-point invoice_items
            await supabase.from('invoice_items').update({ product_id: canonical.id }).eq('product_id', dup.id);

            // Delete duplicate product
            await supabase.from('products').delete().eq('id', dup.id);
            mergedCount++;
        }
    }

    console.log('\n✨ Migration Complete!');
    console.log(`   Canonical Products Grouped: ${groupedCount}`);
    console.log(`   Duplicates Merged & Deleted: ${mergedCount}`);
}

runMigration().catch(console.error);
