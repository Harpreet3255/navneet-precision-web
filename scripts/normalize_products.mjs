/**
 * Navneet Industries — Core Data Architecture Normalization Script
 * Fetches all products + client_pricing from Supabase and outputs
 * a fully normalized JSON array per the schema contract.
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// ─── Supabase Connection ─────────────────────────────────────────────────────
const SUPABASE_URL = 'https://iazkarfgykfeddsjcbes.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhemthcmZneWtmZWRkc2pjYmVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA0NTMzMSwiZXhwIjoyMDgwNjIxMzMxfQ.SaU6xswnmst-Pb4qMZzZqi279mRkoIGPM1z2RB-dXjc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Typo Dictionary ─────────────────────────────────────────────────────────
const TYPO_MAP = [
  [/\bMODIFYED\b/gi,       'MODIFIED'],
  [/\bMENDRAL\b/gi,        'MANDREL'],
  [/\bMENDAL\b/gi,         'MANDREL'],
  [/\bTARAY\b/gi,          'TRAY'],
  [/\bTHURST\b/gi,         'THRUST'],
  [/\bENTERANCE\b/gi,      'ENTRANCE'],
  [/\bRECONDITIONING\b/gi, 'RECONDITIONING'], // normalize spacing variants
];

function sanitizeTypos(text) {
  if (!text) return text;
  let out = text;
  for (const [pattern, replacement] of TYPO_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

// ─── Modifier / Commentary Stripping ────────────────────────────────────────
const MODIFIER_PATTERNS = [
  /\(WITHOUT\s+[^)]+\)/gi,
  /\(WITH\s+[^)]+\)/gi,
  /\bAS\s+PER\s+DRAWING\b/gi,
  /\bMATERIAL\s+[A-Z0-9-]+\b/gi,
  /\bAS\s+PER\s+SAMPLE\b/gi,
  /\bAS\s+REQUIRED\b/gi,
];

function extractModifiers(text) {
  const modifiers = [];
  let cleaned = text;
  for (const pat of MODIFIER_PATTERNS) {
    const matches = cleaned.match(pat) || [];
    for (const m of matches) modifiers.push(m.trim());
    cleaned = cleaned.replace(pat, ' ');
  }
  // Also extract parenthetical remarks generically
  const parens = cleaned.match(/\([^)]+\)/g) || [];
  for (const p of parens) {
    modifiers.push(p.trim());
    cleaned = cleaned.replace(p, ' ');
  }
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return { sanitized: cleaned, modifiers };
}

// ─── Product Class Classifier ─────────────────────────────────────────────────
function classifyProduct(text) {
  const u = text.toUpperCase();
  if (/\bTRANSPORTATION\s+CHARGES?\b|\bDELIVERY\b/.test(u))   return 'LOGISTICS';
  if (/\bFAB\b|\bFABRICATION\b|\bMAKING\b|\bMANUF\b/.test(u)) return 'FABRICATION';
  if (/\bREPAIRING\b|\bREBUILD\b|\bRECONDITIONING\b|\bREWORK\b/.test(u)) return 'REPAIR_MAINTENANCE';
  if (/\bCAP\b|\bBUSH\b|\bWASHER\b|\bDISC\b|\bPAD\b|\bSEPARATOR\b/.test(u)) return 'CONSUMABLE_PRODUCT';
  return 'CONSUMABLE_PRODUCT'; // default fallback
}

// ─── Material Extractor ──────────────────────────────────────────────────────
const MATERIAL_KEYWORDS = [
  'S.S.', 'SS', 'MS', 'MILD STEEL', 'NYLON', 'BRASS', 'PLASTIC',
  'RUBBER', 'CAST IRON', 'CI', 'ALLOY STEEL', 'EN-19', 'EN19',
  'COPPER', 'BRONZE', 'ALUMINIUM', 'ALUMINUM', 'TEFLON', 'PVC',
];

function extractMaterial(text) {
  const u = text.toUpperCase();
  for (const mat of MATERIAL_KEYWORDS) {
    if (u.includes(mat)) return mat;
  }
  return null;
}

// ─── Fraction Parser ─────────────────────────────────────────────────────────
function parseFraction(str) {
  // Matches: "3/4", "3 1/4", "1/2"
  const mixed  = str.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixed)  return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const simple = str.match(/(\d+)\/(\d+)/);
  if (simple) return parseInt(simple[1]) / parseInt(simple[2]);
  return null;
}

// ─── Dimension Extractor ─────────────────────────────────────────────────────
function extractDimensions(text) {
  const u = text.toUpperCase();
  const dims = {
    nominal_size_inch_string:  null,
    nominal_size_inch_decimal: null,
    length_mm:                 null,
    outer_diameter_mm:         null,
    inner_diameter_mm:         null,
    pitch_mm:                  null,
  };

  // OD — outer diameter in mm: "OD 200", "OD200"
  const odMm = u.match(/\bOD\s*(\d+(?:\.\d+)?)\s*MM\b/);
  if (odMm) dims.outer_diameter_mm = parseFloat(odMm[1]);

  // OD in inches (fractional): "OD 3/4\"" or "3/4" OD"
  const odInch = u.match(/(?:OD\s*)?([\d\s\/]+)\s*(?:INCH|IN|")\s*OD|OD\s*([\d\s\/]+)\s*(?:INCH|IN|")/);
  if (odInch && !dims.outer_diameter_mm) {
    const raw = (odInch[1] || odInch[2] || '').trim();
    const dec = parseFraction(raw);
    if (dec) {
      dims.nominal_size_inch_string  = raw;
      dims.nominal_size_inch_decimal = Math.round(dec * 1000) / 1000;
      dims.outer_diameter_mm         = Math.round(dec * 25.4 * 100) / 100;
    }
  }

  // ID — inner diameter in mm
  const idMm = u.match(/\bID\s*(\d+(?:\.\d+)?)\s*MM\b/);
  if (idMm) dims.inner_diameter_mm = parseFloat(idMm[1]);

  // DIA — general diameter (treat as OD if no OD found)
  const diaMm = u.match(/\bDIA\s*(\d+(?:\.\d+)?)\s*MM\b|\bDIA\s*(\d+(?:\.\d+)?)\b/);
  if (diaMm && !dims.outer_diameter_mm) {
    dims.outer_diameter_mm = parseFloat(diaMm[1] || diaMm[2]);
  }

  // LENGTH — explicit mm
  const lenMm = u.match(/\bL\s*(\d+(?:\.\d+)?)\s*MM\b|(\d+(?:\.\d+)?)\s*MM\s*L(?:ONG)?\b/);
  if (lenMm) dims.length_mm = parseFloat(lenMm[1] || lenMm[2]);

  // LENGTH — MTR / METER → convert to mm
  const lenMtr = u.match(/(\d+(?:\.\d+)?)\s*(?:MTR|METER|METRE)\b/);
  if (lenMtr) dims.length_mm = parseFloat(lenMtr[1]) * 1000;

  // PITCH — thread pitch in mm: "M24 x 1.5", "PITCH 1.5"
  const pitchThread = u.match(/M\d+\s*[Xx×]\s*(\d+(?:\.\d+)?)/);
  if (pitchThread) dims.pitch_mm = parseFloat(pitchThread[1]);
  const pitchExplicit = u.match(/\bPITCH\s*(\d+(?:\.\d+)?)\s*MM\b/);
  if (pitchExplicit) dims.pitch_mm = parseFloat(pitchExplicit[1]);

  // THREAD SPEC — nominal size without OD/ID context (e.g. "3/4\"", "1/2\"")
  if (!dims.nominal_size_inch_string) {
    const sizeInch = u.match(/([\d]+\s*[\d]*\/[\d]+)\s*(?:"|INCH|IN)/);
    if (sizeInch) {
      const raw = sizeInch[1].trim();
      const dec = parseFraction(raw);
      if (dec) {
        dims.nominal_size_inch_string  = raw;
        dims.nominal_size_inch_decimal = Math.round(dec * 1000) / 1000;
      }
    }
  }

  return dims;
}

// ─── Thread Spec Extractor ────────────────────────────────────────────────────
function extractThreadSpec(text) {
  const u = text.toUpperCase();
  const patterns = [
    /\b(BSPT[\s\d/]*)/,
    /\b(BSP[\s\d/]*)/,
    /\b(NPT[\s\d/]*)/,
    /\b(M\d+\s*[Xx×]\s*[\d.]+)/,
    /\b(UNC[\s\d]*)/,
    /\b(UNF[\s\d]*)/,
  ];
  for (const pat of patterns) {
    const m = u.match(pat);
    if (m) return m[1].trim();
  }
  return null;
}

// ─── Deduplication Fingerprint ────────────────────────────────────────────────
function fingerprint(clientId, name) {
  return `${clientId}::${name.toUpperCase().replace(/\s+/g, ' ').trim()}`;
}

// ─── SKU Generator (mirrors skuGenerator.ts logic) ───────────────────────────
function generateSKU(description, existingSkus) {
  const u = description.toUpperCase();
  let prefix = 'GEN';
  if (u.includes('CAP'))       prefix = 'PC';
  else if (u.includes('DISC') || u.includes('SEPARATOR')) prefix = 'SD';
  else if (u.includes('BUSH')) prefix = 'NB';
  else if (u.includes('WASHER')) prefix = 'TW';
  else if (/\bFAB\b/.test(u)) prefix = 'FAB';
  else if (/\bREPAIR/.test(u)) prefix = 'RPR';

  const dimRegex = /(OD\s*\d+|ID\s*\d+|DIA\s*\d+|M\s*\d+)/gi;
  const matches = u.match(dimRegex) || [];
  const dimensions = matches.map(m => m.replace(/\s+/g, '')).join('-');

  const parts = [prefix];
  if (dimensions) parts.push(dimensions);
  let base = parts.join('-');

  // Check uniqueness
  if (existingSkus.has(base)) {
    let v = 2;
    while (existingSkus.has(`${base}-V${v}`)) v++;
    base = `${base}-V${v}`;
  }
  existingSkus.add(base);
  return base;
}

// ─── Main Pipeline ─────────────────────────────────────────────────────────
async function run() {
  console.log('🔗 Connecting to Supabase...');

  // Fetch all tables in parallel
  const [
    { data: products,      error: prodErr },
    { data: clients,       error: cliErr  },
    { data: clientPricing, error: cpErr   },
  ] = await Promise.all([
    supabase.from('products').select('*').order('name'),
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('client_pricing').select('*, clients(name)'),
  ]);

  if (prodErr) throw new Error(`Products fetch error: ${prodErr.message}`);
  if (cliErr)  throw new Error(`Clients fetch error: ${cliErr.message}`);
  if (cpErr)   throw new Error(`ClientPricing fetch error: ${cpErr.message}`);

  console.log(`✅ Fetched ${products.length} products, ${clients.length} clients, ${clientPricing.length} client_pricing rows`);

  // Build client lookup
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  // Build pricing lookup: productId → [ { clientName, rate } ]
  const pricingByProduct = {};
  for (const cp of clientPricing) {
    if (!pricingByProduct[cp.product_id]) pricingByProduct[cp.product_id] = [];
    pricingByProduct[cp.product_id].push({
      client_name: cp.clients?.name ?? clientMap[cp.client_id] ?? 'Unknown',
      custom_rate: cp.custom_rate,
    });
  }

  // ── Dedup fingerprint tracking ──
  const fingerprintSeen = {};  // fingerprint → [index list in output]
  const existingSkus    = new Set(products.filter(p => p.sku).map(p => p.sku));

  const output = [];

  for (const product of products) {
    const raw = product.name || '';
    if (!raw.trim()) continue;

    // 1. Typo correction
    const typoFixed = sanitizeTypos(raw);

    // 2. Strip modifiers / inline commentary
    const { sanitized, modifiers } = extractModifiers(typoFixed);

    // 3. Material extraction
    const material = extractMaterial(sanitized);

    // 4. Dimensions
    const dimensions = extractDimensions(sanitized);

    // 5. Thread spec
    const thread_spec = extractThreadSpec(sanitized);
    if (thread_spec && !modifiers.includes(thread_spec)) {
      // Keep thread spec visible in modifiers list if meaningful
    }

    // 6. Product class
    const product_class = classifyProduct(raw);

    // 7. SKU — use existing or generate
    const sku_code = product.sku || generateSKU(sanitized, existingSkus);

    // 8. Determine client context
    const directClient = product.client_id ? clientMap[product.client_id] ?? null : null;
    const pricingEntries = pricingByProduct[product.id] || [];

    // Build one record per client-pricing row (or one generic if none)
    const contexts = pricingEntries.length > 0 ? pricingEntries : [{ client_name: directClient ?? 'CATALOG', custom_rate: product.unit_price }];

    for (const ctx of contexts) {
      const fp = fingerprint(ctx.client_name, sanitized);

      const record = {
        product_db_id:         product.id,
        client_name:           ctx.client_name,
        sku_code:              sku_code,
        raw_description:       raw,
        sanitized_product_name: sanitized.trim(),
        product_class,
        pricing: {
          amount:            parseFloat(ctx.custom_rate) || 0,
          base_catalog_rate: parseFloat(product.unit_price) || 0,
          currency_iso_code: 'INR',
        },
        extracted_attributes: {
          material,
          thread_specification: thread_spec,
          dimensions,
          modifiers,
        },
        meta: {
          hsn_code:  product.hsn_code  ?? null,
          sac_code:  product.sac_code  ?? null,
          unit:      product.unit      ?? 'Pcs',
          has_typos: raw !== typoFixed,
          has_inline_commentary: modifiers.length > 0,
        },
        deduplication: {
          fingerprint: fp,
          duplicate_alert: false,
        },
      };

      // Dedup check
      if (fingerprintSeen[fp] !== undefined) {
        record.deduplication.duplicate_alert = true;
        record.deduplication.duplicate_of_index = fingerprintSeen[fp];
        // Also flag the original
        if (output[fingerprintSeen[fp]]) {
          output[fingerprintSeen[fp]].deduplication.duplicate_alert = true;
        }
      } else {
        fingerprintSeen[fp] = output.length;
      }

      output.push(record);
    }
  }

  // ── Summary Statistics ──
  const stats = {
    total_records:        output.length,
    unique_products:      products.length,
    by_class: {
      FABRICATION:        output.filter(r => r.product_class === 'FABRICATION').length,
      REPAIR_MAINTENANCE: output.filter(r => r.product_class === 'REPAIR_MAINTENANCE').length,
      CONSUMABLE_PRODUCT: output.filter(r => r.product_class === 'CONSUMABLE_PRODUCT').length,
      LOGISTICS:          output.filter(r => r.product_class === 'LOGISTICS').length,
    },
    typo_corrections:     output.filter(r => r.meta.has_typos).length,
    modifier_stripped:    output.filter(r => r.meta.has_inline_commentary).length,
    duplicate_flags:      output.filter(r => r.deduplication.duplicate_alert).length,
    missing_material:     output.filter(r => !r.extracted_attributes.material).length,
    missing_sku:          output.filter(r => !r.sku_code).length,
  };

  const result = { stats, records: output };

  // Write to file
  const outPath = './scripts/normalized_output.json';
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  NORMALIZATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total records:        ${stats.total_records}`);
  console.log(`  Unique products:      ${stats.unique_products}`);
  console.log(`  FABRICATION:          ${stats.by_class.FABRICATION}`);
  console.log(`  REPAIR_MAINTENANCE:   ${stats.by_class.REPAIR_MAINTENANCE}`);
  console.log(`  CONSUMABLE_PRODUCT:   ${stats.by_class.CONSUMABLE_PRODUCT}`);
  console.log(`  LOGISTICS:            ${stats.by_class.LOGISTICS}`);
  console.log(`  Typo corrections:     ${stats.typo_corrections}`);
  console.log(`  Modifier-stripped:    ${stats.modifier_stripped}`);
  console.log(`  Duplicate flags:      ${stats.duplicate_flags}`);
  console.log(`  Missing material:     ${stats.missing_material}`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Output → ${outPath}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Print first 5 records as preview
  console.log('PREVIEW (first 5 records):');
  console.log(JSON.stringify(output.slice(0, 5), null, 2));
}

run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
