import React, { useState, useEffect, useMemo } from 'react';
import { supabase, type Client, type Product, type ClientPricing } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/calculations';
import { toast } from "sonner";
import {
    Plus, Edit, Trash2, Briefcase, TrendingUp, TrendingDown,
    Minus, AlertTriangle, Search, BarChart3, Tag, ShieldAlert,
} from 'lucide-react';
import DataFallback from '@/components/DataFallback';

// ─── Pricing Intelligence Helpers ────────────────────────────────────────────

/** Compute price_type from variance against the floor (min) rate for that product */
function getPriceType(contractRate: number, baseRate: number, hasContract: boolean): 'STANDARD' | 'CONTRACT' | 'PROMO' {
    if (!hasContract) return 'STANDARD';
    if (baseRate === 0) return 'CONTRACT';
    const variance = ((contractRate - baseRate) / baseRate) * 100;
    if (variance < -5) return 'PROMO';
    return 'CONTRACT';
}

function getVariancePct(contractRate: number, baseRate: number): number | null {
    if (baseRate === 0) return null;
    return Math.round(((contractRate - baseRate) / baseRate) * 10000) / 100;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ClientPricingManagement = () => {
    const [pricingRules, setPricingRules] = useState<ClientPricing[]>([]);
    const [clients, setClients]           = useState<Client[]>([]);
    const [products, setProducts]         = useState<Product[]>([]);
    const [showForm, setShowForm]         = useState(false);
    const [editingRule, setEditingRule]   = useState<ClientPricing | null>(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [search, setSearch]             = useState('');
    const [filterType, setFilterType]     = useState<'ALL' | 'CONTRACT' | 'PROMO' | 'STANDARD'>('ALL');
    const [filterClient, setFilterClient] = useState('ALL');

    const [formData, setFormData] = useState({
        client_id:   '',
        product_id:  '',
        custom_rate: 0,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pricingRes, clientsRes, productsRes] = await Promise.all([
                supabase.from('client_pricing')
                    .select('*, client:clients(*), product:products(*)')
                    .order('created_at', { ascending: false }),
                supabase.from('clients').select('*').order('name'),
                supabase.from('products').select('*').order('name'),
            ]);
            if (pricingRes.error) throw pricingRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (productsRes.error) throw productsRes.error;
            setPricingRules(pricingRes.data || []);
            setClients(clientsRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error: any) {
            toast.error("Failed to load data: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Base rate map: productId → MIN(custom_rate) across all contracts ──────
    const baseRateMap = useMemo(() => {
        const map: Record<string, number> = {};
        for (const rule of pricingRules) {
            const rate = parseFloat(String(rule.custom_rate)) || 0;
            if (map[rule.product_id] === undefined || rate < map[rule.product_id]) {
                map[rule.product_id] = rate;
            }
        }
        return map;
    }, [pricingRules]);

    // ── Enriched rules with price intelligence ────────────────────────────────
    const enrichedRules = useMemo(() => {
        return pricingRules.map(rule => {
            const contractRate = parseFloat(String(rule.custom_rate)) || 0;
            const baseRate     = baseRateMap[rule.product_id] ?? 0;
            const priceType    = getPriceType(contractRate, baseRate, true);
            const variancePct  = getVariancePct(contractRate, baseRate);
            return { ...rule, priceType, variancePct, baseRate, contractRate };
        });
    }, [pricingRules, baseRateMap]);

    // ── Duplicate fingerprint detection ───────────────────────────────────────
    const duplicateMap = useMemo(() => {
        const seen: Record<string, number> = {};
        const dupes = new Set<string>();
        for (const rule of enrichedRules) {
            const fp = `${rule.client_id}::${(rule.product?.name || '').toUpperCase().trim()}`;
            if (seen[fp] !== undefined) {
                dupes.add(rule.id);
                dupes.add(enrichedRules[seen[fp]]?.id);
            } else {
                seen[fp] = enrichedRules.indexOf(rule);
            }
        }
        return dupes;
    }, [enrichedRules]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total:      enrichedRules.length,
        contract:   enrichedRules.filter(r => r.priceType === 'CONTRACT').length,
        promo:      enrichedRules.filter(r => r.priceType === 'PROMO').length,
        standard:   enrichedRules.filter(r => r.priceType === 'STANDARD').length,
        duplicates: duplicateMap.size,
    }), [enrichedRules, duplicateMap]);

    // ── Filtered view ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return enrichedRules.filter(rule => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                rule.client?.name?.toLowerCase().includes(q) ||
                rule.product?.name?.toLowerCase().includes(q) ||
                rule.product?.sku?.toLowerCase().includes(q);
            const matchType   = filterType === 'ALL'   || rule.priceType === filterType;
            const matchClient = filterClient === 'ALL' || rule.client_id === filterClient;
            return matchSearch && matchType && matchClient;
        });
    }, [enrichedRules, search, filterType, filterClient]);

    // ── Form handlers ─────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('client_pricing')
                .upsert(
                    { id: editingRule?.id, client_id: formData.client_id, product_id: formData.product_id, custom_rate: formData.custom_rate },
                    { onConflict: 'client_id,product_id' }
                );
            if (error) throw error;
            toast.success(`Pricing rule ${editingRule ? 'updated' : 'added'} successfully`);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleEdit = (rule: ClientPricing) => {
        setEditingRule(rule);
        setFormData({ client_id: rule.client_id, product_id: rule.product_id, custom_rate: rule.custom_rate });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this pricing rule?')) return;
        try {
            const { error } = await supabase.from('client_pricing').delete().eq('id', id);
            if (error) throw error;
            toast.success("Pricing rule deleted");
            fetchData();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({ client_id: '', product_id: '', custom_rate: 0 });
        setEditingRule(null);
        setShowForm(false);
    };

    // ── Render helpers ────────────────────────────────────────────────────────
    const PriceTypeBadge = ({ type }: { type: 'CONTRACT' | 'PROMO' | 'STANDARD' }) => {
        if (type === 'PROMO')    return <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] px-2">PROMO</Badge>;
        if (type === 'CONTRACT') return <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] px-2">CONTRACT</Badge>;
        return <Badge className="bg-white/10 text-white/50 border border-white/10 font-mono text-[10px] px-2">STANDARD</Badge>;
    };

    const VarianceDisplay = ({ pct }: { pct: number | null }) => {
        if (pct === null || pct === 0) return <span className="text-white/30 font-mono text-xs">—</span>;
        if (pct > 0) return (
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
                <TrendingUp className="w-3 h-3" />+{pct}%
            </span>
        );
        return (
            <span className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                <TrendingDown className="w-3 h-3" />{pct}%
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-10">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Client Pricing Intelligence</h1>
                    <p className="text-white/50 mt-1 text-sm">Contract rates · variance analysis · duplicate detection</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <Plus className="w-4 h-4 mr-2" />Add Contract Price
                </Button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Contracts', value: stats.total,     icon: <Tag className="w-4 h-4" />,          color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                    { label: 'CONTRACT',        value: stats.contract,  icon: <BarChart3 className="w-4 h-4" />,    color: 'text-sky-400',    bg: 'bg-sky-500/10'  },
                    { label: 'PROMO (discounted)', value: stats.promo,  icon: <TrendingDown className="w-4 h-4" />, color: 'text-amber-400',  bg: 'bg-amber-500/10'},
                    { label: 'Duplicate Flags', value: stats.duplicates,icon: <ShieldAlert className="w-4 h-4" />, color: 'text-rose-400',   bg: 'bg-rose-500/10' },
                ].map(s => (
                    <Card key={s.label} className="glass-dark border-none shadow-lg">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-white/50 text-xs">{s.label}</p>
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Add / Edit Form ── */}
            {showForm && (
                <Card className="glass-dark border-none shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {editingRule ? <Edit className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-blue-400" />}
                            {editingRule ? 'Edit Contract Pricing' : 'Add New Contract Pricing'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select value={formData.client_id} onValueChange={(val) => setFormData({ ...formData, client_id: val })} disabled={!!editingRule}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                        <SelectValue placeholder="Select Client *" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                        {clients.map(c => <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={formData.product_id} onValueChange={(val) => setFormData({ ...formData, product_id: val })} disabled={!!editingRule}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-blue-500/50">
                                        <SelectValue placeholder="Select Product *" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                        {products.map(p => <SelectItem key={p.id} value={p.id} className="focus:bg-white/10 focus:text-white">[{p.sku}] {p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-white/40">₹</span>
                                    <Input
                                        type="number" step="0.01" required placeholder="Contract Rate *"
                                        value={formData.custom_rate}
                                        onChange={(e) => setFormData({ ...formData, custom_rate: parseFloat(e.target.value) })}
                                        className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-500/50 h-11"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <Button type="button" onClick={resetForm} variant="ghost" className="text-white hover:bg-white/10">Cancel</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
                                    {editingRule ? 'Update' : 'Save'} Pricing Rule
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                    <Input
                        placeholder="Search client, product, or SKU…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50 h-10"
                    />
                </div>
                <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full sm:w-44 h-10">
                        <SelectValue placeholder="Price Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="ALL"      className="focus:bg-white/10 focus:text-white">All Types</SelectItem>
                        <SelectItem value="CONTRACT" className="focus:bg-white/10 focus:text-white">CONTRACT</SelectItem>
                        <SelectItem value="PROMO"    className="focus:bg-white/10 focus:text-white">PROMO</SelectItem>
                        <SelectItem value="STANDARD" className="focus:bg-white/10 focus:text-white">STANDARD</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterClient} onValueChange={setFilterClient}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full sm:w-52 h-10">
                        <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white">All Clients</SelectItem>
                        {clients.map(c => <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* ── Table ── */}
            {!isLoading && pricingRules.length === 0 ? (
                <DataFallback title="No Pricing Contracts Found" message="Create your first client-specific product price." />
            ) : (
                <Card className="glass-dark border-none shadow-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/50 pl-6">Client</TableHead>
                                    <TableHead className="text-white/50">SKU / Product</TableHead>
                                    <TableHead className="text-white/50">Floor Rate</TableHead>
                                    <TableHead className="text-white/50">Contract Price</TableHead>
                                    <TableHead className="text-white/50">Variance</TableHead>
                                    <TableHead className="text-white/50">Type</TableHead>
                                    <TableHead className="text-white/50 text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((rule) => {
                                    const isDupe = duplicateMap.has(rule.id);
                                    return (
                                        <TableRow
                                            key={rule.id}
                                            className={`border-white/5 hover:bg-white/5 transition-colors ${isDupe ? 'bg-rose-500/5' : ''}`}
                                        >
                                            <TableCell className="font-medium text-white pl-4 md:pl-6">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-blue-400 shrink-0" />
                                                    <span className="truncate max-w-[140px]">{rule.client?.name || '—'}</span>
                                                    {isDupe && (
                                                        <span title="Duplicate detected">
                                                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white/90">
                                                <div className="flex flex-col">
                                                    <span className="text-blue-300 font-mono text-xs">[{rule.product?.sku || '—'}]</span>
                                                    <span className="truncate max-w-[200px] text-sm">{rule.product?.name || '—'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white/40 font-mono text-sm whitespace-nowrap">
                                                {rule.baseRate === rule.contractRate
                                                    ? <span className="text-white/20">= contract</span>
                                                    : formatCurrency(rule.baseRate)
                                                }
                                            </TableCell>
                                            <TableCell className="font-bold text-green-400 whitespace-nowrap">
                                                {formatCurrency(rule.contractRate)}
                                            </TableCell>
                                            <TableCell>
                                                <VarianceDisplay pct={rule.variancePct} />
                                            </TableCell>
                                            <TableCell>
                                                <PriceTypeBadge type={rule.priceType} />
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div className="px-6 py-3 border-t border-white/5 text-white/30 text-xs">
                            Showing {filtered.length} of {enrichedRules.length} records
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ClientPricingManagement;
