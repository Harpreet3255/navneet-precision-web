import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save, FileText, User, MapPin, Truck } from 'lucide-react';
import { supabase, type Client, type Product, type InvoiceItem } from '@/lib/supabase';
import { calculateItemTax, calculateInvoiceTotals, generateInvoiceNumber } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type InvoiceFormData = {
    invoice_number: string;
    invoice_date: string;
    client_id: string;
    receiver_name: string;
    receiver_address: string;
    receiver_city: string;
    receiver_state: string;
    receiver_state_code: string;
    receiver_gstin: string;
    consignee_name: string;
    consignee_address: string;
    consignee_city: string;
    consignee_state: string;
    consignee_state_code: string;
    consignee_gstin: string;
    supplier: string;
    transportation_charges: number;
    notes: string;
    status: 'draft' | 'finalized';
    items: Array<{
        product_id: string;
        description: string;
        sac_code: string;
        hsn_code: string;
        quantity: number;
        unit: string;
        rate: number;
    }>;
};

const NAVNEET_STATE_CODE = '20'; // Jharkhand

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, control, watch, setValue, handleSubmit, reset } = useForm<InvoiceFormData>({
        defaultValues: {
            invoice_date: new Date().toISOString().split('T')[0],
            status: 'draft',
            transportation_charges: 0,
            items: [{ product_id: '', description: '', sac_code: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = watch('items');
    const watchClientId = watch('client_id');
    const watchReceiverStateCode = watch('receiver_state_code');
    const watchTransportationCharges = watch('transportation_charges') || 0;

    useEffect(() => {
        fetchClients();
        fetchProducts();
        if (!id) generateNextInvoiceNumber();
        else loadInvoice();
    }, [id]);

    useEffect(() => {
        if (watchClientId) {
            const client = clients.find((c) => c.id === watchClientId);
            if (client) {
                setValue('receiver_name', client.name);
                setValue('receiver_address', client.address || '');
                setValue('receiver_city', client.city || '');
                setValue('receiver_state', client.state || '');
                setValue('receiver_state_code', client.state_code || '');
                setValue('receiver_gstin', client.gstin || '');

                // Also populate consignee with same details
                setValue('consignee_name', client.name);
                setValue('consignee_address', client.address || '');
                setValue('consignee_city', client.city || '');
                setValue('consignee_state', client.state || '');
                setValue('consignee_state_code', client.state_code || '');
                setValue('consignee_gstin', client.gstin || '');
            }
        }
    }, [watchClientId, clients]);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*').order('name');
        setClients(data || []);
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('name');
        setProducts(data || []);
    };

    const generateNextInvoiceNumber = async () => {
        const { data } = await supabase
            .from('invoices')
            .select('invoice_number')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const nextNumber = generateInvoiceNumber(data?.invoice_number || null);
        setValue('invoice_number', nextNumber);
    };

    const loadInvoice = async () => {
        if (!id) return;
        const { data } = await supabase
            .from('invoices')
            .select('*, invoice_items(*)')
            .eq('id', id)
            .single();

        if (data) {
            reset({
                ...data,
                invoice_date: data.invoice_date,
                items: data.invoice_items.map((item: InvoiceItem) => ({
                    product_id: item.product_id || '',
                    description: item.description,
                    sac_code: item.sac_code || '',
                    hsn_code: item.hsn_code || '',
                    quantity: item.quantity,
                    unit: item.unit,
                    rate: item.rate,
                })),
            });
        }
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            setValue(`items.${index}.product_id`, productId);
            setValue(`items.${index}.description`, product.name);
            setValue(`items.${index}.sac_code`, product.sac_code || '');
            setValue(`items.${index}.hsn_code`, product.hsn_code || '');
            setValue(`items.${index}.unit`, product.unit);
            setValue(`items.${index}.rate`, product.unit_price);
        }
    };

    const calculateTotals = () => {
        const receiverStateCode = watchReceiverStateCode || NAVNEET_STATE_CODE;

        const itemsWithTax = watchItems.map((item) =>
            calculateItemTax(item.quantity, item.rate, NAVNEET_STATE_CODE, receiverStateCode)
        );

        return calculateInvoiceTotals(itemsWithTax, watchTransportationCharges);
    };

    const totals = calculateTotals();

    const onSubmit = async (data: InvoiceFormData) => {
        setLoading(true);
        try {
            const receiverStateCode = data.receiver_state_code || NAVNEET_STATE_CODE;

            const invoiceData = {
                invoice_number: data.invoice_number,
                invoice_date: data.invoice_date,
                client_id: data.client_id || null,
                receiver_name: data.receiver_name,
                receiver_address: data.receiver_address,
                receiver_city: data.receiver_city,
                receiver_state: data.receiver_state,
                receiver_state_code: data.receiver_state_code,
                receiver_gstin: data.receiver_gstin,
                consignee_name: data.consignee_name,
                consignee_address: data.consignee_address,
                consignee_city: data.consignee_city,
                consignee_state: data.consignee_state,
                consignee_state_code: data.consignee_state_code,
                consignee_gstin: data.consignee_gstin,
                supplier: data.supplier,
                transportation_charges: data.transportation_charges,
                subtotal: totals.subtotal,
                cgst_amount: totals.cgst_amount,
                sgst_amount: totals.sgst_amount,
                igst_amount: totals.igst_amount,
                total_amount: totals.total_amount,
                notes: data.notes,
                status: data.status,
            };

            let invoiceId = id;

            if (id) {
                await supabase.from('invoices').update(invoiceData).eq('id', id);
                await supabase.from('invoice_items').delete().eq('invoice_id', id);
            } else {
                const { data: newInvoice } = await supabase
                    .from('invoices')
                    .insert(invoiceData)
                    .select()
                    .single();
                invoiceId = newInvoice.id;
            }

            // Insert invoice items
            const itemsData = data.items.map((item) => {
                const tax = calculateItemTax(item.quantity, item.rate, NAVNEET_STATE_CODE, receiverStateCode);
                return {
                    invoice_id: invoiceId,
                    product_id: item.product_id || null,
                    description: item.description,
                    sac_code: item.sac_code,
                    hsn_code: item.hsn_code,
                    quantity: item.quantity,
                    unit: item.unit,
                    rate: item.rate,
                    ...tax,
                };
            });

            await supabase.from('invoice_items').insert(itemsData);

            toast.success("Invoice saved successfully");
            navigate('/admin/invoices');
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error('Error saving invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {id ? 'Edit Invoice' : 'New Invoice'}
                    </h1>
                    <p className="text-white/60 mt-1">Create or edit invoice details</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        onClick={() => setValue('status', 'draft')}
                        disabled={loading}
                        variant="secondary"
                        className="bg-white/10 hover:bg-white/20 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => setValue('status', 'finalized')}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Finalize Invoice
                    </Button>
                </div>
            </div>

            {/* Basic Details */}
            <Card className="glass-dark border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        Basic Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Invoice Number</label>
                        <Input
                            {...register('invoice_number')}
                            className="bg-white/5 border-white/10 text-white"
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Invoice Date</label>
                        <Input
                            type="date"
                            {...register('invoice_date')}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Select Client</label>
                        <Select
                            onValueChange={(val) => {
                                setValue('client_id', val);
                            }}
                            defaultValue={watch('client_id')}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select a client..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Receiver & Consignee Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-400" />
                            Receiver Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input {...register('receiver_name')} placeholder="Name" className="bg-white/5 border-white/10 text-white" />
                        <Textarea {...register('receiver_address')} placeholder="Address" className="bg-white/5 border-white/10 text-white" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...register('receiver_city')} placeholder="City" className="bg-white/5 border-white/10 text-white" />
                            <Input {...register('receiver_state')} placeholder="State" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...register('receiver_state_code')} placeholder="State Code" className="bg-white/5 border-white/10 text-white" />
                            <Input {...register('receiver_gstin')} placeholder="GSTIN" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-dark border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-400" />
                            Consignee Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input {...register('consignee_name')} placeholder="Name" className="bg-white/5 border-white/10 text-white" />
                        <Textarea {...register('consignee_address')} placeholder="Address" className="bg-white/5 border-white/10 text-white" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...register('consignee_city')} placeholder="City" className="bg-white/5 border-white/10 text-white" />
                            <Input {...register('consignee_state')} placeholder="State" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...register('consignee_state_code')} placeholder="State Code" className="bg-white/5 border-white/10 text-white" />
                            <Input {...register('consignee_gstin')} placeholder="GSTIN" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Items */}
            <Card className="glass-dark border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Invoice Items</CardTitle>
                    <Button
                        type="button"
                        onClick={() => append({ product_id: '', description: '', sac_code: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: 0 })}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/70 min-w-[200px]">Product</TableHead>
                                    <TableHead className="text-white/70 min-w-[200px]">Description</TableHead>
                                    <TableHead className="text-white/70 w-[100px]">SAC/HSN</TableHead>
                                    <TableHead className="text-white/70 w-[80px]">Qty</TableHead>
                                    <TableHead className="text-white/70 w-[80px]">Unit</TableHead>
                                    <TableHead className="text-white/70 w-[120px]">Rate</TableHead>
                                    <TableHead className="text-white/70 w-[120px]">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const item = watchItems[index];
                                    const amount = item ? item.quantity * item.rate : 0;

                                    return (
                                        <TableRow key={field.id} className="border-white/5 hover:bg-white/5">
                                            <TableCell>
                                                <Select
                                                    value={item?.product_id || ''}
                                                    onValueChange={(val) => handleProductSelect(index, val)}
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                                        {products.map((product) => (
                                                            <SelectItem key={product.id} value={product.id}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    {...register(`items.${index}.description`)}
                                                    className="bg-white/5 border-white/10 text-white h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    {...register(`items.${index}.hsn_code`)}
                                                    placeholder="HSN"
                                                    className="bg-white/5 border-white/10 text-white h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className="bg-white/5 border-white/10 text-white h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    {...register(`items.${index}.unit`)}
                                                    className="bg-white/5 border-white/10 text-white h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`items.${index}.rate`, { valueAsNumber: true })}
                                                    className="bg-white/5 border-white/10 text-white h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="text-white font-medium">₹{amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Totals */}
            <Card className="glass-dark border-none shadow-xl">
                <CardContent className="p-6">
                    <div className="max-w-md ml-auto space-y-3">
                        <div className="flex justify-between text-white/70">
                            <span>Subtotal:</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-white/70">
                            <span className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Transportation Charges:
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('transportation_charges', { valueAsNumber: true })}
                                className="w-32 bg-white/5 border-white/10 text-white text-right h-8"
                            />
                        </div>
                        {totals.cgst_amount > 0 && (
                            <>
                                <div className="flex justify-between text-white/70">
                                    <span>CGST (9%):</span>
                                    <span className="font-medium">₹{totals.cgst_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/70">
                                    <span>SGST (9%):</span>
                                    <span className="font-medium">₹{totals.sgst_amount.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        {totals.igst_amount > 0 && (
                            <div className="flex justify-between text-white/70">
                                <span>IGST (18%):</span>
                                <span className="font-medium">₹{totals.igst_amount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-white/10">
                            <span>Total Amount:</span>
                            <span>₹{totals.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            <Card className="glass-dark border-none shadow-xl">
                <CardContent className="p-6">
                    <label className="block text-sm font-medium text-white/70 mb-2">Notes</label>
                    <Textarea
                        {...register('notes')}
                        rows={3}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Additional notes..."
                    />
                </CardContent>
            </Card>
        </form>
    );
};

export default InvoiceForm;
