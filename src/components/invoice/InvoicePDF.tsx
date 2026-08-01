import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { type InvoiceWithItems } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/calculations';

// Utility for Amount in words
const amountToWords = (amount: number): string => {
    if (amount === 0) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convert = (num: number): string => {
        if (num < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
        if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
        if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
        if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(num % 100000) : '');
        return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '');
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
        result += ' and ' + convert(paise) + ' Paise';
    }
    return result + ' Only';
};

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        borderBottom: '1px solid #000',
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    companyDetails: {
        fontSize: 9,
        marginBottom: 2,
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    column: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 3,
    },
    value: {
        fontSize: 9,
    },
    table: {
        marginVertical: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        borderTop: '1px solid #000',
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        fontSize: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #ccc',
        paddingVertical: 5,
        fontSize: 8,
    },
    col1: { width: '30%', paddingHorizontal: 5 },
    col2: { width: '10%', paddingHorizontal: 5 },
    col3: { width: '8%', paddingHorizontal: 5, textAlign: 'right' },
    col4: { width: '8%', paddingHorizontal: 5 },
    col5: { width: '11%', paddingHorizontal: 5, textAlign: 'right' },
    col6: { width: '11%', paddingHorizontal: 5, textAlign: 'right' },
    col7: { width: '11%', paddingHorizontal: 5, textAlign: 'right' },
    col8: { width: '11%', paddingHorizontal: 5, textAlign: 'right' },
    totals: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        fontSize: 9,
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingTop: 5,
        borderTop: '1px solid #000',
        fontWeight: 'bold',
        fontSize: 11,
    },
    notes: {
        marginTop: 15,
        fontSize: 9,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    termsContainer: {
        marginTop: 20,
        width: '65%',
    },
    termsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 4,
        textDecoration: 'underline',
    },
    termsText: {
        fontSize: 7.5,
        marginBottom: 2,
        color: '#333',
    },
});

interface InvoicePDFProps {
    invoice: InvoiceWithItems;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
    const isInterState = invoice.igst_amount > 0;

    // Helper function to ensure values are never empty strings for PDF renderer
    const safeValue = (value: any): string => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return String(value);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>NAVNEET INDUSTRIES</Text>
                    <Text style={styles.companyDetails}>
                        New Development Area, 25/A, Golmuri, Jamshedpur, Jharkhand 831003, India
                    </Text>
                    <Text style={styles.companyDetails}>
                        Email: navneetindustries@gmail.com | GSTIN: 20AAECT1182J12A
                    </Text>
                </View>

                <Text style={styles.invoiceTitle}>TAX INVOICE</Text>

                {/* Details Section */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Receiver (Billed to)</Text>
                        <Text style={styles.value}>Name: {safeValue(invoice.receiver_name)}</Text>
                        <Text style={styles.value}>Address: {safeValue(invoice.receiver_address)}</Text>
                        <Text style={styles.value}>{`${safeValue(invoice.receiver_city)}, ${safeValue(invoice.receiver_state)}`}</Text>
                        <Text style={styles.value}>State Code: {safeValue(invoice.receiver_state_code)}</Text>
                        <Text style={styles.value}>GSTIN: {safeValue(invoice.client?.gstin || invoice.receiver_gstin)}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>Consignee (Shipped to)</Text>
                        <Text style={styles.value}>Name: {safeValue(invoice.consignee_name || invoice.receiver_name)}</Text>
                        <Text style={styles.value}>Address: {safeValue(invoice.consignee_address || invoice.receiver_address)}</Text>
                        <Text style={styles.value}>{`${safeValue(invoice.consignee_city || invoice.receiver_city)}, ${safeValue(invoice.consignee_state || invoice.receiver_state)}`}</Text>
                        <Text style={styles.value}>State Code: {safeValue(invoice.consignee_state_code || invoice.receiver_state_code)}</Text>
                        <Text style={styles.value}>GSTIN: {safeValue(invoice.consignee_gstin || invoice.client?.gstin || invoice.receiver_gstin)}</Text>
                    </View>
                </View>

                {/* Invoice Details */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Invoice No: {safeValue(invoice.invoice_number)}</Text>
                        <Text style={styles.value}>Date: {formatDate(invoice.invoice_date)}</Text>
                    </View>
                    {invoice.supplier && (
                        <View style={styles.column}>
                            <Text style={styles.label}>Supplier: {safeValue(invoice.supplier)}</Text>
                        </View>
                    )}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.col1, width: '25%' }}>Description</Text>
                        <Text style={{ ...styles.col2, width: '13%' }}>PO No.</Text>
                        <Text style={styles.col2}>HSN/SAC</Text>
                        <Text style={styles.col3}>Qty</Text>
                        <Text style={styles.col4}>Unit</Text>
                        <Text style={styles.col5}>Rate</Text>
                        <Text style={styles.col6}>Taxable Value</Text>
                        {isInterState ? (
                            <Text style={{ ...styles.col7, width: '22%' }}>IGST 18%</Text>
                        ) : (
                            <Text style={styles.col7}>CGST 9% {"\n"}(Jharkhand)</Text>
                        )}
                        {!isInterState && <Text style={styles.col8}>SGST 9%</Text>}
                        <Text style={styles.col8}>Total</Text>
                    </View>

