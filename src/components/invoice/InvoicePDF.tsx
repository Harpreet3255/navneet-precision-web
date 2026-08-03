import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type InvoiceWithItems } from '@/lib/supabase';
import { formatDate } from '@/lib/calculations';

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

const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
    table: { border: '1px solid #000', flex: 1, display: 'flex', flexDirection: 'column' },
    
    row: { flexDirection: 'row', borderBottom: '1px solid #000' },
    colHeader: { padding: 4, textAlign: 'center', borderRight: '1px solid #000', flex: 1, fontSize: 7, fontWeight: 'bold' },
    colHeaderLast: { padding: 4, textAlign: 'center', flex: 1, fontSize: 7, fontWeight: 'bold' },
    
    centerBlock: { padding: 5, textAlign: 'center', borderBottom: '1px solid #000' },
    titleMain: { fontSize: 9, fontWeight: 'bold' },
    titleSub: { fontSize: 8, fontStyle: 'italic', marginBottom: 5 },
    companyName: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
    companyAddress: { fontSize: 8 },
    companyGstin: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },
    
    detailsRow: { flexDirection: 'row', borderBottom: '1px solid #000', minHeight: 70 },
    detailsColLeft: { width: '35%', borderRight: '1px solid #000', padding: 5 },
    detailsColMid: { width: '30%', borderRight: '1px solid #000', padding: 5 },
    detailsColRight: { width: '35%', padding: 5 },
    
    detailsLabel: { fontWeight: 'bold', fontSize: 7, marginBottom: 2 },
    detailsText: { fontSize: 7, marginBottom: 1 },
    
    itemsHeader: { flexDirection: 'row', borderBottom: '1px solid #000', backgroundColor: '#f9f9f9', alignItems: 'stretch' },
    itemCol1: { width: '5%', borderRight: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 7, fontWeight: 'bold' },
    itemCol2: { width: '35%', borderRight: '1px solid #000', padding: 4, fontSize: 7, fontWeight: 'bold' },
    itemCol3: { width: '10%', borderRight: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 7, fontWeight: 'bold' },
    itemCol4: { width: '15%', borderRight: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 7, fontWeight: 'bold' },
    itemCol5: { width: '12%', borderRight: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 7, fontWeight: 'bold' },
    itemCol6: { width: '11%', borderRight: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 7, fontWeight: 'bold' },
    itemCol7: { width: '12%', padding: 4, textAlign: 'right', fontSize: 7, fontWeight: 'bold' },
    
    itemsContainer: { flex: 1, position: 'relative', borderBottom: '1px solid #000', flexDirection: 'column' },
    itemRow: { flexDirection: 'row', minHeight: 20 },
    itemCol1D: { width: '5%', padding: 4, textAlign: 'center', fontSize: 7 },
    itemCol2D: { width: '35%', padding: 4, fontSize: 7 },
    itemCol3D: { width: '10%', padding: 4, textAlign: 'center', fontSize: 7 },
    itemCol4D: { width: '15%', padding: 4, textAlign: 'center', fontSize: 7 },
    itemCol5D: { width: '12%', padding: 4, textAlign: 'right', fontSize: 7 },
    itemCol6D: { width: '11%', padding: 4, textAlign: 'right', fontSize: 7 },
    itemCol7D: { width: '12%', padding: 4, textAlign: 'right', fontSize: 7 },
    
    // Absolute vertical lines for the items container to stretch all the way down
    vLine1: { position: 'absolute', top: 0, bottom: 0, left: '5%', borderLeft: '1px solid #000' },
    vLine2: { position: 'absolute', top: 0, bottom: 0, left: '40%', borderLeft: '1px solid #000' },
    vLine3: { position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '1px solid #000' },
    vLine4: { position: 'absolute', top: 0, bottom: 0, left: '65%', borderLeft: '1px solid #000' },
    vLine5: { position: 'absolute', top: 0, bottom: 0, left: '77%', borderLeft: '1px solid #000' },
    vLine6: { position: 'absolute', top: 0, bottom: 0, left: '88%', borderLeft: '1px solid #000' },
    
    footerRow: { flexDirection: 'row', minHeight: 120 },
    footerLeft: { width: '65%', borderRight: '1px solid #000', flexDirection: 'column' },
    footerRight: { width: '35%', flexDirection: 'column' },
    
    wordsBlock: { padding: 5, borderBottom: '1px solid #000' },
    wordsLabel: { fontWeight: 'bold', fontSize: 7 },
    wordsText: { fontSize: 7, marginTop: 2 },
    
    declarationBlock: { padding: 5, flex: 1 },
    declarationText: { fontSize: 7 },
    
    totalsRow: { flexDirection: 'row', borderBottom: '1px solid #000', minHeight: 16, alignItems: 'center' },
    totalsLabel: { width: '60%', borderRight: '1px solid #000', padding: 4, fontSize: 7 },
    totalsValue: { width: '40%', padding: 4, textAlign: 'right', fontSize: 7 },
    
    sigBlock: { padding: 5, flex: 1, position: 'relative' },
    sigText: { fontSize: 7, marginTop: 5 },
    sigLine: { borderBottom: '1px solid #000', marginTop: 2, marginBottom: 2 },
    sigCompany: { fontSize: 8, fontWeight: 'bold', position: 'absolute', bottom: 5, right: 5 }
});

