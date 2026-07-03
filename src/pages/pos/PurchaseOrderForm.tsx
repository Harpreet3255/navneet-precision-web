import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, Calendar, User, Hash, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataFallback from "@/components/DataFallback";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type POFormData = {
    client_id: string;
    po_number: string;
    po_date: string;
    items: {
        product_id: string;
        quantity: number;
        unit_price: number;
    }[];
};

export default function PurchaseOrderForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [totalAmount, setTotalAmount] = useState(0);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<POFormData>({
        defaultValues: {
            po_date: new Date().toISOString().split('T')[0],
            items: [{ product_id: "", quantity: 1, unit_price: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchedItems = watch("items");

    // Fetch Clients
    const { data: clients, isError: isClientsError, refetch: refetchClients } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name')
                .order('name');
            if (error) throw error;
            return data;
        }
    });

    // Fetch Products (Universal Catalog)
    const { data: products, isError: isProductsError, refetch: refetchProducts } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku')
                .order('name');
            if (error) throw error;
            // Eliminate duplicates by SKU
            return Array.from(new Map((data || []).map(p => [p.sku, p])).values());
        }
    });

    const watchedClientId = watch("client_id");

    // Fetch Client Pricing Matrix
    const { data: pricingItems } = useQuery({
        queryKey: ['client_pricing', watchedClientId],
        queryFn: async () => {
            if (!watchedClientId) return [];
            const { data, error } = await supabase
                .from('client_pricing')
                .select('product_id, custom_rate')
                .eq('client_id', watchedClientId);
            if (error) throw error;
            return data;
        },
        enabled: !!watchedClientId
    });

    // Calculate Total Real-time
    useEffect(() => {
        const total = watchedItems.reduce((sum, item) => {
            return sum + (Number(item.quantity) * Number(item.unit_price));
        }, 0);
        setTotalAmount(total);
    }, [watchedItems]);

    const createPO = useMutation({
        mutationFn: async (data: POFormData) => {
            // 1. Create PO
            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .insert({
                    client_id: data.client_id,
                    po_number: data.po_number,
                    po_date: data.po_date,
                    status: 'open'
                })
                .select()
                .single();

            if (poError) throw poError;

            // 2. Create PO Line Items
            const lineItems = data.items.map(item => ({
                po_id: po.id,
                product_id: item.product_id,
                qty_ordered: item.quantity, // Corrected field name
                unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
                .from('po_line_items')
                .insert(lineItems);

            if (itemsError) throw itemsError;

            return po;
        },
        onSuccess: () => {
            toast.success("Purchase Order created successfully!");
            queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
            navigate('/admin/dispatch');
        },
        onError: (error: any) => {
            if (error.code === '23505') {
                toast.error("A Purchase Order with this number already exists.");
            } else {
                toast.error(`Failed to create PO: ${error.message}`);
            }
        }
    });

    const onSubmit = (data: POFormData) => {
        createPO.mutate(data);
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Purchase Order</h1>
                    <p className="text-white/60 mt-1">Record a new customer order</p>
                </div>
            </div>

            {(isClientsError || isProductsError) && (
                <DataFallback 
                    title="Failed to Load Data" 
                    message="Unable to retrieve clients or products required for this form."
                    onRetry={() => { refetchClients(); refetchProducts(); }}
                    className="mb-8"
                />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* PO Details Card */}
                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Order Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white/90 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" /> Client
                            </Label>
                            <Select onValueChange={(val) => setValue("client_id", val)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10 text-white">
                                    {clients?.map(client => (
                                        <SelectItem key={client.id} value={client.id} className="focus:bg-white/10 focus:text-white">
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.client_id && <p className="text-red-400 text-sm">{errors.client_id.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/90 flex items-center gap-2">
                                <Hash className="h-4 w-4 text-blue-400" /> PO Number
                            </Label>
                            <Input
                                {...register("po_number", { required: "PO Number is required" })}
                                className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50 placeholder:text-white/20"
                                placeholder="e.g. PO-2024-001"
                            />
                            {errors.po_number && <p className="text-red-400 text-sm">{errors.po_number.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/90 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-400" /> Date
                            </Label>
                            <Input
                                type="date"
                                {...register("po_date", { required: "Date is required" })}
                                className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50 [color-scheme:dark]"
                            />
                            {errors.po_date && <p className="text-red-400 text-sm">{errors.po_date.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Line Items Card */}
                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader className="border-b border-white/10 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                            <Hash className="h-5 w-5 text-blue-400" />
                            Line Items
                        </CardTitle>
                        <Button
                            type="button"
                            onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
                            variant="outline"
                            size="sm"
                            className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/70 w-[40%]">Product</TableHead>
                                    <TableHead className="text-white/70 w-[20%]">Quantity</TableHead>
                                    <TableHead className="text-white/70 w-[20%]">Unit Price</TableHead>
                                    <TableHead className="text-white/70 w-[10%] text-right">Total</TableHead>
                                    <TableHead className="w-[10%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const itemTotal = (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0);
                                    return (
                                        <TableRow key={field.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="p-4">
                                                <Select
                                                    onValueChange={(val) => {
                                                        setValue(`items.${index}.product_id`, val);
                                                        const pricing = pricingItems?.find((p: any) => p.product_id === val);
                                                        if (pricing) {
                                                            setValue(`items.${index}.unit_price`, pricing.custom_rate);
                                                        } else {
                                                            setValue(`items.${index}.unit_price`, 0);
                                                            toast.warning("No contract price found for this product. Defaulted to ₹0.00. Flagged for review.");
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 focus:ring-blue-500/50">
                                                        <SelectValue placeholder="Select Product" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                                        {products?.map((product: any) => (
                                                            <SelectItem key={product.id} value={product.id} className="focus:bg-white/10 focus:text-white">
                                                                [{product.sku}] {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <Input
                                                    type="number"
                                                    {...register(`items.${index}.quantity` as const)}
                                                    className="bg-white/5 border-white/10 text-white h-10 focus:ring-blue-500/50"
                                                    min="1"
                                                />
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-white/40">₹</span>
                                                    <Input
                                                        type="number"
                                                        {...register(`items.${index}.unit_price` as const)}
                                                        className="pl-7 bg-white/5 border-white/10 text-white h-10 focus:ring-blue-500/50"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-white p-4">
                                                ₹{itemTotal.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="p-4 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </form>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-64 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-white/60">Total Amount:</div>
                        <div className="text-2xl font-bold text-white flex items-center">
                            <DollarSign className="h-6 w-6 text-green-400 mr-1" />
                            ₹{totalAmount.toFixed(2)}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="border-white/10 text-white hover:bg-white/10">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={createPO.isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 px-8"
                        >
                            {createPO.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                            Create Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
