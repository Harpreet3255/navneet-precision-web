import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: clients, error } = await supabase.from('clients').select('*');
    if (error) { console.error('Error fetching clients:', error); return; }
    
    // 1. Group clients by aggressive alphanumeric normalization
    const groups = {};
    for (const c of clients) {
        const norm = (c.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(c);
    }
    
    const duplicates = Object.values(groups).filter(g => g.length > 1);
    if (duplicates.length === 0) {
        console.log("No duplicate clients found to merge.");
        return;
    }
    
    console.log(`Found ${duplicates.length} client groups with duplicates.`);

    for (const group of duplicates) {
        console.log("\nMerging group:");
        group.forEach(c => console.log(`  - [${c.id}] ${c.name}`));
        
        // Use the first client as the primary
        const primary = group[0];
        const toMerge = group.slice(1);
        
        for (const duplicate of toMerge) {
            console.log(`    Moving references from ${duplicate.id} -> ${primary.id}`);
            
            // 2a. Update purchase_orders
            const { error: poError } = await supabase
                .from('purchase_orders')
                .update({ client_id: primary.id })
                .eq('client_id', duplicate.id);
            if (poError) console.error(`    Error updating POs for ${duplicate.id}:`, poError);

            // 2b. Update invoices
            const { error: invError } = await supabase
                .from('invoices')
                .update({ client_id: primary.id })
                .eq('client_id', duplicate.id);
            if (invError) console.error(`    Error updating invoices for ${duplicate.id}:`, invError);

            // 2c. Update dispatch_notes
            const { error: dnError } = await supabase
                .from('dispatch_notes')
                .update({ client_id: primary.id })
                .eq('client_id', duplicate.id);
            if (dnError) console.error(`    Error updating dispatch_notes for ${duplicate.id}:`, dnError);

            // 2d. Update client_pricing (needs careful handling for unique constraints)
            const { data: pricingData, error: pricingFetchError } = await supabase
                .from('client_pricing')
                .select('*')
                .eq('client_id', duplicate.id);
            if (pricingFetchError) {
                console.error(`    Error fetching pricing for ${duplicate.id}:`, pricingFetchError);
            } else if (pricingData && pricingData.length > 0) {
                for (const pricing of pricingData) {
                    // Try to move it to primary client
                    const { error: pricingUpdateError } = await supabase
                        .from('client_pricing')
                        .update({ client_id: primary.id })
                        .eq('id', pricing.id);
                        
                    if (pricingUpdateError) {
                        // Probably a unique constraint violation (client_id, product_id)
                        // If primary already has a price for this product, just delete the duplicate's pricing row
                        console.log(`      Conflict moving pricing for product ${pricing.product_id}. Deleting duplicate price row.`);
                        await supabase.from('client_pricing').delete().eq('id', pricing.id);
                    }
                }
            }

            // 3. Delete the duplicate client
            const { error: delError } = await supabase
                .from('clients')
                .delete()
                .eq('id', duplicate.id);
            
            if (delError) {
                console.error(`    Failed to delete duplicate client ${duplicate.id}:`, delError);
            } else {
                console.log(`    Successfully deleted duplicate client ${duplicate.id}`);
            }
        }
    }
    console.log("\nMerge complete.");
}

main().catch(console.error);
