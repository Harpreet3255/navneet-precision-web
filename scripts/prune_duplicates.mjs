import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    console.log("Fetching products to prune duplicates...");
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error("Error fetching products", error);
        return;
    }

    const clusters = {};
    for (const p of products) {
        // We'll also group by client_id. Since we don't want to merge duplicate names across DIFFERENT clients.
        // Wait, what if the user manually entered a product twice globally? If client_id is null, it's global.
        // The normalization key should include the client_id so we only deduplicate WITHIN a client's own catalogue or global catalogue.
        const clientKey = p.client_id || 'global';
        const norm = `${clientKey}_${normalize(p.name)}`;
        
        if (!clusters[norm]) {
            clusters[norm] = [];
        }
        clusters[norm].push(p);
    }

    let duplicateCount = 0;
    let prunedCount = 0;

    for (const [key, group] of Object.entries(clusters)) {
        if (group.length > 1) {
            duplicateCount++;
            const master = group[0];
            const duplicates = group.slice(1);

            console.log(`\nMerging duplicates for: "${master.name}" (Client: ${master.client_id || 'Global'})`);
            
            for (const dup of duplicates) {
                console.log(`  -> Moving references from ID: ${dup.id} to Master ID: ${master.id}`);
                
                // 1. Update invoice_items
                const { error: invErr } = await supabase.from('invoice_items')
                    .update({ product_id: master.id })
                    .eq('product_id', dup.id);
                if (invErr) console.error(`     Error updating invoice_items:`, invErr.message);

                // 2. Update po_line_items
                const { error: poErr } = await supabase.from('po_line_items')
                    .update({ product_id: master.id })
                    .eq('product_id', dup.id);
                if (poErr) console.error(`     Error updating po_line_items:`, poErr.message);

                // 3. Delete the duplicate product
                const { error: delErr } = await supabase.from('products')
                    .delete()
                    .eq('id', dup.id);
                
                if (delErr) {
                    console.error(`     Error deleting product ${dup.id}:`, delErr.message);
                } else {
                    console.log(`     Successfully pruned duplicate: ${dup.id}`);
                    prunedCount++;
                }
            }
        }
    }

    console.log(`\n✅ Pruning Complete.`);
    console.log(`Clusters processed with duplicates: ${duplicateCount}`);
    console.log(`Total duplicate products removed: ${prunedCount}`);
}

run();
