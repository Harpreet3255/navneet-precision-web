import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const ClientManagement = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        state_code: '',
        gstin: '',
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select(`
            *,
            client_pricing ( id ),
            purchase_orders ( id, status )
        `).order('name');
        
        if (error) {
            toast.error("Failed to fetch clients");
        } else {
            const enhancedData = (data || []).map(c => ({
                ...c,
                contractsCount: c.client_pricing?.length || 0,
                openPOsCount: c.purchase_orders?.filter((po: any) => po.status === 'open').length || 0
            }));
            const distinctClients = Array.from(new Map(enhancedData.map(c => [c.name.trim().toUpperCase(), c])).values());
            setClients(distinctClients);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase.from('clients').insert(formData);
            if (error) throw error;
            toast.success("Client added successfully");

            resetForm();
            fetchClients();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', city: '', state: '', state_code: '', gstin: '' });
        setShowForm(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-10 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Clients Hub</h1>
                    <p className="text-white/60 mt-1">Enterprise Command Center</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {showForm && (
                <Card className="glass-dark border-none shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-400" />
                            Add New Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Input
                                        required
                                        placeholder="Client Name *"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                    />
                                </div>
                                <Input
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <Input
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <Input
                                    placeholder="State Code (e.g., 20)"
                                    value={formData.state_code}
                                    onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                                <Input
                                    placeholder="GSTIN"
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" onClick={resetForm} variant="ghost" className="text-white hover:bg-white/10">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
                                    Save Client
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <Card 
                        key={client.id} 
                        className="glass-dark border border-white/5 shadow-lg cursor-pointer group hover:-translate-y-1 hover:shadow-blue-500/20 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                    >
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                            <ChevronRight className="w-5 h-5 text-blue-400" />
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                    <Building2 className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-4 w-full pr-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-2">
                                        {client.name}
                                    </h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-white/5 group-hover:border-blue-500/20 transition-colors">
                                            <span className="text-sm font-medium text-white/50">Active Contracts</span>
                                            <span className="font-mono font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded text-sm">
                                                {client.contractsCount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-white/5 group-hover:border-amber-500/20 transition-colors">
                                            <span className="text-sm font-medium text-white/50">Open POs</span>
                                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-sm ${client.openPOsCount > 0 ? 'text-amber-300 bg-amber-500/20' : 'text-white/30 bg-white/5'}`}>
                                                {client.openPOsCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ClientManagement;
