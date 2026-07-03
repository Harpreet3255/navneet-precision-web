import { useState } from "react";
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
import { Loader2, Truck, CheckCircle2, GraduationCap, Check, ChevronsUpDown, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DataFallback from "@/components/DataFallback";

export default function DispatchInterface() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedPO, setSelectedPO] = useState<string>("");
    const [poOpen, setPoOpen] = useState(false);
    const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({}); // po_line_item_id -> qty
    const [invalidItems, setInvalidItems] = useState<Record<string, boolean>>({});
    const [trainingMode, setTrainingMode] = useState<boolean>(false);

    // Fetch Open POs
    const { data: purchaseOrders, isError: isPOError, refetch: refetchPOs } = useQuery({
        queryKey: ['open_pos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select('id, po_number, created_at, client:clients(id, name, address, city, state, state_code, gstin)')
                .eq('status', 'open')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const activePOData = purchaseOrders?.find(po => po.id === selectedPO);

    // Fetch Line Items for selected PO
    const { data: lineItems, isLoading: loadingItems, isError: isItemsError, refetch: refetchItems } = useQuery({
        queryKey: ['po_line_items', selectedPO],
        queryFn: async () => {
            if (!selectedPO) return [];

            const { data, error } = await supabase
                .from('po_line_items')
                .select(`
                    id,
                    qty_ordered,
                    unit_price,
                    product:products(id, name, sku),
                    invoice_items(quantity)
                `)
                .eq('po_id', selectedPO);

            if (error) throw error;

            return data.map((item: any) => {
                const qtyShipped = item.invoice_items?.reduce((sum: number, ii: any) => sum + (ii.quantity || 0), 0) || 0;
                return {
                    id: item.id,
                    product_id: item.product?.id,
                    product_name: item.product?.name,
                    sku: item.product?.sku,
                    qty_ordered: item.qty_ordered,
                    unit_price: item.unit_price,
                    qty_shipped: qtyShipped,
                    qty_remaining: item.qty_ordered - qtyShipped
                };
            }).filter(item => item.qty_remaining > 0);
        },
        enabled: !!selectedPO
    });

    const handleQuantityChange = (lineItemId: string, qtyStr: string, totalRemaining: number) => {
        if (qtyStr === "") {
            setDispatchQuantities(prev => {
                const newState = { ...prev };
                delete newState[lineItemId];
                return newState;
            });
            if (invalidItems[lineItemId]) {
                setInvalidItems(prev => {
                    const newState = { ...prev };
                    delete newState[lineItemId];
                    return newState;
                });
            }
            return;
        }

        const val = parseFloat(qtyStr);
        const qty = isNaN(val) ? 0 : val;

        if (qty > totalRemaining) {
            toast.error(`Over-shipping Alert! You entered ${qty}, but only ${totalRemaining} are remaining.`, {
                style: { background: '#ef4444', color: 'white', border: 'none', fontSize: '16px' }
            });
            setInvalidItems(prev => ({ ...prev, [lineItemId]: true }));
        } else {
            setInvalidItems(prev => {
                const newState = { ...prev };
                delete newState[lineItemId];
                return newState;
            });
        }

        setDispatchQuantities(prev => ({
            ...prev,
            [lineItemId]: qty
        }));
    };

    const generateInvoice = useMutation({
        mutationFn: async () => {
            if (!selectedPO || !activePOData) throw new Error("Missing PO selection");

            const itemsToDispatch = Object.entries(dispatchQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([lineItemId, qty]) => {
                    const line = lineItems?.find(l => l.id === lineItemId);
                    if (!line) throw new Error("Line item not found");
                    return {
                        ...line,
                        dispatch_qty: qty
                    };
                });

            if (itemsToDispatch.length === 0) throw new Error("Nothing to ship");

            if (trainingMode) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                return { invoice_number: "TRAINING-MODE-001", id: "simulated" };
            }

            const clientInfo: any = activePOData.client;

            // Generate Invoice Number
            const getNextInvoiceNumber = async () => {
                const today = new Date();
                const month = today.getMonth();
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

            // Insert Invoice Header
            const { data: newInvoice, error: invError } = await supabase.from('invoices').insert({
                invoice_number: invoiceNumber,
                invoice_date: new Date().toISOString(),
                client_id: clientInfo.id,
                receiver_name: clientInfo.name,
                receiver_address: clientInfo.address,
                receiver_city: clientInfo.city,
                receiver_state: clientInfo.state,
                receiver_state_code: clientInfo.state_code,
                receiver_gstin: clientInfo.gstin,
                status: 'draft',
                subtotal: 0,
                cgst_amount: 0,
                sgst_amount: 0,
                igst_amount: 0,
                total_amount: 0
            }).select('id').single();

            if (invError) throw invError;

            let subtotal = 0;
            let cgst = 0;
            let sgst = 0;
            let igst = 0;
            let totalAmount = 0;

            const invoiceItemsToInsert = itemsToDispatch.map(item => {
                const taxableVal = item.dispatch_qty * item.unit_price;
                
                let lineCgst = 0;
                let lineSgst = 0;
                let lineIgst = 0;

                // Rule: If state_code is '20' (Jharkhand), assume intra-state (CGST+SGST). Else Inter-state (IGST).
                if (clientInfo.state_code === '20') {
                    lineCgst = taxableVal * 0.09;
                    lineSgst = taxableVal * 0.09;
                } else {
                    lineIgst = taxableVal * 0.18;
                }

                const lineTotal = taxableVal + lineCgst + lineSgst + lineIgst;

                subtotal += taxableVal;
                cgst += lineCgst;
                sgst += lineSgst;
                igst += lineIgst;
                totalAmount += lineTotal;

                return {
                    invoice_id: newInvoice.id,
                    product_id: item.product_id,
                    po_line_item_id: item.id,
                    description: item.product_name,
                    quantity: item.dispatch_qty,
                    unit: 'Nos',
                    rate: item.unit_price,
                    taxable_value: taxableVal,
                    cgst_amount: lineCgst,
                    sgst_amount: lineSgst,
                    igst_amount: lineIgst,
                    total: lineTotal
                };
            });

            // Insert Invoice Items
            const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItemsToInsert);
            if (itemsError) throw itemsError;

            // Update Invoice Totals
            const { error: updateError } = await supabase.from('invoices').update({
                subtotal,
                cgst_amount: cgst,
                sgst_amount: sgst,
                igst_amount: igst,
                total_amount: totalAmount
            }).eq('id', newInvoice.id);

            if (updateError) throw updateError;

            return { id: newInvoice.id, invoice_number: invoiceNumber };
        },
        onSuccess: () => {
            if (trainingMode) {
                toast.success("Training Invoice Generated! (Simulated).");
            } else {
                toast.success("Invoice Generated Successfully!");
            }
            setDispatchQuantities({});
            setInvalidItems({});
            queryClient.invalidateQueries({ queryKey: ['po_line_items'] });
            queryClient.invalidateQueries({ queryKey: ['open_pos'] });
            if (!trainingMode) navigate('/admin/invoices');
        },
        onError: (error: any) => {
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
                        Dispatch Goods
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
                        <Label className="text-lg font-medium text-white/90">Select Purchase Order</Label>
                        <Popover open={poOpen} onOpenChange={setPoOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={poOpen}
                                    className="w-full h-14 justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 text-lg"
                                >
                                    {selectedPO && activePOData
                                        ? `${activePOData.po_number} - ${activePOData.client?.name}`
                                        : "Select active PO..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-white/10 text-white">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search PO number or client..." className="h-12 text-base text-white" />
                                    <CommandList>
                                        <CommandEmpty>No open PO found.</CommandEmpty>
                                        <CommandGroup>
                                            {purchaseOrders?.map((po) => (
                                                <CommandItem
                                                    key={po.id}
                                                    value={`${po.po_number} ${po.client?.name}`}
                                                    onSelect={() => {
                                                        setSelectedPO(po.id);
                                                        setDispatchQuantities({});
                                                        setPoOpen(false);
                                                    }}
                                                    className="text-base py-3 aria-selected:bg-white/10 aria-selected:text-white"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4 text-blue-500",
                                                            selectedPO === po.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-blue-300">{po.po_number}</span>
                                                        <span className="text-sm text-white/70">{po.client?.name}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {isPOError && (
                            <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                                <span>Failed to load purchase orders.</span>
                                <Button variant="link" className="text-red-400 p-0 h-auto" onClick={() => refetchPOs()}>Retry</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedPO && (
                <div className="space-y-4">
                    {isItemsError ? (
                        <DataFallback 
                            title="Failed to Load PO Items" 
                            message="We couldn't retrieve the line items for this PO."
                            onRetry={() => refetchItems()} 
                            className="my-8"
                        />
                    ) : loadingItems ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                        </div>
                    ) : lineItems?.length === 0 ? (
                        <div className="text-center p-8 text-white/60">
                            No remaining items to dispatch for this PO.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {lineItems?.map(item => {
                                const currentDispatch = dispatchQuantities[item.id] || 0;
                                const isInvalid = invalidItems[item.id];

                                return (
                                    <Card key={item.id} className={`glass-dark border-none shadow-lg transition-all duration-200 ${isInvalid ? 'ring-2 ring-red-500/50 bg-red-950/10' : 'bg-black/40'}`}>
                                        <CardContent className="p-5">
                                            <div className="flex flex-col gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-white/90">[{item.sku || 'N/A'}]</span>
                                                        <h3 className="text-xl text-white/70 leading-tight mt-1">{item.product_name}</h3>
                                                    </div>
                                                    <div className="flex items-center flex-wrap gap-2 text-sm mt-2">
                                                        <span className="text-white/60">Ordered: <span className="text-white font-mono">{item.qty_ordered}</span></span>
                                                        <span className="text-white/20">|</span>
                                                        <span className={`${item.qty_remaining < 100 ? 'text-amber-400' : 'text-green-400'} font-bold`}>
                                                            Remaining: {item.qty_remaining}
                                                        </span>
                                                        <span className="text-white/20">|</span>
                                                        <span className="text-blue-400 font-mono">₹{item.unit_price}</span>
                                                    </div>
                                                </div>

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
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value, item.qty_remaining)}
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

            {selectedPO && (
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
                            {trainingMode ? 'Generate Simulated' : 'Confirm Dispatch'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
