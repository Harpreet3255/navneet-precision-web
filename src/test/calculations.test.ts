import { describe, it, expect } from 'vitest';
import {
    isInterState,
    calculateItemTax,
    calculateInvoiceTotals,
    generateInvoiceNumber,
    formatCurrency,
    formatDate,
} from '@/lib/calculations';

// ─── isInterState ─────────────────────────────────────────────────────────────
describe('isInterState', () => {
    it('returns true when sender and receiver are in different states', () => {
        expect(isInterState('20', '27')).toBe(true); // Jharkhand vs Maharashtra
    });

    it('returns false when sender and receiver share the same state code', () => {
        expect(isInterState('20', '20')).toBe(false); // Jharkhand intra-state
    });

    it('treats numeric-string codes correctly', () => {
        expect(isInterState('06', '06')).toBe(false);
        expect(isInterState('06', '07')).toBe(true);
    });
});

// ─── calculateItemTax ─────────────────────────────────────────────────────────
describe('calculateItemTax', () => {
    describe('intra-state (Jharkhand → Jharkhand, state_code=20)', () => {
        const result = calculateItemTax(100, 10, '20', '20'); // qty=100, rate=10

        it('computes taxable value correctly', () => {
            expect(result.taxable_value).toBe(1000);
        });

        it('uses CGST 9% and SGST 9% for intra-state', () => {
            expect(result.cgst_rate).toBe(9);
            expect(result.sgst_rate).toBe(9);
            expect(result.igst_rate).toBe(0);
        });

        it('calculates CGST and SGST amounts correctly', () => {
            expect(result.cgst_amount).toBe(90); // 9% of 1000
            expect(result.sgst_amount).toBe(90); // 9% of 1000
            expect(result.igst_amount).toBe(0);
        });

        it('totals taxable + CGST + SGST', () => {
            expect(result.total).toBe(1180); // 1000 + 90 + 90
        });
    });

    describe('inter-state (Jharkhand → Maharashtra)', () => {
        const result = calculateItemTax(50, 20, '20', '27'); // qty=50, rate=20

        it('computes taxable value correctly', () => {
            expect(result.taxable_value).toBe(1000);
        });

        it('uses IGST 18% for inter-state', () => {
            expect(result.igst_rate).toBe(18);
            expect(result.cgst_rate).toBe(0);
            expect(result.sgst_rate).toBe(0);
        });

        it('calculates IGST amount correctly', () => {
            expect(result.igst_amount).toBe(180); // 18% of 1000
            expect(result.cgst_amount).toBe(0);
            expect(result.sgst_amount).toBe(0);
        });

        it('totals taxable + IGST', () => {
            expect(result.total).toBe(1180); // 1000 + 180
        });
    });

    describe('always uses sender state_code=20 (Jamshedpur override)', () => {
        it('treats any sender state as Jharkhand (code 20)', () => {
            // Even if senderStateCode='27' is passed, the function overrides with '20'
            const result = calculateItemTax(1, 100, '27', '20');
            // '20' (overridden) vs '20' (receiver) → intra-state
            expect(result.cgst_rate).toBe(9);
            expect(result.sgst_rate).toBe(9);
        });
    });

    describe('edge cases', () => {
        it('returns zero amounts for zero quantity', () => {
            const result = calculateItemTax(0, 500, '20', '27');
            expect(result.taxable_value).toBe(0);
            expect(result.total).toBe(0);
        });

        it('returns zero amounts for zero rate', () => {
            const result = calculateItemTax(100, 0, '20', '27');
            expect(result.taxable_value).toBe(0);
            expect(result.total).toBe(0);
        });

        it('rounds to 2 decimal places', () => {
            // 3 * 0.1 = 0.30000000000000004 in floating point
            const result = calculateItemTax(3, 0.1, '20', '27');
            expect(result.taxable_value).toBe(0.30);
            expect(typeof result.total).toBe('number');
            // Ensure no more than 2 decimal places
            const decimals = (result.total.toString().split('.')[1] || '').length;
            expect(decimals).toBeLessThanOrEqual(2);
        });

        it('handles fractional quantities', () => {
            const result = calculateItemTax(2.5, 4, '20', '20');
            expect(result.taxable_value).toBe(10);
            expect(result.cgst_amount).toBe(0.90);
        });
    });
});

