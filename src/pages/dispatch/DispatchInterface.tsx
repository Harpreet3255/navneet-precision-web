import { useState, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Truck, CheckCircle2, ArrowLeft, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TrackingItem = {
    po_id: string;
    po_number: string;
    po_date: string; // from created_at of PO
    client_id: string;
    po_line_item_id: string;
    product_id: string;
    product_name: string;
    qty_ordered: number;
    qty_shipped: number;
    qty_remaining: number;
    unit_price: number;
};

type ProductAggregate = {
    product_id: string;
    product_name: string;
    total_ordered: number;
    total_remaining: number;
    tracking_items: TrackingItem[];
};

export default function DispatchInterface() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({}); // product_id -> qty
    const [invalidItems, setInvalidItems] = useState<Record<string, boolean>>({});
    const [trainingMode, setTrainingMode] = useState<boolean>(false);

    // Fetch Clients
    const { data: clients } = useQuery({
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

    // Fetch All Open Line Items for Client (Aggregated by Product)
    const { data: aggregatedProducts, isLoading: loadingProducts } = useQuery({
        queryKey: ['client_products', selectedClient],
        queryFn: async () => {
            if (!selectedClient) return [];

            // 1. Fetch from view_po_tracking for this client
            const { data: tracking, error: trackingError } = await supabase
                .from('view_po_tracking')
                .select('*')
                .eq('client_id', selectedClient)
                .gt('qty_remaining', 0); // Only fetch items with remaining qty

            if (trackingError) throw trackingError;

            // 2. Fetch PO details (date) and Line Item details (price)
            // We need prices and PO dates for FIFO
            const poIds = [...new Set(tracking.map(t => t.po_id))];
            const lineItemIds = tracking.map(t => t.po_line_item_id);

            if (poIds.length === 0) return [];

            const [poRes, productRes] = await Promise.all([
                supabase.from('purchase_orders').select('id, created_at, po_number, client_id').in('id', poIds),
                supabase.from('products').select('id, unit_price').in('id', [...new Set(tracking.map(t => t.product_id))])
            ]);

            if (poRes.error) throw poRes.error;
            if (productRes.error) throw productRes.error;

            const poMap = new Map(poRes.data.map(po => [po.id, po]));
            const priceMap = new Map(productRes.data.map(p => [p.id, p.unit_price]));

            // 3. Enrich and Group
            const enrichedTracking: TrackingItem[] = tracking.map(t => {
                const po = poMap.get(t.po_id);
                // Integrity Check: Warn if PO client doesn't match selected client (Shouldn't happen due to view filter)
                if (po && po.client_id !== selectedClient) {
                    console.error(`PO ${po.po_number} belongs to client ${po.client_id}, expected ${selectedClient}`);
                }

                return {
                    ...t,
                    po_number: po?.po_number || '',
                    po_date: po?.created_at || '',
                    unit_price: priceMap.get(t.product_id) || 0 // Use Product Price, NOT PO price
                }
            });

            // Group by Product
            const productsMap = new Map<string, ProductAggregate>();

            enrichedTracking.forEach(item => {
                const existing = productsMap.get(item.product_id);
                if (existing) {
                    existing.total_ordered += item.qty_ordered;
                    existing.total_remaining += item.qty_remaining;
                    existing.tracking_items.push(item);
                } else {
                    productsMap.set(item.product_id, {
                        product_id: item.product_id,
                        product_name: item.product_name,
                        total_ordered: item.qty_ordered,
                        total_remaining: item.qty_remaining,
                        tracking_items: [item]
                    });
                }
            });

            // Sort tracking items within each product by PO Date (FIFO)
            Array.from(productsMap.values()).forEach(prod => {
                prod.tracking_items.sort((a, b) => new Date(a.po_date).getTime() - new Date(b.po_date).getTime());
            });

            return Array.from(productsMap.values());
        },
        enabled: !!selectedClient
    });

    const handleQuantityChange = (productId: string, qtyStr: string, totalRemaining: number) => {
        const val = parseFloat(qtyStr);
        const qty = isNaN(val) ? 0 : val;

        // "Over-shipping" Check
        if (qty > totalRemaining) {
            toast.error(`You are sending ${qty} units, but they only have ${totalRemaining} left on order. Please check the count.`);
            setInvalidItems(prev => ({ ...prev, [productId]: true }));
        } else {
            setInvalidItems(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        }

        setDispatchQuantities(prev => ({
            ...prev,
            [productId]: qty
        }));
    };

    const generateInvoice = useMutation({
        mutationFn: async () => {
            if (!selectedClient) throw new Error("Missing client selection");

            // Filter items to dispatch
            const productsToDispatch = Object.entries(dispatchQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([prodId, qty]) => {
                    // Find product details for price/name
                    const prod = aggregatedProducts?.find(p => p.product_id === prodId);
                    // Use the price from the tracking item (assuming uniform price per product or picking one)
                    // Currently aggregatedProducts merges items, but unit_price was set from products table in Step 37 query.
                    // So all items for one product have same price.
                    return {
                        product_id: prodId,
                        product_name: prod?.product_name || 'Unknown Product',
                        quantity: qty,
                        unit_price: prod?.tracking_items[0]?.unit_price || 0
                    };
                });

            if (productsToDispatch.length === 0) throw new Error("Nothing to ship");

            // --- Training Mode Simulation ---
            if (trainingMode) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Fake network delay
                return { invoice_number: "TRAINING-MODE-001", id: "simulated" };
            }
            // --------------------------------

            // 1. Get Client Details (Need specific fields for RPC)
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', selectedClient)
                .single();
            if (clientError) throw clientError;

            // 2. Generate Invoice Number (Client-side generation preserved for FY logic)
            const getNextInvoiceNumber = async () => {
                const today = new Date();
                const month = today.getMonth(); // 0-11
                const year = today.getFullYear();
                const startYear = month >= 3 ? year : year - 1;
                const fyString = `${(startYear % 100)}-${(startYear + 1) % 100}`;
                const prefix = `NI/${fyString}/`;

                const { data: lastInvoice, error } = await supabase
                    .from('invoices')
                    .select('invoice_number')
                    .ilike('invoice_number', `${prefix}%`)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching last invoice:", error);
                }

                let nextSeq = 1;
                if (lastInvoice?.invoice_number) {
                    const parts = lastInvoice.invoice_number.split('/');
                    const lastSeq = parseInt(parts[parts.length - 1]);
                    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
                }
                return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
            };

            const invoiceNumber = await getNextInvoiceNumber();

            // 3. Call RPC for Transactional Execution
            const { data: rpcResult, error: rpcError } = await supabase.rpc('create_dispatch_invoice', {
                p_client_id: selectedClient,
                p_invoice_number: invoiceNumber,
                p_invoice_date: new Date().toISOString(),
                p_receiver_details: {
                    name: client.name,
                    address: client.address,
                    city: client.city,
                    state: client.state,
                    state_code: client.state_code,
                    gstin: client.gstin
                },
                p_dispatch_items: productsToDispatch
            });

            if (rpcError) throw rpcError;

            return rpcResult;
        },
        onSuccess: (data) => {
            if (trainingMode) {
                toast.success("Training Invoice Generated! The order list has been updated (Simulated).");
            } else {
                toast.success("Invoice Generated Successfully! System updated.");
            }
            // Reset
            setDispatchQuantities({});
            setInvalidItems({});
            queryClient.invalidateQueries({ queryKey: ['client_products'] });
            queryClient.invalidateQueries({ queryKey: ['view_po_tracking'] });
            // Only navigate if real mode
            if (!trainingMode) navigate('/admin/invoices');
        },
        onError: (error) => {
            console.error(error);
            toast.error(`Transaction Failed: ${error.message}`);
        }
    });

    const handleGenerateClick = () => {
        const totalQty = Object.values(dispatchQuantities).reduce((a, b) => a + b, 0);
        if (totalQty === 0) {
            toast.info("Please enter the quantity you are loading onto the truck today.");
            return;
        }

        if (Object.keys(invalidItems).length > 0) {
            toast.error("Please fix the errors before proceeding.");
            return;
        }

        generateInvoice.mutate();
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl pb-24 animate-in fade-in duration-500">
            <Card className="border-none shadow-none bg-transparent mb-6">
                <CardHeader className="px-0 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl text-white">
                        <Truck className="h-6 w-6 text-blue-400" />
                        Dispatch
                    </CardTitle>
                    <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                        <GraduationCap className={`h-5 w-5 ${trainingMode ? 'text-amber-400' : 'text-white/40'}`} />
                        <Label htmlFor="training-mode" className="text-white text-sm cursor-pointer">Training Mode</Label>
                        <Switch
                            id="training-mode"
                            checked={trainingMode}
                            onCheckedChange={setTrainingMode}
                            className="data-[state=checked]:bg-amber-500"
                        />
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-lg font-medium text-white/90">Select Client</Label>
                        <Select onValueChange={(val) => { setSelectedClient(val); setDispatchQuantities({}); }} value={selectedClient}>
                            <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 text-white shadow-sm hover:bg-white/10 transition-colors">
                                <SelectValue placeholder="Choose Client" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                                {clients?.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="text-lg py-3">
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedClient && (
                <div className="space-y-4">
                    {loadingProducts ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                        </div>
                    ) : aggregatedProducts?.length === 0 ? (
                        <div className="text-center p-8 text-white/60">
                            No open orders found for this client.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {aggregatedProducts?.map(product => {
                                const currentDispatch = dispatchQuantities[product.product_id] || 0;
                                const isInvalid = invalidItems[product.product_id];

                                return (
                                    <Card key={product.product_id} className={`glass-dark border-none shadow-lg ${isInvalid ? 'ring-2 ring-red-500/50' : ''}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-semibold text-white">{product.product_name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded text-sm font-medium">
                                                            {product.total_remaining} Remaining
                                                        </span>
                                                        <span className="text-white/40 text-sm">
                                                            (Across {product.tracking_items.length} POs)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-32">
                                                    <Label className="text-xs text-white/60 mb-1 block">Qty Today</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-12 text-lg bg-black/20 border-white/10 text-white"
                                                        placeholder="0"
                                                        min="0"
                                                        value={currentDispatch || ''}
                                                        onChange={(e) => handleQuantityChange(product.product_id, e.target.value, product.total_remaining)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {selectedClient && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50">
                    <div className="container max-w-2xl mx-auto">
                        <Button
                            className={`w-full h-14 text-lg font-semibold shadow-lg ${trainingMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white disabled:opacity-50`}
                            size="lg"
                            onClick={handleGenerateClick}
                            disabled={generateInvoice.isPending}
                        >
                            {generateInvoice.isPending ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                            {trainingMode ? 'Generate Training Invoice' : 'Generate Invoice'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
