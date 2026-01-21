import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Edit, ArrowLeft } from 'lucide-react';
import { supabase, type InvoiceWithItems } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { toast } from "sonner";

const InvoiceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          client:clients(*),
          invoice_items(*, po_line_items(purchase_orders(po_number)))
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setInvoice(data);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error("Failed to fetch invoice");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/70">Loading invoice...</div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/70">Invoice not found</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/admin/invoices" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Invoices
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Invoice {invoice.invoice_number}</h1>
                    <p className="text-white/60 mt-1">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="flex gap-3">
                    <Link to={`/admin/invoices/${id}/edit`}>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        onClick={async () => {
                            try {
                                const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `Invoice-${invoice.invoice_number}.pdf`;
                                link.click();
                                URL.revokeObjectURL(url);
                                toast.success("Invoice downloaded successfully");
                            } catch (error) {
                                console.error("Download error:", error);
                                toast.error("Failed to download PDF");
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Invoice Preview */}
            <Card className="glass-dark border-none shadow-xl print:shadow-none print:bg-white print:text-black">
                <CardContent className="p-8">
                    {/* Company Header */}
                    <div className="text-center mb-8 pb-6 border-b border-white/10">
                        <h2 className="text-3xl font-bold text-white mb-2">NAVNEET INDUSTRIES</h2>
                        <p className="text-white/70">25/A, New Burmamines Area, Golmuri, Jamshedpur, Jharkhand - 831003</p>
                        <p className="text-white/70">Email: navneet.steel2005@gmail.com | GSTIN: 20AAECT1182J12A</p>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-blue-400 tracking-wide uppercase">Tax Invoice</h3>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Receiver */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-white/90 uppercase text-sm tracking-wider">Receiver (Billed to)</h4>
                            <div className="text-white/70 space-y-1 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                <p className="font-bold text-white text-base">{invoice.receiver_name}</p>
                                <p>{invoice.receiver_address}</p>
                                <p>{invoice.receiver_city}, {invoice.receiver_state}</p>
                                <p>State Code: {invoice.receiver_state_code}</p>
                                <p>GSTIN: {invoice.receiver_gstin}</p>
                            </div>
                        </div>

                        {/* Consignee */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-white/90 uppercase text-sm tracking-wider">Consignee (Shipped to)</h4>
                            <div className="text-white/70 space-y-1 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                <p className="font-bold text-white text-base">{invoice.consignee_name}</p>
                                <p>{invoice.consignee_address}</p>
                                <p>{invoice.consignee_city}, {invoice.consignee_state}</p>
                                <p>State Code: {invoice.consignee_state_code}</p>
                                <p>GSTIN: {invoice.consignee_gstin}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div>
                            <p className="text-blue-200/70 text-sm">Invoice No</p>
                            <p className="font-bold text-white">{invoice.invoice_number}</p>
                        </div>
                        <div>
                            <p className="text-blue-200/70 text-sm">Invoice Date</p>
                            <p className="font-bold text-white">{formatDate(invoice.invoice_date)}</p>
                        </div>
                        {invoice.supplier && (
                            <div>
                                <p className="text-blue-200/70 text-sm">Supplier</p>
                                <p className="font-bold text-white">{invoice.supplier}</p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="rounded-lg border border-white/10 overflow-hidden mb-8">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/70">Description</TableHead>
                                    <TableHead className="text-white/70">PO No.</TableHead>
                                    <TableHead className="text-white/70">HSN/SAC</TableHead>
                                    <TableHead className="text-white/70 text-right">Qty</TableHead>
                                    <TableHead className="text-white/70">Unit</TableHead>
                                    <TableHead className="text-white/70 text-right">Rate</TableHead>
                                    <TableHead className="text-white/70 text-right">Taxable</TableHead>
                                    {invoice.igst_amount > 0 ? (
                                        <TableHead className="text-white/70 text-right">IGST</TableHead>
                                    ) : (
                                        <>
                                            <TableHead className="text-white/70 text-right">CGST</TableHead>
                                            <TableHead className="text-white/70 text-right">SGST</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-white/70 text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.invoice_items.map((item) => (
                                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="text-white/80">{item.description}</TableCell>
                                        <TableCell className="text-white/60 text-xs">
                                            {/* @ts-ignore */}
                                            {item.po_line_items?.purchase_orders?.po_number || '-'}
                                        </TableCell>
                                        <TableCell className="text-white/60">{item.hsn_code || item.sac_code}</TableCell>
                                        <TableCell className="text-white/80 text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-white/60">{item.unit}</TableCell>
                                        <TableCell className="text-white/80 text-right">{formatCurrency(item.rate)}</TableCell>
                                        <TableCell className="text-white/80 text-right">{formatCurrency(item.taxable_value)}</TableCell>
                                        {invoice.igst_amount > 0 ? (
                                            <TableCell className="text-white/80 text-right">{formatCurrency(item.igst_amount)}</TableCell>
                                        ) : (
                                            <>
                                                <TableCell className="text-white/80 text-right">{formatCurrency(item.cgst_amount)}</TableCell>
                                                <TableCell className="text-white/80 text-right">{formatCurrency(item.sgst_amount)}</TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-white font-medium text-right">{formatCurrency(item.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                            <div className="flex justify-between text-white/70 text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.transportation_charges > 0 && (
                                <div className="flex justify-between text-white/70 text-sm">
                                    <span>Transportation Charges</span>
                                    <span>{formatCurrency(invoice.transportation_charges)}</span>
                                </div>
                            )}

                            <Separator className="bg-white/10" />

                            {invoice.cgst_amount > 0 && (
                                <>
                                    <div className="flex justify-between text-white/70 text-sm">
                                        <span>CGST (9%)</span>
                                        <span>{formatCurrency(invoice.cgst_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70 text-sm">
                                        <span>SGST (9%)</span>
                                        <span>{formatCurrency(invoice.sgst_amount)}</span>
                                    </div>
                                </>
                            )}
                            {invoice.igst_amount > 0 && (
                                <div className="flex justify-between text-white/70 text-sm">
                                    <span>IGST (18%)</span>
                                    <span>{formatCurrency(invoice.igst_amount)}</span>
                                </div>
                            )}

                            <Separator className="bg-white/10" />

                            <div className="flex justify-between text-white text-xl font-bold pt-2">
                                <span>Total Amount</span>
                                <span>{formatCurrency(invoice.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-sm font-medium text-white/70 mb-2">Notes:</p>
                            <p className="text-white/70 text-sm">{invoice.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceView;
