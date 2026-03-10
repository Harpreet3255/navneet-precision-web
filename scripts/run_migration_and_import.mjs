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
// Support both env var naming conventions
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stats = { total: 0, clientsNew: 0, clientsExisting: 0, productsNew: 0, productsUpdated: 0, errors: [] };

// ─── CSV Parsing ─────────────────────────────────────────────────────────────
function parseCSVLine(line) {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
            else inQ = !inQ;
        } else if (line[i] === ',' && !inQ) { result.push(cur); cur = ''; }
        else cur += line[i];
    }
    result.push(cur);
    return result;
}

async function parseCSV(filePath) {
    const rows = [];
    const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
    let first = true;
    for await (const line of rl) {
        if (first) { first = false; continue; }
        if (!line.trim()) continue;
        const cols = parseCSVLine(line);
        if (cols.length < 3) continue;
        const partyName = cols[0].replace(/^"|"$/g, '').trim();
        const description = cols.slice(1, -1).join(',').replace(/^"|"$/g, '').trim();
        const rate = parseFloat(cols[cols.length - 1].replace(/^"|"$/g, '').trim());
        const skip = !partyName || !description || description === 'NAN' || description === 'CANCELLED' || isNaN(rate) || partyName === 'NAN';
        if (!skip) rows.push({ partyName, description, rate });
    }
    return rows;
}

// ─── Client Upsert ───────────────────────────────────────────────────────────
const clientCache = new Map();
async function getOrCreateClient(name) {
    if (clientCache.has(name)) return clientCache.get(name);
    const { data: existing } = await supabase.from('clients').select('id').eq('name', name).maybeSingle();
    if (existing) { stats.clientsExisting++; clientCache.set(name, existing.id); return existing.id; }
    const { data: newC, error } = await supabase.from('clients')
        .insert({ name, address: null, city: null, state: null, state_code: null, gstin: null })
        .select('id').single();
    if (error) { stats.errors.push(`[client] ${name}: ${error.message}`); return null; }
    stats.clientsNew++;
    clientCache.set(name, newC.id);
    return newC.id;
}

// ─── Product Upsert (no constraint dependency) ───────────────────────────────
// Build a local map of existing products per client for fast lookup
const productCache = new Map(); // key: `${clientId}::${name}` => id

async function loadExistingProducts(clientId) {
    const { data, error } = await supabase.from('products').select('id, name').eq('client_id', clientId);
    if (error) return;
    data.forEach(p => productCache.set(`${clientId}::${p.name}`, p.id));
}

async function upsertProduct(clientId, name, rate) {
    const cacheKey = `${clientId}::${name}`;
    const existingId = productCache.get(cacheKey);
    if (existingId) {
        const { error } = await supabase.from('products').update({ unit_price: rate }).eq('id', existingId);
        if (error) stats.errors.push(`[product update] ${name}: ${error.message}`);
        else stats.productsUpdated++;
    } else {
        const { data, error } = await supabase.from('products')
            .insert({ client_id: clientId, name, description: name, unit_price: rate, unit: 'Nos' })
            .select('id').single();
        if (error) stats.errors.push(`[product insert] ${name}: ${error.message}`);
        else { stats.productsNew++; productCache.set(cacheKey, data.id); }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🚀 Navneet Master Catalog Import\n' + '='.repeat(50));
    console.log('🔧 Note: Apply unique_constraint_migration.sql in Supabase SQL Editor for dedup protection.\n');

    const csvPath = path.join(__dirname, '..', 'Navneet_Master_Catalog_Clean.csv');
    if (!fs.existsSync(csvPath)) { console.error('❌ CSV not found!'); process.exit(1); }

    console.log('📖 Parsing CSV...');
    const rows = await parseCSV(csvPath);
    stats.total = rows.length;
    console.log(`✅ Parsed ${rows.length} valid rows\n`);

    // Group by client
    const clientMap = new Map();
    rows.forEach(r => { if (!clientMap.has(r.partyName)) clientMap.set(r.partyName, []); clientMap.get(r.partyName).push(r); });
    console.log(`👥 ${clientMap.size} unique clients found\n`);
    console.log('📦 Importing...');

    let done = 0;
    for (const [clientName, products] of clientMap) {
        done++;
        process.stdout.write(`\r   [${done}/${clientMap.size}] ${clientName.substring(0, 40).padEnd(40)}`);
        const clientId = await getOrCreateClient(clientName);
        if (!clientId) continue;
        // Load existing products for this client once
        await loadExistingProducts(clientId);
        // Process products sequentially (avoid rate limits)
        for (const p of products) await upsertProduct(clientId, p.description, p.rate);
    }

    console.log('\n\n' + '='.repeat(50));
    console.log('✨ Import Complete!\n');
    console.log('📊 Statistics:');
    console.log(`   CSV Rows Parsed  : ${stats.total}`);
    console.log(`   Clients New      : ${stats.clientsNew}`);
    console.log(`   Clients Existing : ${stats.clientsExisting}`);
    console.log(`   Products New     : ${stats.productsNew}`);
    console.log(`   Products Updated : ${stats.productsUpdated}`);
    if (stats.errors.length > 0) {
        console.log(`\n⚠️  Errors (${stats.errors.length}):`);
        stats.errors.slice(0, 10).forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
        if (stats.errors.length > 10) console.log(`   ... and ${stats.errors.length - 10} more`);
    } else {
        console.log('\n✅ No errors!');
    }
}

main().catch(e => { console.error('\n❌ Fatal:', e); process.exit(1); });
