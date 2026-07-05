/**
 * Navneet Industries — Pricing Intelligence Pipeline
 * ─────────────────────────────────────────────────
 * Live schema (confirmed 2026-07-05):
 *   products         → id, name, description, sku, unit, hsn_code, sac_code, group_id
 *   client_pricing   → id, product_id, client_id, custom_rate
 *   clients          → id, name
 *
 * NOTE: products.unit_price does NOT exist in the live DB.
 *       The canonical price lives entirely in client_pricing.custom_rate.
 *
 * Base retail rate derivation (FALLBACK MATRIX):
 *   - If ≥1 client_pricing row exists: base = MIN of all custom_rates for that product
 *     (treating the cheapest rate as the floor/standard rate)
 *   - If no client_pricing rows exist: base = 0, flag as UNPRICED
 *
 * price_type state transitions:
 *   STANDARD  → product has no client_pricing rows at all (fallback)
 *   CONTRACT  → custom_rate >= base_retail_rate (at or above floor)
 *   PROMO     → custom_rate < base_retail_rate by >5% (discounted below floor)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL  = 'https://iazkarfgykfeddsjcbes.supabase.co';
const SERVICE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhemthcmZneWtmZWRkc2pjYmVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA0NTMzMSwiZXhwIjoyMDgwNjIxMzMxfQ.SaU6xswnmst-Pb4qMZzZqi279mRkoIGPM1z2RB-dXjc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Price Type Classifier ────────────────────────────────────────────────────
// PROMO   : contract price < base by more than 5%
// STANDARD: no contract found — inherits base rate
// CONTRACT: explicit override exists (within ±5% or above base)
function classifyPriceType(baseRate, contractRate, isExplicitContract) {
  if (!isExplicitContract) return 'STANDARD';
  if (baseRate === 0) return 'CONTRACT'; // can't compute variance without base
  const variance = ((contractRate - baseRate) / baseRate) * 100;
  if (variance < -5) return 'PROMO';
  return 'CONTRACT';
}

// ─── Variance Calculator ──────────────────────────────────────────────────────
function computeVariance(baseRate, contractRate) {
  if (baseRate === 0) return null; // avoid div-by-zero
  const raw = ((contractRate - baseRate) / baseRate) * 100;
  return Math.round(raw * 100) / 100; // 2 decimal places
}

// ─── Product Category Extractor (from name) ───────────────────────────────────
function inferCategory(name) {
  const u = name.toUpperCase();
  if (/\bCAP\b/.test(u) || /\bPLUG\b/.test(u))                  return 'CAPS & PLUGS';
  if (/\bBUSH\b/.test(u))                                        return 'BUSHINGS';
  if (/\bWASHER\b/.test(u))                                      return 'WASHERS';
  if (/\bDISC\b/.test(u) || /\bSEPARATOR\b/.test(u))            return 'DISCS & SEPARATORS';
  if (/\bLANCE\b/.test(u))                                       return 'LANCES';
  if (/\bMANDREL\b|\bMENDRAL\b|\bMENDAL\b/.test(u))             return 'MANDRELS';
  if (/\bSHAFT\b/.test(u))                                       return 'SHAFTS';
  if (/\bSLEEVE\b/.test(u))                                      return 'SLEEVES';
  if (/\bBEARING\b/.test(u))                                     return 'BEARINGS';
  if (/\bFAB\b|\bFABRICATION\b|\bMAKING\b/.test(u))             return 'FABRICATION SERVICES';
  if (/\bREPAIRING\b|\bREBUILD\b|\bRECOND\b/.test(u))           return 'REPAIR SERVICES';
  if (/\bTRANSPORTATION\b|\bDELIVERY\b/.test(u))                return 'LOGISTICS';
  return 'GENERAL';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🔗 Connecting to Supabase...');

  const [
    { data: products,      error: prodErr },
    { data: clients,       error: cliErr  },
    { data: clientPricing, error: cpErr   },
  ] = await Promise.all([
    supabase.from('products').select('id, name, sku, unit, hsn_code, sac_code, group_id').order('name'),
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('client_pricing').select('id, product_id, client_id, custom_rate'),
  ]);

  if (prodErr) throw new Error(`Products: ${prodErr.message}`);
  if (cliErr)  throw new Error(`Clients: ${cliErr.message}`);
  if (cpErr)   throw new Error(`ClientPricing: ${cpErr.message}`);

  console.log(`✅ ${products.length} products | ${clients.length} clients | ${clientPricing.length} contract rows`);

  // ── Lookup maps ──────────────────────────────────────────────────────────────
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  // contractMap: productId → { clientId → { rate, cpId } }
  const contractMap = {};
  // baseRateMap: productId → MIN(custom_rate) across all clients (floor price)
  const baseRateMap = {};

  for (const cp of clientPricing) {
    const rate = parseFloat(cp.custom_rate) || 0;

    if (!contractMap[cp.product_id]) contractMap[cp.product_id] = {};
    contractMap[cp.product_id][cp.client_id] = { rate, cp_id: cp.id };

    // Track minimum rate per product as the base/floor retail rate
    if (baseRateMap[cp.product_id] === undefined || rate < baseRateMap[cp.product_id]) {
      baseRateMap[cp.product_id] = rate;
    }
  }

  // ── Build output ─────────────────────────────────────────────────────────────
  const records  = [];
  const warnings = [];

  // Stats accumulators
  let countStandard  = 0;
  let countContract  = 0;
  let countPromo     = 0;
  let countZeroBase  = 0;

  // Category aggregates: category → { base_rates[], contract_rates[], variances[] }
  const categoryStats = {};

  function trackCategory(cat, baseRate, contractRate, priceType) {
    if (!categoryStats[cat]) categoryStats[cat] = {
      category: cat,
      product_count: 0,
      contract_count: 0,
      promo_count: 0,
      standard_count: 0,
      avg_base_rate: 0,
      avg_contract_rate: 0,
      avg_variance_pct: 0,
      _bases: [], _contracts: [], _variances: []
    };
    const s = categoryStats[cat];
    s.product_count++;
    s._bases.push(baseRate);
    s._contracts.push(contractRate);
    if (priceType === 'CONTRACT') s.contract_count++;
    if (priceType === 'PROMO')    s.promo_count++;
    if (priceType === 'STANDARD') s.standard_count++;
  }

  for (const product of products) {
    // Base rate = floor price = MIN of all client_pricing rates for this product
    // If no client_pricing exists → 0 (UNPRICED)
    const baseRate  = baseRateMap[product.id] ?? 0;
    const category  = inferCategory(product.name);
    const contracts = contractMap[product.id] || {};
    const clientIds = Object.keys(contracts);

    const hasAnyContract = !!contractMap[product.id];
    if (!hasAnyContract) countZeroBase++; // no pricing data at all

    // ── Case A: has client_pricing rows ─────────────────────────────────────
    if (clientIds.length > 0) {
      for (const clientId of clientIds) {
        const cp          = contracts[clientId];
        const clientName  = clientMap[clientId] ?? 'UNKNOWN';
        const variance    = computeVariance(baseRate, cp.rate);
        const priceType   = classifyPriceType(baseRate, cp.rate, true);

        if (priceType === 'CONTRACT') countContract++;
        else if (priceType === 'PROMO') countPromo++;

        trackCategory(category, baseRate, cp.rate, priceType);

        records.push({
          product_id:             product.id,
          product_name:           product.name,
          sku:                    product.sku ?? null,
          category,
          client_id:              clientId,
          client_name:            clientName,
          pricing: {
            currency_iso_code:    'INR',
            base_retail_rate:     baseRate,
            contract_price:       cp.rate,
            variance_pct:         variance,
            price_type:           priceType,
          },
          meta: {
            contract_pricing_id:  cp.cp_id,
            hsn_code:             product.hsn_code ?? null,
            sac_code:             product.sac_code ?? null,
            unit:                 product.unit ?? 'Nos',
            fallback_applied:     false,
            fallback_reason:      null,
          },
        });
      }
    }

    // ── Case B: FALLBACK — no client_pricing rows at all ───────────────────
    else {
      countStandard++;
      trackCategory(category, 0, 0, 'STANDARD');

      warnings.push({
        product_id:   product.id,
        product_name: product.name,
        sku:          product.sku ?? null,
        warning:      'UNPRICED — no client_pricing rows found for this product',
      });

      records.push({
        product_id:           product.id,
        product_name:         product.name,
        sku:                  product.sku ?? null,
        category,
        group_id:             product.group_id ?? null,
        client_id:            null,
        client_name:          'ALL_CLIENTS_CATALOG_DEFAULT',
        pricing: {
          currency_iso_code:  'INR',
          base_retail_rate:   0,
          contract_price:     0,
          variance_pct:       0.00,
          price_type:         'STANDARD',
        },
        meta: {
          contract_pricing_id: null,
          hsn_code:            product.hsn_code ?? null,
          sac_code:            product.sac_code ?? null,
          unit:                product.unit ?? 'Nos',
          fallback_applied:    true,
          fallback_reason:     'NO_CLIENT_PRICING_ROWS_FOUND',
        },
      });
    }
  }

  // ── Finalize category averages ───────────────────────────────────────────────
  const categoryReport = Object.values(categoryStats).map(s => {
    const avgBase     = s._bases.reduce((a, b) => a + b, 0) / s._bases.length;
    const avgContract = s._contracts.reduce((a, b) => a + b, 0) / s._contracts.length;
    const avgVariance = avgBase > 0 ? ((avgContract - avgBase) / avgBase) * 100 : null;
    return {
      category:          s.category,
      product_count:     s.product_count,
      contract_count:    s.contract_count,
      promo_count:       s.promo_count,
      standard_count:    s.standard_count,
      avg_base_rate:     Math.round(avgBase * 100) / 100,
      avg_contract_rate: Math.round(avgContract * 100) / 100,
      avg_variance_pct:  avgVariance !== null ? Math.round(avgVariance * 100) / 100 : null,
    };
  }).sort((a, b) => b.product_count - a.product_count);

  // ── Stats summary ────────────────────────────────────────────────────────────
  const stats = {
    total_pricing_records:       records.length,
    price_type_breakdown: {
      STANDARD:  countStandard,
      CONTRACT:  countContract,
      PROMO:     countPromo,
    },
    products_with_no_pricing:    countZeroBase,
    products_with_no_contract:   countStandard,
    warning_count:               warnings.length,
    schema_note:                 'unit_price removed from products table; base_retail_rate = MIN(custom_rate) across all client_pricing rows per product',
  };

  const payload = { stats, category_analysis: categoryReport, warnings, records };

  // ── Write output ─────────────────────────────────────────────────────────────
  const outPath = './scripts/pricing_analysis.json';
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');

  // ── Console report ────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PRICING INTELLIGENCE PIPELINE — COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total pricing records:       ${stats.total_pricing_records}`);
  console.log(`  STANDARD  (fallback):        ${stats.price_type_breakdown.STANDARD}`);
  console.log(`  CONTRACT  (explicit):        ${stats.price_type_breakdown.CONTRACT}`);
  console.log(`  PROMO     (discounted):      ${stats.price_type_breakdown.PROMO}`);
  console.log(`  Products with no pricing:    ${stats.products_with_no_pricing}`);
  console.log(`  Warnings:                    ${stats.warning_count}`);
  console.log('───────────────────────────────────────────────────────');
  console.log('\n  CATEGORY ANALYSIS (top 10 by volume):');
  categoryReport.slice(0, 10).forEach(c => {
    const varStr = c.avg_variance_pct !== null ? `${c.avg_variance_pct > 0 ? '+' : ''}${c.avg_variance_pct}%` : 'N/A';
    console.log(`  [${c.category.padEnd(24)}] ${String(c.product_count).padStart(4)} products | avg variance: ${varStr.padStart(8)} | PROMO: ${c.promo_count} | STD: ${c.standard_count}`);
  });
  console.log('───────────────────────────────────────────────────────');
  if (warnings.length > 0) {
    console.log('\n  ⚠️  WARNINGS (zero-rate, no-contract products):');
    warnings.slice(0, 10).forEach(w => console.log(`     • ${w.product_name} — ${w.warning}`));
    if (warnings.length > 10) console.log(`     ... and ${warnings.length - 10} more`);
  }
  console.log(`\n  Output → ${outPath}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Sample: 3 CONTRACT, 2 PROMO, 2 STANDARD records ─────────────────────────
  const sample = [
    ...records.filter(r => r.pricing.price_type === 'CONTRACT').slice(0, 3),
    ...records.filter(r => r.pricing.price_type === 'PROMO').slice(0, 2),
    ...records.filter(r => r.pricing.price_type === 'STANDARD').slice(0, 2),
  ];
  console.log('SAMPLE RECORDS (3 CONTRACT + 2 PROMO + 2 STANDARD):');
  console.log(JSON.stringify(sample, null, 2));
}

run().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
