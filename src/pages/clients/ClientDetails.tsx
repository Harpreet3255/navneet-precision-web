import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search, Package, FileText, Calendar, IndianRupee, MapPin, Building2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DataFallback from '@/components/DataFallback';

const ClientDetails = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Client Details
    const { data: client, isLoading: loadingClient, isError: errorClient } = useQuery({
        queryKey: ['client', clientId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!clientId
    });

    // Fetch Client Pricing Matrix (All Items)
    const { data: pricingItems, isLoading: loadingItems } = useQuery({
        queryKey: ['client_items', clientId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('client_pricing')
                .select(`
                    id,
                    custom_rate,
                    product:products(id, name, sku)
                `)
                .eq('client_id', clientId);
            if (error) throw error;
            return data;
        },
        enabled: !!clientId
    });

    // Fetch Active POs
    const { data: activePOs, isLoading: loadingPOs } = useQuery({
        queryKey: ['client_pos', clientId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select('*')
                .eq('client_id', clientId)
                .eq('status', 'open')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!clientId
    });

    // Filtering Logic
    const filteredItems = pricingItems?.filter((item: any) => {
        const query = searchQuery.toLowerCase();
        return (
            item.product?.sku?.toLowerCase().includes(query) ||
            item.product?.name?.toLowerCase().includes(query)
        );
    });

    const filteredPOs = activePOs?.filter((po: any) => {
        const query = searchQuery.toLowerCase();
        return po.po_number?.toLowerCase().includes(query);
    });

    if (errorClient) {
        return <DataFallback title="Client Not Found" message="Could not load client details." onRetry={() => navigate('/admin/clients')} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')} className="text-white/70 hover:text-white hover:bg-white/10 mt-1 md:mt-0">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="w-full">
                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-400 hidden md:block" />
                        {loadingClient ? 'Loading...' : client?.name}
                    </h1>
                    
                    {/* Metadata Badges */}
                    {!loadingClient && client && (
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/80">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="font-semibold text-white/50 mr-1">GSTIN:</span> 
                                <span className="font-mono">{client.gstin || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/80">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="font-semibold text-white/50 mr-1">Location:</span>
                                <span>{client.city || 'Unknown City'}, {client.state || 'Unknown State'} {client.state_code ? `(${client.state_code})` : ''}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drill-Down UI */}
            <Tabs defaultValue="items" className="w-full space-y-6">
                <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl h-14 w-full md:w-auto inline-flex grid-cols-2">
                    <TabsTrigger 
                        value="items" 
                        className="text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/60 rounded-lg px-8 py-2"
                        onClick={() => setSearchQuery('')}
                    >
                        All Items
                    </TabsTrigger>
                    <TabsTrigger 
                        value="pos" 
                        className="text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/60 rounded-lg px-8 py-2"
                        onClick={() => setSearchQuery('')}
                    >
                        Active POs
                    </TabsTrigger>
                </TabsList>

                {/* Dynamic Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 text-lg w-full md:max-w-md"
                    />
                </div>

                <TabsContent value="items" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="glass-dark border-none shadow-xl">
                        <CardContent className="p-0">
                            {loadingItems ? (
                                <div className="p-8 text-center text-white/50">Loading catalog...</div>
                            ) : filteredItems && filteredItems.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-white/70 pl-6 w-[180px]">SKU</TableHead>
                                            <TableHead className="text-white/70">Product Name</TableHead>
                                            <TableHead className="text-white/70 text-right pr-6 w-[150px]">Custom Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item: any) => (
                                            <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                                <TableCell className="font-mono text-blue-300/90 pl-6 font-medium">
                                                    {item.product?.sku}
                                                </TableCell>
                                                <TableCell className="font-mono text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-white/20 shrink-0" />
                                                        <span>{item.product?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1 font-mono text-white">
                                                        <IndianRupee className="w-3 h-3 text-white/40" />
                                                        {Number(item.custom_rate).toFixed(2)}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center text-white/50">
                                    No items found matching "{searchQuery}".
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pos" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="glass-dark border-none shadow-xl">
                        <CardContent className="p-0">
                            {loadingPOs ? (
                                <div className="p-8 text-center text-white/50">Loading purchase orders...</div>
                            ) : filteredPOs && filteredPOs.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-white/70 pl-6">PO Number</TableHead>
                                            <TableHead className="text-white/70">Date</TableHead>
                                            <TableHead className="text-white/70 text-right pr-6">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPOs.map((po: any) => (
                                            <TableRow key={po.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate('/admin/dispatch')}>
                                                <TableCell className="font-medium text-white pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                                                        <span className="group-hover:text-blue-400 transition-colors">{po.po_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-white/70">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-white/40 shrink-0" />
                                                        {new Date(po.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1 font-mono text-white">
                                                        <IndianRupee className="w-3 h-3 text-white/40" />
                                                        {Number(po.total_value || 0).toFixed(2)}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center text-white/50">
                                    No active purchase orders found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClientDetails;
