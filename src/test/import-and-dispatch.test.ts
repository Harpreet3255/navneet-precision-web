/**
 * Tests for the CSV parsing logic extracted from run_migration_and_import.mjs
 * We inline the parseCSVLine function here since it's a pure utility in a .mjs script.
 */
import { describe, it, expect } from 'vitest';

// Inline the CSV line parser (copied from the import script for testability)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
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

/**
 * Simulates the row-level filtering applied in parseCSV()
 */
function isValidRow(partyName: string, description: string, rateStr: string): boolean {
    const rate = parseFloat(rateStr);
    return !!(
        partyName &&
        description &&
        description !== 'NAN' &&
        description !== 'CANCELLED' &&
        !isNaN(rate) &&
        partyName !== 'NAN'
    );
}

// ─── parseCSVLine ─────────────────────────────────────────────────────────────
describe('parseCSVLine', () => {
    it('splits a simple CSV line into 3 columns', () => {
        const cols = parseCSVLine('RSB,THRUST WASHER DOST,0.8');
        expect(cols).toEqual(['RSB', 'THRUST WASHER DOST', '0.8']);
    });

    it('handles quoted descriptions containing commas', () => {
        // "PLASTIC CAP(THREAD 3 1/4"")FOR EGE SPINDL",4.0
        const cols = parseCSVLine('RKFL,"PLASTIC CAP(THREAD 3 1/4"")FOR EGE SPINDL",4.0');
        expect(cols[0]).toBe('RKFL');
        expect(cols[1]).toBe('PLASTIC CAP(THREAD 3 1/4")FOR EGE SPINDL');
        expect(cols[2]).toBe('4.0');
    });

    it('handles empty fields', () => {
        const cols = parseCSVLine('A,,3.0');
        expect(cols).toEqual(['A', '', '3.0']);
    });

    it('handles a single column', () => {
        expect(parseCSVLine('SINGLE')).toEqual(['SINGLE']);
    });

    it('preserves spaces inside quoted strings', () => {
        const cols = parseCSVLine('CLIENT,"  SPACED DESCRIPTION  ",10.0');
        expect(cols[1]).toBe('  SPACED DESCRIPTION  ');
    });

    it('correctly handles escaped double-quotes inside quoted fields', () => {
        // "" inside quotes = literal "
        const cols = parseCSVLine('"RSB","DESC ""WITH"" QUOTES",5.0');
        expect(cols[0]).toBe('RSB');
        expect(cols[1]).toBe('DESC "WITH" QUOTES');
        expect(cols[2]).toBe('5.0');
    });
});

// ─── Row validation (filtering logic from parseCSV) ───────────────────────────
describe('CSV row validation', () => {
    it('accepts valid rows with party name, description, and numeric rate', () => {
        expect(isValidRow('RSB', 'THRUST WASHER', '0.8')).toBe(true);
    });

    it('rejects rows where description is NAN', () => {
        expect(isValidRow('RSB', 'NAN', '0.0')).toBe(false);
    });

    it('rejects rows where description is CANCELLED', () => {
        expect(isValidRow('RKFL', 'CANCELLED', '')).toBe(false);
    });

    it('rejects rows where party name is NAN', () => {
        expect(isValidRow('NAN', 'PLASTIC CAP BD 66.40', '3.2')).toBe(false);
    });

    it('rejects rows with non-numeric rate', () => {
        expect(isValidRow('RSB', 'SOME PART', 'N/A')).toBe(false);
    });

    it('accepts rows with rate of 0 (valid 0-priced item)', () => {
        // Rate of 0 is a valid number — 591 THRUST WASHER has rate 0 in the CSV
        expect(isValidRow('RSB', '591 THRUST WASHER', '0.0')).toBe(true);
    });

    it('rejects rows with empty party name', () => {
        expect(isValidRow('', 'SOME PRODUCT', '5.0')).toBe(false);
    });

    it('rejects rows with empty description', () => {
        expect(isValidRow('RSB', '', '5.0')).toBe(false);
    });
});