interface InvoicePDFProps {
    invoice: InvoiceWithItems;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
    const isInterState = invoice.igst_amount > 0;
    
    const safeValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '';
        return String(value);
    };

    const totalTax = invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount;
    
    const poNumbers = [...new Set(invoice.invoice_items.map((i: any) => i.po_line_items?.purchase_orders?.po_number).filter(Boolean))];
    const poNumberDisplay = poNumbers.join(', ') || '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.table}>
                    {/* Top Copies Row */}
                    <View style={styles.row}>
                        <Text style={styles.colHeader}>Original for buyer</Text>
                        <Text style={styles.colHeader}>Duplicate for transporter</Text>
                        <Text style={styles.colHeader}>Triplicate for office copy</Text>
                        <Text style={styles.colHeaderLast}>Extra copy</Text>
                    </View>

                    {/* Main Header */}
                    <View style={styles.centerBlock}>
                        <Text style={styles.titleMain}>Government of India/ State Department of Jharkhand</Text>
                        <Text style={styles.titleMain}>Form Goods and Service Tax-Invoice</Text>
                        <Text style={styles.titleSub}>(See rules—20)</Text>
                        
                        <Text style={styles.companyName}>NAVNEET INDUSTRIES</Text>
                        <Text style={styles.companyAddress}>New Development Area, 25/A, Golmuri, Jamshedpur, Jharkhand 831003, India</Text>
                        <Text style={styles.companyGstin}>GSTIN No 20AAECT1182J12A</Text>
                    </View>

                    {/* Parties Details */}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailsColLeft}>
                            <Text style={styles.detailsLabel}>Details of Receiver (Billed To)</Text>
                            <Text style={{...styles.detailsText, fontWeight: 'bold'}}>{safeValue(invoice.receiver_name)}</Text>
                            <Text style={styles.detailsText}>{safeValue(invoice.receiver_address)}</Text>
                            <Text style={styles.detailsText}>{`${safeValue(invoice.receiver_city)}, ${safeValue(invoice.receiver_state)} - ${safeValue(invoice.receiver_state_code)}`}</Text>
                            <Text style={styles.detailsText}>Phone No : </Text>
                            <Text style={styles.detailsText}>PAN No.: </Text>
                            <Text style={styles.detailsText}>Range :  Division : </Text>
                            <Text style={styles.detailsText}>GSTIN : {safeValue(invoice.client?.gstin || invoice.receiver_gstin)}</Text>
                            <Text style={styles.detailsText}>IEC No. : </Text>
                        </View>
                        
                        <View style={styles.detailsColMid}>
                            <Text style={styles.detailsText}><Text style={{fontWeight: 'bold'}}>Invoice No:</Text> {safeValue(invoice.invoice_number)}</Text>
                            <Text style={styles.detailsText}><Text style={{fontWeight: 'bold'}}>Invoice Date:</Text> {formatDate(invoice.invoice_date)}</Text>
                            <Text style={{...styles.detailsText, marginTop: 10}}><Text style={{fontWeight: 'bold'}}>Order No.:</Text> {poNumberDisplay}</Text>
                            {invoice.supplier && <Text style={styles.detailsText}><Text style={{fontWeight: 'bold'}}>Supplier:</Text> {safeValue(invoice.supplier)}</Text>}
                        </View>

                        <View style={styles.detailsColRight}>
                            <Text style={styles.detailsLabel}>Details of Consignee (Shipped To)</Text>
                            <Text style={{...styles.detailsText, fontWeight: 'bold'}}>{safeValue(invoice.consignee_name || invoice.receiver_name)}</Text>
                            <Text style={styles.detailsText}>{safeValue(invoice.consignee_address || invoice.receiver_address)}</Text>
                            <Text style={styles.detailsText}>{`${safeValue(invoice.consignee_city || invoice.receiver_city)}, ${safeValue(invoice.consignee_state || invoice.receiver_state)} - ${safeValue(invoice.consignee_state_code || invoice.receiver_state_code)}`}</Text>
                            <Text style={styles.detailsText}>Phone No : </Text>
                            <Text style={styles.detailsText}>PAN No.: </Text>
                            <Text style={styles.detailsText}>Range :  Division : </Text>
                            <Text style={styles.detailsText}>GSTIN : {safeValue(invoice.consignee_gstin || invoice.client?.gstin || invoice.receiver_gstin)}</Text>
                            <Text style={styles.detailsText}>IEC No. : </Text>
                        </View>
                    </View>

                    {/* Items Header */}
                    <View style={styles.itemsHeader}>
                        <Text style={styles.itemCol1}>Sl. No</Text>
                        <Text style={styles.itemCol2}>Particulars</Text>
                        <Text style={styles.itemCol3}>HSN Code</Text>
                        <Text style={styles.itemCol4}>Qty/Rate</Text>
                        <Text style={styles.itemCol5}>Taxable Amount</Text>
                        <Text style={styles.itemCol6}>{isInterState ? "IGST" : "CGST+SGST"}</Text>
                        <Text style={styles.itemCol7}>Total Invoice Value</Text>
                    </View>

                    {/* Items Container with flex 1 to fill page and absolute lines */}
                    <View style={styles.itemsContainer}>
                        <View style={styles.vLine1} />
                        <View style={styles.vLine2} />
                        <View style={styles.vLine3} />
                        <View style={styles.vLine4} />
                        <View style={styles.vLine5} />
                        <View style={styles.vLine6} />

                        {invoice.invoice_items.map((item, index) => {
                            const hsn = item.hsn_code || item.sac_code || (item.product as any)?.hsn_code || '-';
                            const qtyRate = `${item.quantity} ${item.unit} @ Rs ${item.rate.toFixed(2)}/-`;
                            const taxAmt = (item.cgst_amount + item.sgst_amount + item.igst_amount).toFixed(2);
                            
                            return (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemCol1D}>{index + 1}.</Text>
                                    <Text style={styles.itemCol2D}>
                                        {/* @ts-ignore */}
                                        {safeValue(((item.product?.sku ? `[${item.product.sku}] ` : '') + (item.description || '')))}
                                    </Text>
                                    <Text style={styles.itemCol3D}>{hsn}</Text>
                                    <Text style={styles.itemCol4D}>{qtyRate}</Text>
                                    <Text style={styles.itemCol5D}>{item.taxable_value.toFixed(2)}</Text>
                                    <Text style={styles.itemCol6D}>{taxAmt}</Text>
                                    <Text style={styles.itemCol7D}>{item.total.toFixed(2)}</Text>
                                </View>
                            );
                        })}
                        
                        {invoice.transportation_charges > 0 && (
                            <View style={styles.itemRow}>
                                <Text style={styles.itemCol1D}></Text>
                                <Text style={styles.itemCol2D}>Transportation Charges</Text>
                                <Text style={styles.itemCol3D}></Text>
                                <Text style={styles.itemCol4D}></Text>
                                <Text style={styles.itemCol5D}>{invoice.transportation_charges.toFixed(2)}</Text>
                                <Text style={styles.itemCol6D}></Text>
                                <Text style={styles.itemCol7D}>{invoice.transportation_charges.toFixed(2)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footerRow}>
                        <View style={styles.footerLeft}>
                            <View style={styles.wordsBlock}>
                                <Text style={styles.wordsLabel}>Total Tax (In Words):</Text>
                                <Text style={styles.wordsText}>Rupees: {amountToWords(totalTax)}</Text>
                            </View>
                            <View style={styles.wordsBlock}>
                                <Text style={styles.wordsLabel}>Invoice Total (In Words):</Text>
                                <Text style={styles.wordsText}>Rupees: {amountToWords(invoice.total_amount)}</Text>
                            </View>
                            <View style={styles.declarationBlock}>
                                <Text style={styles.declarationText}>Certified that the particulars given above are true and correct and the amount indicated represent the price actually charged and that there is no flow additional consideration directly or indirectly from the buyer.</Text>
                            </View>
                        </View>
                        
                        <View style={styles.footerRight}>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Taxable Amount:</Text>
                                <Text style={styles.totalsValue}>{invoice.subtotal.toFixed(2)}</Text>
                            </View>
                            
                            {!isInterState && (
                                <View style={styles.totalsRow}>
                                    <Text style={styles.totalsLabel}>Tax Amount - SGST:</Text>
                                    <Text style={styles.totalsValue}>{invoice.sgst_amount.toFixed(2)}</Text>
                                </View>
                            )}
                            {!isInterState && (
                                <View style={styles.totalsRow}>
                                    <Text style={styles.totalsLabel}>Tax Amount - CGST:</Text>
                                    <Text style={styles.totalsValue}>{invoice.cgst_amount.toFixed(2)}</Text>
                                </View>
                            )}
                            {isInterState && (
                                <View style={styles.totalsRow}>
                                    <Text style={styles.totalsLabel}>Tax Amount - IGST:</Text>
                                    <Text style={styles.totalsValue}>{invoice.igst_amount.toFixed(2)}</Text>
                                </View>
                            )}
                            
                            <View style={styles.totalsRow}>
                                <Text style={{...styles.totalsLabel, fontWeight: 'bold'}}>Total Invoice Value:</Text>
                                <Text style={{...styles.totalsValue, fontWeight: 'bold'}}>{invoice.total_amount.toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.sigBlock}>
                                <Text style={styles.sigText}>Electronics Reference No</Text>
                                <View style={styles.sigLine} />
                                <Text style={styles.sigText}>Date</Text>
                                <View style={styles.sigLine} />
                                <Text style={styles.sigCompany}>For Navneet Industries</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;
