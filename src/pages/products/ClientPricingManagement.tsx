import React, { useState, useEffect } from 'react';
import { supabase, type Client, type Product, type ClientPricing } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from '@/lib/calculations';
import { toast } from "sonner";
import { Plus, Edit, Trash2, Tag, Briefcase, FileText } from 'lucide-react';
import DataFallback from '@/components/DataFallback';

const ClientPricingManagement = () => {
    const [pricingRules, setPricingRules] = useState<ClientPricing[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<ClientPricing | null>(null);
    const [formData, setFormData] = useState({
        client_id: '',
        product_id: '',
        custom_rate: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pricingRes, clientsRes, productsRes] = await Promise.all([
                supabase.from('client_pricing').select('*, client:clients(*), product:products(*)').order('created_at', { ascending: false }),
                supabase.from('clients').select('*').order('name'),
                supabase.from('products').select('*').order('name'),
            ]);

            if (pricingRes.error) throw pricingRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (productsRes.error) throw productsRes.error;

            setPricingRules(pricingRes.data || []);
            setClients(clientsRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error: any) {
            toast.error("Failed to load data: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('client_pricing')
                .upsert(
                    { 
                        id: editingRule?.id,
                        client_id: formData.client_id, 
                        product_id: formData.product_id, 
                        custom_rate: formData.custom_rate 
                    },
                    { onConflict: 'client_id,product_id' }
                );

            if (error) throw error;
            toast.success(`Pricing rule ${editingRule ? 'updated' : 'added'} successfully`);

            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleEdit = (rule: ClientPricing) => {
        setEditingRule(rule);
        setFormData({
            client_id: rule.client_id,
            product_id: rule.product_id,
            custom_rate: rule.custom_rate,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this pricing rule?')) return;
        try {
            const { error } = await supabase.from('client_pricing').delete().eq('id', id);
            if (error) throw error;
            toast.success("Pricing rule deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(`Error deleting rule: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({ client_id: '', product_id: '', custom_rate: 0 });
        setEditingRule(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Client Special Pricing</h1>
                    <p className="text-white/60 mt-1">Manage what specific clients pay for universal SKUs</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contract Price
                </Button>
            </div>

            {showForm && (
                <Card className="glass-dark border-none shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {editingRule ? <Edit className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-blue-400" />}
                            {editingRule ? 'Edit Contract Pricing' : 'Add New Contract Pricing'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <Select
                                        value={formData.client_id}
                                        onValueChange={(val) => setFormData({ ...formData, client_id: val })}
                                        disabled={!!editingRule}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                            <SelectValue placeholder="Select Client *" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id} className="focus:bg-white/10 focus:text-white">
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <Select
                                        value={formData.product_id}
                                        onValueChange={(val) => setFormData({ ...formData, product_id: val })}
                                        disabled={!!editingRule}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                            <SelectValue placeholder="Select Universal SKU *" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id} className="focus:bg-white/10 focus:text-white">
                                                    [{product.sku}] {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1 relative">
                                    <span className="absolute left-3 top-2.5 text-white/40">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="Custom Rate *"
                                        value={formData.custom_rate}
                                        onChange={(e) => setFormData({ ...formData, custom_rate: parseFloat(e.target.value) })}
                                        className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 h-11"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" onClick={resetForm} variant="ghost" className="text-white hover:bg-white/10">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
                                    {editingRule ? 'Update' : 'Save'} Pricing Rule
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!isLoading && pricingRules.length === 0 ? (
                <DataFallback title="No Pricing Contracts Found" message="Create your first client-specific product price." />
            ) : (
                <Card className="glass-dark border-none shadow-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/70 pl-6">Client</TableHead>
                                    <TableHead className="text-white/70">SKU / Product</TableHead>
                                    <TableHead className="text-white/70">Contract Price</TableHead>
                                    <TableHead className="text-white/70 text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pricingRules.map((rule) => (
                                    <TableRow key={rule.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-white pl-4 md:pl-6">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-blue-400 shrink-0" />
                                                <span>{rule.client?.name || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white/90 font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-blue-300 font-mono text-sm">[{rule.product?.sku}]</span>
                                                <span>{rule.product?.name || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-green-400 whitespace-nowrap">
                                            {formatCurrency(rule.custom_rate)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ClientPricingManagement;
