import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const stats = {
    totalRows: 0,
    clientsCreated: 0,
    productsCreated: 0,
    pricingCreated: 0,
    errors: [],
};

function generateBaseSKU(description) {
  const descUpper = description.toUpperCase();
  
  let prefix = 'GEN';
  if (descUpper.includes('CAP')) prefix = 'PC';
  else if (descUpper.includes('DISC') || descUpper.includes('SEPARATOR')) prefix = 'SD';
  else if (descUpper.includes('BUSH')) prefix = 'NB';
  else if (descUpper.includes('WASHER')) prefix = 'TW';
  
  const dimRegex = /(OD\s*\d+|ID\s*\d+|DIA\s*\d+|M\s*\d+)/gi;
  const matches = descUpper.match(dimRegex) || [];
  const dimensions = matches.map(m => m.replace(/\s+/g, '')).join('-');
  
  let suffix = '';
  if (descUpper.includes('UPPER')) suffix = '-UP';
  if (descUpper.includes('BOTTOM')) suffix = '-BT';
  
  const parts = [prefix];
  if (dimensions) parts.push(dimensions);
  
  let baseSku = parts.join('-');
  if (suffix) baseSku += suffix;
  
  return baseSku;
}

class SKURegistry {
  constructor() {
    this.seenSkus = {};
  }

  generateUniqueSKU(description) {
    const baseSku = generateBaseSKU(description);
    if (this.seenSkus[baseSku] !== undefined) {
      this.seenSkus[baseSku]++;
      return `${baseSku}-V${this.seenSkus[baseSku]}`;
    } else {
      this.seenSkus[baseSku] = 0;
      return baseSku;
    }
  }
}

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
            continue;
        }

        if (!line.trim()) continue;

        const parts = line.split(',');

        if (parts.length >= 3) {
            const partyName = parts[0].replace(/^"|"$/g, '').trim();
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

async function upsertClient(clientName) {
    try {
        const { data: existingClient, error: findError } = await supabase
            .from('clients')
            .select('id')
            .eq('name', clientName)
            .maybeSingle();

        if (existingClient) {
            return existingClient.id;
        }

        const { data: newClient, error: insertError } = await supabase
            .from('clients')
            .insert({ name: clientName })
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

async function upsertProduct(productName, sku) {
    try {
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('sku', sku)
            .maybeSingle();

        if (existing) {
            return existing.id;
        }

        const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert({
                sku: sku,
                name: productName,
                description: productName,
                unit: 'Nos',
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        
        stats.productsCreated++;
        return newProduct.id;
    } catch (error) {
        console.error(`\nError upserting product "${productName}":`, error.message);
        stats.errors.push({ type: 'product', name: productName, error: error.message });
        return null;
    }
}

async function upsertClientPricing(clientId, productId, rate) {
    try {
        const { error } = await supabase
            .from('client_pricing')
            .upsert(
                { client_id: clientId, product_id: productId, custom_rate: rate },
                { onConflict: 'client_id,product_id' }
            );

        if (error) throw error;
        stats.pricingCreated++;
    } catch (error) {
        console.error(`\nError upserting client pricing:`, error.message);
        stats.errors.push({ type: 'pricing', error: error.message });
    }
}

async function importCatalog() {
    console.log('🚀 Starting Master Catalog Import...\n');

    const csvPath = path.join(__dirname, '..', 'Navneet_Master_Catalog_Clean.csv');
    console.log(`📖 Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error('❌ CSV file not found!');
        process.exit(1);
    }

    const rows = await parseCSV(csvPath);
    stats.totalRows = rows.length;
    console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

    const registry = new SKURegistry();

    // Map description to unique SKU to ensure we reuse the same SKU for the same description
    const productSKUMap = new Map();

    rows.forEach(row => {
        const descUpper = row.description.trim().toUpperCase();
        if (!productSKUMap.has(descUpper)) {
            productSKUMap.set(descUpper, registry.generateUniqueSKU(descUpper));
        }
    });

    let processed = 0;
    for (const row of rows) {
        processed++;
        process.stdout.write(`\r📦 Processing row ${processed}/${rows.length} `);

        const clientId = await upsertClient(row.partyName);
        if (!clientId) continue;

        const descUpper = row.description.trim().toUpperCase();
        const sku = productSKUMap.get(descUpper);

        const productId = await upsertProduct(row.description, sku);
        if (!productId) continue;

        await upsertClientPricing(clientId, productId, row.rate);
    }

    console.log('\n\n✨ Import Complete!\n');
    console.log('📊 Statistics:');
    console.log(`   Total Rows Processed: ${stats.totalRows}`);
    console.log(`   New Clients Created: ${stats.clientsCreated}`);
    console.log(`   New Products Created: ${stats.productsCreated}`);
    console.log(`   Pricing Rules Inserted/Updated: ${stats.pricingCreated}`);

    if (stats.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${stats.errors.length}`);
        stats.errors.slice(0, 10).forEach((err, idx) => {
            console.log(`   ${idx + 1}. ${err.type}: ${err.name || ''} - ${err.error}`);
        });
    }
}

importCatalog().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
