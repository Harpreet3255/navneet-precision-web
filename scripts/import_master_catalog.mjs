import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// You'll need to set SUPABASE_SERVICE_ROLE_KEY in your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
    process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Statistics
const stats = {
    totalRows: 0,
    clientsCreated: 0,
    clientsUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    errors: [],
};

/**
 * Parse CSV file and return rows
 */
async function parseCSV(filePath) {
    const rows = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue; // Skip header
        }

        if (!line.trim()) continue; // Skip empty lines

        // Simple CSV parsing: Party Name, Description, Rate
        const parts = line.split(',');

        if (parts.length >= 3) {
            const partyName = parts[0].replace(/^"|"$/g, '').trim();
            // Description might have commas, so join all middle parts
            const description = parts.slice(1, -1).join(',').replace(/^"|"$/g, '').trim();
            const rate = parseFloat(parts[parts.length - 1].trim());

            if (partyName && description && !isNaN(rate)) {
                rows.push({
                    partyName,
                    description,
                    rate
                });
            }
        }
    }

    return rows;
}

/**
 * Upsert a client by name
 */
async function upsertClient(clientName) {
    try {
        // First, try to find existing client
        const { data: existingClient, error: findError } = await supabase
            .from('clients')
            .select('id')
            .eq('name', clientName)
            .maybeSingle();

        if (existingClient) {
            stats.clientsUpdated++;
            return existingClient.id;
        }

        // If not found, insert new client
        const { data: newClient, error: insertError } = await supabase
            .from('clients')
            .insert({
                name: clientName,
                address: null,
                city: null,
                state: null,
                state_code: null,
                gstin: null
            })
            .select('id')
            .single();

        if (insertError) throw insertError;

        stats.clientsCreated++;
        return newClient.id;
    } catch (error) {
        console.error(`\nError upserting client "${clientName}":`, error.message);
        stats.errors.push({ type: 'client', name: clientName, error: error.message });
        return null;
    }
}

/**
 * Upsert a product for a specific client
 */
async function upsertProduct(clientId, productName, unitPrice) {
    try {
        // First check if product exists
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('client_id', clientId)
            .eq('name', productName)
            .maybeSingle();

        if (existing) {
            // Update existing
            const { error: updateError } = await supabase
                .from('products')
                .update({ unit_price: unitPrice })
                .eq('id', existing.id);

            if (updateError) throw updateError;
            stats.productsUpdated++;
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('products')
                .insert({
                    client_id: clientId,
                    name: productName,
                    unit_price: unitPrice,
                    description: productName,
                    unit: 'Nos',
                });

            if (insertError) throw insertError;
            stats.productsCreated++;
        }

        return true;
    } catch (error) {
        console.error(`\nError upserting product "${productName}" for client ${clientId}:`, error.message);
        stats.errors.push({ type: 'product', name: productName, clientId, error: error.message });
        return false;
    }
}

/**
 * Main import function
 */
async function importCatalog() {
    console.log('🚀 Starting Master Catalog Import...\n');

    // Parse CSV
    const csvPath = path.join(__dirname, '..', 'Navneet_Master_Catalog_Clean.csv');
    console.log(`📖 Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error('❌ CSV file not found!');
        process.exit(1);
    }

    const rows = await parseCSV(csvPath);
    stats.totalRows = rows.length;
    console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

    // Group rows by client to batch operations
    const clientMap = new Map();
    rows.forEach(row => {
        if (!clientMap.has(row.partyName)) {
            clientMap.set(row.partyName, []);
        }
        clientMap.get(row.partyName).push(row);
    });

    console.log(`👥 Found ${clientMap.size} unique clients\n`);

    // Process each client and their products
    let processedClients = 0;
    for (const [clientName, products] of clientMap) {
        processedClients++;
        process.stdout.write(`\r📦 Processing client ${processedClients}/${clientMap.size}: ${clientName.substring(0, 40).padEnd(40)} `);

        // Upsert client
        const clientId = await upsertClient(clientName);
        if (!clientId) continue;

        // Upsert all products for this client
        for (const product of products) {
            await upsertProduct(clientId, product.description, product.rate);
        }
    }

    console.log('\n\n✨ Import Complete!\n');
    console.log('📊 Statistics:');
    console.log(`   Total Rows: ${stats.totalRows}`);
    console.log(`   Clients Created: ${stats.clientsCreated}`);
    console.log(`   Clients Updated: ${stats.clientsUpdated}`);
    console.log(`   Products Created: ${stats.productsCreated}`);
    console.log(`   Products Updated: ${stats.productsUpdated}`);

    if (stats.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${stats.errors.length}`);
        stats.errors.slice(0, 10).forEach((err, idx) => {
            console.log(`   ${idx + 1}. ${err.type}: ${err.name} - ${err.error}`);
        });
        if (stats.errors.length > 10) {
            console.log(`   ... and ${stats.errors.length - 10} more errors`);
        }
    } else {
        console.log('\n✅ No errors!');
    }
}

// Run the import
importCatalog().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