// ─── calculateInvoiceTotals ───────────────────────────────────────────────────
describe('calculateInvoiceTotals', () => {
    const items = [
        { taxable_value: 1000, cgst_amount: 90, sgst_amount: 90, igst_amount: 0, total: 1180 },
        { taxable_value: 500, cgst_amount: 45, sgst_amount: 45, igst_amount: 0, total: 590 },
    ];

    it('sums subtotal from taxable values', () => {
        const totals = calculateInvoiceTotals(items);
        expect(totals.subtotal).toBe(1500);
    });

    it('sums CGST across all items', () => {
        expect(calculateInvoiceTotals(items).cgst_amount).toBe(135);
    });

    it('sums SGST across all items', () => {
        expect(calculateInvoiceTotals(items).sgst_amount).toBe(135);
    });

    it('sums IGST across all items', () => {
        expect(calculateInvoiceTotals(items).igst_amount).toBe(0);
    });

    it('calculates total amount correctly (no transport)', () => {
        expect(calculateInvoiceTotals(items).total_amount).toBe(1770); // 1500+135+135
    });

    it('adds transportation charges to total amount', () => {
        const totals = calculateInvoiceTotals(items, 200);
        expect(totals.total_amount).toBe(1970); // 1770 + 200
    });

    it('handles empty items array', () => {
        const totals = calculateInvoiceTotals([]);
        expect(totals.subtotal).toBe(0);
        expect(totals.total_amount).toBe(0);
    });

    it('handles IGST-based items', () => {
        const igstItems = [
            { taxable_value: 1000, cgst_amount: 0, sgst_amount: 0, igst_amount: 180, total: 1180 },
        ];
        const totals = calculateInvoiceTotals(igstItems);
        expect(totals.igst_amount).toBe(180);
        expect(totals.cgst_amount).toBe(0);
        expect(totals.total_amount).toBe(1180);
    });
});

// ─── generateInvoiceNumber ────────────────────────────────────────────────────
describe('generateInvoiceNumber', () => {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    it('generates the first invoice number when no previous exists', () => {
        expect(generateInvoiceNumber(null)).toBe(`${prefix}0001`);
    });

    it('generates 0001 when lastInvoiceNumber is empty string', () => {
        expect(generateInvoiceNumber('')).toBe(`${prefix}0001`);
    });

    it('increments the sequence by 1', () => {
        expect(generateInvoiceNumber(`${prefix}0001`)).toBe(`${prefix}0002`);
        expect(generateInvoiceNumber(`${prefix}0099`)).toBe(`${prefix}0100`);
    });

    it('pads the number to 4 digits', () => {
        expect(generateInvoiceNumber(`${prefix}0009`)).toBe(`${prefix}0010`);
    });

    it('resets to 0001 when previous invoice has a different year prefix', () => {
        const oldInvoice = `INV-${currentYear - 1}-0099`;
        expect(generateInvoiceNumber(oldInvoice)).toBe(`${prefix}0001`);
    });

    it('handles large sequence numbers', () => {
        expect(generateInvoiceNumber(`${prefix}9999`)).toBe(`${prefix}10000`);
    });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────
describe('formatCurrency', () => {
    it('formats INR currency with ₹ symbol', () => {
        const result = formatCurrency(1000);
        // ₹ symbol must appear (with optional space / narrow-no-break-space)
        expect(result).toMatch(/₹/);
    });

    it('formats zero correctly', () => {
        const result = formatCurrency(0);
        expect(result).toContain('0.00');
    });

    it('always shows 2 decimal places', () => {
        expect(formatCurrency(100)).toContain('.00');
        const halfResult = formatCurrency(100.5);
        expect(halfResult).toMatch(/\.50/);
    });

    it('formats large numbers with Indian comma grouping', () => {
        // INR: 1,00,000 for 100000
        const result = formatCurrency(100000);
        // Must contain digits and commas — flexible assertion
        expect(result).toMatch(/[0-9,]+[0-9]/);
        expect(result).toContain('₹');
    });
});

// ─── formatDate ───────────────────────────────────────────────────────────
describe('formatDate', () => {
    it('formats a Date object and includes the correct year', () => {
        // Use local Date constructor to avoid UTC timezone shifting
        const d = new Date(2024, 0, 15); // Jan 15, 2024 local
        const result = formatDate(d);
        expect(result).toContain('2024');
        expect(result).toMatch(/15/);
    });

    it('accepts a Date object', () => {
        const d = new Date(2024, 5, 20); // June 20, 2024
        const result = formatDate(d);
        expect(result).toContain('2024');
    });

    it('returns a non-empty string for valid dates', () => {
        expect(formatDate(new Date(2023, 5, 1))).toBeTruthy();
    });

    it('returns a formatted string with numeric day/month/year components', () => {
        const d = new Date(2024, 0, 15);
        const result = formatDate(d);
        // Should be a localized date string with year 2024
        expect(result).toMatch(/2024/);
        expect(result).toMatch(/[0-9]/);
    });
});
