import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Users, Package, Home, LayoutDashboard, Truck, PlusCircle } from 'lucide-react';

const DashboardLayout = () => {
    const location = useLocation();

    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Invoices', href: '/admin/invoices', icon: FileText },
        { name: 'Clients', href: '/admin/clients', icon: Users },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Create PO', href: '/admin/pos/new', icon: PlusCircle },
        { name: 'Dispatch', href: '/admin/dispatch', icon: Truck },
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg tracking-tight">Navneet Industries</h1>
                                <p className="text-white/60 text-xs font-medium">Invoice System</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Back to Website */}
                    <div className="p-4 border-t border-white/10">
                        <a
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">Back to Website</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
