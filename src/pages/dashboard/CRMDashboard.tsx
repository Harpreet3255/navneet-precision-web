import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Package, Clock, FileText } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function CRMDashboard() {
    // Fetch Dashboard Stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard_stats'],
        queryFn: async () => {
            const [
                { count: clientCount },
                { count: productCount },
                { count: openPOCount },
                { data: recentPOs },
                { data: invoices }
            ] = await Promise.all([
                supabase.from('clients').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'open'),
                supabase.from('purchase_orders')
                    .select('*, clients(name)')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase.from('invoices').select('total_amount, created_at')
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
            })).slice(-7); // Last 7 days

            return {
                clientCount: clientCount || 0,
                productCount: productCount || 0,
                openPOCount: openPOCount || 0,
                recentPOs: recentPOs || [],
                salesData
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
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-white/60 mt-1">Overview of your business performance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.clientCount}</div>
                        <p className="text-xs text-white/60 mt-1">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.productCount}</div>
                        <p className="text-xs text-white/60 mt-1">+12 new items</p>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Open POs</CardTitle>
                        <Clock className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.openPOCount}</div>
                        <p className="text-xs text-white/60 mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="glass-dark border-none shadow-lg hover:bg-white/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Daily Sales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ₹{stats?.salesData[stats.salesData.length - 1]?.amount.toFixed(0) || '0'}
                        </div>
                        <p className="text-xs text-white/60 mt-1">+15% from yesterday</p>
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

                {/* Recent POs */}
                <Card className="col-span-3 glass-dark border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentPOs.map((po: any) => (
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
