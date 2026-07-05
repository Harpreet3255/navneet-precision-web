/**
 * pricing-intelligence.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for the Pricing Intelligence Pipeline logic:
 *   • getPriceType()    — price_type state machine (STANDARD / CONTRACT / PROMO)
 *   • getVariancePct()  — variance formula
 *   • baseRateMap       — floor-rate derivation (MIN of custom_rates per product)
 *   • duplicate fingerprint detection
 *   • category inference
 *
 * All logic is extracted from ClientPricingManagement.tsx and pricing_analysis.mjs
 * and tested in pure isolation (no Supabase, no React rendering).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';

// ─── Pure logic extracted from ClientPricingManagement.tsx ────────────────────

function getPriceType(
    contractRate: number,
    baseRate: number,
    hasContract: boolean
): 'STANDARD' | 'CONTRACT' | 'PROMO' {
    if (!hasContract) return 'STANDARD';
    if (baseRate === 0) return 'CONTRACT';
    const variance = ((contractRate - baseRate) / baseRate) * 100;
    if (variance < -5) return 'PROMO';
    return 'CONTRACT';
}

function getVariancePct(contractRate: number, baseRate: number): number | null {
    if (baseRate === 0) return null;
    return Math.round(((contractRate - baseRate) / baseRate) * 10000) / 100;
}

// ─── Pure logic extracted from pricing_analysis.mjs ─────────────────────────

function buildBaseRateMap(
    rows: { product_id: string; custom_rate: number }[]
): Record<string, number> {
    const map: Record<string, number> = {};
    for (const cp of rows) {
        const rate = parseFloat(String(cp.custom_rate)) || 0;
        if (map[cp.product_id] === undefined || rate < map[cp.product_id]) {
            map[cp.product_id] = rate;
        }
    }
    return map;
}

function fingerprint(clientName: string, productName: string): string {
    return `${clientName}::${productName.toUpperCase().trim()}`;
}

function inferCategory(name: string): string {
    const u = name.toUpperCase();
    if (/\bCAP\b/.test(u) || /\bPLUG\b/.test(u))       return 'CAPS & PLUGS';
    if (/\bBUSH\b/.test(u))                             return 'BUSHINGS';
    if (/\bWASHER\b/.test(u))                           return 'WASHERS';
    if (/\bDISC\b/.test(u) || /\bSEPARATOR\b/.test(u)) return 'DISCS & SEPARATORS';
    if (/\bLANCE\b/.test(u))                            return 'LANCES';
    if (/\bMANDREL\b|\bMENDRAL\b|\bMENDAL\b/.test(u))  return 'MANDRELS';
    if (/\bSHAFT\b/.test(u))                            return 'SHAFTS';
    if (/\bSLEEVE\b/.test(u))                           return 'SLEEVES';
    if (/\bBEARING\b/.test(u))                          return 'BEARINGS';
    if (/\bFAB\b|\bFABRICATION\b|\bMAKING\b/.test(u))  return 'FABRICATION SERVICES';
    if (/\bREPAIRING\b|\bREBUILD\b|\bRECOND\b/.test(u)) return 'REPAIR SERVICES';
    if (/\bTRANSPORTATION\b|\bDELIVERY\b/.test(u))     return 'LOGISTICS';
    return 'GENERAL';
}

// ─── getPriceType ─────────────────────────────────────────────────────────────

describe('getPriceType()', () => {
    describe('STANDARD — no explicit contract', () => {
        it('returns STANDARD when hasContract is false regardless of rates', () => {
            expect(getPriceType(500, 500, false)).toBe('STANDARD');
            expect(getPriceType(0, 0, false)).toBe('STANDARD');
            expect(getPriceType(1000, 200, false)).toBe('STANDARD');
        });
    });

    describe('CONTRACT — explicit contract, rate at or above floor', () => {
        it('returns CONTRACT when contract equals base rate (0% variance)', () => {
            expect(getPriceType(500, 500, true)).toBe('CONTRACT');
        });

        it('returns CONTRACT when contract is above base rate (positive variance)', () => {
            expect(getPriceType(600, 500, true)).toBe('CONTRACT'); // +20%
            expect(getPriceType(505, 500, true)).toBe('CONTRACT'); // +1%
        });

        it('returns CONTRACT when variance is exactly -5% (boundary)', () => {
            // -5% exactly → NOT less than -5 → CONTRACT
            expect(getPriceType(475, 500, true)).toBe('CONTRACT');
        });

        it('returns CONTRACT when base rate is 0 (avoids div-by-zero)', () => {
            expect(getPriceType(900, 0, true)).toBe('CONTRACT');
            expect(getPriceType(0, 0, true)).toBe('CONTRACT');
        });
    });

    describe('PROMO — contract rate discounted > 5% below floor', () => {
        it('returns PROMO when contract is 10% below base', () => {
            expect(getPriceType(450, 500, true)).toBe('PROMO'); // -10%
        });

        it('returns PROMO when contract is 6% below base (just past threshold)', () => {
            expect(getPriceType(470, 500, true)).toBe('PROMO'); // -6%
        });

        it('does NOT return PROMO at exactly -5% (threshold is exclusive)', () => {
            expect(getPriceType(475, 500, true)).not.toBe('PROMO');
        });
    });
});

// ─── getVariancePct ───────────────────────────────────────────────────────────

describe('getVariancePct()', () => {
    it('returns null when base rate is 0 (prevents div-by-zero)', () => {
        expect(getVariancePct(500, 0)).toBeNull();
        expect(getVariancePct(0, 0)).toBeNull();
    });

    it('returns 0 when contract equals base', () => {
        expect(getVariancePct(500, 500)).toBe(0);
    });

    it('returns positive value when contract > base', () => {
        expect(getVariancePct(600, 500)).toBe(20.00);  // +20%
        expect(getVariancePct(550, 500)).toBe(10.00);  // +10%
    });

    it('returns negative value when contract < base', () => {
        expect(getVariancePct(450, 500)).toBe(-10.00); // -10%
        expect(getVariancePct(475, 500)).toBe(-5.00);  // -5%
    });

    it('rounds to 2 decimal places', () => {
        // 1/3 base variance → should be capped at 2dp
        const result = getVariancePct(100, 300);
        expect(result).toBe(-66.67);
    });
});

// ─── buildBaseRateMap (floor rate derivation) ─────────────────────────────────

describe('buildBaseRateMap()', () => {
    it('returns empty object for empty input', () => {
        expect(buildBaseRateMap([])).toEqual({});
    });

    it('maps a single row correctly', () => {
        const rows = [{ product_id: 'p1', custom_rate: 500 }];
        expect(buildBaseRateMap(rows)).toEqual({ p1: 500 });
    });

    it('picks the MIN rate across multiple clients for the same product', () => {
        const rows = [
            { product_id: 'p1', custom_rate: 600 },
            { product_id: 'p1', custom_rate: 450 },
            { product_id: 'p1', custom_rate: 700 },
        ];
        expect(buildBaseRateMap(rows)['p1']).toBe(450);
    });

    it('handles multiple products independently', () => {
        const rows = [
            { product_id: 'p1', custom_rate: 500 },
            { product_id: 'p2', custom_rate: 200 },
            { product_id: 'p1', custom_rate: 300 },
            { product_id: 'p2', custom_rate: 400 },
        ];
        const map = buildBaseRateMap(rows);
        expect(map['p1']).toBe(300);
        expect(map['p2']).toBe(200);
    });

    it('treats string custom_rate values safely via parseFloat', () => {
        const rows = [{ product_id: 'p1', custom_rate: '1.50' as any }];
        expect(buildBaseRateMap(rows)['p1']).toBe(1.5);
    });

    it('treats invalid rate as 0', () => {
        const rows = [{ product_id: 'p1', custom_rate: null as any }];
        expect(buildBaseRateMap(rows)['p1']).toBe(0);
    });
});

// ─── Duplicate fingerprint detection ─────────────────────────────────────────

describe('fingerprint()', () => {
    it('produces identical fingerprints for same client + product', () => {
        const fp1 = fingerprint('RSB', 'Plastic Cap');
        const fp2 = fingerprint('RSB', 'Plastic Cap');
        expect(fp1).toBe(fp2);
    });

    it('is case-insensitive for product name', () => {
        expect(fingerprint('RSB', 'plastic cap')).toBe(fingerprint('RSB', 'PLASTIC CAP'));
    });

    it('is case-sensitive for client name', () => {
        expect(fingerprint('RSB', 'Cap')).not.toBe(fingerprint('rsb', 'Cap'));
    });

    it('trims whitespace from product name', () => {
        expect(fingerprint('Client', '  CAP  ')).toBe(fingerprint('Client', 'CAP'));
    });

    it('produces different fingerprints for different clients', () => {
        const fp1 = fingerprint('ClientA', 'S.S. Bush');
        const fp2 = fingerprint('ClientB', 'S.S. Bush');
        expect(fp1).not.toBe(fp2);
    });

    it('produces different fingerprints for different products', () => {
        const fp1 = fingerprint('RSB', 'Plastic Cap');
        const fp2 = fingerprint('RSB', 'Nylon Bush');
        expect(fp1).not.toBe(fp2);
    });

    it('can detect duplicates in a collection', () => {
        const records = [
            { client: 'RSB', product: 'Plastic Cap' },
            { client: 'RSB', product: 'plastic cap' }, // duplicate (case variant)
            { client: 'RSB', product: 'Nylon Bush' },
        ];
        const seen = new Set<string>();
        const dupes = new Set<number>();
        records.forEach((r, i) => {
            const fp = fingerprint(r.client, r.product);
            if (seen.has(fp)) dupes.add(i);
            else seen.add(fp);
        });
        expect(dupes.has(1)).toBe(true);  // index 1 is the duplicate
        expect(dupes.has(2)).toBe(false); // Nylon Bush is unique
    });
});

// ─── Category inference ───────────────────────────────────────────────────────

describe('inferCategory()', () => {
    const cases: [string, string][] = [
        ['Plastic Cap 3/4"',              'CAPS & PLUGS'],
        ['End Plug AM-170543',            'CAPS & PLUGS'],
        ['S.S. BUSH OD50 ID25',          'BUSHINGS'],
        ['Thrust Washer M24',             'WASHERS'],
        ['Disc Separator 200mm',          'DISCS & SEPARATORS'],
        ['16x11x1080 MM LONG SS LANCE',  'LANCES'],
        ['MANDREL 50mm DIA',             'MANDRELS'],
        ['FAB. OF SHAFT EN-19',          'SHAFTS'],   // SHAFT takes priority
        ['Sleeve Bearing Holder',        'SLEEVES'],
        ['117 BEARING CUP COVER',        'BEARINGS'],
        ['FAB. OF ARM BRACKET',          'FABRICATION SERVICES'],
        ['REPAIRING OF ROLLER',          'REPAIR SERVICES'],
        ['TRANSPORTATION CHARGES',       'LOGISTICS'],
        ['DELIVERY CHARGES',             'LOGISTICS'],
        ['Random Widget XYZ',            'GENERAL'],
    ];

    cases.forEach(([input, expected]) => {
        it(`classifies "${input}" as ${expected}`, () => {
            expect(inferCategory(input)).toBe(expected);
        });
    });

    it('is case-insensitive', () => {
        expect(inferCategory('plastic cap')).toBe('CAPS & PLUGS');
        expect(inferCategory('PLASTIC CAP')).toBe('CAPS & PLUGS');
    });
});