// ─── Price resolution logic (from DispatchInterface.tsx) ─────────────────────
describe('Dispatch UI price resolution', () => {
    /**
     * Simulates the dual price lookup logic added to DispatchInterface.tsx:
     * 1. Primary: look up by product_id in priceMap
     * 2. Fallback: look up by product_name.toUpperCase() in namePriceMap
     */
    function resolvePrice(
        productId: string,
        productName: string,
        priceMap: Map<string, number>,
        namePriceMap: Map<string, number>
    ): number {
        const priceById = priceMap.get(productId);
        const priceByName = namePriceMap.get(productName.trim().toUpperCase());
        return (priceById && priceById > 0) ? priceById : (priceByName || 0);
    }

    const priceMap = new Map([
        ['prod-001', 10.5],
        ['prod-002', 0],     // product exists but with 0 price (pre-import)
        ['prod-003', 25.0],
    ]);
    const namePriceMap = new Map([
        ['THRUST WASHER DOST', 0.8],
        ['NYLON BUSH', 6.1],
        ['KNUCKLE CAP M60', 3.25],
    ]);

    it('returns the product-id price when it is non-zero', () => {
        expect(resolvePrice('prod-001', 'SOME PART', priceMap, namePriceMap)).toBe(10.5);
    });

    it('falls back to name-based price when product-id price is 0', () => {
        expect(resolvePrice('prod-002', 'THRUST WASHER DOST', priceMap, namePriceMap)).toBe(0.8);
    });

    it('returns 0 when neither lookup finds a price', () => {
        expect(resolvePrice('prod-999', 'UNKNOWN PART', priceMap, namePriceMap)).toBe(0);
    });

    it('returns 0 when product-id is unknown and name has no catalog entry', () => {
        expect(resolvePrice('prod-999', 'MISSING PART', priceMap, namePriceMap)).toBe(0);
    });

    it('name lookup is case-insensitive via toUpperCase()', () => {
        // Name from PO might be lower/mixed case
        expect(resolvePrice('prod-002', 'thrust washer dost', priceMap, namePriceMap)).toBe(0.8);
        expect(resolvePrice('prod-002', 'Nylon Bush', priceMap, namePriceMap)).toBe(6.1);
    });

    it('prefers product-id price over name price when both exist and id-price is non-zero', () => {
        const mixedPriceMap = new Map([['prod-A', 50.0]]);
        const mixedNameMap = new Map([['NYLON BUSH', 6.1]]);
        expect(resolvePrice('prod-A', 'NYLON BUSH', mixedPriceMap, mixedNameMap)).toBe(50.0);
    });
});

// ─── Invoice number generation (NI fiscal year format) ───────────────────────
describe('Fiscal-year invoice numbering (NI/YY-YY/NNN format)', () => {
    /**
     * Replicates the getNextInvoiceNumber logic from DispatchInterface.tsx
     */
    function computeInvoicePrefix(testDate: Date): string {
        const month = testDate.getMonth();
        const year = testDate.getFullYear();
        const startYear = month >= 3 ? year : year - 1;
        const fyString = `${(startYear % 100).toString().padStart(2, '0')}-${((startYear + 1) % 100).toString().padStart(2, '0')}`;
        return `NI/${fyString}/`;
    }

    function getNextInvoiceNumber(lastInvoiceNumber: string | null, testDate: Date): string {
        const prefix = computeInvoicePrefix(testDate);
        if (!lastInvoiceNumber) return `${prefix}001`;
        const parts = lastInvoiceNumber.split('/');
        const seq = parseInt(parts[parts.length - 1]);
        const next = isNaN(seq) ? 1 : seq + 1;
        return `${prefix}${next.toString().padStart(3, '0')}`;
    }

    it('generates NI/25-26/001 for April 2025 (start of FY25-26)', () => {
        const date = new Date(2025, 3, 1); // April 2025
        expect(computeInvoicePrefix(date)).toBe('NI/25-26/');
    });

    it('generates NI/25-26/ prefix for March 2026 (same fiscal year)', () => {
        const date = new Date(2026, 2, 31); // March 2026
        expect(computeInvoicePrefix(date)).toBe('NI/25-26/');
    });

    it('generates NI/24-25/ for January 2025 (before April, so FY24-25)', () => {
        const date = new Date(2025, 0, 10); // January 2025
        expect(computeInvoicePrefix(date)).toBe('NI/24-25/');
    });

    it('starts at 001 when no previous invoice', () => {
        const date = new Date(2025, 3, 1);
        expect(getNextInvoiceNumber(null, date)).toBe('NI/25-26/001');
    });

    it('increments from a previous invoice number', () => {
        const date = new Date(2025, 3, 1);
        expect(getNextInvoiceNumber('NI/25-26/005', date)).toBe('NI/25-26/006');
    });

    it('pads sequence to 3 digits', () => {
        const date = new Date(2025, 3, 1);
        expect(getNextInvoiceNumber('NI/25-26/009', date)).toBe('NI/25-26/010');
    });

    it('handles two-digit year rollover correctly', () => {
        // FY 99-00
        const date = new Date(1999, 4, 1); // May 1999
        expect(computeInvoicePrefix(date)).toBe('NI/99-00/');
    });
});
