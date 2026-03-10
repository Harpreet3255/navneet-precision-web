import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    console.log('🔧 Applying unique constraint migration to products table...\n');

    try {
        // Step 1: Check for existing duplicates
        console.log('1️⃣ Checking for existing duplicate products...');
        const { data: duplicates, error: dupError } = await supabase.rpc('check_product_duplicates', {});

        // If the RPC doesn't exist, check manually
        const { data: products, error: fetchError } = await supabase
            .from('products')
            .select('client_id, name')
            .not('client_id', 'is', null);

        if (fetchError) {
            console.error('Error fetching products:', fetchError);
            throw fetchError;
        }

        // Count duplicates manually
        const productMap = new Map();
        products?.forEach(p => {
            const key = `${p.client_id}:${p.name}`;
            productMap.set(key, (productMap.get(key) || 0) + 1);
        });

        const duplicateCount = Array.from(productMap.values()).filter(count => count > 1).length;

        if (duplicateCount > 0) {
            console.log(`⚠️  Found ${duplicateCount} duplicate product entries.`);
            console.log('   These will be handled by the import script (it uses upsert).');
        } else {
            console.log('✅ No duplicates found. Safe to proceed.');
        }

        // Step 2: Apply the unique constraint using raw SQL
        console.log('\n2️⃣ Adding unique constraint...');

        const { error: constraintError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE products 
                ADD CONSTRAINT IF NOT EXISTS unique_product_per_client 
                UNIQUE (client_id, name);
            `
        });

        // If RPC doesn't work, try direct SQL execution
        // Note: Supabase client doesn't support direct DDL, so we'll inform the user
        console.log('ℹ️  Note: The unique constraint should be applied via Supabase Dashboard SQL Editor.');
        console.log('   SQL to run:');
        console.log('   ----------------------------------------');
        console.log('   ALTER TABLE products');
        console.log('   ADD CONSTRAINT IF NOT EXISTS unique_product_per_client');
        console.log('   UNIQUE (client_id, name);');
        console.log('   ----------------------------------------');

        // Step 3: Create index for performance
        console.log('\n3️⃣ Creating performance index...');
        console.log('   SQL to run:');
        console.log('   ----------------------------------------');
        console.log('   CREATE INDEX IF NOT EXISTS idx_products_client_name ON products(client_id, name);');
        console.log('   ----------------------------------------');

        console.log('\n✅ Migration script completed.');
        console.log('\n📝 Instructions:');
        console.log('   1. Go to Supabase Dashboard → SQL Editor');
        console.log('   2. Run the SQL commands shown above');
        console.log('   3. Then run: node scripts/import_master_catalog.mjs');

    } catch (error) {
        console.error('\n❌ Migration error:', error);
        process.exit(1);
    }
}

applyMigration();
