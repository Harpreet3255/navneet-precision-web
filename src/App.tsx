
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
import TransitionOverlay from "./components/TransitionOverlay";
import { TransitionProvider } from "./contexts/TransitionContext";
import './App.css';

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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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
);

export default App;
