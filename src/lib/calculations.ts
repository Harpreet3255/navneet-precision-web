// Tax and invoice calculation utilities

/**
 * Determines if transaction is inter-state based on state codes
 */
export function isInterState(senderStateCode: string, receiverStateCode: string): boolean {
    return senderStateCode !== receiverStateCode;
}

/**
 * Calculate tax amounts for an invoice item
 */
export function calculateItemTax(
    quantity: number,
    rate: number,
    senderStateCode: string,
    receiverStateCode: string
) {
    const taxableValue = quantity * rate;
    const isInterStateTx = isInterState(senderStateCode, receiverStateCode);

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isInterStateTx) {
        // Inter-state: use IGST
        igstRate = 18;
        igstAmount = (taxableValue * igstRate) / 100;
    } else {
        // Intra-state: use CGST + SGST
        cgstRate = 9;
        sgstRate = 9;
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
    }

    const total = taxableValue + cgstAmount + sgstAmount + igstAmount;

    return {
        taxable_value: Number(taxableValue.toFixed(2)),
        cgst_rate: cgstRate,
        cgst_amount: Number(cgstAmount.toFixed(2)),
        sgst_rate: sgstRate,
        sgst_amount: Number(sgstAmount.toFixed(2)),
        igst_rate: igstRate,
        igst_amount: Number(igstAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
}

/**
 * Calculate invoice totals from items
 */
export function calculateInvoiceTotals(
    items: Array<{
        taxable_value: number;
        cgst_amount: number;
        sgst_amount: number;
        igst_amount: number;
        total: number;
    }>,
    transportationCharges: number = 0
) {
    const subtotal = items.reduce((sum, item) => sum + item.taxable_value, 0);
    const cgstAmount = items.reduce((sum, item) => sum + item.cgst_amount, 0);
    const sgstAmount = items.reduce((sum, item) => sum + item.sgst_amount, 0);
    const igstAmount = items.reduce((sum, item) => sum + item.igst_amount, 0);
    const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount + transportationCharges;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        cgst_amount: Number(cgstAmount.toFixed(2)),
        sgst_amount: Number(sgstAmount.toFixed(2)),
        igst_amount: Number(igstAmount.toFixed(2)),
        total_amount: Number(totalAmount.toFixed(2)),
    };
}

/**
 * Generate next invoice number
 */
export function generateInvoiceNumber(lastInvoiceNumber: string | null): string {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    if (!lastInvoiceNumber || !lastInvoiceNumber.startsWith(prefix)) {
        return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastInvoiceNumber.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `${prefix}${nextNumber}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}
