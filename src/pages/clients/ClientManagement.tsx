import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building2, MapPin, FileText } from 'lucide-react';
import { supabase, type Client } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const ClientManagement = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
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
        const { data, error } = await supabase.from('clients').select('*').order('name');
        if (error) {
            toast.error("Failed to fetch clients");
        } else {
            setClients(data || []);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingClient) {
                const { error } = await supabase.from('clients').update(formData).eq('id', editingClient.id);
                if (error) throw error;
                toast.success("Client updated successfully");
            } else {
                const { error } = await supabase.from('clients').insert(formData);
                if (error) throw error;
                toast.success("Client added successfully");
            }

            resetForm();
            fetchClients();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            state_code: client.state_code || '',
            gstin: client.gstin || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this client?')) return;
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            toast.success("Client deleted successfully");
            fetchClients();
        } catch (error: any) {
            toast.error(`Error deleting client: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', city: '', state: '', state_code: '', gstin: '' });
        setEditingClient(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Clients</h1>
                    <p className="text-white/60 mt-1">Manage your client database</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {showForm && (
                <Card className="glass-dark border-none shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {editingClient ? <Edit className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-blue-400" />}
                            {editingClient ? 'Edit Client' : 'Add New Client'}
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
                                    {editingClient ? 'Update' : 'Save'} Client
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="glass-dark border-none shadow-xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white/70 pl-6">Name</TableHead>
                                <TableHead className="text-white/70 hidden sm:table-cell">City</TableHead>
                                <TableHead className="text-white/70 hidden md:table-cell">State</TableHead>
                                <TableHead className="text-white/70 hidden md:table-cell">GSTIN</TableHead>
                                <TableHead className="text-white/70 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium text-white pl-4 md:pl-6 max-w-[180px]">
                                        <div className="flex items-center gap-2 truncate">
                                            <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
                                            <span className="truncate">{client.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white/70 hidden sm:table-cell truncate max-w-[120px]">{client.city || '-'}</TableCell>
                                    <TableCell className="text-white/70 hidden md:table-cell">{client.state || '-'}</TableCell>
                                    <TableCell className="text-white/70 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3 w-3 text-white/40 shrink-0" />
                                            <span className="truncate">{client.gstin || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientManagement;
