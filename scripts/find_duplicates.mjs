import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available for full access, else anon
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function normalize(str) {
    if (!str) return '';
    // Strip spaces, dashes, convert to lowercase
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    console.log("Fetching products to analyze for duplicates...");
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error("Error fetching products", error);
        return;
    }

    console.log(`Found ${products?.length || 0} total products.\n`);

    const clusters = {};
    for (const p of products) {
        const norm = normalize(p.name);
        if (!clusters[norm]) {
            clusters[norm] = [];
        }
        clusters[norm].push(p);
    }

    let duplicateCount = 0;
    let itemsToBeRemoved = 0;

    for (const [key, group] of Object.entries(clusters)) {
        if (group.length > 1) {
            console.log(`[Group Match] Shared Normalized Key: "${key}"`);
            group.forEach((g, index) => {
                console.log(`  ${index === 0 ? 'KEEP' : 'DROP'} -> ID: ${g.id} | Name: "${g.name}" | Price: ${g.unit_price} | Client: ${g.client_id || 'Global'}`);
            });
            console.log('---');
            duplicateCount++;
            itemsToBeRemoved += (group.length - 1);
        }
    }

    console.log(`\nAnalysis Complete.`);
    console.log(`Total unique product concepts: ${Object.keys(clusters).length}`);
    console.log(`Groups containing duplicates: ${duplicateCount}`);
    console.log(`Potential redundancies to prune: ${itemsToBeRemoved}`);
}

run();
