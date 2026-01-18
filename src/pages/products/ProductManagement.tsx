import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Tag, Ruler, DollarSign } from 'lucide-react';
import { supabase, type Product, type Client } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const ProductManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        client_id: '',
        name: '',
        description: '',
        sac_code: '',
        hsn_code: '',
        unit: 'Pcs',
        unit_price: 0,
    });

    useEffect(() => {
        fetchProducts();
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*').order('name');
        setClients(data || []);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*, client:clients(name)').order('name');
        if (error) {
            toast.error("Failed to fetch products");
        } else {
            setProducts(data || []);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingProduct) {
                const { error } = await supabase.from('products').update(formData).eq('id', editingProduct.id);
                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                const { error } = await supabase.from('products').insert(formData);
                if (error) throw error;
                toast.success("Product added successfully");
            }

            resetForm();
            fetchProducts();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            client_id: product.client_id || '',
            name: product.name,
            description: product.description || '',
            sac_code: product.sac_code || '',
            hsn_code: product.hsn_code || '',
            unit: product.unit,
            unit_price: product.unit_price,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error: any) {
            toast.error(`Error deleting product: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({ client_id: '', name: '', description: '', sac_code: '', hsn_code: '', unit: 'Pcs', unit_price: 0 });
        setEditingProduct(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
                    <p className="text-white/60 mt-1">Manage your product catalog</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {showForm && (
                <Card className="glass-dark border-none shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {editingProduct ? <Edit className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-blue-400" />}
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Select
                                        value={formData.client_id}
                                        onValueChange={(val) => setFormData({ ...formData, client_id: val })}
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
                                <div className="col-span-2">
                                    <Input
                                        required
                                        placeholder="Product Name *"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Textarea
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 min-h-[80px]"
                                    />
                                </div>
                                <Input
                                    placeholder="SAC Code"
                                    value={formData.sac_code}
                                    onChange={(e) => setFormData({ ...formData, sac_code: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <Input
                                    placeholder="HSN Code"
                                    value={formData.hsn_code}
                                    onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <Input
                                    placeholder="Unit (e.g., Pcs, Kg)"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-white/40">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="Unit Price *"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                                        className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" onClick={resetForm} variant="ghost" className="text-white hover:bg-white/10">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
                                    {editingProduct ? 'Update' : 'Save'} Product
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="glass-dark border-none shadow-xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white/70 pl-6">Name</TableHead>
                                <TableHead className="text-white/70">Client</TableHead>
                                <TableHead className="text-white/70">HSN/SAC</TableHead>
                                <TableHead className="text-white/70">Unit</TableHead>
                                <TableHead className="text-white/70">Unit Price</TableHead>
                                <TableHead className="text-white/70 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium text-white pl-6">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-blue-400" />
                                            {product.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white/70">{product.client?.name || '-'}</TableCell>
                                    <TableCell className="text-white/70">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3 w-3 text-white/40" />
                                            {product.hsn_code || product.sac_code || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white/70">
                                        <div className="flex items-center gap-2">
                                            <Ruler className="h-3 w-3 text-white/40" />
                                            {product.unit}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        {formatCurrency(product.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
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
        </div>
    );
};

export default ProductManagement;
