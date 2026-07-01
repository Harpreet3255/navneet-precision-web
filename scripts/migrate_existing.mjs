import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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

  registerExisting(sku) {
    const match = sku.match(/^(.*?)(?:-V(\d+))?$/);
    if (match) {
      const base = match[1];
      const version = match[2] ? parseInt(match[2], 10) : 0;
      if (!this.seenSkus[base] || version > this.seenSkus[base]) {
        this.seenSkus[base] = version;
      }
    }
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

async function runMigration() {
  console.log('Fetching products...');
  const { data: products, error: fetchError } = await supabase.from('products').select('*');
  
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log('No products found to migrate.');
    return;
  }

  console.log(`Found ${products.length} products. Starting migration...`);
  const registry = new SKURegistry();
  
  for (const product of products) {
    const descToUse = product.description || product.name || 'GEN';
    const sku = registry.generateUniqueSKU(descToUse);
    
    console.log(`Updating product ${product.id} with SKU: ${sku}`);
    const { error: updateError } = await supabase
      .from('products')
      .update({ sku })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Failed to update product ${product.id}:`, updateError.message);
      // We continue to see if it's a schema issue
    } else if (product.client_id) {
      const { error: pricingError } = await supabase
        .from('client_pricing')
        .upsert(
          { client_id: product.client_id, product_id: product.id, custom_rate: product.unit_price || 0 },
          { onConflict: 'client_id,product_id' }
        );
      if (pricingError) {
         console.error(`Failed to update pricing for product ${product.id}:`, pricingError.message);
      }
    }
  }
  
  console.log('Migration finished.');
}

runMigration();
