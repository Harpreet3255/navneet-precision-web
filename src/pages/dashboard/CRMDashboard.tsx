import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Package, Clock, FileText, Cloud, CheckCircle2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import { useNavigate } from "react-router-dom";

export default function CRMDashboard() {
    const navigate = useNavigate();
    const [clientFilter, setClientFilter] = useState<string>("all");
    const [periodFilter, setPeriodFilter] = useState<string>("week"); // today, week, month
    const [statusFilter, setStatusFilter] = useState<string>("all"); // all, open, completed

    // Fetch Clients for Filter
    const { data: clients } = useQuery({
        queryKey: ['clients_list'],
        queryFn: async () => {
            const { data } = await supabase.from('clients').select('id, name').order('name');
            return data || [];
        }
    });

    // Fetch Dashboard Stats with Filters
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard_stats', clientFilter, periodFilter, statusFilter],
        queryFn: async () => {
            // Base queries
            let openPOQuery = supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'open');
            let recentPOsQuery = supabase.from('purchase_orders').select('*, clients(name)').order('created_at', { ascending: false }).limit(10);
            let invoicesQuery = supabase.from('invoices').select('total_amount, created_at, client_id');
            const backlogQuery = supabase.from('view_po_tracking').select('product_name, qty_remaining, client_id');

            // Apply Client Filter
            if (clientFilter !== 'all') {
                openPOQuery = openPOQuery.eq('client_id', clientFilter);
                recentPOsQuery = recentPOsQuery.eq('client_id', clientFilter);
                invoicesQuery = invoicesQuery.eq('client_id', clientFilter);
                // backlogQuery filtered implicitly below or we filter here?
                // PostgREST filtering on view:
                // backlogQuery = backlogQuery.eq('client_id', clientFilter);
                // But let's fetch all and filter in JS if needed, or filter here. 
                // Using filter here is better for performance.
            }

            if (statusFilter !== 'all') {
                recentPOsQuery = recentPOsQuery.eq('status', statusFilter);
            }

            // Apply Time Period Filter to Invoices (Sales)
            const now = new Date();
            let startDate = new Date();
            if (periodFilter === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (periodFilter === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (periodFilter === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            }

            if (periodFilter !== 'all') {
                invoicesQuery = invoicesQuery.gte('created_at', startDate.toISOString());
            }

            const [
                { count: clientCount },
                { count: productCount },
                { count: openPOCount },
                { data: recentPOs },
                { data: invoices },
                { data: backlogData, error: backlogError }
            ] = await Promise.all([
                supabase.from('clients').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                openPOQuery,
                recentPOsQuery,
                invoicesQuery,
                clientFilter !== 'all'
                    ? supabase.from('view_po_tracking').select('product_name, qty_remaining').eq('client_id', clientFilter).gt('qty_remaining', 0)
                    : supabase.from('view_po_tracking').select('product_name, qty_remaining').gt('qty_remaining', 0)
            ]);

            // Calculate daily sales for the chart
            const salesByDate = invoices?.reduce((acc, inv) => {
                const date = new Date(inv.created_at).toLocaleDateString();
                acc[date] = (acc[date] || 0) + (inv.total_amount || 0);
                return acc;
            }, {} as Record<string, number>);

            const salesData = Object.entries(salesByDate || {}).map(([date, amount]) => ({
                date,
                amount
            }));

            // Calculate Backlog (Aggregated by Product)
            const backlogMap = (backlogData || []).reduce((acc: any, item: any) => {
                acc[item.product_name] = (acc[item.product_name] || 0) + item.qty_remaining;
                return acc;
            }, {});

            const backlogChartData = Object.entries(backlogMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a: any, b: any) => b.value - a.value) // Sort desc
                .slice(0, 10); // Top 10 products

            return {
                clientCount: clientCount || 0,
                productCount: productCount || 0,
                openPOCount: openPOCount || 0,
                recentPOs: recentPOs || [],
                salesData,
                backlogChartData
            };
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Cloud Sync Active</span>
                        </div>
                    </div>
                    <p className="text-white/60">Overview of your business performance</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-3">
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                            <SelectItem value="all">All Clients</SelectItem>
                            {clients?.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="open">Open / Partial</SelectItem>
                            <SelectItem value="closed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/clients')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.clientCount}</div>
                        <p className="text-xs text-white/60 mt-1">Total registered</p>
                    </CardContent>
                </Card>
                <Card
                    className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/products')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.productCount}</div>
                        <p className="text-xs text-white/60 mt-1">In catalog</p>
                    </CardContent>
                </Card>
                <Card
                    className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setStatusFilter("open")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Open POs</CardTitle>
                        <Clock className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.openPOCount}</div>
                        <p className="text-xs text-white/60 mt-1">Matching filters</p>
                    </CardContent>
                </Card>
                <Card
                    className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/invoices')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Sales ({periodFilter})</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ₹{stats?.salesData.reduce((acc: number, curr: any) => acc + curr.amount, 0).toFixed(0) || '0'}
                        </div>
                        <p className="text-xs text-white/60 mt-1">Total for period</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Chart */}
                <Card className="col-span-4 glass-dark border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Backlog Chart (NEW) */}
                <Card className="col-span-3 glass-dark border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Production Backlog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {stats?.backlogChartData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-white/60">No pending orders</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.backlogChartData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            stroke="rgba(255,255,255,0.7)"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#f59e0b"
                                            radius={[0, 4, 4, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent POs */}
            <div className="grid gap-6">
                <Card className="glass-dark border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentPOs.length === 0 ? (
                                <p className="text-white/60 text-sm text-center py-4">No orders match the filters.</p>
                            ) : (
                                stats?.recentPOs.map((po: any) => (
                                    <div key={po.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-blue-500/20 rounded-full">
                                                <FileText className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white leading-none">{po.po_number}</p>
                                                <p className="text-xs text-white/60 mt-1">{po.clients?.name}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={po.status === 'open' ? 'default' : 'secondary'}
                                            className={po.status === 'open' ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}
                                        >
                                            {po.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
