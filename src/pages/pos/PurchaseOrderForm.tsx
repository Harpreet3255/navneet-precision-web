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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, Calendar, User, Hash, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataFallback from "@/components/DataFallback";
import { ProductCombobox } from "@/components/ProductCombobox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type POFormData = {
    client_id:  string;
    po_number:  string;
    po_date:    string;
    items: {
        product_id: string;
        quantity:   number;
        unit_price: number;
    }[];
};

export default function PurchaseOrderForm() {
    const navigate      = useNavigate();
    const queryClient   = useQueryClient();
    const [totalAmount, setTotalAmount] = useState(0);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<POFormData>({
        defaultValues: {
            po_date: new Date().toISOString().split('T')[0],
            items: [{ product_id: "", quantity: 1, unit_price: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems    = watch("items");
    const watchedClientId = watch("client_id");

    // ── Fetch Clients ────────────────────────────────────────────────────────
    const { data: clients, isError: isClientsError, refetch: refetchClients } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients').select('id, name').order('name');
            if (error) throw error;
            return data;
        },
    });

    // ── Fetch All Products (Master Catalog) ──────────────────────────────────
    const { data: allProducts = [], isError: isProductsError, refetch: refetchProducts } = useQuery({
        queryKey: ['products-catalog'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products').select('id, name, sku').order('name');
            if (error) throw error;
            // De-dupe by SKU
            return Array.from(new Map((data || []).map(p => [p.sku, p])).values());
        },
    });

    // ── Fetch Client Contract Pricing (scoped to selected client) ───────────
    const { data: clientPricingRows = [], isFetching: isPricingLoading } = useQuery({
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
        enabled: !!watchedClientId,
    });

    // Build contractMap: productId → custom_rate (only for this client)
    const contractMap: Record<string, number> = {};
    for (const row of clientPricingRows) {
        contractMap[row.product_id] = parseFloat(String(row.custom_rate)) || 0;
    }
    const contractCount = Object.keys(contractMap).length;

    // ── Total ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const total = watchedItems.reduce((sum, item) =>
            sum + (Number(item.quantity) * Number(item.unit_price)), 0);
        setTotalAmount(total);
    }, [watchedItems]);

    // Reset line-item product selections when client changes
    const handleClientChange = (clientId: string) => {
        setValue("client_id", clientId);
        fields.forEach((_, i) => {
            setValue(`items.${i}.product_id`, "");
            setValue(`items.${i}.unit_price`, 0);
        });
    };

    // ── Mutation ─────────────────────────────────────────────────────────────
    const createPO = useMutation({
        mutationFn: async (data: POFormData) => {
            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .insert({ client_id: data.client_id, po_number: data.po_number, po_date: data.po_date, status: 'open' })
                .select().single();
            if (poError) throw poError;

            const lineItems = data.items.map(item => ({
                po_id:      po.id,
                product_id: item.product_id,
                qty_ordered: item.quantity,
                unit_price:  item.unit_price,
            }));
            const { error: itemsError } = await supabase.from('po_line_items').insert(lineItems);
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
        },
    });

    const onSubmit = (data: POFormData) => createPO.mutate(data);

    return (
        <div className="max-w-5xl mx-auto pb-44 md:pb-32 animate-in fade-in duration-500">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Purchase Order</h1>
                    <p className="text-white/50 mt-1 text-sm">Select a client to scope the product catalog to their contract items</p>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* ── Order Details Card ── */}
                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Order Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Client */}
                        <div className="space-y-2">
                            <Label className="text-white/80 flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-blue-400" /> Client *
                            </Label>
                            <Select onValueChange={handleClientChange}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10 text-white">
                                    {clients?.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Contract count indicator */}
                            {watchedClientId && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    {isPricingLoading ? (
                                        <span className="text-white/30 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />Loading contracts…
                                        </span>
                                    ) : contractCount > 0 ? (
                                        <span className="text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {contractCount} contract{contractCount !== 1 ? 's' : ''} found for this client
                                        </span>
                                    ) : (
                                        <span className="text-amber-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            No contracts found — only master catalog available
                                        </span>
                                    )}
                                </div>
                            )}
                            {errors.client_id && <p className="text-red-400 text-xs">{errors.client_id.message}</p>}
                        </div>

                        {/* PO Number */}
                        <div className="space-y-2">
                            <Label className="text-white/80 flex items-center gap-2 text-sm">
                                <Hash className="h-4 w-4 text-blue-400" /> PO Number *
                            </Label>
                            <Input
                                {...register("po_number", { required: "PO Number is required" })}
                                className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50 placeholder:text-white/20"
                                placeholder="e.g. PO-2024-001"
                            />
                            {errors.po_number && <p className="text-red-400 text-xs">{errors.po_number.message}</p>}
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label className="text-white/80 flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-blue-400" /> Date *
                            </Label>
                            <Input
                                type="date"
                                {...register("po_date", { required: "Date is required" })}
                                className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50 [color-scheme:dark]"
                            />
                            {errors.po_date && <p className="text-red-400 text-xs">{errors.po_date.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Line Items Card ── */}
                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader className="border-b border-white/10 pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <Hash className="h-5 w-5 text-blue-400" />
                                Line Items
                            </CardTitle>
                            {!watchedClientId && (
                                <Badge className="bg-white/5 text-white/30 border border-white/10 text-xs">
                                    Select a client to enable product search
                                </Badge>
                            )}
                        </div>
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
                                    <TableHead className="text-white/50 pl-3">Product</TableHead>
                                    <TableHead className="text-white/50 hidden sm:table-cell w-[16%]">Qty</TableHead>
                                    <TableHead className="text-white/50 hidden sm:table-cell w-[18%]">Unit Price</TableHead>
                                    <TableHead className="text-white/50 text-right w-[18%] pr-2">Total</TableHead>
                                    <TableHead className="w-[8%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const itemTotal = (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0);
                                    const selectedProductId = watchedItems[index]?.product_id;
                                    const hasContract = selectedProductId ? selectedProductId in contractMap : false;

                                    return (
                                        <TableRow key={field.id} className="border-white/5 hover:bg-white/[0.03] transition-colors align-top">
                                            {/* Product cell — full row on mobile, 44% on desktop */}
                                            <TableCell className="p-2 sm:p-3">
                                                <ProductCombobox
                                                    index={index}
                                                    clientId={watchedClientId || null}
                                                    allProducts={allProducts}
                                                    contractMap={contractMap}
                                                    value={watchedItems[index]?.product_id || ""}
                                                    disabled={!watchedClientId}
                                                    onSelect={(productId, rate) => {
                                                        setValue(`items.${index}.product_id`, productId);
                                                        if (rate !== null) {
                                                            setValue(`items.${index}.unit_price`, rate);
                                                        } else {
                                                            setValue(`items.${index}.unit_price`, 0);
                                                            toast.warning("No contract price — defaulted to ₹0. Please enter rate manually.");
                                                        }
                                                    }}
                                                />
                                                {selectedProductId && !hasContract && (
                                                    <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> No contract — rate set manually
                                                    </p>
                                                )}
                                                {/* Mobile-only inline qty + price row */}
                                                <div className="flex sm:hidden items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1 flex-1">
                                                        <span className="text-white/30 text-xs w-6 shrink-0">Qty</span>
                                                        <Input
                                                            type="number"
                                                            {...register(`items.${index}.quantity` as const)}
                                                            className="bg-white/5 border-white/10 text-white h-8 focus:ring-blue-500/50 text-center text-sm w-16"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-1">
                                                        <span className="text-white/30 text-xs shrink-0">₹</span>
                                                        <Input
                                                            type="number"
                                                            {...register(`items.${index}.unit_price` as const)}
                                                            className="bg-white/5 border-white/10 text-white h-8 focus:ring-blue-500/50 text-sm flex-1"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {/* Desktop-only qty + price columns */}
                                            <TableCell className="hidden sm:table-cell p-3">
                                                <Input
                                                    type="number"
                                                    {...register(`items.${index}.quantity` as const)}
                                                    className="bg-white/5 border-white/10 text-white h-10 focus:ring-blue-500/50 text-center"
                                                    min="1"
                                                />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell p-3">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-white/30 text-sm">₹</span>
                                                    <Input
                                                        type="number"
                                                        {...register(`items.${index}.unit_price` as const)}
                                                        className="pl-7 bg-white/5 border-white/10 text-white h-10 focus:ring-blue-500/50"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono p-2 sm:p-3 whitespace-nowrap align-top pt-3">
                                                <span className={itemTotal > 0 ? "text-green-400 text-sm" : "text-white/30 text-sm"}>
                                                    ₹{itemTotal.toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-2 sm:p-3 text-right align-top">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                    className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
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

            {/* ── Sticky Footer ── */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-3 md:p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 z-[60]">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-white/50 text-sm">Order Total</span>
                        <div className="text-2xl font-bold text-white flex items-center gap-1">
                            <IndianRupee className="h-5 w-5 text-green-400" />
                            <span className={totalAmount > 0 ? "text-green-400" : "text-white/30"}>
                                {totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/dashboard')}
                            className="border-white/10 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={createPO.isPending || !watchedClientId}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 px-8 disabled:opacity-50"
                        >
                            {createPO.isPending
                                ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Creating…</>
                                : <><Plus className="mr-2 h-4 w-4" />Create Order</>
                            }
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
