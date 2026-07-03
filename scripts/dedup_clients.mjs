import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🚀 Starting Aggressive Client Normalization & Deduplication...\n");
    const { data: clients, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    
    // Group by normalized name
    const groups = {};
    for (const client of clients) {
        const normalized = client.name.trim().toUpperCase();
        if (!groups[normalized]) groups[normalized] = [];
        groups[normalized].push(client);
    }
    
    let mergedCount = 0;
    for (const [normalizedName, clientGroup] of Object.entries(groups)) {
        if (clientGroup.length > 1) {
            // Keep the oldest one as canonical (sort by created_at)
            clientGroup.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const canonical = clientGroup[0];
            const duplicates = clientGroup.slice(1);
            
            // Fix canonical name if needed
            if (canonical.name !== normalizedName) {
                await supabase.from('clients').update({ name: normalizedName }).eq('id', canonical.id);
            }
            
            for (const dup of duplicates) {
                console.log(`Merging [${dup.name}] -> into Canonical [${canonical.name}]`);
                
                // Update references
                await supabase.from('client_pricing').update({ client_id: canonical.id }).eq('client_id', dup.id);
                await supabase.from('purchase_orders').update({ client_id: canonical.id }).eq('client_id', dup.id);
                await supabase.from('invoices').update({ client_id: canonical.id }).eq('client_id', dup.id);
                
                // Delete duplicate
                await supabase.from('clients').delete().eq('id', dup.id);
                mergedCount++;
            }
        } else {
            // Just update the name if needed
            const client = clientGroup[0];
            if (client.name !== normalizedName) {
                await supabase.from('clients').update({ name: normalizedName }).eq('id', client.id);
            }
        }
    }
    
    console.log(`\n✨ Client Deduplication Complete!`);
    console.log(`   Duplicates Merged & Deleted: ${mergedCount}`);
}

run().catch(console.error);