                    {invoice.invoice_items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={{ ...styles.col1, width: '25%' }}>
                                {/* @ts-ignore */}
                                {safeValue(((item.product?.sku ? `[${item.product.sku}] ` : '') + (item.description || '')))}
                            </Text>
                            <Text style={{ ...styles.col2, width: '13%', fontSize: 7 }}>
                                {/* @ts-ignore */}
                                {safeValue(item.po_line_items?.purchase_orders?.po_number)}
                            </Text>
                            {/* @ts-ignore */}
                            <Text style={styles.col2}>{safeValue(item.hsn_code || item.sac_code || item.product?.hsn_code)}</Text>
                            <Text style={styles.col3}>{safeValue(item.quantity)}</Text>
                            <Text style={styles.col4}>{safeValue(item.unit)}</Text>
                            <Text style={styles.col5}>{item.rate.toFixed(2)}</Text>
                            <Text style={styles.col6}>{item.taxable_value.toFixed(2)}</Text>
                            {isInterState ? (
                                <Text style={{ ...styles.col7, width: '22%' }}>{item.igst_amount.toFixed(2)}</Text>
                            ) : (
                                <Text style={styles.col7}>{item.cgst_amount.toFixed(2)}</Text>
                            )}
                            {!isInterState && <Text style={styles.col8}>{item.sgst_amount.toFixed(2)}</Text>}
                            <Text style={styles.col8}>{item.total.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {!isInterState && (
                    <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 5 }}>
                        * Intra-state Supply (Jharkhand) - CGST (9%) + SGST (9%)
                    </Text>
                )}

                {/* Totals & Amount in Words */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{ width: '55%', paddingTop: 10 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Amount Chargeable (in words)</Text>
                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>INR {amountToWords(invoice.total_amount)}</Text>
                    </View>

                    <View style={styles.totals}>
                        <View style={styles.totalRow}>
                            <Text>Subtotal:</Text>
                            <Text>₹{invoice.subtotal.toFixed(2)}</Text>
                        </View>
                        {invoice.transportation_charges > 0 && (
                            <View style={styles.totalRow}>
                                <Text>Transportation Charges:</Text>
                                <Text>₹{invoice.transportation_charges.toFixed(2)}</Text>
                            </View>
                        )}
                        {isInterState ? (
                            <View style={styles.totalRow}>
                                <Text>IGST (18%):</Text>
                                <Text>₹{invoice.igst_amount.toFixed(2)}</Text>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.totalRow}>
                                    <Text>CGST (9%):</Text>
                                    <Text>₹{invoice.cgst_amount.toFixed(2)}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text>SGST (9%):</Text>
                                    <Text>₹{invoice.sgst_amount.toFixed(2)}</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.grandTotal}>
                            <Text>Total Amount:</Text>
                            <Text>₹{invoice.total_amount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.label}>Notes:</Text>
                        <Text>{safeValue(invoice.notes)}</Text>
                    </View>
                )}

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                    <Text style={styles.termsText}>1. Payment is strictly due within 90 days from the date of invoice.</Text>
                    <Text style={styles.termsText}>2. Interest @ 18% p.a. (1.5% per month) will be charged on delayed payments.</Text>
                    <Text style={styles.termsText}>3. All disputes are subject to Jamshedpur jurisdiction only.</Text>
                    <Text style={styles.termsText}>4. Goods once sold and delivered will not be taken back or exchanged.</Text>
                    <Text style={styles.termsText}>5. Our risk and responsibility ceases once the goods leave our manufacturing premises.</Text>
                </View>

                {/* Signature */}
                <View style={{ position: 'absolute', bottom: 30, right: 30 }}>
                    <Text style={{ fontSize: 9, marginTop: 40 }}>Authorized Signatory</Text>
                    <Text style={{ fontSize: 9 }}>For Navneet Industries</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;
