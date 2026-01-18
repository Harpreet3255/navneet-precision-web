import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Loader2, Truck, CheckCircle2, ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

type POTrackingItem = {
    po_id: string;
    po_number: string;
    client_id: string;
    client_name: string;
    po_line_item_id: string;
    product_id: string;
    product_name: string;
    qty_ordered: number;
    qty_shipped: number;
    qty_remaining: number;
    unit_price: number;
};

export default function DispatchInterface() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedPO, setSelectedPO] = useState<string>("");
    const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({});

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

    // Fetch Open POs for Client
    const { data: openPOs } = useQuery({
        queryKey: ['open_pos', selectedClient],
        queryFn: async () => {
            if (!selectedClient) return [];
            const { data, error } = await supabase
                .from('purchase_orders')
                .select('id, po_number')
                .eq('client_id', selectedClient)
                .eq('status', 'open');
            if (error) throw error;
            return data;
        },
        enabled: !!selectedClient
    });

    // Fetch PO Items with Tracking
    const { data: poItems, isLoading: loadingItems } = useQuery({
        queryKey: ['po_items', selectedPO],
        queryFn: async () => {
            if (!selectedPO) return [];

            // Fetch from view
            const { data: trackingData, error: trackingError } = await supabase
                .from('view_po_tracking')
                .select('*')
                .eq('po_id', selectedPO);

            if (trackingError) throw trackingError;

            // We also need unit_price, which might not be in the view.
            // Let's fetch line items to get price.
            const { data: lineItems, error: lineItemsError } = await supabase
                .from('po_line_items')
                .select('id, unit_price')
                .eq('po_id', selectedPO);

            if (lineItemsError) throw lineItemsError;

            // Merge price into tracking data
            return trackingData.map(item => {
                const lineItem = lineItems.find(li => li.id === item.po_line_item_id);
                return {
                    ...item,
                    unit_price: lineItem?.unit_price || 0
                };
            });
        },
        enabled: !!selectedPO
    });

    const generateInvoice = useMutation({
        mutationFn: async () => {
            if (!selectedPO || !selectedClient) throw new Error("Missing selection");

            // 1. Get Client Details for Invoice
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', selectedClient)
                .single();

            if (clientError) throw clientError;

            // 2. Create Invoice
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    invoice_number: invoiceNumber,
                    client_id: selectedClient,
                    receiver_name: client.name,
                    receiver_address: client.address,
                    receiver_city: client.city,
                    receiver_state: client.state,
                    receiver_state_code: client.state_code,
                    receiver_gstin: client.gstin,
                    status: 'draft',
                    po_id: selectedPO
                })
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // 3. Create Invoice Items
            const itemsToInsert = Object.entries(dispatchQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([lineItemId, qty]) => {
                    const item = poItems?.find(i => i.po_line_item_id === lineItemId);
                    if (!item) throw new Error("Item not found");

                    return {
                        invoice_id: invoice.id,
                        product_id: item.product_id,
                        description: item.product_name,
                        quantity: qty,
                        rate: item.unit_price,
                        po_line_item_id: lineItemId
                    };
                });

            if (itemsToInsert.length === 0) throw new Error("No items to ship");

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            return invoice;
        },
        onSuccess: () => {
            toast.success("Invoice generated successfully!");
            setStep(1);
            setSelectedPO("");
            setDispatchQuantities({});
            queryClient.invalidateQueries({ queryKey: ['view_po_tracking'] });
            navigate('/admin/invoices');
        },
        onError: (error) => {
            toast.error(`Failed to generate invoice: ${error.message}`);
        }
    });

    const handleQuantityChange = (lineItemId: string, qty: string) => {
        const val = parseFloat(qty);
        setDispatchQuantities(prev => ({
            ...prev,
            [lineItemId]: isNaN(val) ? 0 : val
        }));
    };

    return (
        <div className="container mx-auto p-4 max-w-md pb-24 animate-in fade-in duration-500">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl text-white">
                        {step === 2 && (
                            <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="-ml-2 text-white hover:text-white/80 hover:bg-white/10">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                        )}
                        <Truck className="h-6 w-6 text-blue-400" />
                        Dispatch
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-white/90">Select Client</Label>
                                <Select onValueChange={setSelectedClient} value={selectedClient}>
                                    <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 text-white shadow-sm hover:bg-white/10 transition-colors">
                                        <SelectValue placeholder="Choose Client" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                        {clients?.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="text-lg py-3 focus:bg-white/10 focus:text-white">
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedClient && (
                                <div className="space-y-2">
                                    <Label className="text-lg font-medium text-white/90">Select Purchase Order</Label>
                                    <Select
                                        onValueChange={(val) => {
                                            setSelectedPO(val);
                                            setStep(2);
                                        }}
                                        value={selectedPO}
                                    >
                                        <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 text-white shadow-sm hover:bg-white/10 transition-colors">
                                            <SelectValue placeholder="Choose PO" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                                            {openPOs?.map(po => (
                                                <SelectItem key={po.id} value={po.id} className="text-lg py-3 focus:bg-white/10 focus:text-white">
                                                    {po.po_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            {loadingItems ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {poItems?.map(item => {
                                        const progress = item.qty_ordered > 0 ? (item.qty_shipped / item.qty_ordered) * 100 : 0;
                                        return (
                                            <div key={item.po_line_item_id} className="glass-dark rounded-xl p-4 space-y-4 border border-white/10">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-lg text-white">{item.product_name}</h4>
                                                        <p className="text-sm text-white/60">Ordered: {item.qty_ordered}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/20">
                                                            {item.qty_remaining} Left
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-white/60">
                                                        <span>Progress</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2 bg-white/10" indicatorClassName="bg-blue-500" />
                                                </div>

                                                <div className="pt-2">
                                                    <Label htmlFor={`qty-${item.po_line_item_id}`} className="text-sm font-medium mb-1.5 block text-white/90">
                                                        Ship Quantity
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id={`qty-${item.po_line_item_id}`}
                                                            type="number"
                                                            className="h-12 text-lg font-medium bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                                            placeholder="0"
                                                            max={item.qty_remaining}
                                                            onChange={(e) => handleQuantityChange(item.po_line_item_id, e.target.value)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="h-12 px-4 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                                            onClick={() => {
                                                                const input = document.getElementById(`qty-${item.po_line_item_id}`) as HTMLInputElement;
                                                                if (input) {
                                                                    input.value = item.qty_remaining.toString();
                                                                    handleQuantityChange(item.po_line_item_id, item.qty_remaining.toString());
                                                                }
                                                            }}
                                                        >
                                                            Max
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {step === 2 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50">
                    <div className="container max-w-md mx-auto">
                        <Button
                            className="w-full h-14 text-lg font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 text-white"
                            size="lg"
                            onClick={() => generateInvoice.mutate()}
                            disabled={generateInvoice.isPending || Object.values(dispatchQuantities).every(q => q <= 0)}
                        >
                            {generateInvoice.isPending ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                            Generate Invoice
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
