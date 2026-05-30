import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Truck, CheckCircle2, GraduationCap, Check, ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DataFallback from "@/components/DataFallback";

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
    const [clientOpen, setClientOpen] = useState(false);
    const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({}); // product_id -> qty
    const [invalidItems, setInvalidItems] = useState<Record<string, boolean>>({});
    const [trainingMode, setTrainingMode] = useState<boolean>(false);

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

    // Fetch All Open Line Items for Client (Aggregated by Product)
    const { data: aggregatedProducts, isLoading: loadingProducts, isError: isProductsError, refetch: refetchProducts } = useQuery({
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

            if (poIds.length === 0) return [];

            const [poRes, productRes, clientProductRes] = await Promise.all([
                supabase.from('purchase_orders').select('id, created_at, po_number, client_id').in('id', poIds),
                supabase.from('products').select('id, unit_price').in('id', [...new Set(tracking.map(t => t.product_id))]),
                // Fallback: fetch ALL products for this client by name to resolve ₹0 prices
                supabase.from('products').select('name, unit_price').eq('client_id', selectedClient)
            ]);

            if (poRes.error) throw poRes.error;
            if (productRes.error) throw productRes.error;

            const poMap = new Map(poRes.data.map(po => [po.id, po]));
            // Primary price map: by product_id
            const priceMap = new Map(productRes.data.map(p => [p.id, p.unit_price]));
            // Fallback price map: by product name (from master catalog)
            const namePriceMap = new Map(
                (clientProductRes.data || []).map(p => [p.name.trim().toUpperCase(), p.unit_price])
            );

            // 3. Enrich and Group
            const enrichedTracking: TrackingItem[] = tracking.map(t => {
                const po = poMap.get(t.po_id);
                // Integrity Check: Warn if PO client doesn't match selected client
                if (po && po.client_id !== selectedClient) {
                    console.error(`PO ${po.po_number} belongs to client ${po.client_id}, expected ${selectedClient}`);
                }

                // Resolve price: primary by product_id, fallback by product name from master catalog
                const priceByid = priceMap.get(t.product_id);
                const priceByName = namePriceMap.get(t.product_name?.trim().toUpperCase());
                const resolvedPrice = (priceByid && priceByid > 0) ? priceByid : (priceByName || 0);

                return {
                    ...t,
                    po_number: po?.po_number || '',
                    po_date: po?.created_at || '',
                    unit_price: resolvedPrice
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
        // Allow empty string to clear input
        if (qtyStr === "") {
            setDispatchQuantities(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            // Clear invalid state if empty
            if (invalidItems[productId]) {
                setInvalidItems(prev => {
                    const newState = { ...prev };
                    delete newState[productId];
                    return newState;
                });
            }
            return;
        }

        const val = parseFloat(qtyStr);
        const qty = isNaN(val) ? 0 : val;

        // "Over-shipping" Check
        if (qty > totalRemaining) {
            toast.error(`Over-shipping Alert! You entered ${qty}, but only ${totalRemaining} are remaining.`, {
                style: { background: '#ef4444', color: 'white', border: 'none', fontSize: '16px' }
            });
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

            // 1. Get Client Details
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', selectedClient)
                .single();
            if (clientError) throw clientError;

            // 2. Generate Invoice Number
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
                toast.success("Training Invoice Generated! (Simulated).");
            } else {
                toast.success("Invoice Generated Successfully!");
            }
            // Reset
            setDispatchQuantities({});
            setInvalidItems({});
            queryClient.invalidateQueries({ queryKey: ['client_products'] });
            queryClient.invalidateQueries({ queryKey: ['view_po_tracking'] });
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
            toast.info("Please enter at least one quantity.");
            return;
        }

        if (Object.keys(invalidItems).length > 0) {
            toast.error("Please fix errors before proceeding.");
            return;
        }

        generateInvoice.mutate();
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl pb-32 animate-in fade-in duration-500">
            <Card className="border-none shadow-none bg-transparent mb-6">
                <CardHeader className="px-0 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl text-white">
                        <Truck className="h-6 w-6 text-blue-400" />
                        Dispatch
                    </CardTitle>
                    <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                        <GraduationCap className={`h-5 w-5 ${trainingMode ? 'text-amber-400' : 'text-white/40'}`} />
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
                        <Popover open={clientOpen} onOpenChange={setClientOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={clientOpen}
                                    className="w-full h-14 justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 text-lg"
                                >
                                    {selectedClient
                                        ? clients?.find((client) => client.id === selectedClient)?.name
                                        : "Search Client..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-white/10 text-white">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search client..." className="h-12 text-base text-white" />
                                    <CommandList>
                                        <CommandEmpty>No client found.</CommandEmpty>
                                        <CommandGroup>
                                            {clients?.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.name}
                                                    onSelect={() => {
                                                        setSelectedClient(client.id);
                                                        setDispatchQuantities({});
                                                        setClientOpen(false);
                                                    }}
                                                    className="text-lg py-3 aria-selected:bg-white/10 aria-selected:text-white"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4 text-blue-500",
                                                            selectedClient === client.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {client.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {isClientsError && (
                            <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                                <span>Failed to load clients.</span>
                                <Button variant="link" className="text-red-400 p-0 h-auto" onClick={() => refetchClients()}>Retry</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedClient && (
                <div className="space-y-4">
                    {isProductsError ? (
                        <DataFallback 
                            title="Failed to Load Product Data" 
                            message="We couldn't retrieve the products for this client. Please check your connection and try again."
                            onRetry={() => refetchProducts()} 
                            className="my-8"
                        />
                    ) : loadingProducts ? (
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
                                    <Card key={product.product_id} className={`glass-dark border-none shadow-lg transition-all duration-200 ${isInvalid ? 'ring-2 ring-red-500/50 bg-red-950/10' : 'bg-black/40'}`}>
                                        <CardContent className="p-5">
                                            <div className="flex flex-col gap-4">
                                                {/* Header & Status */}
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-bold text-white leading-tight">{product.product_name}</h3>
                                                    <div className="flex items-center flex-wrap gap-2 text-sm">
                                                        <span className="text-white/60">Ordered: <span className="text-white font-mono">{product.total_ordered}</span></span>
                                                        <span className="text-white/20">|</span>
                                                        <span className={`${product.total_remaining < 100 ? 'text-amber-400' : 'text-green-400'} font-bold`}>
                                                            Remaining: {product.total_remaining}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Input Area */}
                                                <div className="relative">
                                                    <Label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Dispatch Qty</Label>
                                                    <Input
                                                        type="number"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className={`h-16 text-2xl font-mono bg-black/40 border-white/10 text-white placeholder:text-white/10 focus:ring-blue-500/50 transition-all ${currentDispatch > 0 && !isInvalid ? 'border-green-500/50 bg-green-950/10' : ''}`}
                                                        placeholder="0"
                                                        min="0"
                                                        value={currentDispatch || ''}
                                                        onChange={(e) => handleQuantityChange(product.product_id, e.target.value, product.total_remaining)}
                                                    />
                                                    {currentDispatch > 0 && !isInvalid && (
                                                        <div className="absolute right-4 top-[38px] text-green-500 animate-in zoom-in spin-in-90 duration-300">
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </div>
                                                    )}
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
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-xl border-t border-white/10 z-[60] pb-safe">
                    <div className="container max-w-2xl mx-auto flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={() => {
                                setDispatchQuantities({});
                                setInvalidItems({});
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            className={`flex-[2] h-14 text-lg font-bold shadow-xl shadow-blue-500/20 ${trainingMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white disabled:opacity-50`}
                            onClick={handleGenerateClick}
                            disabled={generateInvoice.isPending}
                        >
                            {generateInvoice.isPending ? <Loader2 className="animate-spin mr-2" /> : <Truck className="mr-2" />}
                            {trainingMode ? 'Generate Simulated' : 'Generate Invoice'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
