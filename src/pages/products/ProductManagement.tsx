import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Package, Tag, Ruler, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { supabase, type Product, type ProductGroup } from '@/lib/supabase';
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
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ProductManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [groups, setGroups] = useState<ProductGroup[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        sac_code: '',
        hsn_code: '',
        unit: 'Nos',
        group_id: '',
    });
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchProducts();
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        const { data } = await supabase.from('product_groups').select('*').order('group_name');
        setGroups(data || []);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*, group:product_groups(group_name)').order('name');
        if (error) {
            toast.error("Failed to fetch products");
        } else {
            const uniqueProducts = Array.from(new Map((data || []).map(p => [p.sku, p])).values());
            setProducts(uniqueProducts);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = { ...formData };
            if (!payload.group_id) delete payload.group_id; // Allow null group

            if (editingProduct) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                const { error } = await supabase.from('products').insert(payload);
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
            sku: product.sku || '',
            name: product.name,
            description: product.description || '',
            sac_code: product.sac_code || '',
            hsn_code: product.hsn_code || '',
            unit: product.unit,
            group_id: product.group_id || '',
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
        setFormData({ sku: '', name: '', description: '', sac_code: '', hsn_code: '', unit: 'Nos', group_id: '' });
        setEditingProduct(null);
        setShowForm(false);
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    // Group products for UI by SKU prefix
    const groupedProducts = useMemo(() => {
        const map = new Map<string, Product[]>();
        
        products.forEach(p => {
            const skuParts = p.sku?.split('-') || [];
            const prefix = skuParts.length > 0 ? skuParts[0].toUpperCase() : '';
            
            let gName = 'General / Miscellaneous';
            if (prefix === 'PC') gName = 'Caps & Plugs';
            else if (prefix === 'SD') gName = 'Discs & Separators';
            else if (prefix === 'NB') gName = 'Nylon Bushes';
            else if (prefix === 'TW') gName = 'Thrust Washers';
            
            if (!map.has(gName)) map.set(gName, []);
            map.get(gName)!.push(p);
        });
        
        // Sort keys alphabetically but put General at the end
        const keys = Array.from(map.keys()).sort((a, b) => {
            if (a === 'General / Miscellaneous') return 1;
            if (b === 'General / Miscellaneous') return -1;
            return a.localeCompare(b);
        });

        return keys.map(k => ({ groupName: k, items: map.get(k)! }));
    }, [products]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Products Catalog</h1>
                    <p className="text-white/60 mt-1">Structured Master Inventory List</p>
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
                                <div className="col-span-2 md:col-span-1">
                                    <Input
                                        required
                                        placeholder="SKU (e.g., PC-DIA120) *"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 uppercase font-mono"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <Select
                                        value={formData.group_id}
                                        onValueChange={(val) => setFormData({ ...formData, group_id: val })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                                            <SelectValue placeholder="Select Group (Optional)" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                                            <SelectItem value="none" className="focus:bg-white/10 focus:text-white text-white/50">None</SelectItem>
                                            {groups.map((g) => (
                                                <SelectItem key={g.id} value={g.id} className="focus:bg-white/10 focus:text-white">
                                                    {g.group_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        required
                                        placeholder='Fractional Product Name (e.g. 3/4" S. S LANCE) *'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 font-mono"
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
                                    placeholder="Unit (e.g., Nos, Kg)"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
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

            <div className="space-y-4">
                {groupedProducts.map((group) => {
                    const isExpanded = expandedGroups[group.groupName];
                    return (
                        <Card key={group.groupName} className="glass-dark border-none shadow-xl overflow-hidden">
                            <div 
                                className="p-4 bg-white/5 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between"
                                onClick={() => toggleGroup(group.groupName)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-blue-400" />
                                    </div>
                                        <h3 className="text-lg font-bold text-white tracking-wide uppercase">
                                            {group.groupName} ({group.items.length} Items)
                                        </h3>
                                </div>
                                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-transparent pointer-events-none">
                                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </Button>
                            </div>

                            {isExpanded && (
                                <div className="bg-black/20 animate-in slide-in-from-top-2 duration-200">
                                    <Table>
                                        <TableHeader className="bg-transparent">
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="text-white/50 pl-6 w-[150px]">SKU</TableHead>
                                                <TableHead className="text-white/50">Fractional Name</TableHead>
                                                <TableHead className="text-white/50 hidden md:table-cell w-[120px]">HSN/SAC</TableHead>
                                                <TableHead className="text-white/50 hidden sm:table-cell w-[100px]">Unit</TableHead>
                                                <TableHead className="text-white/50 text-right pr-6 w-[100px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.items.map((product) => (
                                                <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                    <TableCell className="font-mono text-blue-300/90 pl-6 font-medium">
                                                        {product.sku}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-white/90">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <Package className="h-4 w-4 text-white/20 shrink-0" />
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-white/60 hidden md:table-cell font-mono text-sm">
                                                        {product.hsn_code || product.sac_code || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-white/60 hidden sm:table-cell">
                                                        {product.unit}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductManagement;
