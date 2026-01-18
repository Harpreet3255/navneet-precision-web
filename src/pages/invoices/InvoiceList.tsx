import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar, User } from 'lucide-react';
import { supabase, type InvoiceWithItems } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const InvoiceList = () => {
    const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          client:clients(*),
          invoice_items(*)
        `)
                .order('invoice_date', { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error("Failed to fetch invoices");
        } finally {
            setLoading(false);
        }
    };

    const deleteInvoice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const { error } = await supabase.from('invoices').delete().eq('id', id);
            if (error) throw error;
            toast.success("Invoice deleted successfully");
            fetchInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error("Failed to delete invoice");
        }
    };

    const filteredInvoices = invoices.filter((invoice) =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.receiver_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/70">Loading invoices...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Invoices</h1>
                    <p className="text-white/60 mt-1">Manage all your invoices</p>
                </div>
                <Link to="/admin/invoices/new">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            <Card className="glass-dark border-none shadow-xl">
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            type="text"
                            placeholder="Search by invoice number or client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white/70 pl-6">Invoice #</TableHead>
                                <TableHead className="text-white/70">Date</TableHead>
                                <TableHead className="text-white/70">Client</TableHead>
                                <TableHead className="text-white/70">Amount</TableHead>
                                <TableHead className="text-white/70">Status</TableHead>
                                <TableHead className="text-white/70 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-white/60">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-white pl-6">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-400" />
                                                {invoice.invoice_number}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white/70">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-white/40" />
                                                {formatDate(invoice.invoice_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white/70">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-white/40" />
                                                {invoice.receiver_name || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-white">
                                            {formatCurrency(invoice.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={invoice.status === 'finalized' ? 'default' : 'secondary'}
                                                className={invoice.status === 'finalized'
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                }
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/invoices/${invoice.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/admin/invoices/${invoice.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteInvoice(invoice.id)}
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceList;
