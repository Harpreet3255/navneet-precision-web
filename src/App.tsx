
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlasticCapManufacturing from "./pages/PlasticCapManufacturing";
import CustomDieMaking from "./pages/CustomDieMaking";
import MachineMaintenance from "./pages/MachineMaintenance";
import MaintenancePortal from "./pages/MaintenancePortal";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceView from "./pages/invoices/InvoiceView";
import ClientManagement from "./pages/clients/ClientManagement";
import ProductManagement from "./pages/products/ProductManagement";
import PurchaseOrderForm from "./pages/pos/PurchaseOrderForm";
import DispatchInterface from "./pages/dispatch/DispatchInterface";
import CRMDashboard from "./pages/dashboard/CRMDashboard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import TransitionOverlay from "./components/TransitionOverlay";
import { TransitionProvider } from "./contexts/TransitionContext";
import './App.css';

import { ErrorBoundary } from "react-error-boundary";
import GlobalFallback from "./components/GlobalFallback";

const queryClient = new QueryClient();

// Routes component without general page transitions
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Index />} />
      <Route path="/services/caps" element={<PlasticCapManufacturing />} />
      <Route path="/services/dies" element={<CustomDieMaking />} />
      <Route path="/services/maintenance" element={<MachineMaintenance />} />
      <Route path="/maintenance-portal" element={<MaintenancePortal />} />

      {/* Invoice Management System */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<InvoiceList />} />
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceView />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="clients" element={<ClientManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="pos/new" element={<PurchaseOrderForm />} />
        <Route path="dispatch" element={<DispatchInterface />} />
        <Route path="dashboard" element={<CRMDashboard />} />
      </Route>
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary
    FallbackComponent={GlobalFallback}
    onReset={() => {
      // Optional: Reset state or caches on error restart
      window.location.reload();
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TransitionProvider>
          <BrowserRouter>
            <AppRoutes />
            <TransitionOverlay />
          </BrowserRouter>
        </TransitionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
